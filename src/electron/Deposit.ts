import _every from 'lodash/every';
import { initBLS, verify } from '@chainsafe/bls';
import axios from 'axios';
import compareVersions from 'compare-versions';
import {
  NumberUintType,
  ByteVector,
  ByteVectorType,
  ContainerType,
} from '@chainsafe/ssz';

export interface DepositKeyInterface {
    pubkey: string;
    withdrawal_credentials: string;
    amount: number;
    signature: string;
    deposit_message_root: string;
    deposit_data_root: string;
    fork_version: string;
    deposit_cli_version: string;
    transactionStatus: TransactionStatus;
    txHash?: string;
    depositStatus: DepositStatus;
}

interface BeaconchainDepositInterface {
  data: BeaconchainDepositDataInterface[];
  status: string;
}

interface BeaconchainDepositDataInterface {
  amount: number;
  block_number: number;
  block_ts: number;
  from_address: string;
  merkletree_index: string;
  publickey: string;
  removed: boolean;
  signature: string;
  tx_hash: string;
  tx_index: number;
  tx_input: string;
  valid_signature: boolean;
  withdrawal_credentials: string;
}

export enum DepositStatus {
    VERIFYING,
    ALREADY_DEPOSITED,
    READY_FOR_DEPOSIT,
}

export enum TransactionStatus {
    'READY',
    'PENDING',
    'STARTED',
    'SUCCEEDED',
    'FAILED',
    'REJECTED',
}

const ETHER_TO_GWEI              = 1e9;
const MIN_DEPOSIT_AMOUNT         = 1 * ETHER_TO_GWEI;
const DOMAIN_DEPOSIT             = Buffer.from('03000000', 'hex');
const EMPTY_ROOT                 = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
const MIN_DEPOSIT_CLI_VERSION    = '1.0.0';
const GENESIS_FORK_VERSION       = Buffer.from('00001020', 'hex');
const GENESIS_FORK_VERSION_MAINET       = Buffer.from('00000000', 'hex');
const BEACONCHAIN_URL            = "https://goerli.beaconcha.in"
const BEACONCHAIN_URL_MAINET            = "https://mainnet.beaconcha.in"
const bufferHex = (x: string): Buffer => Buffer.from(x, 'hex');

interface DepositMessage {
  pubkey: ByteVector;
  withdrawalCredentials: ByteVector;
  amount: Number;
}

const ForkData = new ContainerType({
  fields: {
    currentVersion: new ByteVectorType({
      length: 4,
    }),
    genesisValidatorsRoot: new ByteVectorType({
      length: 32,
    }),
  },
});

const DepositData = new ContainerType({
  fields: {
    pubkey: new ByteVectorType({
      length: 48,
    }),
    withdrawalCredentials: new ByteVectorType({
      length: 32,
    }),
    amount: new NumberUintType({
      byteLength: 8,
    }),
    signature: new ByteVectorType({
      length: 96,
    }),
  },
});

const computeForkDataRoot = (
  currentVersion: Uint8Array,
  genesisValidatorsRoot: Uint8Array
): Uint8Array => {
  const forkData = {
    currentVersion: currentVersion as Uint8Array,
    genesisValidatorsRoot,
  };
  return ForkData.hashTreeRoot(forkData);
};

const computeDomain = (
  domainType: Buffer,
  forkVersion: Buffer | string = GENESIS_FORK_VERSION,
  genesisValidatorsRoot: Buffer = EMPTY_ROOT
): Uint8Array => {
  const forkDataRoot = computeForkDataRoot(
    forkVersion as Uint8Array,
    genesisValidatorsRoot
  );
  const domain = new Uint8Array(32);
  domain.set(domainType);
  domain.set(forkDataRoot.subarray(0, 28), 4);
  return domain;
};

const SigningData = new ContainerType({
  fields: {
    objectRoot: new ByteVectorType({
      length: 32,
    }), // Ideally this would be a RootType, but AFIK, there is no generic expanded type for roots in @chainsafe/ssz
    domain: new ByteVectorType({
      length: 32,
    }),
  },
});

const computeSigningRoot = (
  sszObjectRoot: Uint8Array,
  domain: Uint8Array
): Uint8Array => {
  const signingData = {
    objectRoot: sszObjectRoot,
    domain,
  };
  return SigningData.hashTreeRoot(signingData);
};

const verifySignature = (depositDatum: DepositKeyInterface, chain: String): boolean => {
  const pubkeyBuffer = bufferHex(depositDatum.pubkey);
  const signatureBuffer = bufferHex(depositDatum.signature);
  const depositMessageBuffer = bufferHex(depositDatum.deposit_message_root);
  const domain = computeDomain(DOMAIN_DEPOSIT, chain === 'mainnet' ? GENESIS_FORK_VERSION_MAINET :  GENESIS_FORK_VERSION);
  const signingRoot = computeSigningRoot(depositMessageBuffer, domain);
  return verify(pubkeyBuffer, signingRoot, signatureBuffer);
};

const validateFieldFormatting = (
    depositDatum: DepositKeyInterface
): boolean => {
	// check existence of required keys
	if (
		!depositDatum.pubkey ||
		!depositDatum.withdrawal_credentials ||
		!depositDatum.amount ||
		!depositDatum.signature ||
		!depositDatum.deposit_message_root ||
		!depositDatum.deposit_data_root ||
		!depositDatum.fork_version ||
		!depositDatum.deposit_cli_version
	) {
		return false;
	}

	// check type of values
	if (
		typeof depositDatum.pubkey !== 'string' ||
		typeof depositDatum.withdrawal_credentials !== 'string' ||
		typeof depositDatum.amount !== 'number' ||
		typeof depositDatum.signature !== 'string' ||
		typeof depositDatum.deposit_message_root !== 'string' ||
		typeof depositDatum.deposit_data_root !== 'string' ||
		typeof depositDatum.fork_version !== 'string' ||
		typeof depositDatum.deposit_cli_version !== 'string'
	) {
		return false;
	}

	// check length of strings (note: using string length, so 1 byte = 2 chars)
	if (
		depositDatum.pubkey.length !== 96 ||
		depositDatum.withdrawal_credentials.length !== 64 ||
		depositDatum.signature.length !== 192 ||
		depositDatum.deposit_message_root.length !== 64 ||
		depositDatum.deposit_data_root.length !== 64 ||
		depositDatum.fork_version.length !== 8
	) {
		return false;
	}

	// check the deposit amount
	if (
		depositDatum.amount < MIN_DEPOSIT_AMOUNT ||
		depositDatum.amount > 32 * ETHER_TO_GWEI
	) {
		return false;
	}

	// check the deposit-cli version
	if (
		compareVersions.compare(
			depositDatum.deposit_cli_version,
			MIN_DEPOSIT_CLI_VERSION,
			'<'
		)
	) {
		return false;
	}

	return true;
};

const DepositMessage = new ContainerType({
	fields: {
		pubkey: new ByteVectorType({
			length: 48,
		}),
		withdrawalCredentials: new ByteVectorType({
			length: 32,
		}),
		amount: new NumberUintType({
			byteLength: 8,
		}),
	},
});

const verifyDepositRoots = (
	depositDatum: DepositKeyInterface
): boolean => {
	const depositMessage: DepositMessage = {
		pubkey: bufferHex(depositDatum.pubkey),
		withdrawalCredentials: bufferHex(depositDatum.withdrawal_credentials),
		amount: Number(depositDatum.amount),
	};
	const depositData = {
		pubkey: bufferHex(depositDatum.pubkey),
		withdrawalCredentials: bufferHex(depositDatum.withdrawal_credentials),
		amount: Number(depositDatum.amount),
		signature: bufferHex(depositDatum.signature),
	};
	if (
		bufferHex(depositDatum.deposit_message_root).compare(
			DepositMessage.hashTreeRoot(depositMessage)
		) === 0 &&
		bufferHex(depositDatum.deposit_data_root).compare(
			DepositData.hashTreeRoot(depositData)
		) === 0
	) {
		return true;
	}
	return false;
};

export const validateDepositKey = async (
    files: any[],
    chain: String | String = 'mainnet',
): Promise<boolean> => {
  await initBLS();

  if (!Array.isArray(files)) return false;
  if (files.length <= 0) return false;

  const depositKeysStatuses: boolean[] = (files as DepositKeyInterface[]).map(depositDatum => {
    if (!validateFieldFormatting(depositDatum)) {
      return false;
    }
    if (!verifyDepositRoots(depositDatum)) {
      return false;
    }

    return verifySignature(depositDatum, chain);
  });

  return _every(depositKeysStatuses);
}

export const getExistingDepositsForPubkeys = async (
  files: DepositKeyInterface[],
  chain: String | String = 'mainnet'
): Promise<BeaconchainDepositInterface> => {
  const beaconScan: BeaconchainDepositInterface = {
    data: [],
    status: "200"
  }

  for(let index= 0; index < files.length / 80; index++){
    const pubkeys = files.slice(80*index, Math.min(80*(index+1), files.length)).flatMap(x => x.pubkey)
    const beaconScanUrl = `${chain === 'mainnet' ? BEACONCHAIN_URL_MAINET : BEACONCHAIN_URL}/api/v1/validator/${pubkeys.join(
        ','
    )}/deposits`;
    const { data: beaconScanCheck } = await axios.get<
        BeaconchainDepositInterface
        >(beaconScanUrl);

    if (!beaconScanCheck.data || beaconScanCheck.status !== 'OK') {
      throw new Error('Beaconchain API is down');
    }
    beaconScan.data = beaconScan.data.concat(beaconScanCheck.data)
  }

  return beaconScan;
  // const pubkeys = files.flatMap(x => x.pubkey);
	// //${BEACONCHAIN_URL}
  // const beaconScanUrl = `${chain === 'mainnet' ? BEACONCHAIN_URL_MAINET : BEACONCHAIN_URL}/api/v1/validator/${pubkeys.join(
  //   ','
  // )}/deposits`;
  // const { data: beaconScanCheck } = await axios.get<
  //   BeaconchainDepositInterface
  // >(beaconScanUrl);
  //
  // if (!beaconScanCheck.data || beaconScanCheck.status !== 'OK') {
  //   throw new Error('Beaconchain API is down');
  // }
  //return beaconScanCheck;
};
