import { generatePrivateKey } from "./Gen.civet";
import { encodeWIF } from "./Encode.civet";
import { decodeWIF } from "./Decode.civet";
import { PubKey } from "./PubKey.civet"

export class PrivKey { 
  constructor(
    public number: Uint8Array
  ){}
  static fromString(wif: string) { return new PrivKey((decodeWIF(wif).number)) }
  static fromRandom() { return new PrivKey(generatePrivateKey()) }
  toString() { return encodeWIF(this.number) }
  toPublicKey() { return PubKey.fromPrivKey(this) }
  toAddress() { return this.toPublicKey().toAddress() }
}


  //   @from(privateKey: { toString: () => any }): PrivKey {
  //   if (privateKey <? PrivKey) return privateKey
  //   if (typeof privateKey === "object" && privateKey) {
  //     privateKey = privateKey.toString()
  //   }
  //   if (typeof privateKey === "string") {
  //     return PrivKey.fromString(privateKey)
  //   }
  //   throw new Error("unsupported type")
  // }

