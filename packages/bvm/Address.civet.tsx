
// { Type, Validate, validate, ValidatorError } from "@deepkit/type"
import { encodeAddress } from "./Encode.civet";
import { decodeAddress } from "./Decode.civet";
import { calculatePublicKeyHash } from "./Gen.civet";
import { PubKey } from "./PubKey.civet"

export type PubKeyHash = Buf
export class Address {
  constructor(public pubkeyhash: PubKeyHash){}
  static fromString(address: string) { return new Address(decodeAddress(address)) }
  static fromPubKey({point}: PubKey) { return new Address(calculatePublicKeyHash(point)) }
  toString() { return encodeAddress(this.pubkeyhash) }
}

// validatePubKeyHash := (value: any, _: Type) ->
//   if value.length is not 20
//     new ValidatorError "bad pubkeyhash", "length must be 20"









// test "Address", ->
//   it "creates an address from a string", ->
//     address := Address.fromString "some_encoded_address"
//     assert.equal address.pubkeyhash, decodeAddress "some_encoded_address"

//   it "creates an address from a public key", ->
//     pubKey := new PubKey point: [1, 2, 3]
//     address := Address.fromPubKey pubKey
//     assert.equal address.pubkeyhash, calculatePublicKeyHash pubKey

//   it "converts an address to a string", ->
//     address := new Address pubkeyhash: [4, 5, 6]
//     assert.equal address.toString(), encodeAddress [4, 5, 6]

//   it "throws an error if pubkeyhash length is not 20", ->
//     assertThrows ->
//       new Address pubkeyhash: [1, 2, 3, 4, 5, 6, 7]
//     , "bad pubkeyhash"
//     , "length must be 20"





















// {test} from @kitto/testing

// //@ts-ignore
// test `address`, async (t) =>
//   console.log "RUN TEST!"
//   t "decodes valid mainnet address", => 
//     // const bsvAddress = new bsv.PrivateKey().toAddress();
//     address := Address.fromString "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"

//     // x := cast<Address> pubkeyhash: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" |> encoder.encode

//     // console.log x

//     console.log("X", address);
//   { expect, cast, assert.equal } := await import "@kitto/testing"

//   encoder := new TextEncoder

// //   // const { validate } = await import("@deepkit/type");
// //   // const { cast } = await import("@deepkit/type");
// //   // const { default: bsv } = await import("bsv");
//   { generatePrivateKey } := await import "../fn/generate-private-key.civet"
//   { calculatePublicKey } := await import "../fn/calculate-public-key.civet"
//@ts-ignore
  // await t `fromString`, (t) => 
  //   await step "decodes valid mainnet address", => 
  //     // const bsvAddress = new bsv.PrivateKey().toAddress();
  //     address := Address.fromString "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"

  //     // x := cast<Address> pubkeyhash: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" |> encoder.encode

  //     // console.log x

  //     console.log("X", address);
      // expect(address.toString()).to.equal "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
      // expect(Buffer.from(bsvAddress.hashBuffer).toString('hex')).to.equal(Buffer.from(address.pubkeyhash).toString('hex'))
  

//   const { calculatePublicKeyHash } = await import(
//     "../fn/calculate-public-key-hash.civet"
//   );

//   const privateKey = generatePrivateKey();
//   // const publicKey = calculatePublicKey(privateKey);
//   // const pubkeyhash = calculatePublicKeyHash(publicKey);
//   // const address = new Address(pubkeyhash);

//   // await t.step(`valid`, () => {
//   //   // assert.equal(address.pubkeyhash, pubkeyhash);
//   // });

//   console.log("loading teREADYst");

//   // await t.step(`throws if bad`, async () => {
//   //   // assert.equal(
//   //   //   validate<Address>({
//   //   //     pubkeyhash: "abc",
//   //   //   })[0].code,
//   //   //   "bad pubkeyhash",
//   //   // );
//   //   // assert.equal(
//   //   //   validate<Address>({
//   //   //     pubkeyhash: [],
//   //   //   })[0].code,
//   //   //   "type",
//   //   // );
//   //   // expect(() => new Address("abc")).to.throw("bad pubkeyhash");
//   //   // expect(() => new Address([])).to.throw('bad pubkeyhash')
//   //   // expect(() => new Address(new Array(20), 0)).to.throw('bad testnet flag')
//   // });



//   //   // expect(() => new Address("abc")).to.throw("bad pubkeyhash");
//   //   // expect(() => new Address([])).to.throw('bad pubkeyhash')
//   //   // expect(() => new Address(new Array(20), 0)).to.throw('bad testnet flag')
//   // });
//   // expect(address.pubkeyhash).to.equal(pubkeyhash);
// });
