import { BackgroundLight, } from '../colors';
import { FormControl, FormControlLabel, Radio, RadioGroup, Button, Divider, Typography } from '@material-ui/core';
import React, { Dispatch, SetStateAction } from 'react';

import {LanguageEnum, Network} from '../types';
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

type NetworkPickerProps = {
  handleCloseNetworkModal: (event: object, reason: string) => void,
  setNetwork: Dispatch<SetStateAction<Network>>,
  network: Network,
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
export const NetworkPicker = (props: NetworkPickerProps) => {

  const closePicker = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    props.handleCloseNetworkModal({}, 'submitClick');
  }

  const networkChanged = (selected: React.ChangeEvent<HTMLInputElement>) => {
    props.setNetwork(selected.target.value as Network);
  }

  return (
    <Container>
      <Header><Language id="Network" language={props.language}/></Header>
      <form onSubmit={closePicker} style={{textAlign: 'center'}}>
        <div>
          <FormControl focused>
            <RadioGroup aria-label="gender" name="gender1" value={props.network} onChange={networkChanged}>
              <FormControlLabel value={Network.MAINNET} control={<Radio />} label={Network.MAINNET} />
              <Divider />
              <SubHeader><Language id="Testnets" language={props.language}/></SubHeader>
              <FormControlLabel value={Network.GOERLI} control={<Radio />} label={goerliLabel} />
            </RadioGroup>
          </FormControl>
        </div>
        <Submit variant="contained" color="primary" type="submit" tabIndex={1}>OK</Submit>
      </form>
    </Container>
  )
}
