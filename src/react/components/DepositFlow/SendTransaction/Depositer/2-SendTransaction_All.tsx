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
import {
  BatchLimit,
  DepositKeyBatch,
  DepositKeyInterface,
  DepositStatus,
  LanguageEnum,
  Network,
  TransactionStatus
} from "../../../../types";
import {Language} from "../../../../language/Language";
import {AddressStatus} from "../../../Deposit";

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
  batchNumber: number,
  depositKeyBatch: DepositKeyBatch[],
  setDepositKeyBatch: Dispatch<SetStateAction<DepositKeyBatch[]>>,
  disableChangeMode: Function,
}

const SendTransaction_All: FC<SendTransactionProps> = (props): ReactElement => {
  const classes = useStyles();
  const [disable, setDisable] = useState(false);

  let newItems = props.depositKeyBatch
  let finishedNum = props.finishedNum

  useEffect(() => {
    if (newItems !== null && newItems !== undefined) {
      props.setDepositKeyBatch(newItems)
    }
  }, [newItems, props.sendNum, finishedNum])

  async function confirmDeposit(row: DepositKeyBatch, index: number) {
    props.disableChangeMode()
    setDisable(true)
    newItems[index].transactionStatus = TransactionStatus.STARTED
    const result = await window.walletApi.sendTransaction_All(row.pubkeys, row.withdrawal_credentials, row.signatures, row.deposit_data_roots, row.amount, props.network)
    if (result.result) {
      props.setSendNum(props.sendNum + 1)
      newItems[index].transactionStatus = TransactionStatus.PENDING
      newItems[index].txHash = result.txHash
      window.transactionApi.submitUndoneList(index, result.txHash, props.network)
      await finishedTransactionStatus()
      await Polling()
    } else {
      newItems[index].transactionStatus = TransactionStatus.REJECTED
      newItems[index].txHash = result.msg
    }

    setDisable(false)
    console.log('sendnum', props.sendNum)
  }

  const Polling = async () => {
    if (props.transactionTimer === null) {
      props.setTransactionTimer(setInterval(fetchTransactionStatus, 1200))
    }
  }

  const fetchTransactionStatus = async () => {
    const finished = window.transactionApi.getFinished()
    if (finished != null) {
      newItems[finished.id].transactionStatus = TransactionStatus.SUCCEEDED
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
                {props.depositKeyBatch.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        <Language language={props.language}
                                  id="Validator"/> {index * BatchLimit + 1}{row.number > 1 && ` - ${index * BatchLimit + row.number}`}
                      </TableCell>
                      <TableCell>
                        {row.transactionStatus === TransactionStatus.READY || row.transactionStatus === TransactionStatus.STARTED ?
                            <Language language={props.language} id={DepositStatus[row.depositStatus]}/> :
                            (row.transactionStatus === TransactionStatus.PENDING || row.transactionStatus === TransactionStatus.SUCCEEDED) ?
                                <Button variant="outlined"
                                        color="primary"
                                        onClick={() => window.electronAPI.shellOpenExternal((props.network === Network.GOERLI ? "https://goerli.etherscan.io/tx/" : "https://etherscan.io/tx/") + row.txHash)}>
                                  <Language language={props.language} id={TransactionStatus[row.transactionStatus]}/>
                                </Button>
                                : <Language language={props.language} id={row.txHash}/>
                        }
                      </TableCell>
                      <TableCell>
                        {row.depositStatus === 1 ?
                            <Button variant="text" color="primary"
                                    onClick={() => window.electronAPI.shellOpenExternal((props.network === Network.GOERLI ? "https://goerli.etherscan.io/tx/" : "https://etherscan.io/tx/") + row.txHash)}
                            ><Language language={props.language} id="Already_Deposited"/></Button>
                            // : <Button variant="outlined" color="secondary" onClick={() => {confirmDeposit(row, index)}}>Confirm deposit</Button>}
                            : row.transactionStatus === TransactionStatus.PENDING ?
                                <Button variant="outlined" color="secondary"><Language language={props.language}
                                                                                       id="WAITING_FOR_SUCCESS"/></Button> :
                                row.transactionStatus === TransactionStatus.SUCCEEDED ?
                                    <Button variant="outlined" color="primary"><Language language={props.language}
                                                                                         id="SUCCESS"/></Button> :
                                    <Button variant="outlined" color="secondary"
                                            onClick={() => {
                                              confirmDeposit(row, index)
                                            }}
                                            disabled={row.transactionStatus === TransactionStatus.STARTED || disable}>
                                      <Language language={props.language}
                                                id={row.transactionStatus === TransactionStatus.READY || row.transactionStatus === TransactionStatus.STARTED ? "Confirm_Deposit" : "Retry"}/>
                                    </Button>

                        }
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
  );
}

export default SendTransaction_All;
