export type t = {
  script: Uint8Array
  satoshis: number
};


// const name = entity.name

import { Tx } from "./Tx.civet"



class Output {
  constructor(
     public script: Buf = [],
     public satoshis: number = 1
  ){}
}

export {Output}

  // get txid () 
  //   @tx.hash

  // get vout () { return this.tx.outputs.indexOf(this) }
