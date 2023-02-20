import WalletConnect from "@walletconnect/client";
import {IInternalEvent} from "@walletconnect/types";
import {Network} from "../react/types";
import {IAppState} from "./common/type";
import {apiGetAccountAssets, generateTx, getErrorMsg, getETHBalanceGWei} from "./common/method";

const INITIAL_STATE: IAppState = {
  connector: new WalletConnect({
    bridge: "https://bridge.walletconnect.org"
  }),
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

const state: IAppState = { ...INITIAL_STATE };

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
  const connector = state.connector
  // check if already connected
  if (!connector.connected) {
    // create new session
    await connector.createSession()
  }

  // subscribe to events
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

    if (error) {
      throw error;
    }
  })

  state.connector.on("connect", (error, payload) => {
    console.log(`connector.on("connect")`)
    console.log(state)
    if (error) {
      throw error
    }

    onConnect(payload)
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
    await connector.killSession()
  }

  await resetApp();
};

const resetApp = async () => {
  if(state.timer !== null){
    clearInterval(state.timer)
  }

  state.fetching = false
  state.connected = false
  state.chainId = 1
  state.accounts = []
  state.address = ""
  state.assets = false

  await connect()
};

const onConnect = async (payload: IInternalEvent) => {
  const { chainId, accounts } = payload.params[0];
  const address = accounts[0]
  state.connected = true
  state.chainId = chainId
  state.accounts = accounts
  state.address = address
  getAccountAssets()
  if (state.timer === null){
    state.timer = setInterval(getAccountAssets, 3000)
  }
};

export const getWalletStatus = () => {
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
  getAccountAssets()
  if (state.timer === null){
    state.timer = setInterval(getAccountAssets, 3000)
  }
};

const getAccountAssets = async () => {
  const { address, chainId } = state
  state.fetching = true
  try {
    // get account balances
    const assets = await apiGetAccountAssets(address, chainId)
    state.fetching = true
    state.address = address
    state.assets = true
    state.balance = getETHBalanceGWei(assets)
  } catch (error) {
    console.error(error)
    state.fetching = false
  }
};
