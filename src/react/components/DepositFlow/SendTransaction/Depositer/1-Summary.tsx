import React, {Dispatch, FC, ReactElement, SetStateAction} from "react";
import {Button, Grid, makeStyles, styled, TextField, Typography} from "@material-ui/core";
import {DepositKeyInterface, LanguageEnum, Network} from "../../../../types";
import {AddressStatus} from "../../../Deposit";

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

const UnderlineGridContainer = styled(Grid)({
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
  setIfConfirm: Dispatch<SetStateAction<boolean>>
  undoDepositKey: DepositKeyInterface[],
  number: number,
  setNumber: Dispatch<SetStateAction<number>>,
  noticeError: Function,
}

const Summary: FC<SendTransactionProps> = (props): ReactElement => {
  const classes = useStyles();

  const handleChange = (event: any) => {
    props.setNumber(event.target.value);
  }

  const handleInput = (event: any) => {
    event.target.value = event.target.value.replace(/[^0-9-]/g, '');
  };

  const checkPass = () => {
    return checkBalance() && checkNewNumber()
  }

  const checkBalance = () => {
    const result = props.addressStatus.balance >= 32 * props.number
    if (!result) {
      props.noticeError("余额不足")
    }
    return props.addressStatus.balance >= 32 * props.number
  }

  const checkNewNumber = () => {
    const result = props.undoDepositKey.length >= props.number && props.number > 0
    if (!result) {
      props.noticeError("无效的数目")
    }
    return result
  }

  const pre0x = (str: string) => {
    return "0x" + str;
  }

  const confirm = () => {
    props.setIfConfirm(checkPass())
  }

  return (
      <Grid container spacing={0} justifyContent="center">
        <Grid item>
          <Typography variant="h6" className={classes.title}>
            Here is the list of possible deposits that can be made according to your deposit data file.
          </Typography>
        </Grid>
        <Grid item container xs={12} direction="column" alignItems="center" className={classes.newGrid}>
          <UnderlineGridContainer container justifyContent="space-between">
            <Typography variant="inherit" className={classes.text}>
              Total nodes in deposit data file:
            </Typography>
            <Grid item>{props.depositKey.length}</Grid>
          </UnderlineGridContainer>
          <UnderlineGridContainer container alignItems="center" justifyContent="space-between">
            <Typography variant="inherit" className={classes.text}>
              Already made deposits:
            </Typography>
            <Grid item>{props.depositKey.length - props.undoDepositKey.length}</Grid>
          </UnderlineGridContainer>
          <UnderlineGridContainer container alignItems="center" justifyContent="space-between">
            <Typography variant="inherit" className={classes.text}>
              New deposits that can be made:
            </Typography>
            <Grid item>{props.undoDepositKey.length}</Grid>
          </UnderlineGridContainer>
        </Grid>
        <Grid item container xs={12} direction="row" alignItems="center" className={classes.newGrid}>
          <TextField label="Number of deposits you want to send:"
                     fullWidth={true}
                     type={'number'}
                     onInput={handleInput}
                     onChange={handleChange}
                     inputProps={{max: props.depositKey.length - props.undoDepositKey.length, step: 1}}
                     className={classes.input}/>
        </Grid>
        <Grid item container xs={12} direction="column" alignItems="center" className={classes.newGrid}>
          <UnderlineGridContainer container justifyContent="space-between">
            <Typography variant="inherit" className={classes.text}>
              Amount to send:
            </Typography>
            <Grid item>{32 * props.number} ETH</Grid>
          </UnderlineGridContainer>
          <UnderlineGridContainer container alignItems="center" justifyContent="space-between">
            <Typography variant="inherit" className={classes.text}>
              Available:
            </Typography>
            <Grid item>{props.addressStatus.balance} ETH</Grid>
          </UnderlineGridContainer>
        </Grid>
        <Grid item xs={12}>
          <Button onClick={confirm} variant="contained" className={classes.button}>CONFIRM</Button>
        </Grid>
      </Grid>
  );
}

export default Summary;
