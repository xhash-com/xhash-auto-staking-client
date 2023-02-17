import {Grid, Typography} from '@material-ui/core';
import React, {FC, ReactElement, useEffect, useState} from 'react';
import styled from 'styled-components';
import {Network, DepositKeyInterface, LanguageEnum} from '../types';
import StepNavigation from "./StepNavigation";
import DepositeUpLoad from "./DepositFlow/0-DepositeUpLoad";
import ConnectWallet from "./DepositFlow/1-ConnectWallet";
import SendTransaction from "./DepositFlow/2-SendTransaction";
import {Language, LanguageFunc} from "../language/Language";

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

const FootGrid = styled(Grid)`
  position: fixed;
  bottom: 96;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  network: Network,
  language: LanguageEnum,
}

export type ConnectStatus = {
  connected: boolean,
  fetching: boolean,
  assets: boolean
}

export type AddressStatus = {
  address: string,
  balance: number,
  netword: Network | null
}

/**
 * This is the final page displaying information about the keys
 *
 * @param props.onStepBack the function to execute when the user steps back
 * @param props.onStepForward the function to execute when the user steps forward
 * @param props.folderPath the folder path where the keys are located, for display purposes
 * @param props.network the network the app is running for
 * @returns the react element to render
 */
const Deposit: FC<Props> = (props): ReactElement => {

  const intitialStep = 0;
  const [step, setStep] = useState(intitialStep);
  const [fileName,setFileName] = useState("");
  const [sendNum, setSendNum] = useState(intitialStep);
  const [finishedNum, setFinishedNum] = useState(intitialStep);
  const [fileErrorMsg, setFileErrorMsg] = useState("")
  const [walletErrorMsg, setWalletErrorMsg] = useState("")
  const [modalDisplay, setModalDisplay] = useState(false);
  const [checkDepositKey, setCheckDepositKey] = useState(false);
  const [depositKey, setDepositKey] = useState<DepositKeyInterface[]>([]);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>({connected: false, assets: false, fetching: false})
  const [addressStatus, setAddressStatus] = useState<AddressStatus>({address: "", balance: 0, netword: null})
  const [toConnect, setToConnect] = useState(false)
  const [uri, setUri] = useState('')
  const [showCircular, setShowCircular] = useState(false)
  const [progress, setProgress] = useState(0)
  const [walletConnectTimer, setWalletConnectTimer] = useState<NodeJS.Timer | null>(null)
  const [transactionTimer, setTransactionTimer] = useState<NodeJS.Timer | null>(null)

  const connectStatusUpdater = (connected: boolean, assets: boolean, fetching: boolean) => {
    setConnectStatus({connected, assets, fetching})
  }

  const addressStatusUpdater = (address: string, balance: number, netword: Network | null) => {
    setAddressStatus({address, balance, netword})
  }

  const getWalletMessage = () => {
    const wallet = window.walletApi.getWalletStatus()

    let network: Network | null = null
    switch (wallet.chainId) {
      case 5:
        network = Network.GOERLI
        break
      case 1:
        network = Network.MAINNET
        break
    }

    addressStatusUpdater(wallet.address, wallet.balance/Math.pow(10,9), network)
    connectStatusUpdater(wallet.connected, wallet.assets, wallet.fetching)
    setWalletErrorMsg(props.network !== network ? LanguageFunc("Wrong_Network", props.language) + props.network : '')
    setUri(wallet.uri)
  }

  const polling = () => {
    if(walletConnectTimer === null){
      setWalletConnectTimer(setInterval(getWalletMessage, 1500))
    }
  }

  const finishedPolling = () => {
    if (walletConnectTimer){
      clearInterval(walletConnectTimer)
      setWalletConnectTimer(null)
    }
  }
  const prevClicked = () => {
    switch (step) {
      case 0: {
        props.onStepBack()
        break;
      }
      case 1: {
        setStep(step - 1);
        break;
      }
      case 2: {
        setStep(step - 1);
        break;
      }
      default: {
        console.log("Deposit step is greater than 0 and prev was clicked. This should never happen.")
        break;
      }
    }
  }

  const nextClicked = () => {
    switch (step) {
      case 0: {
        if (checkDepositKey){
          setStep(step + 1);
        }else{
          props.onStepForward()
        }
        break;
      }
      case 1: {
        setStep(step + 1);
        break;
      }
      case 2: {
        props.onStepForward()
        break;
      }
      default: {
        console.log("Deposit generation step is greater than 2 and next was clicked. This should never happen.")
        break;
      }
    }
  }

  const nextLabel = () => {
    switch (step) {
      case 0: {
        if (checkDepositKey){
          return <Language language={props.language} id="Next"/>;
        }else{
          return <Language language={props.language} id="Skip"/>;
        }
        break;
      }
      case 2: {
        if (sendNum === finishedNum && finishedNum === 0){
          return <Language language={props.language} id="Skip"/>;
        }else{
          return <Language language={props.language} id="Next"/>;
        }
        break;
      }
      default:
        return <Language language={props.language} id="Next"/>;
    }
  }

  const prevLabel = () => {
    return <Language language={props.language} id="Back"/>;
  }

  const disableNext = () => {
    return !(((step === 0 && !modalDisplay)
        || (step === 1 && toConnect && !walletErrorMsg)
        || (step === 2)));
  }

  const disableBack = () => {
    return false;
  }

  const content = () => {
    switch (step) {
      case 0:
        return (
            <DepositeUpLoad
              network={props.network}
              depositKey={depositKey}
              modalDisplay={modalDisplay}
              setModalDisplay={setModalDisplay}
              setDepositKey={setDepositKey}
              checkDepositKey={checkDepositKey}
              setCheckDepositKey={setCheckDepositKey}
              fileName={fileName}
              setFileName={setFileName}
              fileErrorMsg={fileErrorMsg}
              setFileErrorMsg={setFileErrorMsg}
              showCircular={showCircular}
              setShowCircular={setShowCircular}
              progress={progress}
              setProgress={setProgress}
              language={props.language}
            />
        );
      case 1:
        return (
            <ConnectWallet
                toConnect={toConnect}
                setToConnect={setToConnect}
                network={props.network}
                connectStatus = {connectStatus}
                connectStatusUpdater = {connectStatusUpdater}
                uri={uri}
                polling = {polling}
                getWalletMessage={getWalletMessage}
                addressStatus = {addressStatus}
                addressStatusUpdater = {addressStatusUpdater}
                walletErrorMsg={walletErrorMsg}
                setWalletErrorMsg={setWalletErrorMsg}
                language={props.language}
                walletConnectTimer={walletConnectTimer}
                setWalletConnectTimer={setWalletConnectTimer}
                finishedPolling={finishedPolling}
            />
        );
      case 2:
        return (
            <SendTransaction
                depositKey={depositKey}
                setDepositKey={setDepositKey}
                network={props.network}
                sendNum={sendNum}
                setSendNum={setSendNum}
                finishedNum={finishedNum}
                setFinishedNum={setFinishedNum}
                language={props.language}
            />
        );
      default:
        return null;
    }
  }

  return (
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h1">
            <Language language={props.language} id="Deposit"/>
          </Typography>
        </Grid>
        <ContentGrid item container>
          <Grid item xs={12}>
            {content()}
          </Grid>
        </ContentGrid>
        <StepNavigation
            children={props.children}
            onPrev={prevClicked}
            onNext={nextClicked}
            backLabel={prevLabel()}
            nextLabel={nextLabel()}
            disableNext={disableNext()}
            disableBack={disableBack()}
        />
      </Grid>
  );
}

export default Deposit;
