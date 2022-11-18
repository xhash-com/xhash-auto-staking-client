import { Button, Grid, Typography } from '@material-ui/core';
import { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import {LanguageEnum} from "../../types";
import {Language} from "../../language/Language";

type SelectFolderProps = {
  setFolderPath: Dispatch<SetStateAction<string>>,
  folderPath: string,
  setFolderError: Dispatch<SetStateAction<boolean>>,
  folderError: boolean,
  setFolderErrorMsg: Dispatch<SetStateAction<string>>,
  folderErrorMsg: string,
  setModalDisplay: Dispatch<SetStateAction<boolean>>,
  modalDisplay: boolean,
  language: LanguageEnum,
}

/**
 * The page which prompts the user to choose a folder to save keys in
 *
 * @param props self documenting parameters passed in
 * @returns react element to render
 */
const SelectFolder: FC<SelectFolderProps> = (props): ReactElement => {
  const chooseFolder = () => {
    props.setFolderError(false);

    const options: OpenDialogOptions = {
      properties: ['openDirectory']
    };

    props.setModalDisplay(true);
    window.electronAPI.invokeShowOpenDialog(options)
      .then((value: OpenDialogReturnValue) => {
        if (value !== undefined && value.filePaths.length > 0) {
          props.setFolderPath(value.filePaths[0]);
        } else {
          props.setFolderError(true);
        }
      })
      .finally(() => {
        props.setModalDisplay(false);
      });
  }

  return (
    <Grid item container direction="column" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="body1">
          <Language language={props.language} id="Choose_Folder"/>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" component="label" onClick={chooseFolder} tabIndex={1} disabled={props.modalDisplay}>
          <Language language={props.language} id="Browse"/>
        </Button>
      </Grid>
      { props.folderPath != "" &&
        <Grid item xs={12}>
          <Typography >
              <Language language={props.language} id="You_Selected"/> {props.folderPath}
          </Typography>
        </Grid>
      }
      { props.folderError &&
        <Grid item xs={12}>
          <Typography color="error">
            {props.folderErrorMsg}
          </Typography>
        </Grid>
      }
    </Grid>
  );
}

export default SelectFolder;
