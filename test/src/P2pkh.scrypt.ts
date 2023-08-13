import {
  assert,
  hash160,
  method,
  prop,
  PubKey,
  PubKeyHash,
  DefaultProvider,
  Sig,
  GorillapoolProvider,
  TestWallet,
  SmartContract,
} from 'scrypt-ts'
import bsv from "bsv"
/*
* A simple Pay to Public Key Hash (P2PKH) contract.
*/
export class P2PKH extends SmartContract {
  // Address of the recipient.
  @prop()
  readonly pubKeyHash: PubKeyHash

  constructor(pubKeyHash: PubKeyHash) {
      super(...arguments)
      this.pubKeyHash = pubKeyHash
  }

  @method()
  public unlock(sig: Sig, pubkey: PubKey) {
      // Check if the passed public key belongs to the specified address.
      assert(
          hash160(pubkey) == this.pubKeyHash,
          'public key hashes are not equal'
      )
      // Check signature validity.
      assert(this.checkSig(sig, pubkey), 'signature check failed')
  }
}


// import { P2PKH } from '../../src/contracts/p2pkh'
// import { getDefaultSigner, inputSatoshis } from '../utils/helper'
import { myPublicKey, myPublicKeyHash , myPrivateKey} from "~/contract/privateKey.ts"


import Wallet from "@kitto/scrypt/wallet.ts"
import {
    findSig,
    MethodCallOptions,
    // PubKey,
    // PubKeyHash,
    toHex,
} from 'scrypt-ts'
import { inputSatoshis } from "~/contract/helper.ts"
import { getDefaultSigner } from '~/contract/helper.ts'

async function main() {
    const p2pkh = new P2PKH(PubKeyHash(toHex(myPublicKeyHash)))

    const gPool = new GorillapoolProvider()

    gPool.updateNetwork(bsv.Networks.testnet)

    // connect to a signer
    await p2pkh.connect(new TestWallet(myPrivateKey,gPool))

    // deploy
    const deployTx = await p2pkh.deploy(inputSatoshis)
    console.log('P2PKH contract deployed: ', deployTx.id)

    // call
    const { tx: callTx } = await p2pkh.methods.unlock(
        // pass signature, the first parameter, to `unlock`
        // after the signer signs the transaction, the signatures are returned in `SignatureResponse[]`
        // you need to find the signature or signatures you want in the return through the public key or address
        // here we use `myPublicKey` to find the signature because we signed the transaction with `myPrivateKey` before
        (sigResps) => findSig(sigResps, myPublicKey),
        // pass public key, the second parameter, to `unlock`
        PubKey(toHex(myPublicKey)),
        // method call options
        {
            // tell the signer to use the private key corresponding to `myPublicKey` to sign this transaction
            // that is using `myPrivateKey` to sign the transaction
            pubKeyOrAddrToSign: myPublicKey,
        } as MethodCallOptions<P2PKH>
    )
    console.log('P2PKH contract called: ', callTx.id)
}

await main()
