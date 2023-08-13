import _ from "../util/_.js";
import bs58 from "bs58";
import { Buffer } from "buffer";

/**
 * The alphabet for the Bitcoin-specific Base 58 encoding distinguishes between
 * lower case L and upper case i - neither of those characters are allowed to
 * prevent accidentaly miscopying of letters.
 */
var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  .split("");

/**
 * A Base58 object can encode/decoded Base 58, which is used primarily for
 * string-formatted Bitcoin addresses and private keys. Addresses and private
 * keys actually use an additional checksum, and so they actually use the
 * Base58Check class.
 *
 * @param {object} obj Can be a string or buffer.
 */
class Base58 {
  constructor(obj) {
    if (!(this instanceof Base58)) {
      return new Base58(obj);
    }
    if (Buffer.isBuffer(obj)) {
      var buf = obj;
      this.fromBuffer(buf);
    } else if (typeof obj === "string") {
      var str = obj;
      this.fromString(str);
    }
  }

  static validCharacters(chars) {
    if (Buffer.isBuffer(chars)) {
      chars = chars.toString();
    }
    return _.every(_.map(chars, function (char) {
      return _.includes(ALPHABET, char);
    }));
  }

  set(obj) {
    this.buf = obj.buf || this.buf || undefined;
    return this;
  }

  /**
   * Encode a buffer to Bsae 58.
   *
   * @param {Buffer} buf Any buffer to be encoded.
   * @returns {string} A Base 58 encoded string.
   */
  static encode(buf) {
    if (!Buffer.isBuffer(buf)) {
      throw new Error("Input should be a buffer");
    }
    return bs58.encode(buf);
  }

  /**
   * Decode a Base 58 string to a buffer.
   *
   * @param {string} str A Base 58 encoded string.
   * @returns {Buffer} The decoded buffer.
   */
  static decode(str) {
    if (typeof str !== "string") {
      throw new Error("Input should be a string");
    }
    return Buffer.from(bs58.decode(str));
  }

  fromBuffer(buf) {
    this.buf = buf;
    return this;
  }

  static fromBuffer(buf) {
    return new Base58().fromBuffer(buf);
  }

  static fromHex(hex) {
    return Base58.fromBuffer(Buffer.from(hex, "hex"));
  }

  fromString(str) {
    var buf = Base58.decode(str);
    this.buf = buf;
    return this;
  }

  static fromString(str) {
    return new Base58().fromString(str);
  }

  toBuffer() {
    return this.buf;
  }

  toHex() {
    return this.toBuffer().toString("hex");
  }

  toString() {
    return Base58.encode(this.buf);
  }
}

export default Base58;
