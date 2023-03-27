import {Grid, IconButton, Typography} from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import React, {FC, ReactElement, useState} from 'react';
import axios from 'axios';
import styled from 'styled-components';
import LoginXHash from "./UploadFlow/0-LoginXHash";
import UploadKeystore from "./UploadFlow/1-UploadKeystore";
import Success from "./UploadFlow/2-Success";
import {FileUploadStatus, LanguageEnum, Network, twoFA, UploadFile} from '../types';
import StepNavigation from "./StepNavigation";
import {Language} from "../language/Language";

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
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

const Upload: FC<Props> = (props): ReactElement => {

  const [step, setStep] = useState(0);
  const [errorInfo, setErrorInfo] = useState("");
  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [twoFA, set2FA] = useState("");
  const [open2FA, setOpen2FA] = useState(false);
  const [twoFACode, set2FACode] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordStrengthError, setPasswordStrengthError] = useState(false);
  const [loginProgress, setLoginProgress] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [keyPassword, setKeyPassword] = useState("");
  const [keyPasswordStrengthError, setKeyPasswordStrengthError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  let url = "https://api.xhash.com:8000";
  let uploadPublicKey = '-----BEGIN RSA Public Key-----\n' +
      'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAovobGpjdwazXFP0Cac7R\n' +
      'b2XayXObXhQor7NK+PZzjHaFZk0RZhbgOsZuKxg7N+XOZf+zUwzDyUcp5Atl+JGG\n' +
      'oOropD3gi4GEz49I2I6173AKOg8Q+DpL1d4bnrPIr9njbB4vHWXGq2IgOi1Rl606\n' +
      'YabR4x4H6RAyVe/+Ox7Y/ffdoTDe1jiWlMULF/em/Ua1sX/ue92uzqh1KslbndZh\n' +
      '/+IU/6l20SQWxhf+mSuQRfoLe8lid/gTxhiXfVlx/n22N4+MITlt3qvGn1yCAkJl\n' +
      '7OVIcnjynfh1F3AG0Lr+zwB0gdyf6c8mVsbeDPbpGBkMm2DkUlwO1MacWzaQqgBY\n' +
      'awIDAQAB\n' +
      '-----END RSA Public Key-----\n';

  const prevLabel = () => {
    switch (step) {
      case 0:
        return <Language language={props.language} id="Back"/>;
      case 1:
        return <Language language={props.language} id="Back"/>;
      case 2:
        return <Language language={props.language} id="Back"/>;
    }
  }

  const prevClicked = () => {
    switch (step) {
      case 0: {
        setEmailError(false);
        setPasswordStrengthError(false);
        setErrorInfo("");
        props.onStepBack();
        break;
      }
      case 1: {
        setKeyPasswordStrengthError(false);
        setErrorInfo("");
        setStep(step - 1);
        break;
      }
      case 2: {
        setStep(step - 1);
        break;
      }
      default: {
        console.log("Upload step is greater than 1 when prev was clicked.  This should never happen.");
        break;
      }
    }
  }

  const nextLabel = () => {
    switch (step) {
      case 0:
        return <Language language={props.language} id="Login"/>;
      case 1:
        return <Language language={props.language} id="Upload"/>;
      case 2:
        return <Language language={props.language} id="Close"/>;
    }
  }

  const disableNext = () => {
    return (step == 0 && loginProgress) || (step == 1 && uploadProgress);
  }

  const disableBack = () => {
    return false;
  }

  const nextClicked = () => {
    switch (step) {

      case 0: {
        login().then();
        break;
      }

      case 1: {
        uploadKeystore().then();
        break;
      }

      case 2: {
        props.onStepForward();
        break;
      }

      default: {
        console.log("Upload step is greater than 1 when next was clicked.  This should never happen.");
        break;
      }
    }
  }

  const uploadKeystore = async () => {
    let success = true;
    try {
      setUploadProgress(true);

      if (keyPassword.length < 8) {
        setKeyPasswordStrengthError(true);
        return;
      } else {
        setKeyPasswordStrengthError(false);
      }

      if (!fileList.length) {
        errorNotice("please select keystore file!");
        return;
      }

      let encryptKeyPassword = window.encrypt.doEncrypt(uploadPublicKey, keyPassword) + '';

      const fileObjListDate = fileList.filter(item => item.status !== FileUploadStatus.SUCCESS).map(item => {
        return {
          ...item,
          status: FileUploadStatus.LOADING
        }
      })

      setFileList(fileObjListDate)

      for (let key = 0; key < fileObjListDate.length; key++) {
        const file = fileObjListDate[key].file
        try {
          const formData = new FormData();
          formData.append('password', encryptKeyPassword);
          formData.append('file', file);

          const {data} = await axios.post(url + '/staking/upload',
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  "authorization": "Bearer " + token,
                  "from": "XHashStakingCli"
                }
              }
          );
          console.log(data);
          if (data.code === '200') {
            setFileList((old) => {
              return old.map((item, index) => {
                return index === key ? {
                  ...item,
                  status: FileUploadStatus.SUCCESS,
                  text: ''
                } : item
              })
            })
          } else {
            setFileList((old) => {
              return old.map((item, index) => {
                return index === key ? {
                  ...item,
                  status: FileUploadStatus.FAILURE,
                  text: 'upload_' + data.code
                } : item
              })
            })
            success = false;
            errorNotice(data.msg);
          }
        } catch (error) {
          setFileList((old) => {
            return old.map((item, index) => {
              return index === key ? {
                ...item,
                status: FileUploadStatus.FAILURE,
                text: error + ""
              } : item
            })
          })
          console.log(error);
          success = false;
          errorNotice(error + "");
        }
      }

      console.log(success);
      if (success) {
        errorNotice("Upload finished!");
        setStep(step + 1);
      }
    } finally {
      setUploadProgress(false);
    }
  }

  const errorNotice = (error: React.SetStateAction<string>) => {
    setErrorInfo(error);
    setOpen(true);
  }

  const login = async () => {
    try {
      setLoginProgress(true);

      if (validate()) {
        return;
      }

      let publicKey = "";
      await getPublicKey().then(r => {
        publicKey = r;
      });
      console.log(publicKey);
      if (publicKey == "") {
        return;
      }

      let encryptPassword= window.encrypt.doEncrypt(publicKey, password);
      let loginSuccess = await loginByEmail(encryptPassword).then();
      if (!loginSuccess) {
        return;
      }

      setStep(step + 1);
    } finally {
      setLoginProgress(false);
    }
  }

  const validate = () => {
    let isError = false;

    let regexp = new RegExp('^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$');
    if(regexp.test(email)) {
      setEmailError(false);
    } else {
      setEmailError(true);
      isError = true;
    }

    if (password.length < 8) {
      setPasswordStrengthError(true);
      isError = true;
    } else {
      setPasswordStrengthError(false);
    }
    return isError;
  }

  const getPublicKey = async () => {
    let publicKey = "";
    try {
      const { data } = await axios.get(url + '/user/getPublicKey', {
        headers: {
          "from": "XHashStakingCli"
        },
        params: {
          email: email
        }
      });
      console.log(data);
      if (data.code != '200') {
        errorNotice(data.msg);
        return "";
      }
      publicKey = data.data.publicKey;
    } catch (error) {
      console.log(error);
      errorNotice(error + "");
      return "";
    }
    return publicKey;
  }

  const loginByEmail = async (encryptPassword: any) => {
    try {
      const {data} = await axios.post(url + "/user/login",
          {
            email: email,
            password: encryptPassword
          }, {
            headers: {
              "from": "XHashStakingCli"
            },
          }
      );
      if (data.code != '200') {
        errorNotice(data.msg);
        return false;
      }
      //加二次验证的逻辑
      setToken(data.data.token);
      return twoFactorAuthentication(data.data);
    } catch (error) {
      console.log(error);
      errorNotice(error + "");
      return false;
    }
  }

  const twoFactorAuthentication = (data: twoFA) => {
    if (!data.twoFactor) {
      return true
    }

    setOpen2FA(data.twoFactor)
    set2FA(data.twoFactorToken)
    return false
  }

  const verify2FA = async () => {
    try {
      const {data} = await axios.post(url + "/user/twoFactor/verify",
          {
            googleCode: twoFACode,
            twoFactorToken: twoFA
          }, {
            headers: {
              "from": "XHashStakingCli"
            },
          }
      );
      if (data.code != '200') {
        errorNotice(data.msg);
        return false;
      }
      setToken(data.data.token);
      setOpen2FA(false)
      set2FA("")
      setStep(step + 1);
    } catch (error) {
      console.log(error);
      errorNotice(error + "");
      return false;
    }
  }

  const deleteFile = (index: number) => {
    setFileList([...fileList.slice(0, index), ...fileList.slice(index + 1)])
  }

  const content = () => {
    switch (step) {
      case 0:
        return (
            <LoginXHash
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                emailError={emailError}
                twoFactorToken={twoFA}
                set2FACode={set2FACode}
                open2FA={open2FA}
                verify2FA={verify2FA}
                passwordStrengthError={passwordStrengthError}
                language={props.language}
            />
        );
      case 1:
        return (
            <UploadKeystore
                fileList={fileList}
                setFileList={setFileList}
                keyPassword={keyPassword}
                setKeyPassword={setKeyPassword}
                deleteFile={deleteFile}
                keyPasswordStrengthError={keyPasswordStrengthError}
                language={props.language}
            />
      );
      case 2: return (
        <Success
          language={props.language}
        />
      );
      default:
        return null;
    }
  }

  const handleClose = () => {
    setOpen(false);
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h1">
          <Language language={props.language} id="Upload_Keystore_to_XHash"/>
        </Typography>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={12}>
          {content()}
        </Grid>
      </ContentGrid>
      <StepNavigation
          children={props.children}
          onPrev={prevClicked}
          onNext={nextClicked}
          backLabel={prevLabel()}
          nextLabel={nextLabel()}
          disableBack={disableBack()}
          disableNext={disableNext()}
      />

      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message={errorInfo}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </Grid>
  );
}

export default Upload;
