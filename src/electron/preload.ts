// preload.ts
/**
 * This typescript file contains the API used by the UI to call the electron modules.
 */

import {
  contextBridge,
  shell,
  clipboard,
  ipcRenderer,
  OpenDialogOptions,
  OpenDialogReturnValue
} from "electron";

import Web3Utils from 'web3-utils';

import { createMnemonic, generateKeys, validateMnemonic } from './Eth2Deposit';

import { doesDirectoryExist, isDirectoryWritable, findFirstFile } from './BashUtils';

import { validateDepositKey, getExistingDepositsForPubkeys } from "./Deposit";

import { doEncrypt } from "./Encrypt"

import {
  connect,
  killSession,
  getWalletStatus,
  sendTransaction,
} from "./WalletApi";

import {getFinished, submitUndoneList} from "./TransactionApi";

const ipcRendererSendClose = () => {
  ipcRenderer.send('close');
};

const invokeShowOpenDialog = (options: OpenDialogOptions): Promise<OpenDialogReturnValue> => {
  return ipcRenderer.invoke('showOpenDialog', options);
};

contextBridge.exposeInMainWorld('electronAPI', {
  'shellOpenExternal': shell.openExternal,
  'shellShowItemInFolder': shell.showItemInFolder,
  'clipboardWriteText': clipboard.writeText,
  'clipboardClear': clipboard.clear,
  'ipcRendererSendClose': ipcRendererSendClose,
  'invokeShowOpenDialog': invokeShowOpenDialog,
});

contextBridge.exposeInMainWorld('eth2Deposit', {
  'createMnemonic': createMnemonic,
  'generateKeys': generateKeys,
  'validateMnemonic': validateMnemonic
});

contextBridge.exposeInMainWorld('encrypt', {
  'doEncrypt': doEncrypt,
});

contextBridge.exposeInMainWorld('deposit', {
  "validateDepositKey": validateDepositKey,
  "getExistingDepositsForPubkeys": getExistingDepositsForPubkeys
});

contextBridge.exposeInMainWorld('bashUtils', {
  'doesDirectoryExist': doesDirectoryExist,
  'isDirectoryWritable': isDirectoryWritable,
  'findFirstFile': findFirstFile
});

contextBridge.exposeInMainWorld('walletApi', {
  'connect': connect,
  'killSession': killSession,
  'getWalletStatus': getWalletStatus,
  "sendTransaction": sendTransaction
});

contextBridge.exposeInMainWorld('transactionApi', {
  "submitUndoneList": submitUndoneList,
  "getFinished": getFinished
})

contextBridge.exposeInMainWorld('web3Utils', {
  'isAddress': Web3Utils.isAddress
});
