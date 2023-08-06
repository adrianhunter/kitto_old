
import { BufferWriter } from "./BufferWriter.civet";
import { writeU32LE, writeU64LE, writeVarint } from "./Write.civet";
import { decodeHex } from "./Decode.civet";
import { asyncify } from "./asyncify.civet"
import type { Tx } from "./Tx.civet"
export const SIGHASH_ALL = 0x01
export const SIGHASH_NONE = 0x02
export const SIGHASH_SINGLE = 0x03
export const SIGHASH_ANYONECANPAY = 0x80
export const SIGHASH_FORKID = 0x4

export const sha256Async = async (data: Iterable<number>) => { 
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(data)))
}
    

export const ripemd160 = (data: string | any[] | ArrayLike<number>) => {
 
  return []
};

// import * as xxx from "https://deno.land/std/_wasm_crypto/crypto.ts"

// import { crypto } from "https://deno.land/std@0.173.0/crypto/mod.ts";



// import { crypto } from "crypto";

// export ripemd160Async := ripemd160 |> asyncify
export const ripemd160Async = async (data: Buf) => {
  return crypto.subtle.digest("RIPEMD-160", new Uint8Array(data))
}


export const sha1 = (data: Iterable<number>) => {
  return new Uint8Array(
    //   await crypto.subtle.digest("SHA-1", new Uint8Array(data)),
  );
};
export var sha1Async = async (data: Iterable<number>) => { 
  return new Uint8Array(await crypto.subtle.digest("SHA-1", new Uint8Array(data)))
}




export const sha256 = (data: Buf) => {
    return new Uint8Array([])
}


export const sha256d = (data: Buf): Uint8Array => {
  return sha256(data)
}


export const sha256ripemd160 = (data: Buf) => {
  return ripemd160(sha256(data))
}

export const sighashAsync = async (
  tx: Tx,
  vin: number,
  parentScript:  Buf,
  parentSatoshis: number,
  sighashFlags: number,
) => { 
  return await sha256Async(await (preimageAsync(tx, vin, parentScript, parentSatoshis, sighashFlags)))
}




export const sighash = (
  tx: Tx,
  vin: number,
  parentScript:  Buf,
  parentSatoshis: number,
  sighashFlags: number,
) => { 
  return sha256d((preimage(tx, vin, parentScript, parentSatoshis, sighashFlags)))
}



export const preimageAsync = async (
  tx: Tx,
  vin: number,
  parentScript: Buf,
  parentSatoshis: number,
  sighashFlags: number
) => {
  return preimage(tx, vin, parentScript, parentSatoshis, sighashFlags)
}


export const preimage = (
  tx:  Tx,
  vin: number,
  parentScript: Buf,
  parentSatoshis: number,
  sighashFlags: number
) => { 
  const {outputs} = tx
  const input = tx.inputs[vin]
  const SIGHASH_NONE = 0x02
  const SIGHASH_SINGLE = 0x03
  const SIGHASH_ANYONECANPAY = 0x80

  const getPrevoutsHash = () => {
    if (tx._hashPrevouts) return tx._hashPrevouts;
    const writer = new BufferWriter
    tx.inputs.forEach((input: { txid: string; vout: number }) => { 
      writer.write(decodeHex(input.txid).reverse())
      return writeU32LE(writer, input.vout)
    })    
    tx._hashPrevouts = sha256d(writer.toBuffer())
    return tx._hashPrevouts
  }

  const getSequenceHash = () => { 
    if (tx._hashSequence) return tx._hashSequence;
    const writer = new BufferWriter
    tx.inputs.forEach((input: { sequence: number }) => { 
      return writeU32LE(
        writer,
        typeof input.sequence === "undefined" ? 0xFFFFFFFF : input.sequence,
      )
    })
    tx._hashSequence = sha256d(writer.toBuffer())
    return tx._hashSequence
  }
  

  const getAllOutputsHash = () => {
    if (tx._hashOutputsAll) return tx._hashOutputsAll;
    const writer = new BufferWriter
    outputs.forEach((output) => { 
        writeU64LE(writer, output.satoshis)
        writeVarint(writer, output.script.length)
        return writer.write(output.script)
    })       
    tx._hashOutputsAll = sha256d(writer.toBuffer())
    return tx._hashOutputsAll
  }

  const getOutputHash = (n: number) => {
    const output = outputs[n]
    const writer = new BufferWriter
    writeU64LE(writer, output.satoshis)
    writeVarint(writer, output.script.length)
    writer.write(output.script)
    return sha256d(writer.toBuffer())
  }

  let hashPrevouts = new Uint8Array(32)
  let hashSequence = new Uint8Array(32)
  let hashOutputs = new Uint8Array(32)

  if (!(sighashFlags & SIGHASH_ANYONECANPAY)) {
    hashPrevouts = getPrevoutsHash();
  }

  if (
    !(sighashFlags & SIGHASH_ANYONECANPAY) &&
    (sighashFlags & 0x1F) !== SIGHASH_SINGLE &&
    (sighashFlags & 0x1F) !== SIGHASH_NONE
  ) {
    hashSequence = getSequenceHash();
  }

  if (
    (sighashFlags & 0x1F) !== SIGHASH_SINGLE &&
    (sighashFlags & 0x1F) !== SIGHASH_NONE
  ) {
    hashOutputs = getAllOutputsHash()
  } else if ((sighashFlags & 0x1F) === SIGHASH_SINGLE && vin < outputs.length) {
    hashOutputs = getOutputHash(vin)
  }

  const getPreimage = (
    hashPrevouts: Uint8Array | Uint8Array,
    hashSequence: Uint8Array | Uint8Array,
    hashOutputs: Uint8Array | Uint8Array,
  ) => {
    const writer = new BufferWriter
    writeU32LE(writer, typeof tx.version === "undefined" ? 1 : tx.version)
    writer.write(hashPrevouts)
    writer.write(hashSequence)
    writer.write(decodeHex(input.txid).reverse())
    writeU32LE(writer, input.vout)
    writeVarint(writer, parentScript.length)
    writer.write(parentScript)
    writeU64LE(writer, parentSatoshis)
    writeU32LE(
      writer,
      typeof input.sequence === "undefined" ? 0xFFFFFFFF : input.sequence
    )
    writer.write(hashOutputs)
    writeU32LE(writer, tx.locktime || 0)
    writeU32LE(writer, sighashFlags >>> 0)
    return writer.toBuffer()
  }
  

  return getPreimage(hashPrevouts, hashSequence, hashOutputs)
}


//@ts-ignore
// import * as bsv from "bsv"


describe('Hash sh256Async', () => { 
  return it('empty', async () => { 
    const data: any = []
    const expected = Array.from(bsv.crypto.Hash.sha256(bsv.deps.Buffer.from(data)))
    const actual = Array.from(await sha256Async(data))
    return assert.equal(actual, expected)
  })
})

describe('Hash ripemd160Async', function() {
  return it('empty', async () => {
    const data: any = [1];return data
  })
})

    // console.log await ripemd160Async(data) |> Array.from
    // expected := Array.from(bsv.crypto.Hash.ripemd160(bsv.deps.Buffer.from(data)))
    // actual := Array.from(await ripemd160Async(data))
    // assert.equal actual, expected


describe('Hash sha-1 Async', function() {
  return it('empty', async  () => {
    const data: Buf = []
    const expected = Array.from(bsv.crypto.Hash.sha1(bsv.deps.Buffer.from(data)))
    const actual = Array.from(await sha1Async(data))
    return assert.equal(actual, expected)
  })
})



// const { SIGHASH_ALL, SIGHASH_FORKID } = nimble.constants.sighashFlags
// const bsv = require('bsv')

import {decodeTx} from "./Decode.civet"

describe('Hash sighash', () => { 
  return it('async', async () => {
    const utxo1 = {
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      vout: 0,
      script: '00',
      satoshis: 1000
    }
    const utxo2 = {
      txid: '1111111111111111111111111111111111111111111111111111111111111111',
      vout: 1,
      script: '01',
      satoshis: 2000
    }
    const addr = new bsv.PrivateKey().toAddress()
    const bsvtx = new bsv.Transaction().from(utxo1).from(utxo2).to(addr, 4000)
    const bsvSighash = bsv.Transaction.Sighash.sighash(bsvtx,
      bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID,
      1, new bsv.Script('01'), new bsv.deps.bnjs.BN(2000)).reverse()
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    const runSighash = await sighashAsync(tx, 1, [0x01], 2000, SIGHASH_ALL | SIGHASH_FORKID);return runSighash
  })
})
    // console.log (new Uint8Array bsvSighash.buffer), runSighash

    