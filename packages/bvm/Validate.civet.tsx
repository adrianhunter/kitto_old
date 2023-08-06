export const areBuffersEqual = (a: string | any[], b: string | any[]) => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
export const isBuffer = (a: unknown) => { 
  // This covers both Uint8Array and Buffer instances
  if (a instanceof Uint8Array) return true
  // Check if a standard array, which is slower than the above checks
  return Array.isArray(a) && !a.some((x) => !Number.isInteger(x) || x < 0 || x > 255)
}


const HEX_REGEX = /^(?:[a-fA-F0-9][a-fA-F0-9])*$/

export const isHex = (s: string) => {
  return HEX_REGEX.test(s)
}

export const isP2PKHLockScript = (script: Uint8Array) => {
  return script.length === 25 &&
    script[0] === 118 &&
    script[1] === 169 &&
    script[2] === 20 &&
    script[23] === 136 &&
    script[24] === 172
}




// import { describe,it } from "mocha";
// import { expect } from "chai";
// import nimble from "../env/nimble";
// const { areBuffersEqual } = nimble.functions;

// Deno.test("areBuffersEqual", async () => {
//   // const x = await import("+test");

//   // it("retunrs true if same", () => {
//   //   expect(areBuffersEqual([], [])).to.equal(true);
//   //   expect(areBuffersEqual(Buffer.from([]), Buffer.from([]))).to.equal(true);
//   //   expect(areBuffersEqual(new Uint8Array([]), new Uint8Array([]))).to.equal(
//   //     true,
//   //   );
//   //   expect(areBuffersEqual([1, 2, 3], [1, 2, 3])).to.equal(true);
//   //   expect(areBuffersEqual(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3]))).to
//   //     .equal(true);
//   //   expect(
//   //     areBuffersEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3])),
//   //   ).to.equal(true);
//   //   expect(areBuffersEqual([], Buffer.from([]))).to.equal(true);
//   //   expect(areBuffersEqual(Buffer.from([]), new Uint8Array([]))).to.equal(true);
//   // });

//   // it("returns false for different lengths", () => {
//   //   expect(areBuffersEqual([], [1])).to.equal(false);
//   //   expect(areBuffersEqual([1], [])).to.equal(false);
//   //   expect(areBuffersEqual([1], [1, 2])).to.equal(false);
//   // });

//   // it("returns false for different values", () => {
//   //   expect(areBuffersEqual([1], [21])).to.equal(false);
//   //   expect(areBuffersEqual([1, 2, 3], [1, 2, 4])).to.equal(false);
//   // });
// });
