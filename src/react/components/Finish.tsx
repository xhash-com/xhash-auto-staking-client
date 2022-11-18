import { Button, Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import {LanguageEnum, Network} from '../types';
import KeysCreated from './KeyGeneratioinFlow/4-KeysCreated';
import StepNavigation from "./StepNavigation";
import {Language, LanguageFunc} from "../language/Language";

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  folderPath: string,
  network: Network,
  language: LanguageEnum,
}

/**
 * This is the final page displaying information about the keys
 *
 * @param props.onStepBack the function to execute when the user steps back
 * @param props.onStepForward the function to execute when the user steps forward
 * @param props.folderPath the folder path where the keys are located, for display purposes
 * @param props.network the network the app is running for
 * @returns the react element to render
 */
const Finish: FC<Props> = (props): ReactElement => {
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h1">
          <Language language={props.language} id="Create_Keys"/>
        </Typography>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={12}>
          <KeysCreated folderPath={props.folderPath} network={props.network}  language={props.language}/>
        </Grid>
      </ContentGrid>
      <StepNavigation
          children={props.children}
          onPrev={props.onStepBack}
          onNext={props.onStepForward}
          backLabel={LanguageFunc("Back", props.language)}
          nextLabel={LanguageFunc("Next", props.language)}
      />
      {/*<Grid item container justifyContent="space-between">
        <Grid item xs={5} />
        <Grid item xs={2}>
          <Button variant="contained" color="primary" onClick={props.onStepForward} tabIndex={2}>Close</Button>
        </Grid>
        <Grid item xs={5} />
      </Grid>*/}

    </Grid>
  );
}

export default Finish;
