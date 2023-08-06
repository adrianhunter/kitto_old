import { Input } from "./Input.civet";
import { Output } from "./Output.civet";
import { Tx } from "./Tx.civet";
import { encodeHex } from "./Encode.civet";
import { BufferReader } from "./BufferReader.civet"

export function readVarint (
  reader: BufferReader,
) {
  const { buffer, pos: i } = reader

  reader.checkRemaining(1)
  const prefix = buffer[i]

  if (prefix <= 0xfc) {
    reader.pos += 1
    return prefix
  }

  if (prefix === 0xfd) {
    reader.checkRemaining(3)
    reader.pos += 3
    return buffer[i + 2] * 0x0100 + buffer[i + 1]
  }

  if (prefix === 0xfe) {
    reader.checkRemaining(5)
    reader.pos += 5
    return buffer[i + 4] * 0x01000000 + buffer[i + 3] * 0x010000 +
      buffer[i + 2] * 0x0100 + buffer[i + 1]
  }

  // prefix === 0xff

  reader.checkRemaining(9)
  reader.pos += 9

  const n = buffer[i + 8] * 0x0100000000000000 +
    buffer[i + 7] * 0x01000000000000 +
    buffer[i + 6] * 0x010000000000 +
    buffer[i + 5] * 0x0100000000 +
    buffer[i + 4] * 0x01000000 +
    buffer[i + 3] * 0x010000 +
    buffer[i + 2] * 0x0100 +
    buffer[i + 1];

  if (n > Number.MAX_SAFE_INTEGER) {
    throw new Error("varint too large")
  }

  return n
}

export function readU64LE (reader: BufferReader) {
  reader.checkRemaining(8);
  const { buffer, pos: i } = reader
  reader.pos += 8
  // We can't use a bit shift for the high-order byte because in JS this math is 32-bit signed.
  let n = buffer[i + 7]
  n = n << 8 | buffer[i + 6]
  n = n << 8 | buffer[i + 5]
  n = n * 256 + buffer[i + 4]
  n = n * 256 + buffer[i + 3]
  n = n * 256 + buffer[i + 2]
  n = n * 256 + buffer[i + 1]
  n = n * 256 + buffer[i + 0]

  return n
}



export function readU32LE (reader: BufferReader) {
  reader.checkRemaining(4);
  const { buffer, pos: i } = reader
  reader.pos += 4;
  // We can't use a bit shift for the high-order byte because in JS this math is 32-bit signed.
  return (buffer[i + 3] << 23) * 2 +
    ((buffer[i + 2] << 16) | (buffer[i + 1] << 8) | (buffer[i + 0] << 0))
}

export function readTx (reader: BufferReader): Tx {
  const version = readU32LE(reader)
  const nin = readVarint(reader);
  const inputs: Input[] = []
  for (let vin = 0; vin < nin; vin++) { 
    const txid = encodeHex(new Uint8Array(reader.read(32)).reverse())
    const vout = readU32LE(reader)
    const scriptLength = readVarint(reader)
    const script = reader.read(scriptLength)
    const sequence = readU32LE(reader)
    inputs.push({ txid, vout, script, sequence })
  }

  const nout = readVarint(reader);
  const outputs: Output[] = []
  for (let vout = 0; vout < nout; vout++) { 
    const satoshis = readU64LE(reader)
    const scriptLength = readVarint(reader)
    const script = reader.read(scriptLength)
    outputs.push({ satoshis, script })
  }

  const locktime = readU32LE(reader);
  return {
    version,
    inputs,
    outputs,
    locktime
  } as Tx
}
export function readDER (reader: BufferReader) {
  const [prefix, length, rprefix, rlength] = reader.read(4)
  const r = reader.read(rlength);
  const [sprefix, slength] = reader.read(2)
  const s = reader.read(slength);

  // if  prefix is not 0x30 
  //     or rprefix is not 0x02 
  //     or sprefix is not 0x02 
  //     or length is not rlength + slength + 4 
  //     or r[0] & 0x80 
  //     or s[0] & 0x80
    // throw new Error("bad der")

  //@ts-ignore
  return ({r: r[0] === 0 ? r.slice(1) : r,
  //@ts-ignore
  s: s[0] === 0 ? s.slice(1) : s})
} 
export function readBlockHeader (reader: BufferReader) {
  const version = readU32LE(reader)
  const prevBlock = reader.read(32)
  const merkleRoot = reader.read(32)
  const timestamp = readU32LE(reader)
  const bits = readU32LE(reader)
  const nonce = readU32LE(reader);
  return ({ 
    version,
    prevBlock,
    merkleRoot,
    timestamp,
    bits,
    nonce 
  })
}



describe('Read readVarint', function() {
  it('valid', () => {
    assert.equal(readVarint(new BufferReader([0])), 0)
    assert.equal(readVarint(new BufferReader([252])), 252)
    assert.equal(readVarint(new BufferReader([0xfd, 0x00, 0x00])), 0)
    assert.equal(readVarint(new BufferReader([0xfd, 0xfd, 0x00])), 253)
    assert.equal(readVarint(new BufferReader([0xfd, 0xff, 0x00])), 255)
    assert.equal(readVarint(new BufferReader([0xfd, 0x00, 0x01])), 256)
    assert.equal(readVarint(new BufferReader([0xfd, 0xfe, 0xff])), 0xfffe)
    assert.equal(readVarint(new BufferReader([0xfe, 0x00, 0x00, 0x00, 0x00])), 0)
    assert.equal(readVarint(new BufferReader([0xfe, 0xfc, 0xfd, 0xfe, 0xff])), 0xfffefdfc)
    assert.equal(readVarint(new BufferReader([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])), 0)
    return assert.equal(readVarint(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00])), Number.MAX_SAFE_INTEGER)
  })
  it('multiple times', () => { 
    const reader = new BufferReader([0x00, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00])
    assert.equal(readVarint(reader), 0)
    assert.equal(readVarint(reader), 1)
    assert.equal(readVarint(reader), Number.MAX_SAFE_INTEGER)
    return assert.throws(() => readVarint(reader), Error, 'not enough data')
  })
  it('throws if too big', () => { 
    assert.throws(() => readVarint(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x20, 0x00])), Error, 'varint too large')
    return assert.throws(() => readVarint(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])), Error, 'varint too large')
  })
  return it('throws if not enough data', () => { 
    const err = 'not enough data'
    assert.throws(() => readVarint(new BufferReader([])), Error, err)
    assert.throws(() => readVarint(new BufferReader([0xfd])), Error, err)
    assert.throws(() => readVarint(new BufferReader([0xfd, 0x00])), Error, err)
    assert.throws(() => readVarint(new BufferReader([0xfe, 0x00])), Error, err)
    assert.throws(() => readVarint(new BufferReader([0xfe, 0x00, 0x00, 0x00])), Error, err)
    assert.throws(() => readVarint(new BufferReader([0xff, 0x00])), Error, err)
    assert.throws(() => readVarint(new BufferReader([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])), Error, err)
    return assert.throws(() => readVarint(new BufferReader([0xff, 0x00])), Error, err)
  })
})

describe('Read readU64LE', () => { 
  it('valid', () => {
    assert.equal(readU64LE(new BufferReader([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])), 0)
    return assert.equal(readU64LE(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00])), Number.MAX_SAFE_INTEGER)
  })
  it('multiple times', () => { 
    const reader = new BufferReader([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00
    ])
    assert.equal(readU64LE(reader), 0x0000000000000000)
    assert.equal(readU64LE(reader), Number.MAX_SAFE_INTEGER)
    return assert.throws(() => readU64LE(reader), Error, 'not enough data')
  })
  return it('throws if not enough data', () => { 
    assert.throws(() => readU64LE(new BufferReader([])), Error, 'not enough data')
    assert.throws(() => readU64LE(new BufferReader([0x00])), Error, 'not enough data')
    return assert.throws(() => readU64LE(new BufferReader([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])), Error, 'not enough data')
  })
})

describe('Read readU32LE', function() {
  it('valid', () => { 
    assert.equal(readU32LE(new BufferReader([0x00, 0x00, 0x00, 0x00])), 0x00000000)
    assert.equal(readU32LE(new BufferReader([0x01, 0x23, 0x45, 0x67])), 0x67452301)
    return assert.equal(readU32LE(new BufferReader([0xff, 0xff, 0xff, 0xff])), 0xffffffff)
  })
  it('multiple times', () => { 
    const reader = new BufferReader([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff])
    assert.equal(readU32LE(reader), 0x00000000)
    assert.equal(readU32LE(reader), 0xffffffff)
    return assert.throws(() => readU32LE(reader), Error, 'not enough data')
  })
  return it('throws if not enough data', () => { 
    assert.throws(() => readU32LE(new BufferReader([])), Error, 'not enough data')
    assert.throws(() => readU32LE(new BufferReader([0x00])), Error, 'not enough data')
    return assert.throws(() => readU32LE(new BufferReader([0x00, 0x00, 0x00])), Error, 'not enough data')
  })
})

import {decodeHex} from "./Decode.civet"

describe('Read readBlockHeader', () => {
  const decoder = new TextDecoder
  it('genesis header', () => { 
    const genesisBlockHeader = '0100000000000000000000000000000000000000000000000000000000000000000000003BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A29AB5F49FFFF001D1DAC2B7C'
    assert.equal(decodeHex(genesisBlockHeader).length, 80)
    const reader = new BufferReader(decodeHex(genesisBlockHeader))
    const header = readBlockHeader(reader)
    reader.close()
    assert.equal(header.version, 1)
    assert.equal(encodeHex(header.prevBlock), '0000000000000000000000000000000000000000000000000000000000000000')
    assert.equal(encodeHex(header.merkleRoot), '3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a')
    assert.equal(header.timestamp, 1231006505)
    assert.equal(header.bits, 0x1d00ffff)
    return assert.equal(header.nonce, 2083236893)
  })
  it('genesis block', () => { 
    const genesisBlock = '0100000000000000000000000000000000000000000000000000000000000000000000003BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A29AB5F49FFFF001D1DAC2B7C0101000000010000000000000000000000000000000000000000000000000000000000000000FFFFFFFF4D04FFFF001D0104455468652054696D65732030332F4A616E2F32303039204368616E63656C6C6F72206F6E206272696E6B206F66207365636F6E64206261696C6F757420666F722062616E6B73FFFFFFFF0100F2052A01000000434104678AFDB0FE5548271967F1A67130B7105CD6A828E03909A67962E0EA1F61DEB649F6BC3F4CEF38C4F35504E51EC112DE5C384DF7BA0B8D578A4C702B6BF11D5FAC00000000'
    const reader = new BufferReader(decodeHex(genesisBlock))
    readBlockHeader(reader)
    const txCount = readVarint(reader)
    assert.equal(txCount, 1)
    const tx = readTx(reader)
    assert.equal(tx.version, 1)
    const inputScriptAscii = decoder.decode(new Uint8Array(tx.inputs[0].script))
    assert.equal(inputScriptAscii.includes('The Times 03/Jan/2009 Chancellor on brink of second bailout for banks'), true)
    return reader.close()
  })
  it('multiple times', () => { 
    const genesisBlockHeader = '0100000000000000000000000000000000000000000000000000000000000000000000003BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A29AB5F49FFFF001D1DAC2B7C'
    const genesisBlockHeader3x = genesisBlockHeader + genesisBlockHeader + genesisBlockHeader
    const reader = new BufferReader(decodeHex(genesisBlockHeader3x))
    const header1 = readBlockHeader(reader)
    const header2 = readBlockHeader(reader)
    const header3 = readBlockHeader(reader)
    reader.close()
    assert.equal(header1, header2)
    return assert.equal(header2, header3)
  })
  return it('throws if not enough data', () => { 
    const genesisBlockHeader = '0100000000000000000000000000000000000000000000000000000000000000000000003BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A29AB5F49FFFF001D1DAC2B'
    const reader = new BufferReader(decodeHex(genesisBlockHeader))
    return assert.throws(() => readBlockHeader(reader), Error, 'not enough data')
  })
})