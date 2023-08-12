import { createUnimport } from 'npm:unimport'
import type { Plugin } from './types.d.ts'

export default function pluginAutoImport(): Plugin {
  const config = {
    imports: Object.keys(autoImports).map((a) => {
      return {
        from: 'scrypt-ts',
        name: a,
      }
    }),
  }
  const stuff = createUnimport(config)

  return {
    enforce: 'pre',
    name: 'kitto:ts',
    extnames: ['.ts', '.tsx', '.mts', '.cts'],
    async configResolved() {
      const autoTypes = await stuff.generateTypeDeclarations({})
      await Deno.writeTextFile(`${Deno.cwd()}/autoimport.d.ts`, autoTypes)
    },
    async transform(opts) {
      const r = await stuff.injectImports(opts.code)
      opts.code = r.code
      return opts
    },
  }
}

const autoImports = {
  prop: true,
  method: true,
  SmartContract: true,
  SmartContractLib: true,
  bsv: true,
  toHex: true,
  buildPublicKeyHashScript: true,
  buildOpreturnScript: true,
  FunctionCall: true,
  Provider: true,
  SensiletSigner: true,
  DotwalletSigner: true,
  TAALSigner: true,
  TestWallet: true,
  PubKey: true,
  Sig: true,
  SigHashPreimage: true,
  PrivKey: true,
  Ripemd160: true,
  PubKeyHash: true,
  Sha256: true,
  Sha1: true,
  OpCodeType: true,
  SigHashType: true,
  instanceOfSIATraceable: true,
  HashedMap: true,
  HashedSet: true,
  toByteString: true,
  equals: true,
  and: true,
  xor: true,
  or: true,
  invert: true,
  getSortedItem: true,
  slice: true,
  fill: true,
  int2ByteString: true,
  byteString2Int: true,
  len: true,
  reverseByteString: true,
  exit: true,
  abs: true,
  min: true,
  max: true,
  within: true,
  ripemd160: true,
  sha1: true,
  sha256: true,
  hash160: true,
  hash256: true,
  lshift: true,
  rshift: true,
  asm: true,
  OpCode: true,
  Utils: true,
  SigHash: true,
  VarIntReader: true,
  VarIntWriter: true,
  Tx: true,
  Constants: true,
  getDummyP2pkhUTXOs: true,
  getRandomAddress: true,
  utxoFromOutput: true,
  parseAddresses: true,
  parseSignatureOption: true,
  filterUTXO: true,
  getDummySig: true,
  toNumber: true,
  findSig: true,
  findSigs: true,
  mapIter: true,
  isInNodeEnv: true,
  alterFileExt: true,
  SignatureHashType: true,
  WhatsonchainProvider: true,
  SensibleProvider: true,
  GorillapoolProvider: true,
  TaalProvider: true,
  DefaultProvider: true,
  DummyProvider: true,
  ScryptProvider: true,
  Signer: true,
  Scrypt: true,
  ActionError: true,
  ContractApi: true,
  BsvApi: true,
}

const autoImportTypes = {
  PubKeyHash: true,
  PubKey: true,
  ByteString: true,
  Sig: true,
  SmartContract: true,
}
