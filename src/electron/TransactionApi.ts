import {Network} from "../react/types";
import axios from "axios";
import {sleep} from "./common/method";

const Goerli_URL = "https://goerli.etherscan.io/api?module=localchk&action=txexist&txhash="
const MainNet_URL = "https://etherscan.io/api?module=localchk&action=txexist&txhash="

type Transaction = {
  id: number
  txhash: string,
  network: Network
}

let polling = false

const undoneList: Transaction[] = []
const finishedList: Transaction[] = []
let pushIndex = -1

const fetchTransactionStatus = async (txhash: string, network: Network) : Promise<any> => {
  return await axios.get((network === Network.MAINNET ? MainNet_URL : Goerli_URL) + txhash);
}

export const submitUndoneList = (id: number, txhash: string, network: Network) => {
  undoneList.push({id: id, txhash: txhash, network: network})
  if(!polling){
    polling = true
    pollingUndoList()
  }
}

const pollingUndoList = async () => {
  while(undoneList.length > 0){
    const tx = undoneList[0]
    try{
      await sleep(1100)
      const result = await fetchTransactionStatus(tx.txhash, tx.network);
      if (result.data.result==="True"){
        undoneList.shift()
        finishedList.push(tx)
      }
    }catch(error){
      console.error(`Error polling transaction ${tx.txhash}: ${error}`)
    }
  }

  polling = false
}

export const getFinished = () => {
  if(finishedList.length == 0){
    return null
  }else if(pushIndex + 1 < finishedList.length){
    return finishedList[++pushIndex]
  }else{
    return null;
  }
}
