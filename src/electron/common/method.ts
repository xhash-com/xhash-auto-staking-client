import {IAssetData, IGasPrices, IParsedTx, Tx} from "./type";
import axios, {AxiosInstance} from "axios";
import {Network} from "../../react/types";

const timers: NodeJS.Timer[] = []
const apiKeyToken = 'A6139HD6GFIYGTH5HXD468K6AWCW96W6RU'
const chain = {
  "Mainet": ""
}

export const sleep = (duration: number) => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      timers.splice(timers.indexOf(timer), 1)
      resolve(true)
    }, duration);
    timers.push(timer)
  })
}

export const generateDepositData = (pubkey: string,
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

// export const generateTx = (
//                     address: string,
//                     pubkey: string,
//                     withdrawal_credentials: string,
//                     signature: string,
//                     deposit_data_root: string,
//                     amount: number,
//                     network: Network) : Tx => {
//   const to = network === Network.GOERLI ? "0xff50ed3d0ec03aC01D4C79aAd74928BFF48a7b2b" : "0x00000000219ab540356cBB839Cbe05303d7705Fa";
//   return {
//     from: address,
//     to: to,
//     data: generateDepositData(pubkey, withdrawal_credentials, signature, deposit_data_root),
//     value: String(1000000000*amount)
//     //"0x1bc16d674ec800000"
//   }
// }

export const generateTx = (
    address: string,
    pubkey: string,
    withdrawal_credentials: string,
    signature: string,
    deposit_data_root: string,
    amount: number,
    network: Network) : Tx => {
  const to = network === Network.GOERLI ? "0xff50ed3d0ec03aC01D4C79aAd74928BFF48a7b2b" : "0x00000000219ab540356cBB839Cbe05303d7705Fa";
  return {
    from: address,
    to: to,
    data: generateDepositData(pubkey, withdrawal_credentials, signature, deposit_data_root),
    value: String(1000000000*amount)
    //"0x1bc16d674ec800000"
  }
}

export const getErrorMsg = (error: string): string => {
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

export const getETHBalanceGWei = (assets: IAssetData[]):number => {
  let total = 0
  if (assets.length != 0){
    assets.filter(e=>e.name === "Ether" && e.symbol === "ETH").forEach(e=>{total += Number(e.balance) + total;})
  }

  return total/Math.pow(10, 9)
}

const api: AxiosInstance = axios.create({
  baseURL: "https://ethereum-api.xyz",
  timeout: 5000, // 5 secs
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
  const {result} = response.data;
  return result;
};

export const apiGetGasPrices = async (): Promise<IGasPrices> => {
  const response = await api.get(`/gas-prices`);
  const {result} = response.data;
  return result;
};

const etherscan = (network: Network): AxiosInstance => {
  return axios.create({
    baseURL: `https://${Network.MAINNET === network ? 'api' : 'api-goerli'}.etherscan.io`,
    timeout: 3000, // 5 secs
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
};

export const etherscanGetBalance = async (address: string, network: Network): Promise<any> => {
  const response = await etherscan(network).get(`/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKeyToken}`);
  const {result} = response.data;
  return result;
}
