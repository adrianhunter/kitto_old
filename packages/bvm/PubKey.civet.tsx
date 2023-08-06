import { encodeHex, encodePubKey } from "./Encode.civet";
import { decodeHex,decodePublicKey } from "./Decode.civet";
import { calculatePublicKey } from "./Gen.civet";
import { Address } from "./Address.civet";
import { PrivKey } from "./PrivKey.civet"

export class PubKey {
  constructor(public point: Point){}
  static fromString(pubkey: string) { return new PubKey(decodePublicKey(decodeHex(pubkey))) }
  static fromPrivKey(privateKey: PrivKey) { return new PubKey(calculatePublicKey(privateKey.number)) } 
  toString() { return encodeHex(this.toBuffer()) }
  toBuffer() { return encodePubKey(this.point) }
  toAddress() { return Address.fromPubKey(this) }
}


  // static from (x) {
  //   if (x instanceof PubKey) return x
  //   const PrivateKey = require('./private-key')
  //   if (x instanceof PrivateKey) return PubKey.fromPrivateKey(x)
  //   if (typeof x === 'object' && x) x = x.toString()
  //   if (typeof x === 'string') return PubKey.fromString(x)
  //   throw new Error('unsupported type')
  // }

//@ts-ignore
// Deno.test "PubKey", async ({ step }) => 
//   { calculatePublicKey } := await "../fn/calculate-public-key.civet");
//   { generatePrivateKey } := await "../fn/generate-private-key.civet");
//   { assert.equal } := await 
//     "https://deno.land/std@0.168.0/testing/asserts.ts"
//   );
//   // await describe("constructor", async ({ step: it }) => {
//   await step "valid", () => 
//     const privateKey = generatePrivateKey();
//     const publicKeyPoint = calculatePublicKey(privateKey);
//     const publicKey = new PubKey(publicKeyPoint);
//     assert.equal(publicKey.point, publicKeyPoint);
    // expect(publicKey.testnet).to.equal(true)
    // expect(publicKey.compressed).to.equal(false)

  // await it("throws if bad", () => {
  //   const privateKey = generatePrivateKey();
  //   const publicKeyPoint = calculatePubKey(privateKey);
  //   // expect(() => new PubKey(0, true, true)).to.throw('bad point')
  //   // expect(() => new PubKey('', true, true)).to.throw('bad point')
  //   // expect(() => new PubKey({}, true, true)).to.throw('bad point')
  //   // expect(() => new PubKey({ x: [], y: publicKeyPoint.y }, true, true)).to.throw('not on curve')
  //   // expect(() => new PubKey({ x: publicKeyPoint.x, y: 1 }, true, true)).to.throw('bad point')
  //   // expect(() => new PubKey(publicKeyPoint, 0, true)).to.throw('bad testnet flag')
  //   // expect(() => new PubKey(publicKeyPoint, 'testnet', true)).to.throw('bad testnet flag')
  //   // expect(() => new PubKey(publicKeyPoint, true, 'compressed')).to.throw('bad compressed flag')
  // });
  // });

  // await describe("fromString", async ({ step: it }) => {
  //   await it("parses string", () => {
  //     // const bsvPrivateKey = new bsv.PrivateKey()
  //     // const bsvPubKey = bsvPrivateKey.toPubKey()
  //     // const publicKey = PubKey.fromString(bsvPubKey.toString())
  //     // expect(publicKey.compressed).to.equal(bsvPubKey.compressed)
  //     // expect(publicKey.testnet).to.equal(false)
  //     // expect([...publicKey.point.x]).to.deep.equal([...bsvPubKey.point.x.toArray()])
  //     // expect([...publicKey.point.y]).to.deep.equal([...bsvPubKey.point.y.toArray()])
  //   });

  //   // it('throws if not a string', () => {
  //   //   expect(() => PubKey.fromString()).to.throw('not a string')
  //   //   expect(() => PubKey.fromString(null)).to.throw('not a string')
  //   //   expect(() => PubKey.fromString({})).to.throw('not a string')
  //   // })

  //   // it('throws if too short', () => {
  //   //   expect(() => PubKey.fromString('02')).to.throw('bad length')
  //   // })

  //   // it('throws if not on curve', () => {
  //   //   const privateKey = nimble.functions.generatePrivateKey()
  //   //   const publicKey = nimble.functions.calculatePubKey(privateKey)
  //   //   publicKey.y = publicKey.x
  //   //   const compressed = nimble.functions.encodeHex(nimble.functions.encodePubKey(publicKey, false))
  //   //   expect(() => PubKey.fromString(compressed)).to.throw('not on curve')
  //   // })

  //   // it('is immutable', () => {
  //   //   const privateKey = PrivateKey.fromRandom()
  //   //   const publicKey = PubKey.fromString(privateKey.toPubKey().toString())
  //   //   expect(Object.isFrozen(publicKey)).to.equal(true)
  //   // })
  // });

  // describe('fromPrivateKey', () => {
  //   it('creates from private key', () => {
  //     const bsvPrivateKey = new bsv.PrivateKey()
  //     const bsvPubKey = bsvPrivateKey.toPubKey()
  //     const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
  //     const publicKey = PubKey.fromPrivateKey(privateKey)
  //     expect(bsvPubKey.toString()).equal(publicKey.toString())
  //   })

  //   it('throws if not a private key', () => {
  //     expect(() => PubKey.fromPrivateKey()).to.throw('not a PrivateKey: ')
  //   })

  //   it('caches public key', () => {
  //     const privateKey = PrivateKey.fromRandom()
  //     const t0 = new Date()
  //     const publicKey1 = PubKey.fromPrivateKey(privateKey)
  //     const t1 = new Date()
  //     const publicKey2 = PubKey.fromPrivateKey(privateKey)
  //     const t2 = new Date()
  //     expect(t2 - t1).to.be.lessThanOrEqual(t1 - t0)
  //     expect(publicKey1).to.equal(publicKey2)
  //   })

  //   it('is immutable', () => {
  //     const privateKey = PrivateKey.fromRandom()
  //     const publicKey = PubKey.fromPrivateKey(privateKey)
  //     expect(Object.isFrozen(publicKey)).to.equal(true)
  //   })
  // })

  // describe('from', () => {
  //   it('from PubKey instance', () => {
  //     const publicKey = PrivateKey.fromRandom().toPubKey()
  //     expect(PubKey.from(publicKey)).to.equal(publicKey)
  //   })

  //   it('from bsv.PubKey', () => {
  //     const publicKey = PrivateKey.fromRandom().toPubKey()
  //     const bsvPubKey = new bsv.PubKey(publicKey.toString())
  //     expect(PubKey.from(bsvPubKey).toString()).to.equal(publicKey.toString())
  //   })

  //   it('from string', () => {
  //     const publicKey = PrivateKey.fromRandom().toPubKey()
  //     expect(PubKey.from(publicKey.toString()).toString()).to.equal(publicKey.toString())
  //   })

  //   it('from PrivateKey instance', () => {
  //     const privateKey = PrivateKey.fromRandom()
  //     expect(PubKey.from(privateKey).toString()).to.equal(privateKey.toPubKey().toString())
  //   })

  //   it('throws if unsupported', () => {
  //     expect(() => PubKey.from()).to.throw()
  //     expect(() => PubKey.from(null)).to.throw()
  //     expect(() => PubKey.from('abc')).to.throw()
  //   })
  // })

  // describe('toString', () => {
  //   it('compressed', () => {
  //     const bsvPrivateKey = new bsv.PrivateKey()
  //     const bsvPubKey = bsvPrivateKey.toPubKey()
  //     expect(bsvPubKey.compressed).to.equal(true)
  //     const publicKey = PubKey.fromString(bsvPubKey.toString())
  //     expect(publicKey.compressed).to.equal(true)
  //     expect(publicKey.toString()).to.equal(bsvPubKey.toString())
  //   })

  //   it('uncompressed', () => {
  //     const bsvPrivateKey = new bsv.PrivateKey()
  //     const bsvPubKey = new bsv.PubKey(bsvPrivateKey.toPubKey().point, { compressed: false })
  //     expect(bsvPubKey.compressed).to.equal(false)
  //     const publicKey = PubKey.fromString(bsvPubKey.toString())
  //     expect(publicKey.compressed).to.equal(false)
  //     expect(publicKey.toString()).to.equal(bsvPubKey.toString())
  //   })
  // })

  // describe('toAddress', () => {
  //   it('mainnet', () => {
  //     const bsvPrivateKey = new bsv.PrivateKey()
  //     const bsvAddress = bsvPrivateKey.toAddress()
  //     const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
  //     const address = privateKey.toAddress()
  //     expect(address.testnet).to.equal(false)
  //     expect(address.toString()).to.equal(bsvAddress.toString())
  //   })

  //   it('testnet', () => {
  //     const bsvPrivateKey = new bsv.PrivateKey('testnet')
  //     const bsvAddress = bsvPrivateKey.toAddress()
  //     const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
  //     const address = privateKey.toAddress()
  //     expect(address.testnet).to.equal(true)
  //     expect(address.toString()).to.equal(bsvAddress.toString())
  //   })
  // })

  // Deno.exit(0);
// })
