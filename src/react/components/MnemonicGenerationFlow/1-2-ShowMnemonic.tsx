import { Tooltip, IconButton, Grid, Typography, CircularProgress, TextField, withStyles } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { FileCopy } from '@material-ui/icons';
import React, { FC, ReactElement, Fragment, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {LanguageEnum, Network} from '../../types';
import {Language, LanguageFunc} from "../../language/Language";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 4px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 2s linear infinite;
`;

const LoudText = styled(Typography)`
  color: cyan;
  text-align: left;
  display: inline;
`;

const WhiteDisabledTextField = withStyles({
  root: {
    marginRight: 8,
    "& .MuiInputBase-root.Mui-disabled": {
      color: "white"
    }
  }
})(TextField);

type ShowMnemonicProps = {
  showCopyWarning: boolean,
  mnemonic: string,
  network: Network,
  language: LanguageEnum,
}

/**
 * This page displays the mnemonic to the user and prompts them to write it down.
 *
 * @param props the data passed in, self documenting
 * @returns the react element to render.
 */
const ShowMnemonic: FC<ShowMnemonicProps> = (props): ReactElement => {
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyTooltipClose = () => {
    setCopyTooltipOpen(false);
    setTimeout(() => setCopied(false), 200);
  };

  const handleCopyTooltipOpen = () => {
    setCopyTooltipOpen(true);
  };

  const copyMnemonic = () => {
    window.electronAPI.clipboardWriteText(props.mnemonic);
    setCopied(true);
  };

  const createMnemonicDisplay = () => {
    return(
      <Grid container item xs={10} spacing={2}>
        {
          props.mnemonic.split(' ').map((word, i) => {
            return (
              <Grid item xs={2} key={"mnemonic-grid-key-" + i}>
                <WhiteDisabledTextField
                  disabled
                  id={"mnemonic-textfield-id-" + i}
                  key={"mnemonic-textfield-key-" + i}
                  label={ LanguageFunc("Word", props.language)+ (i+1)}
                  variant="outlined"
                  value={word} />
              </Grid>
            );
          })
        }
      </Grid>
    );
  }

  const copyText = <Language language={props.language} id={copied ? "Copied" : "Copy"}/>;

  return (
    <Grid container>
      { props.mnemonic == "" &&
        <Grid container spacing={5}>
          <Grid item xs={12}>
              <Language language={props.language} id="Generating"/>
          </Grid>
          <Grid item container xs={12} justifyContent="center">
            <Loader />
          </Grid>
        </Grid>
      }
      { props.mnemonic != "" &&
        <Grid container spacing={3}>

          <Grid item xs={12}>
            { !props.showCopyWarning &&
                <Typography><Language language={props.language} id="Not_ShowCopyWarning"/></Typography>
            }
            { props.showCopyWarning &&
                <LoudText><Language language={props.language} id="ShowCopyWarning"/></LoudText>
            }
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs={1} />
            { createMnemonicDisplay() }
            <Grid item xs={1} style={{alignSelf: "center"}}>
              <Tooltip title={copyText} open={copyTooltipOpen} onClose={handleCopyTooltipClose} onOpen={handleCopyTooltipOpen}>
                <IconButton aria-label="copy" color="primary" onClick={copyMnemonic} autoFocus>
                  <FileCopy />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
      }
    </Grid>
  );
}

export default ShowMnemonic;
