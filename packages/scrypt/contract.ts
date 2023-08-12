import { SmartContract, TestWallet, WhatsonchainProvider, bsv } from 'scrypt-ts'

// mgMc63V7LUv3Xn4gGRXKqA8j6ZpPVuU8Eh
const privateKey = bsv.PrivateKey.fromWIF('cRpjqpBwyFFiqfrJKfs8gBYS7EWo27Nahfjt11dUD189sSM1RpHp')
export default function contract<T>(a: T): T {
  const Fake = class Dog extends SmartContract {

  }

  // @ts-expect-error asd
  Fake.loadArtifact(a.__artifact)

  let instance: SmartContract

  const wow = class Dog {
    constructor(...args: unknown[]) {
      instance = new Fake(...args)

      instance.connect(new TestWallet(privateKey, new WhatsonchainProvider(bsv.Networks.testnet)))

      return new Proxy({}, {

        get(target, key) {
          console.log('BIND ', key)

          return (...args: unknown[]) => {
            console.log('call ', key, ...args)
          }
        },
      })
    }
  }
  return wow as unknown as T
  // return class Dog extends SmartContract {}
}
