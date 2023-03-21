import React, {Dispatch, FC, ReactElement, SetStateAction, useState} from "react";
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
import {DepositKeyInterface, DepositStatus, LanguageEnum, Network} from "../../types";
import {ChevronRight} from "@material-ui/icons";
import {Language} from "../../language/Language";
import {AddressStatus, depositStatus} from "../Deposit";
import Depositer from "./SendTransaction/Depositer";
import SendTransaction_Every from "./SendTransaction/SendTransaction_Every";
import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles({
  IconButton: {
    width: 40,
    height: 'calc(100vh - 375px)',
  },
  fullScreen: {
    width: '100%',
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
  setUndoDepositKey: Dispatch<SetStateAction<DepositKeyInterface[]>>
  easyModeStatus: depositStatus,
  setEastModeStatus: Dispatch<SetStateAction<depositStatus>>
}

const SendTransaction: FC<SendTransactionProps> = (props): ReactElement => {

  const classes = useStyles();

  const [open, setOpen] = React.useState(true);
  const [errorInfo, setErrorInfo] = useState("");
  const [showError, setShowError] = useState(false);

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

  const startEasyMode = () => {
    const newDepositKey: DepositKeyInterface[] = []
    newDepositKey.push(...props.depositKey.filter(item => item.depositStatus === DepositStatus.READY_FOR_DEPOSIT))
    props.setUndoDepositKey(newDepositKey)
    props.setEasySendAll(true)
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
        <Grid item className={props.easySendAll ? classes.fullScreen : ''}>
          {content()}
        </Grid>
        {!props.easySendAll &&
        <Grid container item className={classes.IconButton} alignItems="center">
            <IconButton onClick={startEasyMode}>
                <ChevronRight/>
            </IconButton>
        </Grid>
        }
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
