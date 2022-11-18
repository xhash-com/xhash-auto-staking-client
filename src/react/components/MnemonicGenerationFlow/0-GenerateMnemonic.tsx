import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import { Box, Grid, Link, Typography } from '@material-ui/core';
import styled from 'styled-components';
import {LanguageEnum} from "../../types";
import {Language} from "../../language/Language";

type GenerateMnemonicProps = {
  setGenerateError: Dispatch<SetStateAction<boolean>>,
  generateError: boolean,
  setGenerateErrorMsg: Dispatch<SetStateAction<string>>,
  generateErrorMsg: string,
  language: LanguageEnum,
}

const LoudText = styled.span`
  color: cyan;
`;

/**
 * This page initiates the mnemonic generation flow.  It displays info and creates the mnemonic.
 *
 * @param props the data and functions passed in, they are self documenting
 * @returns
 */
const GenerateMnemonic: FC<GenerateMnemonicProps> = (props): ReactElement => {
  return (
    <Grid container>
      <Grid item xs={1} />
      <Grid item xs={10}>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left">
            <Language language={props.language} id="Paragraph_1"/>
          </Typography>
        </Box>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left" gutterBottom>
            <Language language={props.language} id="Paragraph_2_1"/>
            <b>
              <Language language={props.language} id="Paragraph_2_2"/>
            </b>
            <Language language={props.language} id="Paragraph_2_3"/>
            <LoudText>
              <Language language={props.language} id="Paragraph_2_4"/>
            </LoudText>
            <Language language={props.language} id="Paragraph_2_5"/>
          </Typography>
        </Box>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left" gutterBottom>
            <Language language={props.language} id="Paragraph_3"/>
          </Typography>
        </Box>
        { props.generateError &&
          <Box sx={{ m: 2 }}>
            <Typography variant="body1" align="left" gutterBottom color="error">
              {props.generateErrorMsg}
            </Typography>
          </Box>
        }
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default GenerateMnemonic;
