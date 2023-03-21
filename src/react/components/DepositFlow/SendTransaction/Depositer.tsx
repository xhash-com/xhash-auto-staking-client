import React, {Dispatch, FC, ReactElement, SetStateAction, useState} from "react";
import {Grid, makeStyles, styled} from "@material-ui/core";
import {DepositKeyInterface, LanguageEnum, Network} from "../../../types";
import {AddressStatus, depositStatus} from "../../Deposit";
import Summary from "./Depositer/1-Summary";
import SendTransaction_All from "./Depositer/2-SendTransaction_All";

const useStyles = makeStyles({
  title: {
    color: '#868e9c',
    fontSize: '18px',
  },
  text: {
    fontSize: '15px',
    color: '#868e9c',
  },
  fullScreen: {
    width: '100%',
  },
  input: {
    width: '80%',
    marginLeft: '10%',
    '& input[type="number"]::-webkit-inner-spin-button, & input[type="number"]::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
  button: {
    color: '#FFFFFF',
    width: 110,
    backgroundColor: '#1976d2',
    position: 'fixed',
    bottom: 'calc(3vh + 200px)',
  },
  newGrid: {
    marginTop: 15
  }
});
styled(Grid)({
  borderBottom: '1px solid #868e9c',
  width: '80%',
  height: 25,
  marginTop: 8,
});

type SendTransactionProps = {
  setDepositKey: Dispatch<SetStateAction<DepositKeyInterface[]>>,
  depositKey: DepositKeyInterface[],
  network: Network,
  sendNum: number,
  setSendNum: Dispatch<SetStateAction<number>>,
  finishedNum: number,
  setFinishedNum: Dispatch<SetStateAction<number>>,
  language: LanguageEnum,
  transactionTimer: NodeJS.Timer | null,
  setTransactionTimer: Dispatch<SetStateAction<NodeJS.Timer | null>>,
  easySendAll: boolean,
  setEasySendAll: Dispatch<SetStateAction<boolean>>,
  addressStatus: AddressStatus,
  undoDepositKey: DepositKeyInterface[],
  easyModeStatus: depositStatus,
  setEastModeStatus: Dispatch<SetStateAction<depositStatus>>,
  noticeError: Function
}

const Depositer: FC<SendTransactionProps> = (props): ReactElement => {
  const [number, setNumber] = useState<number>(0);
  const [ifConfirm, setIfConfirm] = useState(false);

  const content = () => {
    if (ifConfirm) {
      return <SendTransaction_All number={number} {...props}/>
    } else {
      return <Summary number={number} setNumber={setNumber} setIfConfirm={setIfConfirm} {...props}/>
    }
  }

  return content();
}

export default Depositer;
