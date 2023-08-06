

import { verifyPrivateKey } from "./Verify.civet";
import { BASE58_CHARS } from "./base58-chars.civet";
import { sha256d } from "./Hash.civet";
import { opcodes } from "./Opcodes.civet";
import { BufferWriter } from "./BufferWriter.civet";
import { writePushData } from "./Write.civet";
import { BufferReader } from "./BufferReader.civet";
import { readTx, readDER } from "./Read.civet";
import { isHex } from "./Validate.civet";
// {
//   BN_SIZE,
//   getMemoryBuffer,
//   getSecp256k1Exports,
//   readBN,
//   writeBN,
// } from ../wasm/wasm-secp256k1.civet
import { verifyPoint } from "./Verify.civet"


export function decodeWIF (privkey: string) {
  const { version, payload } = decodeBase58Check(privkey)
  const testnet = version === 0xef
  let number
  let compressed
  if (payload.length === 32) {
    compressed = false
    number = payload
  }
  else if (payload.length === 33) {
    compressed = true
    number = payload.slice(0, 32)
  }
  else {
    throw new Error("bad length")
  }
  verifyPrivateKey(number)
  return { number, testnet, compressed }
}


export function decodeTx (buffer: Buf): Tx {
  //@ts-ignore
  const reader = new BufferReader(buffer)
  const tx = readTx(reader)
  reader.close()
  return tx
}



export const decodeScriptChunks = (script: Buf) => {
  const chunks: any[] = [];
  let i = 0;
  while (i < script.length) {
    const opcode = script[i];
    i += 1;
    if (opcode === 0) {
      chunks.push({ opcode, buf: [] });
    } else if (opcode < 76) { // OP_PUSHDATA1
      chunks.push({ opcode, buf: script.slice(i, i + opcode) });
      i += opcode;
    } else if (opcode === 76) { // OP_PUSHDATA1
      const len = script[i];
      i += 1;
      chunks.push({ opcode, buf: script.slice(i, i + len) });
      i += len;
    } else if (opcode === 77) { // OP_PUSHDATA2
      const len = script[i] | script[i + 1] << 8;
      i += 2;
      chunks.push({ opcode, buf: script.slice(i, i + len) });
      i += len;
    } else if (opcode === 78) { // OP_PUSHDATA4
      const len = script[i] + script[i + 1] * 0x0100 +
        script[i + 2] * 0x010000 + script[i + 3] * 0x01000000;
      i += 4;
      chunks.push({ opcode, buf: script.slice(i, i + len) });
      i += len;
    } else {
      chunks.push({ opcode: opcode });
    }
  }
  if (i !== script.length) throw new Error("bad script");
  return chunks;
};




// decodeCompressedPublicKey := (buffer: Uint8Array): Point ->
//   if (buffer.length !== 33) throw new Error("bad length");

//   // let xstart = 1;
//   // //@ts-ignore
//   // while (!buffer[xstart] && xstart < buffer.length) xstart++;
//   // const x = buffer.slice(xstart, 33);

//   // const memory = getMemoryBuffer();
//   // const xPos = memory.length - BN_SIZE;
//   // const yPos = xPos - BN_SIZE;

//   // writeBN(memory, xPos, x);
//   // //@ts-ignore
//   // getSecp256k1Exports().decompress_y(yPos, xPos, buffer[0]);
//   // //@ts-ignore
//   // const y = readBN(memory, yPos);

//   return { x: 0, y: 0 } as Point

function decodeUncompressedPublicKey(buffer: Buf): Point {
  if (buffer.length !== 65) throw new Error("bad length");

  let xstart = 1;
  //@ts-ignore
  while (!buffer[xstart] && xstart < buffer.length) xstart++;
  const x = buffer.slice(xstart, 33);

  let ystart = 33;
  //@ts-ignore
  while (!buffer[ystart] && ystart < buffer.length) ystart++;
  const y = buffer.slice(ystart, 65);

  return { x, y } as Point;
}

export const decodePublicKey = (buffer: Buf): Point => {
  //@ts-ignore
  const prefix = buffer[0];

  if (prefix === 0x04) {
    const publicKey = decodeUncompressedPublicKey(buffer);
    verifyPoint(publicKey);
    return publicKey;
  }

  // if (prefix === 0x02 || prefix === 0x03) {
  //   const publicKey = decodeCompressedPublicKey(buffer);
  //   verifyPoint(publicKey);
  //   return publicKey;
  // }

  throw new Error(`bad prefix: ${prefix}`);
};


/* global VARIANT */


// Prefer our implementation of decodeHex over Buffer when we don't know the VARIANT
// to avoid accidentally importing the Buffer shim in the browser.

export function decodeHex (hex: string) {
  if (typeof hex !== "string") throw new Error("not a string");

  if (hex.length % 2 === 1) hex = "0" + hex;

  if (!isHex(hex)) throw new Error("bad hex char");

  const length = hex.length / 2;
  const arr: Buf = new Array(length)
  const isNaN = (x: number) => x !== x // eslint-disable-line no-self-compare
  for (let i = 0; i < length; ++i) {
    const byte = parseInt(hex.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error("bad hex char");
    arr[i] = byte
  }
  return arr
}


export function decodeDER (buffer: Buf) {
  const reader = new BufferReader(buffer)
  const signature = readDER(reader)
  reader.close()
  return signature
}



const REV_LOOKUP: number[] = [];

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (let i = 0, len = BASE64_CHARS.length; i < len; ++i) {
  REV_LOOKUP[BASE64_CHARS.charCodeAt(i)] = i;
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
REV_LOOKUP["-".charCodeAt(0)] = 62;
REV_LOOKUP["_".charCodeAt(0)] = 63;

function getLens(b64: string | string[]) {
  const len = b64.length;

  if (len % 4 > 0) throw new Error("length must be a multiple of 4");

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  let validLen = b64.indexOf("=");
  if (validLen === -1) validLen = len;

  const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);

  return [validLen, placeHoldersLen];
}

function _byteLength(b64: any, validLen: any, placeHoldersLen: number) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen;
}

export let decodeBase64 = (b64: string) => {
  let tmp;
  const lens = getLens(b64);
  const validLen = lens[0];
  const placeHoldersLen = lens[1];

  const arr = new Uint8Array(_byteLength(b64, validLen, placeHoldersLen));

  let curByte = 0;

  // if there are placeholders, only get up to the last complete 4 chars
  const len = placeHoldersLen > 0 ? validLen - 4 : validLen;

  let i;
  for (i = 0; i < len; i += 4) {
    tmp = (REV_LOOKUP[b64.charCodeAt(i)] << 18) |
      (REV_LOOKUP[b64.charCodeAt(i + 1)] << 12) |
      (REV_LOOKUP[b64.charCodeAt(i + 2)] << 6) |
      REV_LOOKUP[b64.charCodeAt(i + 3)];
    arr[curByte++] = (tmp >> 16) & 0xFF;
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 2) {
    tmp = (REV_LOOKUP[b64.charCodeAt(i)] << 2) |
      (REV_LOOKUP[b64.charCodeAt(i + 1)] >> 4);
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 1) {
    tmp = (REV_LOOKUP[b64.charCodeAt(i)] << 10) |
      (REV_LOOKUP[b64.charCodeAt(i + 1)] << 4) |
      (REV_LOOKUP[b64.charCodeAt(i + 2)] >> 2);
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  return arr;
};



export function decodeBase58(s: string): Buf {
  // Credit: https://gist.github.com/diafygi/90a3e80ca1c2793220e5/
  const d: number[] = []; // the array for storing the stream of decoded bytes
  const b: number[] = []; // the result byte array that will be returned
  let j: number; // the iterator variable for the byte array (d)
  let c: number; // the carry amount variable that is used to overflow from the current byte to the next byte
  let n: number; // a temporary placeholder variable for the current byte
  for (let i = 0; i < s.length; i++) {
    j = 0; // reset the byte iterator
    c = BASE58_CHARS.indexOf(s[i]); // set the initial carry amount equal to the current base58 digit
    if (c < 0) throw new Error("bad base58 chars");
    if (!(c || b.length ^ i)) b.push(0); // prepend the result array with a zero if the base58 digit is zero and non-zero characters haven't been seen yet (to ensure correct decode length)
    while (j in d || c) { // start looping through the bytes until there are no more bytes and no carry amount
      n = d[j]; // set the placeholder for the current byte
      n = n ? n * 58 + c : c; // shift the current byte 58 units and add the carry amount (or just add the carry amount if this is a new byte)
      c = n >> 8; // find the new carry amount (1-byte shift of current byte value)
      d[j] = n % 256; // reset the current byte to the remainder (the carry amount will pass on the overflow)
      j++; // iterate to the next byte
    }
  }
  //@ts-ignore
  while (j--) b.push(d[j]); // since the byte array is backwards, loop through it in reverse order, and append
  return b;
}



export const decodeBase58Check = (
  s: string,
): { version: number; payload: Uint8Array } => {
  const arr = decodeBase58(s);

  const version = arr[0];

  const checksum = sha256d(arr.slice(0, arr.length - 4));

  if (
    checksum[0] !== arr[arr.length - 4] ||
    checksum[1] !== arr[arr.length - 3] ||
    checksum[2] !== arr[arr.length - 2] ||
    checksum[3] !== arr[arr.length - 1]
  ) {
    throw new Error("bad checksum");
  }

  const payload = arr.slice(1, arr.length - 4);
    //@ts-ignore
  return { version, payload };
};




export const decodeASM = (script: string): Uint8Array => { 
  const parts = script.split(" ").filter((x: string | any[]) => x.length);
  const writer = new BufferWriter();
  parts.forEach((part: string) => {
    if (part in opcodes) {
      //@ts-ignore
      writer.write([opcodes[part]]);
    } else if (part === "0") {
    //@ts-ignore
      writer.write([opcodes.OP_0]);
    } else if (part === "-1") {
    //@ts-ignore
      writer.write([opcodes.OP_1NEGATE]);
    } else {
      const buf = decodeHex(part);
      writePushData(writer, buf);
    }
  });
  return writer.toBuffer();
}


export const decodeAddress = (address: string): Buf => {
  return decodeBase58(address)
}


import { encodeWIF, encodeTx} from "./Encode.civet";

import { generatePrivateKey} from "./Crypto.civet"
import type { Tx} from "./Tx.civet";



import {encodeDER, encodeHex} from "./Encode.civet"


// import * as bsv from "bsv"


describe('Decode Tx', function() {
  it('twice of buffer returns same value', function() {
    const tx =  {
      version: 1,
      inputs: [ {
        txid: '1234567812345678123456781234567812345678123456781234567812345678',
        vout: 1,
        script: [1, 2, 3],
        sequence: 88,
      }
      ],
      outputs: [ {
        script: [4, 5, 6],
        satoshis: 7,
      }
      ],
      locktime: 100,
    }

    //@ts-ignore
    const buffer = encodeTx(tx)
    const tx1 = decodeTx(buffer)
    const tx2 = decodeTx(buffer)
    return assert.equal(tx1, tx2)
  })

  it('throws if not enough data', function() {
    const err = 'not enough data'
    assert.throws(() => decodeTx([1, 0, 0, 0]), Error, err)
    assert.throws(() => decodeTx([1, 0, 0, 0, 0]), Error, err)
    assert.throws(() => decodeTx([1, 0, 0, 0, 0, 0]), Error, err)
    return assert.throws(() => decodeTx([1, 0, 0, 0, 0, 0, 0, 0, 0]), Error, err)
  })

  return it('100mb tx', function() {
    const tx: Pick<Tx, "inputs" | "outputs"> = { inputs: [], outputs: [] }
    for (let i = 0; i < (1024 / 10); i++) { 
      tx.outputs.push({script: new Uint8Array(1 * 1024 * 1024), satoshis: 123})
    }

    //@ts-ignore
    const buffer = encodeTx(tx)
    return assert.equal(buffer.length > (1024 * 1024 * 1024 / 10), true)
  })
})


// test 'Decode ScriptChunks', ->
//   it('valid', () => {
//     dotest := (script: any, chunks: any) ->
//       assert.equal decodeScriptChunks(script), chunks
//       const bsvScript = bsv.Script.fromBuffer(bsv.deps.Buffer.from(script))
//       assert.equal bsvScript.chunks.length, chunks.length
//       chunks.forEach (chunk, i) => 
//         assert.equal chunk.opcode, bsvScript.chunks[i].opcodenum
//         // We treat OP_0 special and do store an empty buffer to match writePushData behavior
//         if chunk.opcode !== 0
//           assert.equal chunk.buf || [], Array.from(bsvScript.chunks[i].buf || [])

//     dotest([], [])
//     dotest([100, 255], [{ opcode: 100 }, { opcode: 255 }])
//     dotest([0], [{ opcode: 0, buf: [] }])
//     dotest([1, 2], [{ opcode: 1, buf: [2] }])
//     dotest([75, ...new Array(75).fill(1)], [{ opcode: 75, buf: new Array(75).fill(1) }])
//     dotest([76, 76, ...new Array(76).fill(1)], [{ opcode: 76, buf: new Array(76).fill(1) }])
//     dotest([76, 0xFF, ...new Array(0xFF).fill(1)], [{ opcode: 76, buf: new Array(0xFF).fill(1) }])
//     dotest([77, 0, 1, ...new Array(0xFF + 1).fill(1)], [{ opcode: 77, buf: new Array(0xFF + 1).fill(1) }])
//     dotest([77, 0xFF, 0xFF, ...new Array(0xFFFF).fill(1)], [{ opcode: 77, buf: new Array(0xFFFF).fill(1) }])
//     dotest([78, 0, 0, 1, 0, ...new Array(0xFFFF + 1).fill(1)], [{ opcode: 78, buf: new Array(0xFFFF + 1).fill(1) }])
//     dotest([79], [{ opcode: 79 }])
//     dotest([80], [{ opcode: 80 }])
//     dotest([81], [{ opcode: 81 }])
//     dotest([96], [{ opcode: 96 }])
//     dotest([100, 255, 1, 2], [{ opcode: 100 }, { opcode: 255 }, { opcode: 1, buf: [2] }])
//   })

//   it 'throws if bad', ->
//     err := 'bad script'
//     assert.throws () => decodeScriptChunks([1]), Error, err
//     assert.throws () => decodeScriptChunks([75]), Error, err
//     assert.throws () => decodeScriptChunks([76]), Error, err
//     assert.throws () => decodeScriptChunks([76, 1]), Error, err
//     assert.throws () => decodeScriptChunks([77, 0]), Error, err
//     assert.throws () => decodeScriptChunks([77, 1, 0]), Error, err
//     assert.throws () => decodeScriptChunks([78, 0]), Error, err
//     assert.throws () => decodeScriptChunks([78, 0, 0, 0]), Error, err
//     assert.throws () => decodeScriptChunks([78, 1, 0, 0, 0]), Error, err


// test 'Decode DER', ->
//   it 'decodes', ->
//     const signature = { r: new Array(20).fill(1), s: new Array(10).fill(2) }
//     const der = encodeDER(signature)
//     const signature2 = decodeDER(der)
//     assert.equal Array.from(signature2.r), signature.r
//     assert.equal Array.from(signature2.s), signature.s

//   it 'negative', ->
//     const signature = { r: [0x80].concat(new Array(31).fill(0)), s: new Array(32).fill(255) }
//     const der = encodeDER(signature)
//     const signature2 = decodeDER(der)
//     assert.equal Array.from(signature2.r),signature.r
//     assert.equal Array.from(signature2.s),signature.s

//   it 'throws if bad der', ->
//     const err = 'bad der'
//     assert.throws () => decodeDER([0x00, 0x04, 0x02, 0, 0x02, 0]), Error, err
//     assert.throws () => decodeDER([0x30, 0x04, 0x03, 0, 0x02, 0]), Error, err
//     assert.throws () => decodeDER([0x30, 0x04, 0x02, 0, 0xFF, 0]), Error, err
//     assert.throws () => decodeDER([0x30, 100, 0x02, 0, 0x02, 0]), Error, err

//   it 'throws if not enough data', ->
//     const err = 'not enough data'
//     assert.throws () => decodeDER([]), Error, err
//     assert.throws () => decodeDER([0x30]), Error, err
//     assert.throws () => decodeDER([0x30, 0x00]), Error, err
//     assert.throws () => decodeDER([0x30, 0x04, 0x02, 0]), Error, err
//     assert.throws () => decodeDER([0x30, 0x04, 0x02, 0, 0x02, 1]), Error, err
//     assert.throws () => decodeDER([0x30, 0x04, 0x02, 3, 0x02, 1]), Error, err

//   it 'throws if unconsumed data', ->
//     const err = 'unconsumed data'
//     assert.throws () => decodeDER([0x30, 0x04, 0x02, 0x00, 0x02, 0x00, 0xFF]), Error, err
// // test 'decodeWIF', ->
//   // it 'uncompressed', ->
//   //   const privateKey = generatePrivateKey()

// test 'Decode Hex', ->
//   it 'empty', ->
//     assert.equal Array.from(decodeHex('')), []

//   it 'buffer', ->
//     assert.equal Array.from(decodeHex('001122')), [0x00, 0x11, 0x22]

//   it 'incomplete', ->
//     assert.equal Array.from(decodeHex('102')), [0x01, 0x02]

//   it 'throws if not a string', ->
//     //@ts-expect-error
//     assert.throws () => decodeHex(), Error, 'not a string'
//     //@ts-expect-error
//     assert.throws () => decodeHex(null), 'not a string'

//   it 'throws if not a hex char', ->
//     assert.throws () => decodeHex('z'), Error, 'bad hex char'
//     assert.throws () => decodeHex('x!'), Error, 'bad hex char'



// test 'Decode Base64', ->
//   encoder := new TextEncoder

//   it 'decodes', ->
//     assert.equal Array.from(decodeBase64('')), Array.from(encoder.encode(''))
//     assert.equal Array.from(decodeBase64('YQ==')), Array.from(encoder.encode('a'))
//     assert.equal Array.from(decodeBase64('YWI=')), Array.from(encoder.encode('ab'))
//     assert.equal Array.from(decodeBase64('YWJj')), Array.from(encoder.encode('abc'))
//     assert.equal Array.from(decodeBase64('YWJjZGVmZw==')), Array.from(encoder.encode('abcdefg'))
//     assert.equal Array.from(decodeBase64('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5')), Array.from(encoder.encode('abcdefghijklmnopqrstuvwxyz0123456789'))

//   it 'throws if bad', ->
//     assert.throws () => decodeBase64('1'), Error, 'length must be a multiple of 4'
//     assert.throws () => decodeBase64('abc'), Error, 'length must be a multiple of 4'

// test 'Decode ASM', ->
//   it 'long script', ->
//     const asm = 'aaf460daab8997860a390bb3eb641734462c2fd9f86320a6390895a3a94a71c7 c3 OP_2 OP_PICK OP_IF 42 OP_1 OP_ROLL OP_DROP OP_4 OP_PICK 68 OP_SPLIT OP_DROP 44 OP_SPLIT OP_NIP 0 OP_PICK 20 OP_SPLIT OP_DROP 00000000 OP_CAT OP_1 OP_PICK OP_1 OP_PICK OP_CAT OP_6 OP_PICK OP_CAT OP_HASH256 OP_7 OP_PICK 24 OP_SPLIT OP_DROP OP_4 OP_SPLIT OP_NIP OP_EQUAL OP_VERIFY OP_DROP OP_DROP OP_ELSE OP_4 OP_PICK OP_5 OP_PICK OP_SIZE OP_NIP OP_8 OP_SUB OP_SPLIT OP_DROP OP_5 OP_PICK OP_SIZE OP_NIP 28 OP_SUB OP_SPLIT OP_NIP OP_2 OP_PICK OP_EQUAL OP_VERIFY OP_ENDIF OP_NOP OP_4 OP_PICK cdb285cc49e5ff3eed6536e7b426e8a528b05bf9276bd05431a671743e651ceb00 02dca1e194dd541a47f4c85fea6a4d45bb50f16ed2fddc391bf80b525454f8b409 f941a26b1c1802eaa09109701e4e632e1ef730b0b68c9517e7c19be2ba4c7d37 2f282d163597a82d72c263b004695297aecb4d758dccd1dbf61e82a3360bde2c 2cde0b36a3821ef6dbd1cc8d754dcbae97526904b063c2722da89735162d282f OP_6 OP_PICK OP_6 OP_PICK OP_HASH256 OP_NOP OP_NOP 0 OP_PICK 0 OP_PICK OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT 00 OP_CAT OP_BIN2NUM OP_1 OP_ROLL OP_DROP OP_NOP OP_7 OP_PICK OP_6 OP_PICK OP_6 OP_PICK OP_6 OP_PICK OP_6 OP_PICK OP_3 OP_PICK OP_6 OP_PICK OP_4 OP_PICK OP_7 OP_PICK OP_MUL OP_ADD OP_MUL 414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff00 OP_NOP OP_1 OP_PICK OP_1 OP_PICK OP_1 OP_PICK OP_1 OP_PICK OP_MOD OP_2 OP_ROLL OP_DROP OP_1 OP_ROLL OP_1 OP_PICK 0 OP_LESSTHAN OP_IF OP_1 OP_PICK OP_1 OP_PICK OP_ADD OP_2 OP_ROLL OP_DROP OP_1 OP_ROLL OP_ENDIF OP_1 OP_PICK OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_NOP OP_2 OP_ROLL OP_DROP OP_1 OP_ROLL OP_1 OP_PICK OP_1 OP_PICK OP_2 OP_DIV OP_GREATERTHAN OP_IF 0 OP_PICK OP_2 OP_PICK OP_SUB OP_2 OP_ROLL OP_DROP OP_1 OP_ROLL OP_ENDIF OP_3 OP_PICK OP_SIZE OP_NIP OP_2 OP_PICK OP_SIZE OP_NIP OP_4 OP_2 OP_PICK OP_ADD OP_1 OP_PICK OP_ADD 30 OP_1 OP_PICK OP_CAT OP_2 OP_CAT OP_3 OP_PICK OP_CAT OP_7 OP_PICK OP_CAT OP_2 OP_CAT OP_2 OP_PICK OP_CAT OP_5 OP_PICK OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_CAT OP_6 OP_PICK OP_CAT 0 OP_PICK OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_NOP 0 OP_PICK OP_7 OP_PICK OP_CHECKSIG OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_NOP OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP'
//     const hex = '20aaf460daab8997860a390bb3eb641734462c2fd9f86320a6390895a3a94a71c701c35279630142517a75547901687f7501447f77007901207f7504000000007e517951797e56797eaa577901247f75547f77876975756754795579827758947f75557982770128947f77527987696861547921cdb285cc49e5ff3eed6536e7b426e8a528b05bf9276bd05431a671743e651ceb002102dca1e194dd541a47f4c85fea6a4d45bb50f16ed2fddc391bf80b525454f8b40920f941a26b1c1802eaa09109701e4e632e1ef730b0b68c9517e7c19be2ba4c7d37202f282d163597a82d72c263b004695297aecb4d758dccd1dbf61e82a3360bde2c202cde0b36a3821ef6dbd1cc8d754dcbae97526904b063c2722da89735162d282f56795679aa616100790079517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e81517a756157795679567956795679537956795479577995939521414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff0061517951795179517997527a75517a5179009f635179517993527a75517a685179517a75517a7561527a75517a517951795296a0630079527994527a75517a68537982775279827754527993517993013051797e527e53797e57797e527e52797e5579517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7e56797e0079517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a75517a75517a75517a75517a75517a75517a75517a75617777777777'
//     const actual = encodeHex(decodeASM(asm))
//     assert.equal actual, hex

//   it 'decodes 0 an -1 properly', ->
//     const asm = '0 00 OP_10 0a -1'
//     const hex = '0001005a010a4f'
//     const actual = encodeHex(decodeASM(asm))
//     assert.equal actual, hex




// test 'Decode Address', ->
//   it('valid', () => {
//     assert.equal decodeAddress('14kPnFashu7rYZKTXvJU8gXpJMf9e3f8k1'), {
//       testnet: false,
//       pubkeyhash: Array.from(new bsv.Address('14kPnFashu7rYZKTXvJU8gXpJMf9e3f8k1').hashBuffer)
//     }
//     // expect(decodeAddress('mhZZFmSiUqcmf8wQrBNjPAVHUCFsHso9ni')).to.deep.equal({
//     //   testnet: true,
//     //   pubkeyhash: Array.from(new bsv.Address('mhZZFmSiUqcmf8wQrBNjPAVHUCFsHso9ni').hashBuffer)
//     // })
//   })

  // it('throws if not a string', () => {
  //   expect(() => decodeAddress()).to.throw('not a string')
  //   expect(() => decodeAddress([])).to.throw('not a string')
  // })

  // it('throws if unsupported version', () => {
  //   expect(() => decodeAddress('3P14159f73E4gFr7JterCCQh9QjiTjiZrG')).to.throw('unsupported version')
  // })

  // it('throws if bad checksum', () => {
  //   expect(() => decodeAddress('mhZZFmSiUqcmf8wQrBNjPAVHUCFsHso9n')).to.throw('bad checksum')
  // })

  // it('throws if unsupported base58', () => {
  //   expect(() => decodeAddress('@')).to.throw('bad base58 chars')
  // })

  // it('throws if too short', () => {
  //   const badLengthAddress = encodeBase58Check(0x00, [])
  //   expect(() => decodeAddress(badLengthAddress)).to.throw('bad payload')
  // })
  //   console.log privateKey
  //   // const testnet = Math.random() < 0.5
  //   const compressed = false
  //   const wif = encodeWIF(privateKey, compressed)
  //   const decoded = decodeWIF(wif)
  //   // expect([...decoded.number]).to.deep.equal([...privateKey])
  //   // expect(decoded.testnet).to.equal(testnet)
  //   assert.equal decoded.compressed, false

  // it('compressed', () => {
  //   const privateKey = generatePrivateKey()
  //   const testnet = Math.random() < 0.5
  //   const compressed = true
  //   const wif = encodeWIF(privateKey, testnet, compressed)
  //   const decoded = decodeWIF(wif)
  //   expect([...decoded.number]).to.deep.equal([...privateKey])
  //   expect(decoded.testnet).to.equal(testnet)
  //   expect(decoded.compressed).to.equal(true)
  // })

  // it('throws if too short', () => {
  //   const badLengthWIF = encodeBase58Check(0x80, [])
  //   expect(() => decodeWIF(badLengthWIF)).to.throw('bad length')
  // })

  // it('throws if outside range', () => {
  //   const outsideRangeWIP = encodeBase58Check(0x80, new Array(32).fill(255))
  //   expect(() => decodeWIF(outsideRangeWIP)).to.throw('outside range')
  // })
// })