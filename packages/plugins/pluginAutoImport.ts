

import AutoImport from 'npm:unplugin-auto-import/vite'

import type { Plugin } from 'vite'

const autoImports = {
  prop: true,
  method: true,
  SmartContract: true,
  SmartContractLib: true,
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
  // PubKeyHash: true,
  // PubKey: true,
  ByteString: true,
  // Sig: true,
  // SmartContract: true,
}

export default function pluginAutoImport(): Plugin[] {
  return [
    // AutoImport({

    //   // dts: 'auto-imports-global.d.ts',

    //   // resolvers: [

    //   //   [
    //   //     // {
    //   //     //   type: 'directive',
    //   //     //   resolve(a) {
    //   //     //     console.log('REXXXXSOLVEdirective', a, ...arguments)
    //   //     //   },
    //   //     // },

    //   //     {
    //   //       type: 'component',
    //   //       resolve(a) {
    //   //         if (a === 'log') {
    //   //           return {

    //   //             as: 'log',
    //   //             name: 'default',

    //   //             from: 'consola',

    //   //           }
    //   //         }

    //   //         // console.log('REXXXXSOLVE', a, ...arguments)
    //   //       },
    //   //     }],
    //   // ],
    //   imports: [

    //     // {
    //     //   '/Users/X/Documents/GitHub/kitto/packages/app/api.ts': [
    //     //     'log',
    //     //     'info',
    //     //     'warn',
    //     //     'error',

    //     //   ],
    //     // },
    //     // {
    //     //   mocha: [
    //     //     'it',
    //     //     'describe',
    //     //   ],
    //     // },
    //     // {
    //     //   chai: [
    //     //     'assert',
    //     //   ],

    //     // },
    //     // {
    //     //   from: 'scrypt-ts',
    //     //   imports: Object.keys(autoImportTypes),
    //     //   type: true,

    //     // },
    //   ],
    // }),
    AutoImport({
      dts: 'auto-imports-scrypt.d.ts',
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/, /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],

      "exclude": [
        "bsv"
      ],

      // dts: true,
      // include: ['*.scrypt.ts'],
      defaultExportByFilename: false,
      injectAtEnd: true,
      imports: [

        "react",

        {
          'scrypt-ts': Object.keys(autoImports),

        },
        {
          from: 'scrypt-ts',
          imports: Object.keys(autoImportTypes),
          type: true,

        },

      ],
    }),
  ]
}
