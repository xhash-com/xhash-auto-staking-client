const abi = require('ethereumjs-abi');
const keccak256 = require('js-sha3').keccak256;

const functionSignature = 'deposit(bytes[],bytes[],bytes[],bytes32[])';

const functionSelector = keccak256(functionSignature).slice(0, 8);

const encodedArguments = (params: string[][]) => {
  return abi.rawEncode(
      ['bytes[]', 'bytes[]', 'bytes[]', 'bytes32[]'],
      params
  )
};

const generatedDataForDepositer = (pubkeys: string[],
                                   withdrawal_credentials: string[],
                                   signatures: string[],
                                   deposit_data_roots: string[]): string => {
  const param = [pubkeys, withdrawal_credentials, signatures, deposit_data_roots]
  return '0x' + functionSelector + encodedArguments(param).toString('hex');
}
