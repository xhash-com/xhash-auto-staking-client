import React, {Dispatch, FC, ReactElement, SetStateAction, useEffect, useState} from "react";
import {
  Button,
  Grid,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@material-ui/core";
import {DepositKeyInterface, DepositStatus, LanguageEnum, Network, TransactionStatus} from "../../../../types";
import {Language} from "../../../../language/Language";
import {AddressStatus, depositStatus} from "../../../Deposit";

const useStyles = makeStyles({
  table: {
    minWidth: 600,
  },
  tableBody: {
    maxHeight: 'calc(100vh - 375px)',
  },
});

type SendTransactionProps = {
  network: Network,
  sendNum: number,
  setSendNum: Dispatch<SetStateAction<number>>,
  finishedNum: number,
  setFinishedNum: Dispatch<SetStateAction<number>>,
  language: LanguageEnum,
  transactionTimer: NodeJS.Timer | null,
  setTransactionTimer: Dispatch<SetStateAction<NodeJS.Timer | null>>,
  easySendAll: boolean,
  addressStatus: AddressStatus,
  undoDepositKey: DepositKeyInterface[],
  number: number,
  easyModeStatus: depositStatus,
  setEastModeStatus: Dispatch<SetStateAction<depositStatus>>
}

const SendTransaction_All: FC<SendTransactionProps> = (props): ReactElement => {
  const classes = useStyles();
  const [disable, setDisable] = useState(false);

  let newEasyModeStatus = props.easyModeStatus
  let finishedNum = props.finishedNum

  useEffect(() => {
    if (newEasyModeStatus !== null && newEasyModeStatus !== undefined) {
      props.setEastModeStatus(newEasyModeStatus)
    }
  }, [newEasyModeStatus, props.sendNum, finishedNum])

  const confirmDeposit = async () => {
    setDisable(true)
    newEasyModeStatus.transactionStatus = TransactionStatus.STARTED
    const param = createSendAllParam()
    const result = await window.walletApi.sendTransaction_All(...param, 32 * props.number, props.network)
    if (result.result) {
      props.setSendNum(props.sendNum + 1)
      newEasyModeStatus.transactionStatus = TransactionStatus.PENDING
      newEasyModeStatus.txHash = result.txHash
      window.transactionApi.submitUndoneList(0, result.txHash, props.network)
      await finishedTransactionStatus()
      await Polling()
    } else {
      newEasyModeStatus.transactionStatus = TransactionStatus.REJECTED
      newEasyModeStatus.txHash = result.msg
    }

    setDisable(false)
    console.log('sendnum', props.sendNum)
  }

  const createSendAllParam = (): [string[], string[], string[], string[]] => {
    const pubkeys: string[] = [];
    const withdrawal_credentials: string[] = [];
    const signatures: string[] = [];
    const deposit_data_roots: string[] = [];

    props.undoDepositKey.slice(0, props.number).forEach(item => {
      pubkeys.push(pre0x(item.pubkey));
      withdrawal_credentials.push(pre0x(item.withdrawal_credentials));
      signatures.push(pre0x(item.signature));
      deposit_data_roots.push(pre0x(item.deposit_data_root));
    })

    return [pubkeys, withdrawal_credentials, signatures, deposit_data_roots]
  }

  const pre0x = (str: string) => {
    return "0x" + str;
  }

  const Polling = async () => {
    if (props.transactionTimer === null) {
      console.log(props.transactionTimer)
      props.setTransactionTimer(setInterval(fetchTransactionStatus, 1200))
    }
  }

  const fetchTransactionStatus = async () => {
    const finished = window.transactionApi.getFinished()
    if (finished != null) {
      newEasyModeStatus.transactionStatus = TransactionStatus.SUCCEEDED
      props.setFinishedNum(++finishedNum)
      await finishedTransactionStatus()
    }
  }

  const finishedTransactionStatus = async () => {
    if (finishedNum === props.sendNum && props.transactionTimer !== null) {
      clearInterval(props.transactionTimer)
      props.setTransactionTimer(null)
    }
  }

  return (
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <TableContainer component={Paper} className={classes.tableBody}>
            <Table className={classes.table} stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell><Language language={props.language} id="VALIDATORS"/></TableCell>
                  <TableCell><Language language={props.language} id="Status"/></TableCell>
                  <TableCell><Language language={props.language} id="Action"/></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Validator 1 {props.number > 1 ? `- ${props.number}` : ''}
                  </TableCell>
                  <TableCell>
                    {newEasyModeStatus.transactionStatus === TransactionStatus.READY || newEasyModeStatus.transactionStatus === TransactionStatus.STARTED ?
                        <Language language={props.language} id={DepositStatus[newEasyModeStatus.depositStatus]}/> :
                        (newEasyModeStatus.transactionStatus === TransactionStatus.PENDING || newEasyModeStatus.transactionStatus === TransactionStatus.SUCCEEDED) ?
                            <Button variant="outlined"
                                    color="primary"
                                    onClick={() => window.electronAPI.shellOpenExternal((props.network === Network.GOERLI ? "https://goerli.etherscan.io/tx/" : "https://etherscan.io/tx/") + newEasyModeStatus.txHash)}>
                              <Language language={props.language}
                                        id={TransactionStatus[newEasyModeStatus.transactionStatus]}/>
                            </Button>
                            : <Language language={props.language} id={newEasyModeStatus.txHash}/>
                    }
                  </TableCell>
                  <TableCell>
                    {newEasyModeStatus.depositStatus === 1 ?
                        <Button variant="text" color="primary"
                                onClick={() => window.electronAPI.shellOpenExternal((props.network === Network.GOERLI ? "https://goerli.beaconcha.in/validator/0x" : "https://mainnet.beaconcha.in/validator/0x") + props.undoDepositKey[0].pubkey)}
                        ><Language language={props.language} id="Already_Deposited"/></Button>
                        : newEasyModeStatus.transactionStatus === TransactionStatus.PENDING ?
                            <Button variant="outlined" color="secondary"><Language language={props.language}
                                                                                   id="WAITING_FOR_SUCCESS"/></Button> :
                            newEasyModeStatus.transactionStatus === TransactionStatus.SUCCEEDED ?
                                <Button variant="outlined" color="primary"><Language language={props.language}
                                                                                     id="SUCCESS"/></Button> :
                                <Button variant="outlined" color="secondary"
                                        onClick={() => {
                                          confirmDeposit()
                                        }}
                                        disabled={newEasyModeStatus.transactionStatus === TransactionStatus.STARTED || disable}>
                                  <Language language={props.language}
                                            id={newEasyModeStatus.transactionStatus === TransactionStatus.READY || newEasyModeStatus.transactionStatus === TransactionStatus.STARTED ? "Confirm_Deposit" : "Retry"}/>
                                </Button>

                    }
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
  );
}

export default SendTransaction_All;
