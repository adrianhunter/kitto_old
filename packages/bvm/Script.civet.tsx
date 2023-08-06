import { decodeAddress, decodeASM, decodeHex, decodeScriptChunks } from "./Decode.civet";
import { encodeASM, encodeHex } from "./Encode.civet"
export class Script {
  constructor(public code: Buf = new Uint8Array){}
  static fromString(s: string) { 
    try { 
      return Script.fromHex(s)
    }
    catch {
      return Script.fromASM(s)
    }
  }
  static fromHex(s: string) { return this.fromArray(decodeHex(s)) }
  static fromASM(asm: string) { return this.fromBuffer(decodeASM(asm)) }
  static fromBuffer(buffer: Uint8Array) { return new Script(buffer) }
  static fromArray(array: Iterable<number>) { return new Script(new Uint8Array(array)) }
  toString() { return this.toHex() }
  toHex() { return encodeHex(this.code) }
  toASM() {  return encodeASM(this.code) }
  toBuffer() { return this.code }
  get length() { return this.code.length }
  get chunks() { return decodeScriptChunks(this.code) }
  slice(start: number, end: number) { return this.code.slice(start, end) }
}

describe("Script", function() {
  it("create script with buffer property", function() {
    const buffer = new Uint8Array([1, 2, 3]);
    const {code} = new Script(buffer)
    return assert.equal(code, buffer)
  })
  it("defaults to empty buffer if not passed", function() {
    const {code} = new Script
    assert.equal(code instanceof Uint8Array,  true)
    return assert.equal(code.length, 0)
  })
  it("may be substituted for a buffer", function() {
    const script = new Script(new Uint8Array([1, 2, 3]))
    assert.equal(script.code.length, 3)
    assert.equal(script.code[0], 1)
    assert.equal(script.code[1], 2)
    assert.equal(script.code[2], 3)
    const expected = [1, 2, 3]
    for (const byte of script.code) {
      assert.equal(byte, expected.shift())
    }
    return
  })
  it("fromString -> decodes hex", function() { 
    return assert.equal(Array.from(Script.fromString("000102").code), [ 0, 1, 2 ])
  })
  it("fromHex -> decodes hex", function() {
    assert.equal(Array.from(Script.fromHex("").code), [])
    return assert.equal(Array.from(Script.fromHex("aabbcc").code), [
      0xaa,
      0xbb,
      0xcc
    ])
  })
  it("fromASM -> decodes asm", function() {
      return assert.equal(Array.from(Script.fromASM("OP_TRUE").code), [81])
  })
  it("fromBuffer -> creates with buffer", function() { 
    return assert.equal(Array.from(Script.fromBuffer(new Uint8Array()).code), [])
  })
  it("toHex -> encodes hex", function() { 
      return assert.equal(Script.fromBuffer(new Uint8Array([0xff])).toHex(), "ff")
  })
  it("toASM -> encodes asm", function() {
    return assert.equal(Script.fromBuffer(new Uint8Array([0, 81, 100])).toASM(), "0 OP_1 OP_NOTIF")
  })
  return it("toBuffer -> returns buffer", function() {
    assert.equal(Array.from(Script.fromBuffer(new Uint8Array([])).toBuffer()),[])
    assert.equal(Array.from(Script.fromBuffer(new Uint8Array([0xff])).toBuffer()), [0xff])
    return assert.equal(Array.from(Script.fromBuffer(new Uint8Array([1, 2, 3])).toBuffer()), [1, 2, 3])
  })
})

  // await step("length", async ({ step }) => {
  //   await step("returns buffer length", => {
  //     expect(new Script().length).to.equal(0);
  //     expect(new Script(new Uint8Array([1, 2, 3])).length).to.equal(3);
  //   });
  // });

  // test "slice", ->
  //   t "returns slice of buffer", ->
  //     expect(Array.from(Script.fromArray([1, 2, 3]).code.slice()))
  //       .to.equal [ 1, 2, 3 ]
      // expect(Array.from(Script.fromArray([1, 2, 3]).code.slice(1))).to.deep
      //   .equal([
      //     2,
      //     3,
      //   ]);
      // expect(Array.from(Script.fromArray([1, 2, 3]).code.slice(1, 2))).to.deep
      //   .equal([
      //     2,
      //   ]);

//   await step("chunks", async ({ step }) => {
//     await step("returns chunks", => {
//       expect(Script.fromArray([100, 255, 1, 2]).chunks).to.deep.equal([
//         { opcode: 100 },
//         { opcode: 255 },
//         { opcode: 1, buf: new Uint8Array([2]) },
//       ]);
//     });

//     await step("caches chunks", => {
//       let buffer: number[] = [];
//       for (let i = 0; i < 10000; i++) {
//         buffer = buffer.concat([100, 255, 1, 2]);
//       }
//       const script = Script.fromArray(buffer);
//       const t0 = new Date();
//       script.chunks; // eslint-disable-line
//       const t1 = new Date();
//       script.chunks; // eslint-disable-line
//       const t2 = new Date();
//       //@ts-ignore
//       expect(t2 - t1).to.be.lessThanOrEqual(t1 - t0);
//     });
//   });

//   // await step("P2PKHLockScript", async ({ step }) => {
//   //   await step("fromAddress", async ({ step }) => {
//   //     await step("creates", => {
//   //       const address = PrivKey.fromRandom().toAddress();
//   //       const script = Script.templates.P2PKHLockScript.fromAddress(address);
//   //       expect(Array.from(script.code)).to.deep.equal(
//   //         Array.from(
//   //           nimble.functions.createP2PKHLockScript(address.pubkeyhash),
//   //         ),
//   //       );
//   //     });

//   //     await step("throws if not an address", => {
//   //       expect(=> Script.templates.P2PKHLockScript.fromAddress()).to.throw();
//   //       expect(=> Script.templates.P2PKHLockScript.fromAddress("abc")).to
//   //         .throw();
//   //       expect(=> Script.templates.P2PKHLockScript.fromAddress({})).to
//   //         .throw();
//   //     });
//   //   });

//   //   await step("toAddress", async ({ step }) => {
//   //     await step("returns address for current network", => {
//   //       const address = nimble.PrivateKey.fromRandom().toAddress();
//   //       const script = Script.templates.P2PKHLockScript.fromAddress(address);
//   //       expect(script.toAddress().toString()).to.equal(address.toString());
//   //     });
//   //   });
//   // });
// });
// import { is, Type, Validate, validate, ValidatorError } from "@deepkit/type";

// function isValidScript(value: any, type: Type) {
//   // const valid = "string" === typeof value && value.startsWith(chars);
//   if (value.length !== 20) {
//     return new ValidatorError("bad pubkeyhash", "Does not start with " + 123);
//   }
// }