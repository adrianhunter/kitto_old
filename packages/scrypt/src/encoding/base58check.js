import _ from "../util/_.js";
import Base58 from "./base58.js";
import { Buffer as buffer } from "buffer";
import hash from "../crypto/hash.js";
const sha256sha256 = hash.sha256sha256;
import { Buffer } from "buffer";

/**
 * A Base58check object can encode/decodd Base 58, which is used primarily for
 * string-formatted Bitcoin addresses and private keys. This is the same as
 * Base58, except that it includes a checksum to prevent accidental mistypings.
 *
 * @param {object} obj Can be a string or buffer.
 */
class Base58Check {
  constructor(obj) {
    if (!(this instanceof Base58Check)) return new Base58Check(obj);
    if (Buffer.isBuffer(obj)) {
      var buf = obj;
      this.fromBuffer(buf);
    } else if (typeof obj === "string") {
      var str = obj;
      this.fromString(str);
    }
  }

  set(obj) {
    this.buf = obj.buf || this.buf || undefined;
    return this;
  }

  static validChecksum(data, checksum) {
    if (_.isString(data)) {
      data = buffer.Buffer.from(Base58.decode(data));
    }
    if (_.isString(checksum)) {
      checksum = buffer.Buffer.from(Base58.decode(checksum));
    }
    if (!checksum) {
      checksum = data.slice(-4);
      data = data.slice(0, -4);
    }
    return Base58Check.checksum(data).toString("hex") ===
      checksum.toString("hex");
  }

  static decode(s) {
    if (typeof s !== "string") throw new Error("Input must be a string");

    var buf = Buffer.from(Base58.decode(s));

    if (buf.length < 4) throw new Error("Input string too short");

    var data = buf.slice(0, -4);
    var csum = buf.slice(-4);

    var hash = sha256sha256(data);
    var hash4 = hash.slice(0, 4);

    if (csum.toString("hex") !== hash4.toString("hex")) {
      throw new Error("Checksum mismatch");
    }

    return data;
  }

  static checksum(buffer) {
    return sha256sha256(buffer).slice(0, 4);
  }

  static encode(buf) {
    if (!Buffer.isBuffer(buf)) throw new Error("Input must be a buffer");
    var checkedBuf = Buffer.alloc(buf.length + 4);
    var hash = Base58Check.checksum(buf);
    buf.copy(checkedBuf);
    hash.copy(checkedBuf, buf.length);
    return Base58.encode(checkedBuf);
  }

  fromBuffer(buf) {
    this.buf = buf;
    return this;
  }

  static fromBuffer(buf) {
    return new Base58Check().fromBuffer(buf);
  }

  static fromHex(hex) {
    return Base58Check.fromBuffer(Buffer.from(hex, "hex"));
  }

  fromString(str) {
    var buf = Base58Check.decode(str);
    this.buf = buf;
    return this;
  }

  static fromString(str) {
    var buf = Base58Check.decode(str);
    return new Base58(buf);
  }

  toBuffer() {
    return this.buf;
  }

  toHex() {
    return this.toBuffer().toString("hex");
  }

  toString() {
    return Base58Check.encode(this.buf);
  }
}

export default Base58Check;
