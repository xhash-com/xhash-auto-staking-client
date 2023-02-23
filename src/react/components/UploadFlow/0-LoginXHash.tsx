import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
  Tooltip,
  Typography
} from '@material-ui/core';
import React, {Dispatch, FC, ReactElement, SetStateAction} from 'react';
import styled from 'styled-components';
import {LanguageEnum} from "../../types";
import {Language, LanguageFunc} from "../../language/Language";

type LoginXHashProps = {
  email: string,
  setEmail: Dispatch<SetStateAction<string>>,
  password: string,
  setPassword: Dispatch<SetStateAction<string>>,
  emailError: boolean,
  passwordStrengthError: boolean,
  language: LanguageEnum,
  twoFactorToken: string,
  open2FA: boolean,
  set2FACode: Dispatch<SetStateAction<string>>,
  verify2FA: Function
}

const StyledTextField = styled(TextField)`
  margin: 1px 0;
  width: 260px;
  min-height: 79px;
`;

/**
 * This is the page that login to XHash.
 *
 * @returns the react element to render
 */
const LoginXHash: FC<LoginXHashProps> = (props): ReactElement => {

  const updateEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setEmail(e.target.value);
  }

  const updatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setPassword(e.target.value);
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body1">
          <Language language={props.language} id="Login_XHash"/>
        </Typography>
      </Grid>
      <Grid container item direction="column" justifyContent="center" alignItems="center" spacing={2} xs={12}>
        <Dialog open={props.open2FA}>
          <DialogTitle><Language language={props.language} id="Two_Factor_Authentication"/></DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Language language={props.language} id="Enter_your_2FA_code"/>
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                id="2FA"
                type="text"
                onChange={event => props.set2FACode(event.target.value)}
                fullWidth
                variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => props.verify2FA()}><Language language={props.language} id="Submit"/></Button>
          </DialogActions>
        </Dialog>
        <Grid item>
          <Tooltip title={LanguageFunc("EMAIL", props.language)}>
            <StyledTextField
                id="email"
                label={LanguageFunc("Email", props.language)}
                variant="outlined"
                type="string"
                value={props.email}
                onChange={updateEmail}
                error={props.emailError}
                helperText={props.emailError ? LanguageFunc("EMAIL_ERROR", props.language) : ""}
            />
          </Tooltip>
        </Grid>

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
        <Grid item>
          <Language language={props.language} id="No_Account"/> <Button onClick={() => window.electronAPI.shellOpenExternal("https://xhash.com/signUp")}><Language language={props.language} id="Sign_Up"/></Button>
        </Grid>

      </Grid>
    </Grid>
  );
}

export default LoginXHash;
