import {ethers} from "ethers";

const methodsABI = '0x4f498c73'

const abiCoder = new ethers.AbiCoder()

const encodedArguments = (params: [string[], string[], string[], string[]]): string => {
  return abiCoder.encode(['bytes[]', 'bytes[]', 'bytes[]', 'bytes32[]'], params).replace('0x', '')
};

export const generatedDataForDepositer = (pubkeys: string[],
                                          withdrawal_credentials: string[],
                                          signatures: string[],
                                          deposit_data_roots: string[]): string => {
  const param: [string[], string[], string[], string[]] = [pubkeys, withdrawal_credentials, signatures, deposit_data_roots]
  return methodsABI + encodedArguments(param);
}
