import React, {Dispatch, FC, ReactElement, SetStateAction, useEffect, useState} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles
} from "@material-ui/core";
import {DepositKeyBatch, DepositKeyInterface, DepositStatus, LanguageEnum, Network,} from "../../types";
import {Language} from "../../language/Language";
import {AddressStatus} from "../Deposit";
import Depositer from "./SendTransaction/Depositer";
import SendTransaction_Every from "./SendTransaction/SendTransaction_Every";
import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles({
  fullScreen: {
    width: 'calc(95%)',
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
  transactionTimer: NodeJS.Timer | null,
  setTransactionTimer: Dispatch<SetStateAction<NodeJS.Timer | null>>,
  easySendAll: boolean,
  setEasySendAll: Dispatch<SetStateAction<boolean>>
  addressStatus: AddressStatus,
  undoDepositKey: DepositKeyInterface[],
  setUndoDepositKey: Dispatch<SetStateAction<DepositKeyInterface[]>>,
  depositKeyBatch: DepositKeyBatch[],
  setDepositKeyBatch: Dispatch<SetStateAction<DepositKeyBatch[]>>
  disableChangeMode: Function
  batchNumber: number,
  setBatchNumber: Dispatch<SetStateAction<number>>
}

const SendTransaction: FC<SendTransactionProps> = (props): ReactElement => {

  const classes = useStyles();

  const [open, setOpen] = React.useState(true);
  const [errorInfo, setErrorInfo] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    easyMode()
  }, [])

  const noticeError = (str: string) => {
    setErrorInfo(str)
    setShowError(true)
  }

  const cloesError = () => {
    setShowError(false)
  }

  const handleClose = () => {
    setOpen(false);
  };

  const easyMode = () => {
    const newDepositKey: DepositKeyInterface[] = []
    newDepositKey.push(...props.depositKey.filter(item => item.depositStatus === DepositStatus.READY_FOR_DEPOSIT))
    props.setUndoDepositKey(newDepositKey)
    props.setBatchNumber(newDepositKey.length)
  }

  const content = () => {
    if (props.easySendAll) {
      return (<Depositer {...props} noticeError={noticeError}/>)
    } else {
      return (<SendTransaction_Every {...props}/>)
    }
  }
  return (
      <Grid container
            direction="row">
        {open && <Grid>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    <Language language={props.language} id="Wallet_Notice_Title"/>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Language language={props.language} id="Wallet_Running_Notice"/>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} autoFocus>
                        <Language language={props.language} id="Sure"/>
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>}
        <Grid item className={classes.fullScreen}>
          {content()}
        </Grid>
        <Snackbar
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            open={showError}
            onClose={cloesError}
            autoHideDuration={3000}
            message={errorInfo}
            action={
              <React.Fragment>
                <IconButton size="small" aria-label="close" color="inherit" onClick={cloesError}>
                  <CloseIcon fontSize="small"/>
                </IconButton>
              </React.Fragment>
            }
        />
      </Grid>

  );
}

export default SendTransaction;
