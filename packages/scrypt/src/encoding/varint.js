import BufferWriter from "./bufferwriter.js";
import BufferReader from "./bufferreader.js";
import BN from "../crypto/bn.js";
import { Buffer } from "buffer";

class Varint {
  constructor(buf) {
    if (!(this instanceof Varint)) return new Varint(buf);
    if (Buffer.isBuffer(buf)) {
      this.buf = buf;
    } else if (typeof buf === "number") {
      var num = buf;
      this.fromNumber(num);
    } else if (buf instanceof BN) {
      var bn = buf;
      this.fromBN(bn);
    } else if (buf) {
      var obj = buf;
      this.set(obj);
    }
  }

  set(obj) {
    this.buf = obj.buf || this.buf;
    return this;
  }

  fromString(str) {
    this.set({
      buf: Buffer.from(str, "hex"),
    });
    return this;
  }

  toString() {
    return this.buf.toString("hex");
  }

  fromBuffer(buf) {
    this.buf = buf;
    return this;
  }

  fromBufferReader(br) {
    this.buf = br.readVarintBuf();
    return this;
  }

  fromBN(bn) {
    var bw = new BufferWriter();
    this.buf = bw.writeVarintBN(bn).toBuffer();
    return this;
  }

  fromNumber(num) {
    var bw = new BufferWriter();
    this.buf = bw.writeVarintNum(num).toBuffer();
    return this;
  }

  toBuffer() {
    return this.buf;
  }

  toBN() {
    return new BufferReader(this.buf).readVarintBN();
  }

  toNumber() {
    return new BufferReader(this.buf).readVarintNum();
  }
}

export default Varint;
