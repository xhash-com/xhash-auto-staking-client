import WalletConnect from "@walletconnect/client";
import {IInternalEvent} from "@walletconnect/types";
import {Network} from "../react/types";
import {IAppState} from "./common/type";
import {etherscanGetBalance, generateTx, generateTx_All, getErrorMsg} from "./common/method";

const INITIAL_STATE: IAppState = {
  connector: null,
  fetching: false,
  connected: false,
  chainId: 1,
  uri: "",
  accounts: [],
  address: "",
  assets: false,
  balance: 0,
  timer: null,
};

const state: IAppState = {...INITIAL_STATE};

export const sendTransaction_All = async (pubkeys: string[],
                                          withdrawal_credentials: string[],
                                          signature: string[],
                                          deposit_data_root: string[],
                                          amount: number,
                                          network: Network): Promise<any> => {
  if (state.balance < amount) {
    return {
      result: false,
      txHash: "",
      msg: "INSUFFICIENT_FUNDS"
    }
  }

  const tx = generateTx_All(state.address, pubkeys, withdrawal_credentials, signature, deposit_data_root, amount, network);

  const returnResult = {
    result: false,
    txHash: "",
    msg: ""
  }

  if (state.connector) {
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

export const sendTransaction = async (pubkey: string,
                                      withdrawal_credentials: string,
                                      signature: string,
                                      deposit_data_root: string,
                                      amount: number,
                                      network: Network): Promise<any> => {
  if (state.balance < amount) {
    return {
      result: false,
      txHash: "",
      msg: "INSUFFICIENT_FUNDS"
    }
  }

  const tx = generateTx(state.address, pubkey, withdrawal_credentials, signature, deposit_data_root, amount, network);

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

export const connect = async () => {
  window.localStorage.removeItem('walletconnect');
  state.connector = new WalletConnect({
    bridge: "https://bridge.walletconnect.org"
  })

  const connector = state.connector
  // check if already connected

  if (!connector.connected) {
    await connector.createSession()
  }

  await subscribeToEvents()

  state.uri = connector.uri
}

const subscribeToEvents = () => {
  if (state.connector === null) {
    return
  }

  state.connector.on("session_update", async (error, payload) => {
    console.log(`connector.on("session_update")`)

    if (error) {
      throw error
    }

    const { chainId, accounts } = payload.params[0];
    onSessionUpdate(accounts, chainId)
  });

  state.connector.on("session_request", async (error, payload) => {
    console.log(`connector.on("session_request")`)

    if (error) {
      throw error
    }
  });

  state.connector.on("wc_sessionRequest", async (error, payload) => {
    console.log(`connector.on("wc_sessionRequest")`)

    if (error) {
      throw error;
    }
  });

  state.connector.on("wc_sessionUpdate", async (error, payload) => {
    console.log(`connector.on("wc_sessionUpdate")`);
    console.log(payload)
    state.balance = 0

    if (error) {
      throw error;
    }
  })

  state.connector.on("connect", (error, payload) => {
    console.log(`connector.on("connect")`)
    if (error) {
      throw error
    }
    if (!state.connected) {
      console.log(state)
      onConnect(payload)
    }
  });

  state.connector.on("disconnect", (error, payload) => {
    console.log(`connector.on("disconnect")`)

    if (error) {
      throw error
    }

    onDisconnect()
  });

  if (state.connector.connected) {
    const { chainId, accounts } = state.connector
    const address = accounts[0]
    state.connected = true,
    state.chainId = chainId,
    state.accounts = accounts,
    state.address = address,
    onSessionUpdate(accounts, chainId)
  }
}

export const killSession = async () => {
  const connector = state.connector
  console.log(connector)
  if (connector) {
    try {
      await connector.killSession()
    } catch (e) {
      console.log(e)
    }
  }

  await resetApp();
};

const resetApp = async () => {
  cleanGetAssets()

  state.fetching = false
  state.connected = false
  state.chainId = 1
  state.accounts = []
  state.address = ""
  state.assets = false

  await connect()
};

const onConnect = async (payload: IInternalEvent) => {
  const {chainId, accounts} = payload.params[0];
  const address = accounts[0]
  state.connected = true
  state.chainId = chainId
  state.accounts = accounts
  state.address = address
};

export const getWalletStatus = () => {
  if (state.timer === null && state.connected) {
    getAccountAssets()
    state.timer = setInterval(getAccountAssets, 3000)
  }

  return {
    connected: state.connected,
    chainId: state.chainId,
    address: state.address,
    fetching: state.fetching,
    assets: state.assets,
    balance: state.balance,
    uri: state.uri
  }
}

const onDisconnect = async () => {
  await resetApp();
};

const onSessionUpdate = async (accounts: string[], chainId: number) => {
  const address = accounts[0]
  state.chainId = chainId
  state.accounts = accounts
  state.address = address
};

export const cleanGetAssets = () => {
  if (state.timer !== null) {
    clearInterval(state.timer)
    state.timer = null
  }
}

const getAccountAssets = async () => {
  const {address, chainId} = state
  state.fetching = true
  try {
    // get account balances
    const result = await etherscanGetBalance(address, chainId === 1 ? Network.MAINNET : Network.GOERLI)
    state.fetching = true
    state.address = address
    state.assets = true
    state.balance = Number(result) / Math.pow(10, 9)
  } catch (error) {
    console.error(error)
    state.fetching = false
  }
};
