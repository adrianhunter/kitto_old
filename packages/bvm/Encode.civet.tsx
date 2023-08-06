
import { BufferWriter } from "./BufferWriter.civet";
import { Tx } from "./Tx.civet";
import { writeTx, writeDER, writePushData } from "./Write.civet";
import { BASE58_CHARS } from "./base58-chars.civet";
import { sha256d } from "./Hash.civet";
import { decodeScriptChunks } from "./Decode.civet";
import { opcodes } from "./Opcodes.civet"

const HEX = ["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"]
export const encodeWIF = (
  payload: Uint8Array,
  compressed?: boolean
) => {
  //@ts-ignore
  return encodeBase58(//@ts-ignore
    compressed ? [...payload, 1] : payload
  )
}
export const encodeTx = (tx: Tx) => {
  const writer = new BufferWriter
  writeTx(writer, tx)
  return writer.toBuffer()
}
export const encodePushData = (buffer: Buf) => { 
  const writer = new BufferWriter
  writePushData(writer, buffer)
  return writer.toBuffer()
}
export const encodePubKey = (
  publicKey: { x: any; y: any },
  compressed = true,
) => { 
  if (!compressed) {
    const arr = new Uint8Array(65)
    arr[0] = 4
    arr.set(publicKey.x, 1 + 32 - publicKey.x.length)
    arr.set(publicKey.y, 33 + 32 - publicKey.y.length)
    return arr
  }

  const arr = new Uint8Array(33)

  if ((publicKey.y[publicKey.y.length - 1] & 1) === 0) {
    arr[0] = 0x02
  }
  else { 
    arr[0] = 0x03
  }

  arr.set(publicKey.x, 1 + 32 - publicKey.x.length)
  return arr
}
export const encodeHex = (buffer: Buf) => {
  const len = buffer.length
  const out = new Array(len)
  for (let i = 0; i < len; ++i) { 
    //@ts-ignore
    out[i] = HEX[buffer[i]]
  }
  return out.join("")
}
export const encodeDER = (
  signature: Signature
) => {
  const writer = new BufferWriter
  writeDER(writer, signature)
  return writer.toBuffer()
}
export const encodeBase58 = (payload: Uint8Array): string => {
  // Credit: https://gist.github.com/diafygi/90a3e80ca1c2793220e5/
  const d: number[] = []; // the array for storing the stream of base58 digits
  let s = ""; // the result string variable that will be returned
  let i: any; // the iterator variable for the byte input
  let j: any; // the iterator variable for the base58 digit array (d)
  let c; // the carry amount variable that is used to overflow from the current base58 digit to the next base58 digit
  let n; // a temporary placeholder variable for the current base58 digit
  for (const i in payload) { // loop through each byte in the input stream
    j = 0; // reset the base58 digit iterator
    //@ts-ignore
    c = payload[i]; // set the initial carry amount equal to the current byte amount
    //@ts-ignore
    s += c || s.length ^ i ? "" : 1; // prepend the result string with a "1" (0 in base58) if the byte stream is zero and non-zero bytes haven't been seen yet (to ensure correct decode length)
    while (j in d || c) { // start looping through the digits until there are no more digits and no carry amount
      n = d[j]; // set the placeholder for the current base58 digit
      n = n ? n * 256 + c : c; // shift the current base58 one byte and add the carry amount (or just add the carry amount if this is a new digit)
      c = n / 58 | 0; // find the new carry amount (floored integer of current digit divided by 58)
      d[j] = n % 58; // reset the current base58 digit to the remainder (the carry amount will pass on the overflow)
      j++; // iterate to the next base58 digit
    }
  }
  while (j--) { // since the base58 digits are backwards, loop through them in reverse order
    s += BASE58_CHARS[d[j]]; // lookup the character associated with each base58 digit
  }
  return s
}
export const encodeBase58Check = (
  version: number,
  payload: Buf,
) => { 
  const arr = new Uint8Array(payload.length + 5)
  arr[0] = version
  arr.set(payload, 1)
  const checksum = sha256d(arr.slice(0, payload.length + 1)) 
  arr.set(checksum.slice(0, 4), arr.length - 4)
  return encodeBase58(arr)
}

const OPCODE_MAP: string[] = []

Object.entries(opcodes).forEach(([value, key]) => {
  return OPCODE_MAP[key] = value
})


export function encodeASM (script: Buf) {
  const chunks = decodeScriptChunks(script)

  return chunks.map((chunk) => {
    if (chunk.buf) {
      return encodeHex(chunk.buf) || "0"
    }
    else if (chunk.opcode === opcodes.OP_1NEGATE) {
      return "-1"
    }
    else {
      return OPCODE_MAP[chunk.opcode] || `<unknown opcode ${chunk.opcode}>`
    }
  }
  ).join(" ")
}



export const encodeAddress = (pubkeyhash: Buf, testnet?: boolean) => { 
  return encodeBase58Check(testnet ? 0x6f : 0x00, pubkeyhash)
}




//@ts-ignore
// import * as bsv from "bsv"

import { decodeTx } from "./Decode.civet"

// {Buffer} := bsv.deps


describe('Encode Tx', function() {


  return it('valid', function() {
    function testValid (tx: any, buffer: Buf) {
      assert.equal(Array.from(encodeTx(tx)), buffer)
      assert.equal(decodeTx(buffer), tx)
      const bsvtx = new bsv.Transaction()
      if (typeof tx.version !== 'undefined') bsvtx.version = tx.version
      bsvtx.inputs = tx.inputs.map((input) => new bsv.Transaction.Input({
        prevTxId: Buffer.from(input.txid, 'hex').reverse(),
        outputIndex: input.vout,
        script: Buffer.from(input.script).toString('hex'),
        sequenceNumber: input.sequence
      }))
      return bsvtx.outputs = tx.outputs.map((output) => new bsv.Transaction.Output({
        script: Buffer.from(output.script).toString('hex'),
        satoshis: output.satoshis
      }))
      // if (typeof tx.locktime !== 'undefined') bsvtx.nLockTime = tx.locktime
      // assert.equal bsvtx.toString(), Buffer.from(buffer).toString('hex')
    }


    const a = '0000000000000000000000000000000000000000000000000000000000000000'
    const abuffer = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    const b = '0101010101010101010101010101010101010101010101010101010101010101'
    const bbuffer = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    const longScript: number[] = []
    for (let i = 0; i < 256; i++) { 
      longScript.push(0x00)
    }

    testValid({version: 0, inputs: [], outputs: [], locktime: 0}, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    testValid(
      { version: 1, inputs: [], outputs: [], locktime: 0 },
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    testValid(
      { version: 0, inputs: [], outputs: [], locktime: 1 },
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0])
    testValid(
      { version: 1, inputs: [{ txid: a, vout: 0, script: [], sequence: 0xffffffff }], outputs: [], locktime: 0 },
      [1, 0, 0, 0, 1].concat(abuffer).concat([0, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0]))
    testValid(
      { version: 1, inputs: [{ txid: a, vout: 0, script: [], sequence: 0xffffffff }], outputs: [], locktime: 0 },
      [1, 0, 0, 0, 1].concat(abuffer).concat([0, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0]))
    testValid(
      { version: 1, inputs: [{ txid: a, vout: 0, script: [], sequence: 0xffffffff }, { txid: b, vout: 1, script: [], sequence: 0xffffffff }], outputs: [], locktime: 0 },
      [1, 0, 0, 0, 2].concat(abuffer).concat([0, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff]).concat(bbuffer).concat([1, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0]))
    testValid(
      { version: 1, inputs: [{ txid: a, vout: 0, script: [0xdd, 0xee, 0xff], sequence: 0xffffffff }], outputs: [], locktime: 0 },
      [1, 0, 0, 0, 1].concat(abuffer).concat([0, 0, 0, 0, 3, 0xdd, 0xee, 0xff, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0]))
    testValid(
      { version: 1, inputs: [], outputs: [{ satoshis: 0, script: [] }], locktime: 0 },
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    testValid(
      { version: 1, inputs: [], outputs: [{ satoshis: 1, script: [] }], locktime: 0 },
      [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    testValid(
      { version: 1, inputs: [], outputs: [{ satoshis: 0, script: [0xff] }], locktime: 0 },
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0xff, 0, 0, 0, 0])
    testValid(
      { version: 1, inputs: [], outputs: [{ satoshis: 0, script: longScript }], locktime: 0 },
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0xfd, 0x00, 0x01].concat(longScript).concat([0, 0, 0, 0]))
    return testValid(
      { version: 1, inputs: [], outputs: [{ satoshis: 0, script: [0xff] }, { satoshis: 1, script: [0xee] }], locktime: 0 },
      [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0xff, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0xee, 0, 0, 0, 0])
  })
})

  // it('supports optional version', () => {
  //   assert.equal(Array.from(encodeTx(
  //     { inputs: [], outputs: [], locktime: 0 }
  //   )),
  //     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  //   )
  // })

  // it('supports optional inputs', () => {
  //   assert.equal(Array.from(encodeTx(
  //     { version: 1, outputs: [], locktime: 0 }
  //   )),
  //     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  //   )
  // })

  // it('supports optional outputs', () => {
  //   assert.equal(Array.from(encodeTx(
  //     { version: 1, inputs: [], locktime: 0 }
  //   )),
  //     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  //   )
  // })

  // it('supports optional locktime', () => {
  //   assert.equal(Array.from(encodeTx(
  //     { version: 1, inputs: [], outputs: [] }
  //   )),
  //     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  //   )
  // })

  // it('supports optional sequence', () => {
  //   const a = '0000000000000000000000000000000000000000000000000000000000000000'
  //   const abuffer = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  //   assert.equal(Array.from(encodeTx(
  //     { version: 1, inputs: [{ txid: a, vout: 0, script: [] }], outputs: [], locktime: 0 }
  //   )),
  //     [1, 0, 0, 0, 1].concat(abuffer).concat([0, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0])
  //   )
  // })


describe('Encode PushData', function() {
  return it('valid', () => {
    function testValid (x) {
      const actual = Array.from(encodePushData(x))
      const expected = Array.from(bsv.Script.fromASM(`${Buffer.from(x).toString('hex')}`).toBuffer())
      return assert.equal(actual, expected)
    }

    testValid([])
    return testValid(new Array(0xFF + 1).fill(0))
  })
})



describe('Encode Hex', function() {
  it('empty', () => {
    return assert.equal(encodeHex([]), '')
  })

  return it('buffer', () => { 
    return assert.equal(encodeHex([0x00, 0x11, 0x22]), '001122')
  })
})



describe('Encode DER', function() {
  it('encodes full length', () => { 
    const signature = { r: new Array(32).fill(1), s: new Array(32).fill(2) }
    const der = encodeDER(signature)
    assert.equal(der[0], 0x30)
    assert.equal(der[1], 68)
    assert.equal(der[2], 0x02)
    assert.equal(der[3], 32)
    assert.equal(Array.from(der.slice(4, 4 + 32)), signature.r)
    assert.equal(der[36], 0x02)
    assert.equal(der[37], 32)
    assert.equal(Array.from(der.slice(38)), signature.s)
    const bsvSignature = bsv.crypto.Signature.fromDER(bsv.deps.Buffer.from(der))
    assert.equal(Array.from(bsvSignature.r.toBuffer()), signature.r)
    return assert.equal(Array.from(bsvSignature.s.toBuffer()), signature.s)
  })

  it('encodes smaller length', () => { 
    const signature = { r: new Array(20).fill(1), s: new Array(10).fill(2) }
    const der = encodeDER(signature)
    assert.equal(der[0], 0x30)
    assert.equal(der[1], 34)
    assert.equal(der[2], 0x02)
    assert.equal(der[3], 20)
    assert.equal(Array.from(der.slice(4, 4 + 20)), signature.r)
    assert.equal(der[24], 0x02)
    assert.equal(der[25], 10)
    assert.equal(Array.from(der.slice(26)), signature.s)
    const bsvSignature = bsv.crypto.Signature.fromDER(bsv.deps.Buffer.from(der))
    assert.equal(Array.from(bsvSignature.r.toBuffer()), signature.r)
    return assert.equal(Array.from(bsvSignature.s.toBuffer()), signature.s)
  })

  return it('negative', () => { 
    const signature = { r: [0x80].concat(new Array(31).fill(0)), s: new Array(32).fill(255) }
    const der = encodeDER(signature)
    assert.equal(der[0], 0x30)
    assert.equal(der[1], 70)
    assert.equal(der[2], 0x02)
    assert.equal(der[3], 33)
    assert.equal(der[4], 0x00)
    assert.equal(Array.from(der.slice(5, 5 + 32)), signature.r)
    assert.equal(der[37], 0x02)
    assert.equal(der[38], 33)
    assert.equal(der[39], 0x00)
    return assert.equal(Array.from(der.slice(40, 40 + 32)), signature.s)
  })
})

  // it 'matches bsv lib', =>
  //   for (let i = 0; i < 100; i++)
  //     r .= generateRandomData(32)
  //     while (r[0] === 0) { r = r.slice(1) }

  //     s .= generateRandomData(32)
  //     while (s[0] === 0) { s = s.slice(1) }

  //     const signature = { r, s }
  //     const der = encodeDER(signature)

  //     const rbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.r))
  //     const sbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.s))
  //     const bsvSignature = new bsv.crypto.Signature(rbn, sbn)
  //     const bsvder = bsvSignature.toDER()

  //     assert.equal Array.from(der), Array.from(bsvder)
  //     assert.equal Array.from(decodeDER(der).r), Array.from(r)
  //     assert.equal Array.from(decodeDER(der).s), Array.from(s)
import {Script} from "./Script.civet"

describe('Encode ASM', function() { 
  it('long script', () => { 
    const hex = '20aaf460daab8997860a390bb3eb641734462c2fd9f86320a6390895a3a94a71c701c35279630142517a75547901687f7501447f77007901207f7504000000007e517951797e56797eaa577901247f75547f77876975756754795579827758947f75557982770128947f77527987696861547921cdb285cc49e5ff3eed6536e7b426e8a528b05bf9276bd05431a671743e651ceb002102dca1e194dd541a47f4c85fea6a4d45bb50f16ed2fddc391bf80b525454f8b40920f941a26b1c1802eaa09109701e4e632e1ef730b0b68c9517e7c19be2ba4c7d37202f282d163597a82d72c263b004695297aecb4d758dccd1dbf61e82a3360bde2c202cde0b36a3821ef6dbd1cc8d754dcbae97526904b063c2722da89735162d282f56795679aa616100790079517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e81517a756157795679567956795679537956795479577995939521414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff0061517951795179517997527a75517a5179009f635179517993527a75517a685179517a75517a7561527a75517a517951795296a0630079527994527a75517a68537982775279827754527993517993013051797e527e53797e57797e527e52797e5579517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7e56797e0079517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a75517a75517a75517a75517a75517a75517a75517a75617777777777'
    const script = Script.fromString(hex)
    const asm = encodeASM(script.code)
    const expected = 'aaf460daab8997860a390bb3eb641734462c2fd9f86320a6390895a3a94a71c7 c3 OP_2 OP_PICK OP_IF 42 OP_1 OP_ROLL OP_DROP OP_4 OP_PICK 68 OP_SPLIT OP_DROP 44 OP_SPLIT OP_NIP 0 OP_PICK 20 OP_SPLIT OP_DROP 00000000 OP_CAT OP_1 OP_PICK OP_1 OP_PICK OP_CAT OP_6 OP_PICK OP_CAT OP_HASH256 OP_7 OP_PICK 24 OP_SPLIT OP_DROP OP_4 OP_SPLIT OP_NIP OP_EQUAL OP_VERIFY OP_DROP OP_DROP OP_ELSE OP_4 OP_PICK OP_5 OP_PICK OP_SIZE OP_NIP OP_8 OP_SUB OP_SPLIT OP_DROP OP_5 OP_PICK OP_SIZE OP_NIP 28 OP_SUB OP_SPLIT OP_NIP OP_2 OP_PICK OP_EQUAL OP_VERIFY OP_ENDIF OP_NOP OP_4 OP_PICK cdb285cc49e5ff3eed6536e7b426e8a528b05bf9276bd05431a671743e651ceb00 02dca1e194dd541a47f4c85fea6a4d45bb50f16ed2fddc391bf80b525454f8b409 f941a26b1c1802eaa09109701e4e632e1ef730b0b68c9517e7c19be2ba4c7d37 2f282d163597a82d72c263b004695297aecb4d758dccd1dbf61e82a3360bde2c 2cde0b36a3821ef6dbd1cc8d754dcbae97526904b063c2722da89735162d282f OP_6 OP_PICK OP_6 OP_PICK OP_HASH256 OP_NOP OP_NOP 0 OP_PICK 0 OP_PICK OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT 00 OP_CAT OP_BIN2NUM OP_1 OP_ROLL OP_DROP OP_NOP OP_7 OP_PICK OP_6 OP_PICK OP_6 OP_PICK OP_6 OP_PICK OP_6 OP_PICK OP_3 OP_PICK OP_6 OP_PICK OP_4 OP_PICK OP_7 OP_PICK OP_MUL OP_ADD OP_MUL 414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff00 OP_NOP OP_1 OP_PICK OP_1 OP_PICK OP_1 OP_PICK OP_1 OP_PICK OP_MOD OP_2 OP_ROLL OP_DROP OP_1 OP_ROLL OP_1 OP_PICK 0 OP_LESSTHAN OP_IF OP_1 OP_PICK OP_1 OP_PICK OP_ADD OP_2 OP_ROLL OP_DROP OP_1 OP_ROLL OP_ENDIF OP_1 OP_PICK OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_NOP OP_2 OP_ROLL OP_DROP OP_1 OP_ROLL OP_1 OP_PICK OP_1 OP_PICK OP_2 OP_DIV OP_GREATERTHAN OP_IF 0 OP_PICK OP_2 OP_PICK OP_SUB OP_2 OP_ROLL OP_DROP OP_1 OP_ROLL OP_ENDIF OP_3 OP_PICK OP_SIZE OP_NIP OP_2 OP_PICK OP_SIZE OP_NIP OP_4 OP_2 OP_PICK OP_ADD OP_1 OP_PICK OP_ADD 30 OP_1 OP_PICK OP_CAT OP_2 OP_CAT OP_3 OP_PICK OP_CAT OP_7 OP_PICK OP_CAT OP_2 OP_CAT OP_2 OP_PICK OP_CAT OP_5 OP_PICK OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_1 OP_SPLIT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_SWAP OP_CAT OP_CAT OP_6 OP_PICK OP_CAT 0 OP_PICK OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_NOP 0 OP_PICK OP_7 OP_PICK OP_CHECKSIG OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_1 OP_ROLL OP_DROP OP_NOP OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP'
    return assert.equal(asm, expected)
  })

  it('encodes 0 an -1 properly', () => { 
    const asm = '0 00 OP_10 0a -1'
    const hex = '0001005a010a4f'
    const script = Script.fromString(hex)
    const actual = encodeASM(script.code)
    return assert.equal(actual, asm)
  })

  return it('bad opcode', () => { 
    return assert.equal(encodeASM([255]), '<unknown opcode 255>')
  })
})
  




describe('Encode Address', () => {
  return it('valid', () => {
    const pubkeyhash = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    const bsvMainnetAddress = bsv.Address.fromPublicKeyHash(bsv.deps.Buffer.from(pubkeyhash), 'mainnet')
    const bsvTestnetAddress = bsv.Address.fromPublicKeyHash(bsv.deps.Buffer.from(pubkeyhash), 'testnet');return bsvTestnetAddress
  })
})
    // assert.equal encodeAddress(pubkeyhash, false), bsvMainnetAddress.toString()
    // assert.equal encodeAddress(pubkeyhash, true), bsvTestnetAddress.toString()