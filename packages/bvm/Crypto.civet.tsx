export async function generateKeyPair () {
    return await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    )
}

export async function calculatePublicKey (key: CryptoKeyPair) { 
    return await crypto.subtle.exportKey("jwk", key.publicKey)
}



export async function signEcdsa (
//   signature: { r: Uint8Array; s: Uint8Array }
    hash32: Uint8Array,
    privateKey: any,
    publicKey: { x: Uint8Array; y: Uint8Array },
    // signature: BufferSource
    // hash32: Uint8Array
    // publicKey: CryptoKey
) {
    return await crypto.subtle.sign({
            name: "ECDSA",
            hash: {
                name: "SHA-256"
            }
        },
        privateKey,
        hash32
    )
}



export async function verifyEcdsa (
//   signature: { r: Uint8Array; s: Uint8Array }
    signature: BufferSource,
    hash32: Uint8Array,
    publicKey: CryptoKey
) {
    return await crypto.subtle.verify({
            name: "ECDSA",
            hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        publicKey, //from generateKey or importKey above
        // hexStringToUint8Array(cipherText), //ArrayBuffer of the data
        hash32,
        signature
        // asciiToUint8Array(plainText)
    )
}

    // crypto.verify
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
//   return ecdsaVerify(rPos, sPos, hash32Pos, publicKeyPos) === 0
import { verifyPrivateKey } from "./Verify.civet"


export const generatePrivateKey = () => { 
  return generateRandomData(32)
}



export const generateRandomData = (size: number) => {
  return crypto.getRandomValues(new Uint8Array(size))
}