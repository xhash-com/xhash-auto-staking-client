import React, {FC, ReactElement} from 'react';
import {Container, Grid, Typography} from "@material-ui/core";
import styled from "styled-components";
import {Language, LanguageFunc} from "../../language/Language";
import {LanguageEnum} from "../../types";

const StyledMuiContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Links = styled.div`
  margin-top: 35px;
`;

const InfoLabel = styled.span`
  color: gray;
`;

type SuccessProps = {
  language: LanguageEnum,
  total: number,
}

const Success: FC<SuccessProps> = (props): ReactElement => {

  return (
    <StyledMuiContainer>
      <Grid item>
        <Typography variant="h1">
          <Language language={props.language} id="Success"/>
        </Typography>
        <Typography variant="h5">
          <Language language={props.language} id="upload_su_1"/>
          {` ${props.total} `}
          <Language language={props.language} id="upload_su_2"/>
        </Typography>
      </Grid>
      <Links>
        <InfoLabel>XHash:</InfoLabel>
        <button
            onClick={() => window.electronAPI.shellOpenExternal("https://www.xhash.com/stakingdashboard")}>https://www.xhash.com
        </button>
        <br/>
        <InfoLabel>{LanguageFunc("Email", props.language)}:</InfoLabel>admin@xhash.com
      </Links>
    </StyledMuiContainer>
  );
}

export default Success;
