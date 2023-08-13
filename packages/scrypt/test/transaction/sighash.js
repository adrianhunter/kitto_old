import buffer from "buffer";
import chai from "chai";
chai.should();
import bsv from "bsv";
const Script = bsv.Script;
const BN = bsv.crypto.BN;
const Transaction = bsv.Transaction;
const Signature = bsv.crypto.Signature;
const sighash = Transaction.sighash;

import vectorsSighash from "../data/sighash.json";

describe("sighash", () => {
  it("should be able to compute sighash for a coinbase tx", () => {
    const txhex =
      "02000000010000000000000000000000000000000000000000000000000000000000000000ffffffff2e039b1e1304c0737c5b68747470733a2f2f6769746875622e636f6d2f62636578742f01000001c096020000000000ffffffff014a355009000000001976a91448b20e254c0677e760bab964aec16818d6b7134a88ac00000000";
    const tx = new Transaction(txhex);
    const sighash = Transaction.Sighash.sighash(
      tx,
      Signature.SIGHASH_ALL,
      0,
      Script.empty(),
    );
    sighash.toString("hex").should.equal(
      "6829f7d44dfd4654749b8027f44c9381527199f78ae9b0d58ffc03fdab3c82f1",
    );
  });

  it("Should require amount for sigHash ForkId=0", () => {
    const vector = [
      "3eb87070042d16f9469b0080a3c1fe8de0feae345200beef8b1e0d7c62501ae0df899dca1e03000000066a0065525365ffffffffd14a9a335e8babddd89b5d0b6a0f41dd6b18848050a0fc48ce32d892e11817fd030000000863acac00535200527ff62cf3ad30d9064e180eaed5e6303950121a8086b5266b55156e4f7612f2c7ebf223e0020000000100ffffffff6273ca3aceb55931160fa7a3064682b4790ee016b4a5c0c0d101fd449dff88ba01000000055351ac526aa3b8223d0421f25b0400000000026552f92db70500000000075253516a656a53c4a908010000000000b5192901000000000652525251516aa148ca38",
      "acab53",
      3,
      -1325231124,
      "fbbc83ed610e416d94dcee2bb3bc35dfea8060b8052c59eabd7e998e3e978328",
    ];
    const txbuf = buffer.Buffer.from(vector[0], "hex");
    const scriptbuf = buffer.Buffer.from(vector[1], "hex");
    const subscript = Script(scriptbuf);
    const nin = vector[2];
    const nhashtype = vector[3];
    const sighashbuf = buffer.Buffer.from(vector[4], "hex");
    const tx = new Transaction(txbuf);

    // make sure transacion to/from buffer is isomorphic
    tx.uncheckedSerialize().should.equal(txbuf.toString("hex"));

    // sighash ought to be correct
    (() => {
      sighash.sighash(tx, nhashtype, nin, subscript).toString("hex").should
        .equal(sighashbuf.toString("hex"));
    }).should.throw("Invalid Argument");
  });

  const zeroBN = BN.Zero;
  vectorsSighash.forEach((vector, i) => {
    if (i === 0 || !vector[4]) {
      // First element is just a row describing the next ones
      return;
    }
    it(`test vector from bitcoind #${i} (${vector[4].substring(0, 16)})`, () => {
      const txbuf = buffer.Buffer.from(vector[0], "hex");
      const scriptbuf = buffer.Buffer.from(vector[1], "hex");
      const subscript = Script(scriptbuf);
      const nin = vector[2];
      const nhashtype = vector[3];
      // var nhashtype = vector[3]>>>0;
      const sighashbuf = buffer.Buffer.from(vector[4], "hex");
      const tx = new Transaction(txbuf);

      // make sure transacion to/from buffer is isomorphic
      tx.uncheckedSerialize().should.equal(txbuf.toString("hex"));

      // sighash ought to be correct
      sighash.sighash(tx, nhashtype, nin, subscript, zeroBN).toString("hex")
        .should.equal(sighashbuf.toString("hex"));
    });
  });
});
