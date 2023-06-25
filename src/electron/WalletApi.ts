import {Network} from "../react/types";
import {DEFAULT_EIP155_METHODS, IAppState} from "./common/type";
import {etherscanGetBalance, generateTx, generateTx_All, getErrorMsg} from "./common/method";
import {getAppMetadata} from "@walletconnect/utils";
import Client from "@walletconnect/sign-client";
import {EngineTypes, SessionTypes} from "@walletconnect/types";

const DEFAULT_APP_METADATA = {
  name: "XHash Auto Staking Client",
  description: "XHash Auto Staking Client",
  url: "https://github.com/xhash-com/xhash-auto-staking-client",
  icons: ["https://raw.githubusercontent.com/xhash-com/xhash-auto-staking-client/main/static/xhash.png"],
};

const clientInitOptions = {
  relayUrl: "wss://relay.walletconnect.com",
  projectId: "",
  metadata: getAppMetadata() || DEFAULT_APP_METADATA,
}

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
  session: null,
  fullChainId: "eip155:1",
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
    await state.connector.request<string>({
      topic: state.session!.topic,
      chainId: state.fullChainId,
      request: {
        method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
        params: [tx],
      }
    })
        .then((result) => {
          // Returns transaction id (hash)
          console.log(result);
          returnResult.result = true
          returnResult.txHash = result
        })
        .catch((error) => {
          // Error returned when rejected
          console.error(error);

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

  if (state.connector) {
    await
        state.connector.request<string>({
          topic: state.session!.topic,
          chainId: state.fullChainId,
          request: {
            method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
            params: [tx],
          }
        })
            .then((result) => {
              // Returns transaction id (hash)
              console.log(result);
              returnResult.result = true
              returnResult.txHash = result
            })
            .catch((error) => {
              // Error returned when rejected
              console.error(error);

              returnResult.result = false
              returnResult.msg = getErrorMsg(String(error))
            });
  }

  return returnResult;
}

export const connect = async (chain: string) => {
  try {
    if (state.connector) {
      try {
        await state.connector.disconnect(<EngineTypes.DisconnectParams>{reason: {}, topic: state.session!.topic})
      } catch (e) {
        console.log(e)
      }

      await resetApp();
    }


    state.connector = await Client.init(clientInitOptions);

    const _client = state.connector

    const {uri, approval} = await _client.connect({
      // Provide the namespaces and chains (e.g. `eip155` for EVM-based chains) we want to use in this session.
      requiredNamespaces: {
        eip155: {
          methods: [
            "eth_sendTransaction"
          ],
          chains: [chain],
          events: ["chainChanged", "accountsChanged"],
        },
      },
    });
    if (uri) {
      state.uri = uri

      const _session = await approval()

      await onConnect(_session)

      await _subscribeToEvents();
    }
  } catch (e) {
    console.log(e)
  }
}

const _subscribeToEvents = () => {
  if (state.connector === null) {
    return
  }

  const _client = state.connector

  _client.on("session_ping", (args) => {
    console.log("EVENT", "session_ping", args);
  });

  _client.on("session_event", (args) => {
    console.log("EVENT", "session_event", args);
  });

  _client.on("session_update", ({topic, params}) => {
    console.log("EVENT", "session_update", {topic, params});
    const {namespaces} = params;
    const _session = _client.session.get(topic);
    const updatedSession = {..._session, namespaces};
    onConnect(updatedSession);
  });

  _client.on("session_delete", async () => {
    console.log("EVENT", "session_delete");
    await onDisconnect();
  });
}

export const killSession = async () => {
  const chian = state.fullChainId

  const connector = state.connector
  console.log(connector)
  if (connector) {
    try {
      await connector.disconnect(<EngineTypes.DisconnectParams>{reason: {}, topic: state.session!.topic})
    } catch (e) {
      console.log(e)
    }
  }

  await resetApp();

  await connect(chian)
};

const resetApp = async () => {
  cleanGetAssets()

  state.fetching = false
  state.connected = false
  state.chainId = 1
  state.accounts = []
  state.address = ""
  state.assets = false
  state.session = null
};

const onConnect = async (_session: SessionTypes.Struct) => {
  const allNamespaceAccounts = Object.values(_session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();
  const allNamespaceChains = Object.keys(_session.namespaces);
  const account = allNamespaceAccounts[0]
  const [namespace, reference, address] = account.split(":");
  state.session = _session
  state.connected = true
  state.fullChainId = `${namespace}:${reference}`
  //debug
  state.chainId = Number(reference)
  state.accounts = allNamespaceAccounts
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
