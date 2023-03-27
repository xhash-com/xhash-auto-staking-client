import React, {Dispatch, FC, ReactElement, SetStateAction, useEffect} from "react";
import {Button, Grid, makeStyles, styled, TextField, Typography} from "@material-ui/core";
import {
  BatchLimit,
  DepositKeyBatch,
  DepositKeyInterface,
  DepositStatus,
  LanguageEnum,
  Network,
  TransactionStatus
} from "../../../../types";
import {AddressStatus} from "../../../Deposit";
import {Language, LanguageFunc} from "../../../../language/Language";

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
  noticeError: Function,
  setDepositKeyBatch: Dispatch<SetStateAction<DepositKeyBatch[]>>,
  depositKeyBatch: DepositKeyBatch[],
  batchNumber: number,
  setBatchNumber: Dispatch<SetStateAction<number>>
}

const Summary: FC<SendTransactionProps> = (props): ReactElement => {
  const classes = useStyles();
  const [needBalance, setNeedBalance] = React.useState(0)
  const needBalanceCalc = () => {
    let sum = 0
    for (let i = 0; i < props.batchNumber; i++) {
      sum += props.undoDepositKey[i].amount / Math.pow(10, 9)
    }
    setNeedBalance(sum)
  }

  //改变批次数量时改变需要的余额
  useEffect(() => {
    needBalanceCalc()
  }, [props.batchNumber])

  const handleChange = (event: any) => {
    props.setBatchNumber(event.target.value);
  }

  const handleInput = (event: any) => {
    event.target.value = event.target.value.replace(/[^0-9-]/g, '');
  };

  const checkPass = () => {
    return checkBalance() && checkNewNumber()
  }

  const checkBalance = () => {
    const result = props.addressStatus.balance >= needBalance
    if (!result) {
      props.noticeError(LanguageFunc('INSUFFICIENT_FUNDS', props.language))
    }
    return props.addressStatus.balance >= needBalance
  }

  const checkNewNumber = () => {
    const result = props.undoDepositKey.length >= props.batchNumber && props.batchNumber > 0
    if (!result) {
      props.noticeError(LanguageFunc('Invalid_number', props.language))
    }
    return result
  }

  const pre0x = (str: string) => {
    return "0x" + str;
  }

  const confirm = () => {
    if (checkPass()) {
      const depositKeyBatchList: DepositKeyBatch[] = []
      //组装数据
      for (let i = 0; i < props.batchNumber / BatchLimit; i++) {
        const depositKeyBatch: DepositKeyBatch = {
          number: 0,
          txHash: "",
          pubkeys: [],
          signatures: [],
          withdrawal_credentials: [],
          deposit_data_roots: [],
          depositStatus: DepositStatus.READY_FOR_DEPOSIT,
          transactionStatus: TransactionStatus.READY,
          amount: 0
        }
        props.undoDepositKey.slice(i * BatchLimit, Math.min((i + 1) * BatchLimit, props.batchNumber)).forEach(item => {
          depositKeyBatch.pubkeys.push(pre0x(item.pubkey));
          depositKeyBatch.withdrawal_credentials.push(pre0x(item.withdrawal_credentials));
          depositKeyBatch.signatures.push(pre0x(item.signature));
          depositKeyBatch.deposit_data_roots.push(pre0x(item.deposit_data_root));
          depositKeyBatch.amount += item.amount
          depositKeyBatch.number++
        })
        depositKeyBatchList.push(depositKeyBatch)
      }

      props.setDepositKeyBatch(depositKeyBatchList)
      props.setIfConfirm(true)
    }
  }

  return (
      <Grid container spacing={0} justifyContent="center">
        <Grid item>
          <Typography variant="h6" className={classes.title}>
            <Language language={props.language} id='Summary_Title_1'/>
          </Typography>
        </Grid>
        <Grid item container xs={12} direction="column" alignItems="center" className={classes.newGrid}>
          <UnderlineGridContainer container justifyContent="space-between">
            <Typography variant="inherit" className={classes.text}>
              <Language language={props.language} id='Summary_Title_2_1'/>
            </Typography>
            <Grid item>{props.depositKey.length}</Grid>
          </UnderlineGridContainer>
          <UnderlineGridContainer container alignItems="center" justifyContent="space-between">
            <Typography variant="inherit" className={classes.text}>
              <Language language={props.language} id='Summary_Title_2_2'/>
            </Typography>
            <Grid item>{props.depositKey.length - props.undoDepositKey.length}</Grid>
          </UnderlineGridContainer>
          <UnderlineGridContainer container alignItems="center" justifyContent="space-between">
            <Typography variant="inherit" className={classes.text}>
              <Language language={props.language} id='Summary_Title_2_3'/>
            </Typography>
            <Grid item>{props.undoDepositKey.length}</Grid>
          </UnderlineGridContainer>
        </Grid>
        <Grid item container xs={12} direction="row" alignItems="center" className={classes.newGrid}>
          <TextField label={LanguageFunc('Summary_Title_3', props.language)}
                     fullWidth={true}
                     type={'number'}
                     value={props.batchNumber}
                     onInput={handleInput}
                     onChange={handleChange}
                     inputProps={{max: props.depositKey.length - props.undoDepositKey.length, step: 1}}
                     className={classes.input}/>
        </Grid>
        <Grid item container xs={12} direction="column" alignItems="center" className={classes.newGrid}>
          <UnderlineGridContainer container justifyContent="space-between">
            <Typography variant="inherit" className={classes.text}>
              <Language language={props.language} id='Summary_Title_4_1'/>
            </Typography>
            <Grid item>{needBalance} ETH</Grid>
          </UnderlineGridContainer>
          <UnderlineGridContainer container alignItems="center" justifyContent="space-between">
            <Typography variant="inherit" className={classes.text}>
              <Language language={props.language} id='Summary_Title_4_2'/>
            </Typography>
            <Grid item>{props.addressStatus.balance} ETH</Grid>
          </UnderlineGridContainer>
        </Grid>
        <Grid item xs={12}>
          <Button onClick={confirm} variant="contained" className={classes.button}><Language language={props.language}
                                                                                             id='Just_Confirm'/></Button>
        </Grid>
      </Grid>
  );
}

export default Summary;
