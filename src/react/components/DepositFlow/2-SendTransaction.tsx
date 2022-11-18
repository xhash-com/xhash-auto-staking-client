import React, {Dispatch, FC, ReactElement, SetStateAction, useState} from "react";
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
import {DepositKeyInterface, DepositStatus, LanguageEnum, Network, TransactionStatus} from "../../types";
import {Language} from "../../language/Language";

const useStyles = makeStyles({
  table: {
    minWidth: 600,
  },
  tableBody: {
    maxHeight: 325,
  },
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
}

const SendTransaction: FC<SendTransactionProps> = (props): ReactElement => {
  const classes = useStyles();
  const [disable, setDisable] = useState(false);
  const newItems = props.depositKey

  async function confirmDeposit(row: DepositKeyInterface, index: number){
    setDisable(true)
    setTimeout(()=>setDisable(false), 1000)
    waitForSend(row, index)
    const result = await window.walletApi.sendTransaction(row.pubkey, row.withdrawal_credentials, row.signature, row.deposit_data_root, row.amount, props.network)
    const newItem: DepositKeyInterface = Object.assign({}, row)
    if (result.result){
      props.setSendNum(props.sendNum + 1)
      newItems[index].transactionStatus = TransactionStatus.PENDING
      newItems[index].txHash = result.txHash
    }else{
      newItems[index].transactionStatus = TransactionStatus.REJECTED
      newItems[index].txHash = result.msg
    }

    console.log(result)
    props.setDepositKey([...newItems.slice(0, index), Object.assign({}, newItems[index]), ...newItems.slice(index+1)])
    if (result.result){
      Polling(index, result.txHash)
    }
  }

  const waitForSend = (row: DepositKeyInterface, index: number) => {
    const newItem: DepositKeyInterface = Object.assign({}, row)
    newItems[index].transactionStatus = TransactionStatus.STARTED
    props.setDepositKey(newItems)
  }

  const Polling = async (index: number, hash: string) => {
    let timer: NodeJS.Timer;
    timer = setInterval(() => {
      const result = window.walletApi.fetchTransactionStatus(hash, props.network);
      result.then(res=>{
        if (res.data.result==="True"){
          props.setFinishedNum(props.finishedNum + 1)
          const newItem: DepositKeyInterface = Object.assign({}, props.depositKey[index])
          newItems[index].transactionStatus = TransactionStatus.SUCCEEDED
          props.setDepositKey(newItems)
          clearInterval(timer)
        }
      })
    }, 2000)
  }

  return (
   <Grid container spacing={0}>
     <Grid item xs={12}>
       <TableContainer component={Paper} className={classes.tableBody}>
         <Table className={classes.table} stickyHeader aria-label="sticky table">
           <TableHead>
             <TableRow>
               <TableCell><Language language={props.language} id="Validator_Public_Key"/></TableCell>
               <TableCell><Language language={props.language} id="Status"/></TableCell>
               <TableCell><Language language={props.language} id="Action"/></TableCell>
             </TableRow>
           </TableHead>
           <TableBody>
             {props.depositKey.map((row, index) => (
                 <TableRow key={row.pubkey}>
                   <TableCell component="th" scope="row">
                     {row.pubkey.slice(0, 10)}...{row.pubkey.slice(-10)}
                   </TableCell>
                   <TableCell>
                       { row.transactionStatus === TransactionStatus.READY || row.transactionStatus === TransactionStatus.STARTED ? <Language language={props.language} id={DepositStatus[row.depositStatus]}/> :
                           (row.transactionStatus === TransactionStatus.PENDING || row.transactionStatus === TransactionStatus.SUCCEEDED ) ? <Button variant="outlined"
                                                                 color="primary"
                                                                 onClick={()=>window.electronAPI.shellOpenExternal((props.network === Network.GOERLI ? "https://goerli.etherscan.io/tx/" : "https://etherscan.io/tx/") + row.txHash)}>
                                                                   <Language language={props.language} id={TransactionStatus[row.transactionStatus]}/>
                                                         </Button>
                               : <Language language={props.language} id={row.txHash}/>
                       }
                   </TableCell>
                   <TableCell>
                     {row.depositStatus === 1 ?
                         <Button variant="text" color="primary"
                                 onClick={()=>window.electronAPI.shellOpenExternal((props.network === Network.GOERLI ? "https://goerli.beaconcha.in/validator/0x" : "https://mainnet.beaconcha.in/validator/0x") + row.pubkey)}
                         ><Language language={props.language} id="Already_Deposited"/></Button>
                         // : <Button variant="outlined" color="secondary" onClick={() => {confirmDeposit(row, index)}}>Confirm deposit</Button>}
                          : row.transactionStatus === TransactionStatus.PENDING ? <Button variant="outlined" color="secondary"><Language language={props.language} id="WAITING_FOR_SUCCESS"/></Button> :
                             row.transactionStatus === TransactionStatus.SUCCEEDED ? <Button variant="outlined" color="primary"><Language language={props.language} id="SUCCESS"/></Button> :
                                 <Button variant="outlined" color="secondary"
                                         onClick={() => {confirmDeposit(row, index)}}
                                         disabled={row.transactionStatus === TransactionStatus.STARTED || disable}>
                                   <Language language={props.language} id={row.transactionStatus === TransactionStatus.READY || row.transactionStatus === TransactionStatus.STARTED ? "Confirm_Deposit" : "Retry"}/>
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

export default SendTransaction;
