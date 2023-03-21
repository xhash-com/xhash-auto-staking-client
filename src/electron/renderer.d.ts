// renderer.d.ts
/**
 * This file contains the typescript type hinting for the preload.ts API.
 */

import {OpenDialogOptions, OpenDialogReturnValue} from "electron";

import {Network} from "../react/types";

export interface IElectronAPI {
  shellOpenExternal: (url: string, options?: Electron.OpenExternalOptions | undefined) => Promise<void>,
  shellShowItemInFolder: (fullPath: string) => void,
  clipboardWriteText: (ext: string, type?: "selection" | "clipboard" | undefined) => void,
  clipboardClear: (type?: "selection" | "clipboard" | undefined) => void,
  ipcRendererSendClose: () => void,
  invokeShowOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>,
}

export interface IEth2DepositAPI {
  createMnemonic: (language: string) => Promise<string>,
  generateKeys: (mnemonic: string, index: number, count: number, network: string,
    password: string, eth1_withdrawal_address: string, folder: string) => Promise<void>,
  validateMnemonic: (mnemonic: string) => Promise<void>
}

export interface IDepositAPI {
  getExistingDepositsForPubkeys: (fileData: any[], chain: String | undefined) => Promise<any>,
  validateDepositKey: (fileData: any[], chain: String | undefined) => Promise<boolean>
}

export interface IEncryptAPI {
  doEncrypt: (publicKey: string, keyPassword: string) => string | false;
}

export interface IWalletAPI {
  connect: () => void,
  killSession: () => void,
  getWalletStatus: () => any,
  sendTransaction: (pubkey: string, withdrawal_credentials: string, signature: string, deposit_data_root: string, amount: number, network: Network) => any,
  sendTransaction_All: (pubkey: string[], withdrawal_credentials: string[], signature: string[], deposit_data_root: string[], amount: number, network: Network) => any,
  testSendTransaction: () => any,
  cleanGetAssets: () => void
}

export interface ITransactionAPI{
  submitUndoneList: (id: number, txhash: string, network: Network) => void;
  getFinished:() => any;
}

export interface IBashUtilsAPI {
  doesDirectoryExist: (directory: string) => Promise<boolean>,
  isDirectoryWritable: (directory: string) => Promise<boolean>,
  findFirstFile: (directory: string, startsWith: string) => Promise<string>
}

export interface IWeb3UtilsAPI {
  isAddress: (address: string, chainId?: number | undefined) => boolean
}

declare global {
  interface Window {
    electronAPI: IElectronAPI,
    eth2Deposit: IEth2DepositAPI,
    bashUtils: IBashUtilsAPI,
    web3Utils: IWeb3UtilsAPI,
    deposit: IDepositAPI,
    encrypt: IEncryptAPI,
    walletApi: IWalletAPI,
    transactionApi: ITransactionAPI
  }
}
