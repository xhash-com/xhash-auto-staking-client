import { HashRouter, Route, Switch } from "react-router-dom";
import React, { FC, ReactElement, useState } from "react";
import styled from "styled-components";
import Home from "./pages/Home";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import 'typeface-roboto';
import MainWizard from "./pages/MainWizard";
import theme from "./theme";
import {LanguageEnum, Network} from './types';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

/**
 * The React app top level including theme and routing.
 *
 * @returns the react element containing the app
 */
const App: FC = (): ReactElement => {
  const [network, setNetwork] = useState<Network>(Network.MAINNET);
  const [language, setLanguage] = useState<LanguageEnum>(LanguageEnum.enUS);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Container>
          <Switch>
              <Route exact path="/" render={() => <Home network={network} language={language} setLanguage={setLanguage} setNetwork={setNetwork} />} />
              <Route exact path="/wizard/:stepSequenceKey" render={() => <MainWizard network={network} language={language}/>} />
          </Switch>
        </Container>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
