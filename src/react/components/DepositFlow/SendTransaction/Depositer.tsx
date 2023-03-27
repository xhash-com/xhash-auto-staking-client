import React, {Dispatch, FC, ReactElement, SetStateAction, useState} from "react";
import {DepositKeyBatch, DepositKeyInterface, LanguageEnum, Network} from "../../../types";
import {AddressStatus} from "../../Deposit";
import Summary from "./Depositer/1-Summary";
import SendTransaction_All from "./Depositer/2-SendTransaction_All";

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
  depositKeyBatch: DepositKeyBatch[],
  setDepositKeyBatch: Dispatch<SetStateAction<DepositKeyBatch[]>>
  noticeError: Function,
  disableChangeMode: Function,
  batchNumber: number,
  setBatchNumber: Dispatch<SetStateAction<number>>
}

const Depositer: FC<SendTransactionProps> = (props): ReactElement => {
  const [ifConfirm, setIfConfirm] = useState(false);

  const content = () => {
    if (ifConfirm) {
      return <SendTransaction_All {...props}/>
    } else {
      return <Summary setIfConfirm={setIfConfirm} {...props}/>
    }
  }

  return content();
}

export default Depositer;
