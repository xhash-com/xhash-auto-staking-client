import React, {FC, ReactElement, Dispatch, SetStateAction} from "react";
import {Grid, Typography, Button, makeStyles, Theme, createStyles} from "@material-ui/core";
import {Network, DepositKeyInterface, DepositStatus, TransactionStatus, LanguageEnum} from "../../types";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CircularProgressWithLabel from "../CircularProgressWithLabel";
import {Language, LanguageFunc} from "../../language/Language";

type DepositeUpLoadProps = {
	network: Network,
	setDepositKey: Dispatch<SetStateAction<DepositKeyInterface[]>>,
	depositKey: DepositKeyInterface[],
	setCheckDepositKey: Dispatch<SetStateAction<boolean>>,
	checkDepositKey: boolean,
	modalDisplay: boolean,
	setModalDisplay: Dispatch<SetStateAction<boolean>>,
	fileErrorMsg: string,
	setFileErrorMsg: Dispatch<SetStateAction<string>>,
	fileName: string,
	setFileName: Dispatch<SetStateAction<string>>,
	showCircular: boolean,
	setShowCircular: Dispatch<SetStateAction<boolean>>,
	progress: number,
	setProgress: Dispatch<SetStateAction<number>>,
	language: LanguageEnum,
}

const useStyles = makeStyles((theme: Theme) =>
		createStyles({
			button: {
				margin: theme.spacing(1),
			},
		}),
);

const DepositeUpLoad: FC<DepositeUpLoadProps> = (props): ReactElement => {
	const classes = useStyles();
	const GENESIS_FORK_VERSION = props.network === Network.MAINNET ? '00000000' : '00001020';

	const checkJsonStructure = (depositDataJson: { [field: string]: any }) => {
		return !!(
			depositDataJson.pubkey ||
			depositDataJson.withdrawal_credentials ||
			depositDataJson.amount ||
			depositDataJson.signature ||
			depositDataJson.deposit_message_root ||
			depositDataJson.deposit_data_root ||
			depositDataJson.fork_version
		);
	};

	function handleChange(even: { target: any; }) {
		props.setShowCircular(true)
		props.setProgress(25)
		props.setFileErrorMsg(LanguageFunc("Wait_For_Read_Files", props.language));
		props.setModalDisplay(true);
		const file = even.target.files[0];
		props.setFileName(file.path)
		const reader=new FileReader();
		reader.readAsText(file);
		reader.onload=async event=>{
			if(event.target){
				try{
					props.setProgress(50)
					props.setFileErrorMsg(LanguageFunc("Wait_For_Validate_DepositKey", props.language));
					const fileData: any[] = JSON.parse(event.target.result as string);
					//BLS 校验
					let tempDepositKey:DepositKeyInterface[] = [];
					if (await window.deposit.validateDepositKey(fileData, props.network.toLocaleLowerCase())) {
						tempDepositKey =
								fileData.map((file: DepositKeyInterface) => ({
									...file,
									transactionStatus: TransactionStatus.READY, // initialize each file with ready state for transaction
									depositStatus: DepositStatus.VERIFYING, // assign to verifying status until the pubkey is checked via beaconscan
								}))
						//perform double deposit check
						try {
							props.setProgress(75)
							props.setFileErrorMsg(LanguageFunc("Wait_For_Fetch_Existing_Deposits_For_Pubkeys", props.language));
							const existingDeposits = await window.deposit.getExistingDepositsForPubkeys(
								fileData,
								props.network.toLocaleLowerCase()
							);
							const existingDepositPubkeys = existingDeposits.data.flatMap(
								(x: { publickey: string; }) => x.publickey.substring(2)
							);
							(fileData as DepositKeyInterface[]).forEach( (item, index) => {
								if (existingDepositPubkeys.includes(item.pubkey)) {
									tempDepositKey[index].depositStatus = DepositStatus.ALREADY_DEPOSITED
								} else {
									tempDepositKey[index].depositStatus = DepositStatus.READY_FOR_DEPOSIT
								}
							})

							props.setDepositKey(tempDepositKey)
							props.setProgress(100)
							props.setFileErrorMsg(LanguageFunc("BLS_Check_Pass", props.language));
							props.setCheckDepositKey(true)
						} catch (error) {
							props.setShowCircular(false)
							props.setFileErrorMsg(LanguageFunc("BeaconChain_Status_Not_Healthy", props.language))
						}
					}else{
						// file is JSON but did not pass BLS, so leave it "staged" but not "accepted"
						props.setShowCircular(false)
						props.setDepositKey([]);

						// there are a couple special cases that can occur
						const { fork_version: forkVersion } = fileData[0] || {};
						const hasCorrectStructure = checkJsonStructure(fileData[0] || {});
						if (
							hasCorrectStructure &&
							forkVersion !== GENESIS_FORK_VERSION.toString()
						) {
							// file doesn't match the correct network
							props.setFileErrorMsg(LanguageFunc("File_Doesnt_Match", props.language))
						}else{
							props.setFileErrorMsg(LanguageFunc("Wrong_Json_File", props.language));
						}
					}
				}catch(e){
					// possible error example: json is invalid or empty so it cannot be parsed
					// TODO think about other possible errors here, and consider if we might want to set "isFileStaged"
					props.setShowCircular(false)
					props.setFileErrorMsg(LanguageFunc("Json_Invalid", props.language))
				}
			}
		}
		props.setModalDisplay(false);
		return false;
	}

	return (
		<Grid container spacing={3}>
			<Grid item xs={12}>
				<Typography variant="body1">
					<Language language={props.language} id="Select_Files"/>
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Button variant="contained" color="secondary" component="label" className={classes.button} startIcon={<CloudUploadIcon />}>
					{LanguageFunc("Select", props.language)}
					<input hidden accept="json/*" id="input" type="file" onChange={handleChange}/>
				</Button>
			</Grid>
			<Grid item xs={12}>
				<Typography >
					{props.fileName}
				</Typography>
				<br/>
				{props.showCircular && <CircularProgressWithLabel value={props.progress} />}
				<br/>
				{props.fileErrorMsg}
			</Grid>
		</Grid>
	);
}

export default DepositeUpLoad;
