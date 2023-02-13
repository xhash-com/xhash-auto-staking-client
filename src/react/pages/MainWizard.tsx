import React, {FC, ReactElement, useState} from 'react';
import {useHistory, useParams} from "react-router-dom";
import {Grid, makeStyles, Step, StepLabel, Stepper, Typography} from '@material-ui/core';
import styled from 'styled-components';
import {LanguageEnum, Network, StepKey, StepSequenceKey} from '../types';
import MnemonicGenerationWizard from "../components/MnemonicGenerationWizard";
import MnemonicImport from "../components/MnemonicImport";
import KeyConfigurationWizard from "../components/KeyConfigurationWizard";
import KeyGenerationWizard from "../components/KeyGenerationWizard";
import Finish from '../components/Finish';
import Deposit from '../components/Deposit';
import Upload from '../components/Upload';
import {stepLabels} from '../constants';
import VersionFooter from '../components/VersionFooter';
import {Language} from "../language/Language";

const useStyles = makeStyles({
  div: {
    minHeight: 600,
  },
});

const stepSequenceMap: Record<string, StepKey[]> = {
  mnemonicimport: [
    StepKey.MnemonicImport,
    StepKey.KeyConfiguration,
    StepKey.KeyGeneration,
    StepKey.Finish,
    StepKey.Deposit,
    StepKey.Upload
  ],
  mnemonicgeneration: [
    StepKey.MnemonicGeneration,
    StepKey.KeyConfiguration,
    StepKey.KeyGeneration,
    StepKey.Finish,
    StepKey.Deposit,
    StepKey.Upload
  ]
}

const MainGrid = styled(Grid)`
  width: 100%;
  margin: 0px;
  text-align: center;
`;

const StyledStepper = styled(Stepper)`
  background-color: transparent;
`

type RouteParams = {
  stepSequenceKey: StepSequenceKey;
};

type WizardProps = {
  network: Network,
  language: LanguageEnum,
}

/**
 * This is the main wizard through which each piece of functionality for the app runs.
 *
 * This wizard manages the global stepper showing the user where they are in the process.
 *
 * @param props passed in data for the component to use
 * @returns the react element to render
 */
const Wizard: FC<WizardProps> = (props): ReactElement => {
  const { stepSequenceKey } = useParams<RouteParams>();
  const history = useHistory();
  const classes = useStyles();

  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicToVerify, setMnemonicToVerify] = useState("");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [keyGenerationStartIndex, setKeyGenerationStartIndex] = useState(0);
  const [numberOfKeys, setNumberOfKeys] = useState(1);
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [password, setPassword] = useState("");
  const [folderPath, setFolderPath] = useState("");

  const stepSequence = stepSequenceMap[stepSequenceKey];
  const activeStepKey = stepSequence[activeStepIndex];

  const onStepForward = () => {
    if (activeStepIndex === stepSequence.length - 1) {
      window.electronAPI.ipcRendererSendClose();
      return;
    } else if(stepSequence[activeStepIndex] === StepKey.Finish){
      window.electronAPI.clipboardClear();
    }
    setActiveStepIndex(activeStepIndex + 1);
  }

  const onStepBack = () => {
    if (activeStepIndex === 0) {
      history.push("/");
    } else {
      setActiveStepIndex(activeStepIndex - 1);
    }
  }

  /**
   * This is the UI stepper component rendering where the user is in the process
   */
  const stepper = (
    <Grid item>
      <StyledStepper activeStep={activeStepIndex} alternativeLabel>
        {stepSequence.map((stepKey: StepKey) => (
          <Step key={stepKey}>
            <StepLabel><Language language={props.language} id={stepLabels[stepKey]}/></StepLabel>
          </Step>
        ))}
      </StyledStepper>
    </Grid>
  );

  const commonProps = {
    onStepForward,
    onStepBack,
    children: stepper
  };

  /**
   * This switch returns the correct react components based on the active step.
   * @returns the component to render
   */
  const stepComponentSwitch = (): ReactElement => {
    switch(activeStepKey) {
      case StepKey.MnemonicImport:
        return (
          <MnemonicImport {...{ ...commonProps, mnemonic, setMnemonic }}
          language={props.language}
          />
        );
      case StepKey.MnemonicGeneration:
        return (
          <MnemonicGenerationWizard
            {...{ ...commonProps, mnemonic, setMnemonic, mnemonicToVerify, setMnemonicToVerify }}
            network={props.network} language={props.language}/>
        );
      case StepKey.KeyConfiguration:
        return (
            <KeyConfigurationWizard
                {...commonProps}
                keyGenerationStartIndex={keyGenerationStartIndex}
                initialKeyGenerationStartIndex={0}
                setKeyGenerationStartIndex={setKeyGenerationStartIndex}
                showKeyGenerationStartIndexInput={stepSequenceKey === StepSequenceKey.MnemonicImport}
                numberOfKeys={numberOfKeys}
                setNumberOfKeys={setNumberOfKeys}
                withdrawalAddress={withdrawalAddress}
                setWithdrawalAddress={setWithdrawalAddress}
                password={password}
                setPassword={setPassword}
                language={props.language}
            />
        );
      case StepKey.KeyGeneration:
        return (
            <KeyGenerationWizard
                {...commonProps}
                mnemonic={mnemonic}
                network={props.network}
                keyGenerationStartIndex={keyGenerationStartIndex}
                numberOfKeys={numberOfKeys}
                withdrawalAddress={withdrawalAddress}
                password={password}
                folderPath={folderPath}
                setFolderPath={setFolderPath}
                language={props.language}
            />
        );
      case StepKey.Finish:
        return (
            <Finish
                {...commonProps}
                folderPath={folderPath}
                network={props.network}
                language={props.language}
            />
        );
      case StepKey.Deposit:
        return (
            <Deposit
                {...commonProps}
                network={props.network}
                language={props.language}
            />
        );
      case StepKey.Upload:
        return (
            <Upload
                {...commonProps}
                network={props.network}
                language={props.language}
            />
        )
      default:
        return <div><Language language={props.language} id="No_Component_Step"/></div>
    }
  }

  return (
    <MainGrid container spacing={5} direction="column">
      <Grid item container>
        <Grid item xs={10}/>
        <Grid item xs={2}>
          <Typography variant="caption" style={{color: "gray"}}>
            <Language language={props.language} id="Network"/> {props.network}
          </Typography>
        </Grid>
      </Grid>
      <Grid item container className={classes.div}>
        {stepComponentSwitch()}
      </Grid>
      <VersionFooter />
    </MainGrid>
  );
}

export default Wizard;
