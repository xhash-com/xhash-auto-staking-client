import {Space, Upload, UploadFile, UploadProps} from 'antd';
import React, {Dispatch, FC, ReactElement, SetStateAction} from 'react';
import {Button, Grid, TextField, Tooltip, Typography} from "@material-ui/core";
import styled from "styled-components";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {LanguageEnum} from "../../types";
import {Language, LanguageFunc} from "../../language/Language";

type UploadKeystoreProps = {
  fileList: UploadFile[]
  setFileList: Dispatch<SetStateAction<UploadFile[]>>,
  keyPassword: string,
  setKeyPassword: Dispatch<SetStateAction<string>>,
  keyPasswordStrengthError: boolean,
  language: LanguageEnum,
}

const StyledTextField = styled(TextField)`
  margin: 1px 0;
  width: 260px;
  min-height: 79px;
`;

const UploadKeystore: FC<UploadKeystoreProps> = (props): ReactElement => {

  const handleChange: UploadProps['onChange'] = info => {
    let newFileList = [...info.fileList];

    newFileList = newFileList.map(file => {
      return file;
    });

    props.setFileList(newFileList);
  };

  const updateKeyPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setKeyPassword(e.target.value);
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="body1">
          <Language language={props.language} id="Select_Keystore_Files"/>
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Upload
            beforeUpload={(f, fList) => false}
            onChange={handleChange}
            accept=".json"
            maxCount={100}
            multiple
          >
            <Button variant="contained" color="secondary" component="label" startIcon={<CloudUploadIcon />}>
              <Language language={props.language} id="Select"/>
            </Button>
          </Upload>
        </Space>
      </Grid>

      <Grid item xs={12}>
        <Tooltip title={LanguageFunc("PASSWORD", props.language)}>
          <StyledTextField
            id="password"
            label={LanguageFunc("Keystore_Password", props.language)}
            type="password"
            variant="outlined"
            value={props.keyPassword}
            onChange={updateKeyPassword}
            error={props.keyPasswordStrengthError}
            helperText={props.keyPasswordStrengthError ? LanguageFunc("PASSWORD_STRENGTH", props.language) : ""}
          />
        </Tooltip>
      </Grid>

    </Grid>
  );
}

export default UploadKeystore;
