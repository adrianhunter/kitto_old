const K = [
  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2,
]

/**
 *
 * @param message origin message to sha256
 * @param index The partial hash returned is the hash of 0~index chunks, 512 bits per chunk.
 * @returns [partialHash, partialPreimage, padding]
 */
export function partialSha256(message: Buffer, index: number) {
  const bytesHashed = message.length
  const padLength = (bytesHashed % 64 < 56) ? 64 - (bytesHashed % 64) : 128 - (bytesHashed % 64)

  const suffix = Buffer.alloc(padLength)
  const padded = Buffer.concat([message, suffix])

  const bitLenHi = (bytesHashed / 0x20000000) | 0
  const bitLenLo = bytesHashed << 3

  padded[bytesHashed] = 0x80
  for (let i = bytesHashed + 1; i < padded.length - 8; i++)
    padded[i] = 0

  padded[padded.length - 8] = (bitLenHi >>> 24) & 0xFF
  padded[padded.length - 7] = (bitLenHi >>> 16) & 0xFF
  padded[padded.length - 6] = (bitLenHi >>> 8) & 0xFF
  padded[padded.length - 5] = (bitLenHi >>> 0) & 0xFF
  padded[padded.length - 4] = (bitLenLo >>> 24) & 0xFF
  padded[padded.length - 3] = (bitLenLo >>> 16) & 0xFF
  padded[padded.length - 2] = (bitLenLo >>> 8) & 0xFF
  padded[padded.length - 1] = (bitLenLo >>> 0) & 0xFF

  const broken: Buffer[] = []

  for (let i = 0; i < padded.length / 64; i++)
    broken.push(padded.slice(i * 64, i * 64 + 64))

  const h0 = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19]

  let hi = h0

  for (let i = 0; i < broken.length; i++) {
    const chunk = broken[i]
    hi = g(hi, chunk)
    if (bytesHashed > 64 && i == index)
      break
  }

  const partialHash = toHash(hi)

  if (index > -1 && bytesHashed > 64) {
    const partialPreimage = message.slice((index + 1) * 64)
    const padding = padded.slice(message.length)
    return [partialHash, partialPreimage.toString('hex'), padding.toString('hex')]
  }
  return [partialHash, '', '']
}

/**
 *
 * @param partialHash
 * @param partialPreimage
 * @param padding
 * @returns sha256 of the origin message
 */
export function sha256ByPartialHash(partialHash: string, partialPreimage: string, padding: string): string {
  const partialHashBuffer = Buffer.from(partialHash, 'hex')
  const padded = Buffer.from(partialPreimage + padding, 'hex')

  const broken: Buffer[] = []

  for (let i = 0; i < padded.length / 64; i++)
    broken.push(padded.slice(i * 64, i * 64 + 64))

  const h0 = [byteToUint32(partialHashBuffer.slice(0, 4)),
    byteToUint32(partialHashBuffer.slice(4, 8)),
    byteToUint32(partialHashBuffer.slice(8, 12)),
    byteToUint32(partialHashBuffer.slice(12, 16)),
    byteToUint32(partialHashBuffer.slice(16, 20)),
    byteToUint32(partialHashBuffer.slice(20, 24)),
    byteToUint32(partialHashBuffer.slice(24, 28)),
    byteToUint32(partialHashBuffer.slice(28, 32)),
  ]

  let hi = h0
  for (let i = 0; i < broken.length; i++) {
    const chunk = broken[i]
    hi = g(hi, chunk)
  }
  return toHash(hi)
}

function byteToUint32(b: Buffer): number {
  return b.readUInt32BE()
}

function ToInteger(x: number) {
  x = Number(x)
  return x < 0 ? Math.ceil(x) : Math.floor(x)
}

function modulo(a: number, b: number) {
  return a - Math.floor(a / b) * b
}
function ToUint32(x: number) {
  return modulo(ToInteger(x), 2 ** 32)
}

// sha256 compression function
function g(hprev: number[], chunk: Buffer): number[] {
  let a = hprev[0]
  let b = hprev[1]
  let c = hprev[2]
  let d = hprev[3]
  let e = hprev[4]
  let f = hprev[5]
  let g = hprev[6]
  let h = hprev[7]
  const W = []
  // Computation
  for (let i = 0; i < 64; i++) {
    if (i < 16) {
      W[i] = (chunk.slice(i * 4, i * 4 + 4).readUInt32BE())
    }
    else {
      const gamma0x = W[i - 15]
      const gamma0 = (((gamma0x << 25) | (gamma0x >>> 7))
        ^ ((gamma0x << 14) | (gamma0x >>> 18))
        ^ (gamma0x >>> 3))

      const gamma1x = W[i - 2]
      const gamma1 = (((gamma1x << 15) | (gamma1x >>> 17))
        ^ ((gamma1x << 13) | (gamma1x >>> 19))
        ^ (gamma1x >>> 10))

      W[i] = (gamma0 + W[i - 7] + gamma1 + W[i - 16])
    }

    const ch = ((e & f) ^ (~e & g))
    const maj = ((a & b) ^ (a & c) ^ (b & c))

    const sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22))
    const sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25))

    const t1 = (h + sigma1 + ch + K[i] + W[i])
    const t2 = (sigma0 + maj)

    h = g
    g = f
    f = e
    e = (d + t1)
    d = c
    c = b
    b = a
    a = (t1 + t2)
  }

  return [ToUint32(hprev[0] + a),
    ToUint32(hprev[1] + b),
    ToUint32(hprev[2] + c),
    ToUint32(hprev[3] + d),
    ToUint32(hprev[4] + e),
    ToUint32(hprev[5] + f),
    ToUint32(hprev[6] + g),
    ToUint32(hprev[7] + h)]
}

function iToB(i: number): Buffer {
  const bs = Buffer.from([0, 0, 0, 0])
  bs.writeUInt32BE(i)
  return bs
}

function toHash(hi: number[]): string {
  const hashBytes = [iToB(hi[0]), iToB(hi[1]), iToB(hi[2]), iToB(hi[3]), iToB(hi[4]), iToB(hi[5]), iToB(hi[6]), iToB(hi[7])]
  return hashBytes.reduce((acc, cur) => {
    return Buffer.concat([acc, cur])
  }, Buffer.from([])).toString('hex')
}
