import axios, {AxiosInstance} from "axios";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import {IInternalEvent, IWalletConnectOptions} from "@walletconnect/types";
import {Network} from "../react/types";
import {forEach} from "lodash";

const Goerli_URL = "https://goerli.etherscan.io/api?module=localchk&action=txexist&txhash="
const MainNet_URL = "https://etherscan.io/api?module=localchk&action=txexist&txhash="

export interface IAssetData {
  symbol: string;
  name: string;
  decimals: string;
  contractAddress: string;
  balance?: string;
}

export interface IParsedTx {
  timestamp: string;
  hash: string;
  from: string;
  to: string;
  nonce: string;
  gasPrice: string;
  gasUsed: string;
  fee: string;
  value: string;
  input: string;
  error: boolean;
  asset: IAssetData;
  operations: ITxOperation[];
}

export interface ITxOperation {
  asset: IAssetData;
  value: string;
  from: string;
  to: string;
  functionName: string;
}

export interface IGasPricesResponse {
  fastWait: number;
  avgWait: number;
  blockNum: number;
  fast: number;
  fastest: number;
  fastestWait: number;
  safeLow: number;
  safeLowWait: number;
  speed: number;
  block_time: number;
  average: number;
}

export interface IGasPrice {
  time: number;
  price: number;
}

export interface IGasPrices {
  timestamp: number;
  slow: IGasPrice;
  average: IGasPrice;
  fast: IGasPrice;
}

interface IAppState {
  connector: WalletConnect | null;
  fetching: boolean;
  connected: boolean;
  chainId: number;
  showModal: boolean;
  pendingRequest: boolean;
  uri: string;
  accounts: string[];
  address: string;
  result: any | null;
  assets: IAssetData[];
  wallet: string | undefined;
  balance: number;
}

interface Tx {
  from: string,
  to: string,
  data: string,
  value: string
}

const INITIAL_STATE: IAppState = {
  connector: null,
  fetching: false,
  connected: false,
  chainId: 1,
  showModal: false,
  pendingRequest: false,
  wallet: "",
  uri: "",
  accounts: [],
  address: "",
  result: null,
  assets: [],
  balance: 0,
};

const state: IAppState = { ...INITIAL_STATE };

//pubkey
//withdrawal_credentials
//signature
//deposit_data_root
const generateData = (pubkey: string,
                      withdrawal_credentials: string,
                      signature: string,
                      deposit_data_root: string,
                      ) : string => {
    return "0x22895118"
        + "0000000000000000000000000000000000000000000000000000000000000080"
        + "00000000000000000000000000000000000000000000000000000000000000e0"
        + "0000000000000000000000000000000000000000000000000000000000000120"
        + deposit_data_root
        + "0000000000000000000000000000000000000000000000000000000000000030"
        + pubkey + "00000000000000000000000000000000"
        + "0000000000000000000000000000000000000000000000000000000000000020"
        + withdrawal_credentials
        + "0000000000000000000000000000000000000000000000000000000000000060"
        + signature
}

const generateTx = (pubkey: string,
                    withdrawal_credentials: string,
                    signature: string,
                    deposit_data_root: string,
                    amount: number,
                    network: Network) : Tx => {
  const to = network === Network.GOERLI ? "0xff50ed3d0ec03aC01D4C79aAd74928BFF48a7b2b" : "0x00000000219ab540356cBB839Cbe05303d7705Fa";
  return {
    from: state.address,
    to: to,
    data: generateData(pubkey, withdrawal_credentials, signature, deposit_data_root),
    value: String(1000000000*amount)
        //"0x1bc16d674ec800000"
  }
}

export const sendTransaction = async (pubkey: string,
                                withdrawal_credentials: string,
                                signature: string,
                                deposit_data_root: string,
                                amount: number,
                                network: Network) : Promise<any> => {
  if (state.balance < amount){
    return {
      result: false,
      txHash: "",
      msg: "INSUFFICIENT_FUNDS"
    }
  }

  const tx = generateTx(pubkey, withdrawal_credentials, signature, deposit_data_root, amount, network);

  console.log(tx)

  const returnResult = {
    result: false,
    txHash: "",
    msg: ""
  }

  if (state.connector){
    await
      state.connector
        .sendTransaction(tx)
        .then((result) => {
          // Returns transaction id (hash)
          console.log(result);
          returnResult.result = true
          returnResult.txHash = result
        })
        .catch((error) => {
          // Error returned when rejected
          console.log(error);

          returnResult.result = false
          returnResult.msg = getErrorMsg(String(error))
        });
  }

  return returnResult;
}

export const fetchTransactionStatus = async (txhash: string, network: Network) : Promise<any> => {
    return await axios.get((network === Network.MAINNET ? MainNet_URL : Goerli_URL) + txhash);
}

const getErrorMsg = (error: string): string => {
  //insufficient funds
  console.log(error)
  if (error.indexOf("insufficient funds") != -1){
    return "INSUFFICIENT_FUNDS"
  }else if(error.indexOf("User rejected the transaction") != -1){
    return "USER_REJECTED"
  }else{
    return "TRANSACTION_ERROR"
  }
}

export const connect = async (): Promise<string> => {
  // create new connector
  const connectorOpts: IWalletConnectOptions = {
    bridge: "https://bridge.walletconnect.org",
    qrcodeModal: QRCodeModal
  };


  const connector = new WalletConnect(connectorOpts);

  state.connector = connector;

  // check if already connected
  if (!connector.connected) {
    // create new session
    await connector.createSession()
  }

  // subscribe to events
  await subscribeToEvents();

  return connector.uri;
};
const subscribeToEvents = () => {
  if (!state.connector) {
    return;
  }

  state.connector.on("session_update", async (error, payload) => {
    console.log(`connector.on("session_update")`);

    if (error) {
      throw error;
    }

    const { chainId, accounts } = payload.params[0];
    onSessionUpdate(accounts, chainId);
  });

  state.connector.on("session_request", async (error, payload) => {
    console.log(`connector.on("session_request")`);

    if (error) {
      throw error;
    }
  });

  state.connector.on("wc_sessionRequest", async (error, payload) => {
    console.log(`connector.on("wc_sessionRequest")`);

    if (error) {
      throw error;
    }
  });

  state.connector.on("wc_sessionUpdate", async (error, payload) => {
    console.log(`connector.on("wc_sessionUpdate")`);

    if (error) {
      throw error;
    }
  });

  state.connector.on("connect", (error, payload) => {
    console.log(`connector.on("connect")`);
    console.log(state)
    if (error) {
      throw error;
    }

    onConnect(payload);
  });

  state.connector.on("disconnect", (error, payload) => {
    console.log(`connector.on("disconnect")`);

    if (error) {
      throw error;
    }

    onDisconnect();
  });

  if (state.connector.connected) {
    const { chainId, accounts } = state.connector;
    const address = accounts[0];
    state.connected = true,
    state.chainId = chainId,
    state.accounts = accounts,
    state.address = address,
    onSessionUpdate(accounts, chainId);
  }

  // I don't understand
  // this.setState({ connector });
};

export const killSession = async () => {
  const connector = state.connector;
  console.log(connector)
  if (connector) {
    connector.killSession();
  }

  resetApp();
};

const resetApp = async () => {
  state.connector = null;
  state.fetching = false;
  state.connected = false;
  state.chainId = 1;
  state.showModal = false;
  state.pendingRequest = false;
  state.uri = "";
  state.accounts = [];
  state.address = "";
  state.result = null;
  state.assets = [];
};

const onConnect = async (payload: IInternalEvent) => {
  const { chainId, accounts } = payload.params[0];
  const address = accounts[0];
  state.connected = true;
  state.chainId = chainId;
  state.accounts = accounts;
  state.address = address;
  state.wallet = state.connector?.peerMeta?.name
  getAccountAssets();
};

export const getWalletStatus = () => {
  console.log(state)
  return {
    connected : state.connected,
    chainId : state.chainId,
    accounts : state.accounts,
    address : state.address,
    assets : state.assets,
    balance : state.balance,
  }
}

const onDisconnect = async () => {
  resetApp();
};

const onSessionUpdate = async (accounts: string[], chainId: number) => {
  const address = accounts[0];
  state.chainId = chainId;
  state.accounts = accounts;
  state.address = address;
  getAccountAssets();
};

const getAccountAssets = async () => {
  const { address, chainId } = state;
  state.fetching = true;
  try {
    // get account balances
    const assets = await apiGetAccountAssets(address, chainId);
    state.fetching = false;
    state.address = address;
    state.assets = assets;
    state.balance = getETHBalanceGWei()
  } catch (error) {
    console.error(error);
    state.fetching = false;
  }
};

const getETHBalanceGWei = ():number => {
  let total = 0
  if (state.assets.length != 0){
    state.assets.filter(e=>e.name === "Ether" && e.symbol === "ETH").forEach(e=>{total += Number(e.balance) + total;})
  }

  return total/Math.pow(10, 9)
}


const api: AxiosInstance = axios.create({
  baseURL: "https://ethereum-api.xyz",
  timeout: 30000, // 30 secs
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export async function apiGetAccountAssets(address: string, chainId: number): Promise<IAssetData[]> {
  const response = await api.get(`/account-assets?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export async function apiGetAccountTransactions(
  address: string,
  chainId: number,
): Promise<IParsedTx[]> {
  const response = await api.get(`/account-transactions?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export const apiGetAccountNonce = async (address: string, chainId: number): Promise<string> => {
  const response = await api.get(`/account-nonce?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
};

export const apiGetGasPrices = async (): Promise<IGasPrices> => {
  const response = await api.get(`/gas-prices`);
  const { result } = response.data;
  return result;
};
