import { Button, Fade, FormControlLabel, Grid, Switch, TextField, Tooltip, Typography } from '@material-ui/core';
import React, { Dispatch, SetStateAction, useState } from 'react';
import styled from "styled-components";
import { errors, tooltips } from '../../constants';
import {LanguageEnum} from "../../types";
import {Language, LanguageFunc} from "../../language/Language";

type GenerateKeysProps = {
  numberOfKeys: number,
  setNumberOfKeys: Dispatch<SetStateAction<number>>,
  withdrawalAddress: string,
  setWithdrawalAddress: Dispatch<SetStateAction<string>>,
  index: number,
  setIndex: Dispatch<SetStateAction<number>>,
  showIndexInput: boolean,
  password: string,
  setPassword: Dispatch<SetStateAction<string>>,
  withdrawalAddressFormatError: boolean,
  setWithdrawalAddressFormatError: Dispatch<SetStateAction<boolean>>,
  numberOfKeysError: boolean,
  passwordStrengthError: boolean,
  startingIndexError: boolean,
  onFinish: () => void,
  language: LanguageEnum,
}

const StyledTextField = styled(TextField)`
  margin: 12px 0;
  width: 260px;
  min-height: 79px;
`

const AddressTextField = styled(TextField)`
  margin: 12px 0;
  width: 440px;
`

const WithdrawalNotice = styled(Typography)`
  margin: 0 60px;
`

/**
 * This page gathers data about the keys to generate for the user
 *
 * @param props self documenting parameters passed in
 * @returns
 */
const KeyInputs = (props: GenerateKeysProps) => {
  const updateNumberOfKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    props.setNumberOfKeys(num);
  }

  const updateIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    props.setIndex(num);
  }

  const updatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setPassword(e.target.value);
  }

  const updateEth1WithdrawAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setWithdrawalAddress(e.target.value.trim());
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body1">
          <Language language={props.language} id="Collect_Some_Info"/>
        </Typography>
      </Grid>
      <Grid container item direction="row" justifyContent="center" alignItems="center" spacing={2} xs={12}>
        <Grid item>
          <Tooltip title={LanguageFunc("NUMBER_OF_KEYS", props.language)}>
            <StyledTextField
              id="number-of-keys"
              label={LanguageFunc("Number_Of_New_Keys", props.language)}
              variant="outlined"
              type="number"
              value={props.numberOfKeys}
              onChange={updateNumberOfKeys}
              InputProps={{ inputProps: { min: 1, max: 1000 } }}
              error={props.numberOfKeysError}
              helperText={ props.numberOfKeysError ? LanguageFunc("NUMBER_OF_KEYS", props.language) : ""}
            />
          </Tooltip>
        </Grid>
        { props.showIndexInput &&
          <Grid item>
            <Tooltip title={LanguageFunc("STARTING_INDEX", props.language)}>
              <StyledTextField
                id="index"
                label={LanguageFunc("Amount_Of_Existing", props.language)}
                variant="outlined"
                type="number"
                value={props.index}
                onChange={updateIndex}
                InputProps={{ inputProps: { min: 0 } }}
                error={props.startingIndexError}
                helperText={props.startingIndexError ? LanguageFunc("STARTING_INDEX", props.language) : ""}
              />
            </Tooltip>
          </Grid>
        }
        <Grid item>
          <Tooltip title={LanguageFunc("PASSWORD", props.language)}>
            <StyledTextField
              id="password"
              label={LanguageFunc("Password", props.language)}
              type="password"
              variant="outlined"
              value={props.password}
              onChange={updatePassword}
              error={props.passwordStrengthError}
              helperText={props.passwordStrengthError ? LanguageFunc("PASSWORD_STRENGTH", props.language) : ""}
            />
          </Tooltip>
        </Grid>
      </Grid>
      <Grid item>
      </Grid>
      <Grid item>
          <Grid container item direction="row" justifyContent="center" alignItems="center" spacing={2} xs={12}>
            <Grid item>
              <Tooltip title={LanguageFunc("ETH1_WITHDRAW_ADDRESS", props.language)}>
                <AddressTextField
                  id="eth1-withdraw-address"
                  label={LanguageFunc("Ethereum_Withdrawal_Address", props.language)}
                  variant="outlined"
                  value={props.withdrawalAddress}
                  onChange={updateEth1WithdrawAddress}
                  error={props.withdrawalAddressFormatError}
                  helperText={ props.withdrawalAddressFormatError ? LanguageFunc("ADDRESS_FORMAT_ERROR", props.language) : ""}
                />
              </Tooltip>
              <Typography variant="body1">
                <Language language={props.language} id="TIPS"/>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
    </Grid>
  );
}

export default KeyInputs;
