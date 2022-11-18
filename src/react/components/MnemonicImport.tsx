import { Grid, TextField, Typography } from "@material-ui/core";
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import ValidatingMnemonic from './MnemonicImportFlow/1-ValidatingMnemonic';
import { errors, MNEMONIC_LENGTH } from "../constants";
import StepNavigation from './StepNavigation';
import {LanguageEnum} from "../types";
import {Language, LanguageFunc} from "../language/Language";

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  mnemonic: string,
  setMnemonic: Dispatch<SetStateAction<string>>,
  onStepBack: () => void,
  onStepForward: () => void,
  language: LanguageEnum,
}

/**
 * This is the Mnemonic Import flow
 *
 * @param props data and functions passed in for usage, the names are self documenting
 * @returns mnemonic import components to render
 */
const MnemonicImport: FC<Props> = (props): ReactElement => {
  const [step, setStep] = useState(0);
  const [mnemonicError, setMnemonicError] = useState(false);
  const [mnemonicErrorMsg, setMnemonicErrorMsg] = useState("");

  const updateInputMnemonic = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setMnemonic(e.target.value);
  }

  const disableImport = !props.mnemonic;

  const onImport = () => {
    setMnemonicError(false);
    setMnemonicErrorMsg('');

    const mnemonicArray = props.mnemonic.split(" ");

    if (mnemonicArray.length != MNEMONIC_LENGTH) {
      setMnemonicError(true);
      setMnemonicErrorMsg(LanguageFunc("MNEMONIC_FORMAT", props.language));
    } else {

      setStep(step + 1);

      window.eth2Deposit.validateMnemonic(props.mnemonic).then(() => {
        props.onStepForward();
      }).catch((error) => {
        setStep(0);
        const errorMsg = ('stderr' in error) ? error.stderr : error.message;
        setMnemonicError(true);
        setMnemonicErrorMsg(errorMsg);
      })

    }
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      onImport();
    }
  }

  const content = () => {
    switch(step) {
      case 0: return (
        <TextField
            id="mnemonic-input"
            label={LanguageFunc("Type_Your_Secret_Recovery_Phrase", props.language)}
            multiline
            fullWidth
            rows={4}
            variant="outlined"
            color="primary"
            autoFocus
            error={mnemonicError}
            helperText={mnemonicErrorMsg}
            value={props.mnemonic}
            onChange={updateInputMnemonic}
            onKeyDown={handleKeyDown}/>
      );
      case 1: return (
        <ValidatingMnemonic
            language={props.language}
        />
      );
      default:
        return null;
    }
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h1">
          <Language language={props.language} id="Import_Secret_Recovery_Phrase"/>
        </Typography>
      </Grid>
      <ContentGrid item container justifyContent="center">
        <Grid item xs={10}>
          {content()}
        </Grid>
      </ContentGrid>
      {/* props.children is the stepper */}
      <StepNavigation
        children={props.children}
        onPrev={props.onStepBack}
        onNext={onImport}
        backLabel={LanguageFunc("Back", props.language)}
        nextLabel={LanguageFunc("Import", props.language)}
        disableBack={step === 1}
        disableNext={disableImport || step === 1}
      />
    </Grid>
  )
}

export default MnemonicImport;
