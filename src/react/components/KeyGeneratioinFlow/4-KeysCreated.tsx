import { Box, Grid, Typography, Link } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import {LanguageEnum, Network} from '../../types';
import {Language, LanguageFunc} from "../../language/Language";

type KeysCreatedProps = {
  folderPath: string,
  network: Network,
  language: LanguageEnum,
}

const LoudText = styled(Typography)`
  color: cyan;
  text-align: left;
`;

const QuietText = styled(Typography)`
  color: gray;
  text-align: left;
`;

/**
 * The final page displaying key location and information about them.
 *
 * @param props self documenting paramenters passed in
 * @returns the react element to render
 */
const KeysCreated: FC<KeysCreatedProps> = (props): ReactElement => {

  const openKeyLocation = () => {
    window.bashUtils.findFirstFile(props.folderPath, "keystore")
      .then((keystoreFile) => {
        let fileToLocate = props.folderPath;
        if (keystoreFile != "") {
          fileToLocate = keystoreFile;
        }
        window.electronAPI.shellShowItemInFolder(fileToLocate);
    });
  }

  return (
    <Grid container>
      <Grid item xs={1} />
      <Grid item xs={10}>
          <Box sx={{ m: 2 }}>
            <Typography variant="body1" align="left">
              <Language language={props.language} id="Your_Keys_Created_Here"/> <Link display="inline" component="button" onClick={openKeyLocation}>{props.folderPath}</Link>
            </Typography>
          </Box>
          <Box sx={{ m: 2 }}>
            <Typography variant="body1" align="left">
              <Language language={props.language} id="Paragraph_1"/>
            </Typography>
            <LoudText>{LanguageFunc("Keystore_File", props.language)}</LoudText>
            <Typography variant="body2" align="left">
              <Language language={props.language} id="Paragraph_2"/>
            </Typography>
            <LoudText>{LanguageFunc("Deposit_Data_Files", props.language)}</LoudText>
            <Typography variant="body2" align="left">
              <Language language={props.language} id="Paragraph_3"/>
            </Typography>
          </Box>
          <Box sx={{ m: 2 }}>
            <LoudText>{LanguageFunc("Secret_Recovery_Phrase", props.language)}</LoudText>
            <Typography variant="body2" align="left">
              <Language language={props.language} id="Paragraph_4"/>
            </Typography>
            <QuietText>
              {LanguageFunc("Note", props.language)}
            </QuietText>
          </Box>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default KeysCreated;
