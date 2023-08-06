
import { sighash } from "./Hash.civet";
import { signEcdsa } from "./Crypto.civet";
import { encodeDER } from "./Encode.civet";
import { sighashAsync } from "./Hash.civet";
import { ecdsaSign } from "./Ecdsa.civet";
import { Tx } from "./Tx.civet";
import { verifyPrivateKey } from "./Verify.civet";
import { BufferWriter } from "./BufferWriter.civet";
import { writePushData } from "./Write.civet";
import { isBuffer } from "./Validate.civet";
import { ecdsaSignAsync } from "./Ecdsa.civet";


// {
//   BN_SIZE,
//   getMemoryBuffer,
//   getSecp256k1Exports,
//   PT_SIZE,
//   readBN,
//   writeBN,
// } from ../wasm/wasm-secp256k1.civet
import { sha256ripemd160 } from "./Hash.civet";
import { encodePubKey } from "./Encode.civet";
import { encodeHex } from "./Encode.civet";
import { sha256d } from "./Hash.civet"

const SIGHASH_ALL = 0x01
const SIGHASH_FORKID = 0x40

export const generateTxSignature = (
  tx: Tx,
  vin: number,
  parentScript: Uint8Array,
  parentSatoshis: number,
  privateKey: Uint8Array,
  publicKey: Point,
  sighashFlags: number = SIGHASH_ALL
): Uint8Array => {
  sighashFlags |= SIGHASH_FORKID
  const hash = sighash(tx, vin, parentScript, parentSatoshis, sighashFlags)
  const signature = ecdsaSign(hash, privateKey, publicKey)
  const dersig = encodeDER(signature)
  return new Uint8Array(Array.from([...dersig, sighashFlags]))
}

export const generateTxSignatureAsync = async (
  tx: Tx,
  vin: any,
  parentScript: any,
  parentSatoshis: any,
  privateKey: any,
  publicKey: any,
  sighashFlags = SIGHASH_ALL
) => { 
  sighashFlags |= SIGHASH_FORKID
  const hash = await sighashAsync(
    tx,
    vin,
    parentScript,
    parentSatoshis,
    sighashFlags
  )
  const signature = await ecdsaSignAsync(hash, privateKey, publicKey)
  const dersig = encodeDER(signature)
  return Array.from([...dersig, sighashFlags])
}

export const generateRandomData = (size: number) => {
  return window.crypto.getRandomValues(new Uint8Array(size))
}
export const generatePrivateKey = () => { 
  return generateRandomData(32)
}
export const calculatePublicKeyHash = function(publicKey: Point) {
  return sha256ripemd160(encodePubKey(publicKey, true))
}
export const createP2PKHLockScript = (pubkeyhash: Uint8Array) => {
  if (!isBuffer(pubkeyhash)) throw new Error("not a buffer")
  const buf = new Uint8Array(25)
  buf[0] = 118 // OP_DUP
  buf[1] = 169 // OP_HASH160
  buf[2] = 20 // OP_PUSH(20)
  buf.set(pubkeyhash, 3)
  buf[23] = 136 // OP_EQUALVERIFY
  buf[24] = 172 // OP_CHECKSIG
  return buf
}
export const createP2PKHUnlockScript = (
  signature: Uint8Array,
  pubkey: Uint8Array
) => {
  const writer = new BufferWriter
  writePushData(writer, signature)
  writePushData(writer, pubkey)
  return writer.toBuffer()
}
export const calculatePublicKey = (privateKey: Buf) => { 
  // memory := getMemoryBuffer()
  // privateKeyPos := memory.length - BN_SIZE
  // publicKeyPos := privateKeyPos - PT_SIZE
  // writeBN(memory, privateKeyPos, privateKey)
  // //@ts-ignore
  // getSecp256k1Exports().g_mul(publicKeyPos, privateKeyPos)
  // //@ts-ignore
  // x: readBN(memory, publicKeyPos)
  // //@ts-ignore
  // y: readBN(memory, publicKeyPos + BN_SIZE)
  //TODO
  return {} as unknown as Point
}
export const calculateTxid = (buffer: Buf) => { 
    return encodeHex(sha256d(buffer).reverse())
}
export const extractP2PKHLockScriptPubkeyhash = (script: Buf) => {
  return script.slice(3, 23)
}
