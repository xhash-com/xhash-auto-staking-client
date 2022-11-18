import { useHistory } from "react-router-dom";
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { Container, Grid, Modal, Tooltip, Typography } from "@material-ui/core";
import { Button } from '@material-ui/core';
import { KeyIcon } from "../components/icons/KeyIcon";
import { NetworkPicker } from "../components/NetworkPicker";
import { tooltips } from "../constants";
import {LanguageEnum, Network, StepSequenceKey} from '../types'
import VersionFooter from "../components/VersionFooter";
import {LanguagePicker} from "../components/LanguagePicker";
import {Language, LanguageFunc} from "../language/Language";

const StyledMuiContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const NetworkDiv = styled.div`
  margin-top: 35px;
  margin-right: 35px;
  align-self: flex-end;
  color: gray;
`;

const LanguageDiv = styled.div`
  margin-top: 35px;
  margin-left: 35px;
  align-self: flex-end;
  color: gray;
`;

const LandingHeader = styled(Typography)`
  font-size: 36px;
  margin-top: 15px;
  margin-bottom: 20px;
`;

const SubHeader = styled(Typography)`
  margin-top: 20px;
`;

const Links = styled.div`
  margin-top: 35px;
`;

const InfoLabel = styled.span`
  color: gray;
`;

const OptionsGrid = styled(Grid)`
  margin-top: 35px;
  align-items: center;
`;

type HomeProps = {
  network: Network,
  setNetwork: Dispatch<SetStateAction<Network>>,
  language: LanguageEnum,
  setLanguage: Dispatch<SetStateAction<LanguageEnum>>
}

/**
 * Home page and entry point of the app.  This page displays general information
 * and options for a user to create a new secret recovery phrase or use an
 * existing one.
 *
 * @param props passed in data for the component to use
 * @returns the react element to render
 */
const Home: FC<HomeProps> = (props): ReactElement => {
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkModalWasOpened, setNetworkModalWasOpened] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageModalWasOpened, setLanguageModalWasOpened] = useState(false);
  const [createMnemonicSelected, setCreateMnemonicSelected] = useState(false);
  const [useExistingMnemonicSelected, setUseExistingMnemonicSelected] = useState(false);

  let history = useHistory();

  const handleOpenNetworkModal = () => {
    setShowNetworkModal(true);
    setNetworkModalWasOpened(true);
  }

  const handleOpenLanguageModal = () => {
    setShowLanguageModal(true);
    setLanguageModalWasOpened(true);
  }

  const handleCloseNetworkModal = (event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setShowNetworkModal(false);

      if (createMnemonicSelected) {
        handleCreateNewMnemonic();
      } else if (useExistingMnemonicSelected) {
        handleUseExistingMnemonic();
      }
    }
  }

  const handleCloseLanguageModal = (event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setShowLanguageModal(false);

      if (createMnemonicSelected) {
        handleCreateNewMnemonic();
      } else if (useExistingMnemonicSelected) {
        handleUseExistingMnemonic();
      }
    }
  }

  const handleCreateNewMnemonic = () => {
    setCreateMnemonicSelected(true);

    if (!networkModalWasOpened) {
      handleOpenNetworkModal();
    } else {
      const location = {
        pathname: `/wizard/${StepSequenceKey.MnemonicGeneration}`
      }

      history.push(location);
    }
  }

  const handleUseExistingMnemonic = () => {
    setUseExistingMnemonicSelected(true);

    if (!networkModalWasOpened) {
      handleOpenNetworkModal();
    } else {
      const location = {
        pathname: `/wizard/${StepSequenceKey.MnemonicImport}`
      }

      history.push(location);
    }
  }

  const tabIndex = (priority: number) => showNetworkModal ? -1 : priority;

  return (
    <StyledMuiContainer>
      <Grid container justifyContent="space-between">
        <LanguageDiv>
          <Language language={props.language} id="Select_Language"/><Button color="primary" onClick={handleOpenLanguageModal} tabIndex={tabIndex(1)}>{props.language}</Button>
        </LanguageDiv>
        <NetworkDiv>
          <Language language={props.language} id="Select_Network"/><Button color="primary" onClick={handleOpenNetworkModal} tabIndex={tabIndex(1)}>{props.network}</Button>
        </NetworkDiv>
      </Grid>
      <Modal
          open={showLanguageModal}
          onClose={handleCloseLanguageModal}
      >
        {/* Added <div> here per the following link to fix error https://stackoverflow.com/a/63521049/5949270 */}
        <div>
          <LanguagePicker handleCloseLanguageModal={handleCloseLanguageModal} setLanguage={props.setLanguage} language={props.language}></LanguagePicker>
        </div>
      </Modal>
      <Modal
        open={showNetworkModal}
        onClose={handleCloseNetworkModal}
      >
        {/* Added <div> here per the following link to fix error https://stackoverflow.com/a/63521049/5949270 */}
        <div>
          <NetworkPicker handleCloseNetworkModal={handleCloseNetworkModal} setNetwork={props.setNetwork} network={props.network} language={props.language}></NetworkPicker>
        </div>
      </Modal>

      <LandingHeader variant="h1"><Language id={'Welcome'} language={props.language}/></LandingHeader>
      <KeyIcon />
      <SubHeader><Language language={props.language} id="SubHeader"/></SubHeader>

      <Links>
        <InfoLabel>XHash</InfoLabel> https://www.xhash.com
        <br />
        <InfoLabel>Github:</InfoLabel> https://github.com/xhash-com/xhash-auto-staking-client
      </Links>

      <OptionsGrid container spacing={2} direction="column">
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleCreateNewMnemonic} tabIndex={tabIndex(1)}>
            <Language language={props.language} id="Create_New_Secret"/>
          </Button>
        </Grid>
        <Grid item>
          <Tooltip title={LanguageFunc("IMPORT_MNEMONIC", props.language)}>
            <Button style={{color: "gray"}} size="small" onClick={handleUseExistingMnemonic} tabIndex={tabIndex(1)}>
              <Language language={props.language} id="Use_Existing_Secret"/>
            </Button>
          </Tooltip>
        </Grid>
      </OptionsGrid>
      <VersionFooter />
    </StyledMuiContainer>
  );
};

export default Home;
