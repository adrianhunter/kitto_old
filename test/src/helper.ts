import {
  bsv,
  DefaultProvider,
  DummyProvider,
  TestWallet,
  UTXO,
} from 'scrypt-ts'
// import { randomBytes } from 'node:crypto'
import { myPrivateKey } from './privateKey.ts'

export const inputSatoshis = 10000

export const sleep = async (seconds: number) => {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve({})
      }, seconds * 1000)
  })
}

export function randomPrivateKey() {
  const privateKey = bsv.PrivateKey.fromRandom(bsv.Networks.testnet)
  const publicKey = bsv.PublicKey.fromPrivateKey(privateKey)
  const publicKeyHash = bsv.crypto.Hash.sha256ripemd160(publicKey.toBuffer())
  const address = publicKey.toAddress()
  return [privateKey, publicKey, publicKeyHash, address] as const
}

export function getDefaultSigner(
  privateKey?: bsv.PrivateKey | bsv.PrivateKey[]
): TestWallet {
  if (globalThis.testnetSigner === undefined) {
      globalThis.testnetSigner = new TestWallet(
          myPrivateKey,
          new DefaultProvider({
              network: bsv.Networks.testnet,
          })
      )
  }
  if (privateKey !== undefined) {
      globalThis.testnetSigner.addPrivateKey(privateKey)
  }
  return globalThis.testnetSigner
}

// export const dummyUTXO = {
//   txId: randomBytes(32).toString('hex'),
//   outputIndex: 0,
//   script: '', // placeholder
//   satoshis: inputSatoshis,
// }

export function getDummyUTXO(
  satoshis: number = inputSatoshis,
  unique = false
): UTXO {
  if (unique) {
      return Object.assign({}, dummyUTXO, {
          satoshis,
          txId: randomBytes(32).toString('hex'),
      })
  }
  return Object.assign({}, dummyUTXO, { satoshis })
}

export function getDummySigner(
  privateKey?: bsv.PrivateKey | bsv.PrivateKey[]
): TestWallet {
  if (globalThis.dummySigner === undefined) {
      globalThis.dummySigner = new TestWallet(myPrivateKey, new DummyProvider())
  }
  if (privateKey !== undefined) {
      globalThis.dummySigner.addPrivateKey(privateKey)
  }
  return globalThis.dummySigner
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
}

export function stringify(obj: unknown) {
  return JSON.stringify(
      obj,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchange
      2
  )
}
