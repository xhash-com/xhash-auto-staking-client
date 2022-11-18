import { Grid, TextField, Typography } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import styled from "styled-components";
import { errors } from '../../constants';
import {LanguageEnum} from "../../types";
import {Language, LanguageFunc} from "../../language/Language";

const Form = styled.form`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`

const StyledTextField = styled(TextField)`
  margin: 12px 0;
  width: 300px;
`

type VerifyKeysPasswordProps = {
  setVerifyPassword: Dispatch<SetStateAction<string>>,
  passwordVerifyError: boolean,
  onFinish: () => void,
  language: LanguageEnum,
}

/**
 * The page that prompts the user to reinput their keys password
 * @param props self documenting parameters passed in
 * @returns react element to render
 */
const VerifyKeysPassword: FC<VerifyKeysPasswordProps> = (props): ReactElement => {

  const updateVerifyPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setVerifyPassword(e.target.value);
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLFormElement>) => {
    if (evt.key === 'Enter') {
      props.onFinish();
    }
  }

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item xs={12}>
        <Typography>
          <Language language={props.language} id="To_Be_Sure"/>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Form onKeyDown={handleKeyDown}>
          <StyledTextField
            id="password"
            label={LanguageFunc("Retype_Password", props.language)}
            type="password"
            variant="outlined"
            autoFocus
            onChange={updateVerifyPassword}
            error={props.passwordVerifyError}
            helperText={props.passwordVerifyError ? LanguageFunc("PASSWORD_MATCH", props.language) : ""}
          />
        </Form>
      </Grid>
    </Grid>
  );
}

export default VerifyKeysPassword;
