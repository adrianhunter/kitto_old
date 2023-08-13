import { SmartContract, TestWallet, WhatsonchainProvider, bsv } from 'scrypt-ts'
import Wallet from "./wallet.ts"
// mgMc63V7LUv3Xn4gGRXKqA8j6ZpPVuU8Eh
const privateKey = bsv.PrivateKey.fromWIF('cRpjqpBwyFFiqfrJKfs8gBYS7EWo27Nahfjt11dUD189sSM1RpHp')
export default function contract<T>(C: T): T {


  // const x  = class a extends SmartContract {};

  // // const Fake = class Dog extends SmartContract {

  // // }

  // @ts-expect-error asd
  C.loadArtifact(C.__artifact)

  let instance: SmartContract

  const wow = class Dog {
    constructor(...args: unknown[]) {
      instance = new C(...args)

      instance.connect(new Wallet(privateKey))


      return instance

      // return new Proxy({}, {

      //   get(target, key) {
      //     console.log('BIND ', key)

      //     return (...args: unknown[]) => {
      //       console.log('call ', key, ...args)
      //     }
      //   },
      // })
    }
  }
  return wow as unknown as T

  // return C
}


// // Clone the class without using extends
// function cloneClass(original) {
//   function Cloned(...args) {
//       return original.apply(this, args);
//   }

//   Cloned.prototype = Object.create(original.prototype);
//   Cloned.prototype.constructor = Cloned;

//   return Cloned;
// }
