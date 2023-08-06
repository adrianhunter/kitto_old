
import { asyncify } from "./asyncify.civet";
import { generatePrivateKey } from "./Gen.civet"
// { Signature } from ./Signature.civet

// {
//   BN_SIZE,
//   getEcdsaExports,
//   getMemoryBuffer,
//   PT_SIZE,
//   readBN,
//   writeBN,
// } from ../wasm/wasm-secp256k1.civet


export function ecdsaVerify (
  signature: { r: Uint8Array; s: Uint8Array },
  hash32: Uint8Array,
  publicKey: { x: Uint8Array; y: Uint8Array }
) {
  // memory := getMemoryBuffer()
  // rPos := memory.length - BN_SIZE
  // sPos := rPos - BN_SIZE
  // hash32Pos := sPos - BN_SIZE
  // publicKeyPos := hash32Pos - PT_SIZE
  // ecdsaVerify := getEcdsaExports().ecdsa_verify
  // writeBN(memory, rPos, signature.r)
  // writeBN(memory, sPos, signature.s)
  // writeBN(memory, hash32Pos, hash32)
  // writeBN(memory, publicKeyPos, publicKey.x)
  // writeBN(memory, publicKeyPos + BN_SIZE, publicKey.y)
    //@ts-ignore
  return ecdsaVerify(rPos, sPos, hash32Pos, publicKeyPos) === 0
}



export const ecdsaVerifyAsync = asyncify(ecdsaVerify)
export  const ecdsaSign = (
  hash32: Buf,
  privateKey: Buf,
  publicKey: { x: Buf; y: Buf },
): Signature => {
  let signature: Signature;
  while(true) {
    const k = generatePrivateKey()

    const signature = ecdsaSignWithK(hash32, k, privateKey, publicKey);

    if (signature) break
  }
  
  //@ts-ignore
  return signature;

}
export function ecdsaSignWithK (
  hash32: Buf,
  k: Buf,
  privateKey: Buf,
  publicKey: { x: Buf; y: Buf },
) {
  // memory := getMemoryBuffer()
  // hash32Pos := memory.length - BN_SIZE
  // kPos := hash32Pos - BN_SIZE
  // privateKeyPos := kPos - BN_SIZE
  // publicKeyPos := privateKeyPos - PT_SIZE
  // rPos := publicKeyPos - BN_SIZE
  // sPos := rPos - BN_SIZE
  // ecdsaSign: any := getEcdsaExports().ecdsa_sign
  // writeBN memory, hash32Pos, hash32
  // writeBN memory, kPos, k
  // writeBN memory, privateKeyPos, privateKey
  // writeBN memory, publicKeyPos, publicKey.x
  // writeBN memory, publicKeyPos + BN_SIZE, publicKey.y
  // if ecdsaSign(rPos, sPos, hash32Pos, kPos, privateKeyPos, publicKeyPos)
  return null
}

// //@ts-ignore
//   return {
//   //@ts-ignore
//     r: readBN(memory, rPos)
//     //@ts-ignore
//     s: readBN(memory, sPos)
//   }

//  default ecdsaSignWithK



export const ecdsaSignAsync = asyncify(ecdsaSign)
