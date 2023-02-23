import React, {Dispatch, FC, ReactElement, SetStateAction} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Theme,
  Tooltip,
  Typography
} from "@material-ui/core";
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import styled from "styled-components";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {FileUploadStatus, LanguageEnum, UploadFile} from "../../types";
import {Language, LanguageFunc} from "../../language/Language";
import theme from "../../theme";
import {DeleteRounded} from "@material-ui/icons";

type UploadKeystoreProps = {
  fileList: UploadFile[]
  setFileList: Dispatch<SetStateAction<UploadFile[]>>,
  keyPassword: string,
  setKeyPassword: Dispatch<SetStateAction<string>>,
  keyPasswordStrengthError: boolean,
  language: LanguageEnum,
  deleteFile: Function,
}

const StyleIconButton = styled(IconButton)`
  color: ${theme.palette.error.main};
`

const StyledTextField = styled(TextField)`
  margin: 1px 0;
  width: 260px;
  min-height: 79px;
`;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      table: {
        minWidth: 600,
      },
      tableBody: {
        maxHeight: 'calc(100vh - 575px)',
      },
      button: {
        margin: theme.spacing(1),
      },
      success_icons: {
        color: 'green',
      },
      warning_icons: {
        color: 'red',
      }
    }),
);

const UploadKeystore: FC<UploadKeystoreProps> = (props): ReactElement => {

  const classes = useStyles();

  const handleChange = (even: { target: any; }) => {
    const fileList = new Array();
    const files = even.target.files;
    [...files].forEach((file) => {
      const uploadFile: UploadFile = {file: file, status: FileUploadStatus.READY, text: ''}
      fileList.push(uploadFile)
    })

    props.setFileList([...props.fileList, ...fileList])
  };

  const updateKeyPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setKeyPassword(e.target.value);
  }

  return (
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          <Typography variant="body1">
            <Language language={props.language} id="Select_Keystore_Files"/>
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="secondary" component="label" className={classes.button}
                  startIcon={<CloudUploadIcon/>}>
            {LanguageFunc("Select", props.language)}
            <input hidden accept="json/*" id="input" type="file" onChange={handleChange} multiple/>
          </Button>
        </Grid>
        <Grid container item xs={10} justifyContent="center" alignItems="center">
          <TableContainer component={Paper} className={classes.tableBody}>
            <Table className={classes.table} stickyHeader aria-label="sticky table">
              <TableBody>
                {props.fileList.map((row, index) => (
                    <TableRow key={row.file.name}>
                      <TableCell style={{width: '70vw'}}>
                        {row.file.name}
                      </TableCell>
                      <TableCell style={{width: '5vw'}}>
                        <StyleIconButton onClick={() => props.deleteFile(index)}>
                          <DeleteRounded/>
                        </StyleIconButton>
                      </TableCell>
                      <TableCell>
                        {row.status === FileUploadStatus.LOADING && (
                            <Grid style={{width: '1.5rem', height: '1.5rem'}}>
                              <CircularProgress color='primary'
                                                style={{width: '1.5rem', height: '1.5rem'}}
                              />
                            </Grid>
                        )}
                        {row.status === FileUploadStatus.SUCCESS && (
                            <Grid>
                              <CheckCircleOutlineIcon className={classes.success_icons}
                                                      style={{width: '1.5rem', height: '1.5rem'}}
                              />
                            </Grid>
                        )}
                        {row.status === FileUploadStatus.FAILURE && (
                            <Box display="flex" alignItems="center">
                              <ErrorOutlineIcon className={classes.warning_icons}
                                                style={{width: '1.5rem', height: '1.5rem'}}/>
                              <Typography>{row.text}</Typography>
                            </Box>
                        )}
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
