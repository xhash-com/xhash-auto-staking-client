import { BackgroundLight, } from '../colors';
import { FormControl, FormControlLabel, Radio, RadioGroup, Button, Divider, Typography } from '@material-ui/core';
import React, { Dispatch, SetStateAction } from 'react';

import {LanguageEnum} from '../types';
import styled from 'styled-components';
import {Language} from "../language/Language";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 444px;
  width: 350px;
  background: rgba(27, 38, 44, 0.95);
  border-radius: 20px;
  align-items: center;
  background: ${BackgroundLight};
  margin: auto;
  margin-top: 150px;
`;

const Header = styled.div`
  font-size: 36px;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const SubHeader = styled(Typography)`
  font-size: 20px;
  margin-top: 20px;
  margin-bottom: 15px;
`;

const Submit = styled(Button)`
  margin: 35px auto 0;
  margin-top: 35px;
`;

type LanguagePickerProps = {
  handleCloseLanguageModal: (event: object, reason: string) => void,
  setLanguage: Dispatch<SetStateAction<LanguageEnum>>,
  language: LanguageEnum,
}

/**
 * This is the network picker modal component where the user selects the desired network.
 *
 * @param props.handleCloseNetworkModal function to handle closing the network modal
 * @param props.setNetwork update the selected network
 * @param props.network the selected network
 * @returns the network picker element to render
 */
export const LanguagePicker = (props: LanguagePickerProps) => {

  const closePicker = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    props.handleCloseLanguageModal({}, 'submitClick');
  }

  const languageChanged = (selected: React.ChangeEvent<HTMLInputElement>) => {
    props.setLanguage(selected.target.value as LanguageEnum);
  }

  //const goerliLabel = `${Network.GOERLI}/${Network.PRATER}`;

  return (
    <Container>
      <Header><Language language={props.language} id="Language"/></Header>
      <form onSubmit={closePicker} style={{textAlign: 'center'}}>
        <div>
          <FormControl focused>
            <RadioGroup aria-label="gender" name="gender1" value={props.language} onChange={languageChanged}>
              <FormControlLabel value={LanguageEnum.enUS} control={<Radio />} label={LanguageEnum.enUS} />
              <SubHeader/>
              <FormControlLabel value={LanguageEnum.zhTW} control={<Radio />} label={LanguageEnum.zhTW} />
              <SubHeader/>
            </RadioGroup>
          </FormControl>
        </div>
        <Submit variant="contained" color="primary" type="submit" tabIndex={1}>OK</Submit>
      </form>
    </Container>
  )
}
