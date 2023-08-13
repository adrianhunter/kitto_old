

import _ from "./util/_.js";
import Address from "./address.js";
import Base58Check from "./encoding/base58check.js";
import BN from "./crypto/bn.js";
import * as JSUtil from "./util/js.js";
import Networks from "./networks.js";
import Point from "./crypto/point.js";
import PublicKey from "./publickey.js";
import Random from "./crypto/random.js";
import * as $ from "./util/preconditions.js";

/**
 * Instantiate a PrivateKey from a BN, Buffer or WIF string.
 *
 * @param {string} data - The encoded data in various formats
 * @param {Network|string=} network - a {@link Network} object, or a string with the network name
 * @returns {PrivateKey} A new valid instance of an PrivateKey
 * @constructor
 */
class PrivateKey {
  constructor(data, network) {
    if (!(this instanceof PrivateKey)) {
      return new PrivateKey(data, network);
    }
    if (data instanceof PrivateKey) {
      return data;
    }

    var info = this._classifyArguments(data, network);

    // validation
    if (!info.bn || info.bn.cmp(new BN(0)) === 0) {
      throw new TypeError(
        "Number can not be equal to zero, undefined, null or false",
      );
    }
    if (!info.bn.lt(Point.getN())) {
      throw new TypeError("Number must be less than N");
    }
    if (typeof (info.network) === "undefined") {
      throw new TypeError('Must specify the network ("livenet" or "testnet")');
    }

    JSUtil.defineImmutable(this, {
      bn: info.bn,
      compressed: info.compressed,
      network: info.network,
    });

    Object.defineProperty(this, "publicKey", {
      configurable: false,
      enumerable: true,
      get: this.toPublicKey.bind(this),
    });

    return this;
  }

  /**
   * Internal helper to instantiate PrivateKey internal `info` object from
   * different kinds of arguments passed to the constructor.
   *
   * @param {*} data
   * @param {Network|string=} network - a {@link Network} object, or a string with the network name
   * @return {Object}
   */
  _classifyArguments(data, network) {
    console.log("🚀 ~ file: privatekey.js:67 ~ network:", network);
    console.log("🚀 ~ file: privatekey.js:67 ~ data:", data);
    var info = {
      compressed: true,
      network: network ? Networks.get(network) : Networks.defaultNetwork,
    };

    // detect type of data
    if (_.isUndefined(data) || _.isNull(data)) {
      info.bn = PrivateKey._getRandomBN();
    } else if (data instanceof BN) {
      info.bn = data;
    } else if (data instanceof Buffer || data instanceof Uint8Array) {
      info = PrivateKey._transformBuffer(data, network);
    } else if (data.bn && data.network) {
      info = PrivateKey._transformObject(data);
    } else if (!network && Networks.get(data)) {
      info.bn = PrivateKey._getRandomBN();
      info.network = Networks.get(data);
    } else if (typeof (data) === "string") {
      if (JSUtil.isHexa(data)) {
        info.bn = new BN(Buffer.from(data, "hex"));
      } else {
        info = PrivateKey._transformWIF(data, network);
      }
    } else {
      throw new TypeError("First argument is an unrecognized data type.");
    }
    return info;
  }

  /**
   * Internal function to get a random Big Number (BN)
   *
   * @returns {BN} A new randomly generated BN
   * @private
   */
  static _getRandomBN() {
    var condition;
    var bn;
    do {
      var privbuf = Random.getRandomBuffer(32);
      bn = BN.fromBuffer(privbuf);
      condition = bn.lt(Point.getN());
    } while (!condition);
    return bn;
  }

  /**
   * Internal function to transform a WIF Buffer into a private key
   *
   * @param {Buffer} buf - An WIF string
   * @param {Network|string=} network - a {@link Network} object, or a string with the network name
   * @returns {Object} An object with keys: bn, network and compressed
   * @private
   */
  static _transformBuffer(buf, network) {
    var info = {};

    if (buf.length === 32) {
      return PrivateKey._transformBNBuffer(buf, network);
    }

    info.network = Networks.get(buf[0], "privatekey");

    if (!info.network) {
      throw new Error("Invalid network");
    }

    if (network && info.network !== Networks.get(network)) {
      throw new TypeError("Private key network mismatch");
    }

    if (buf.length === 1 + 32 + 1 && buf[1 + 32 + 1 - 1] === 1) {
      info.compressed = true;
    } else if (buf.length === 1 + 32) {
      info.compressed = false;
    } else {
      throw new Error(
        "Length of buffer must be 33 (uncompressed) or 34 (compressed)",
      );
    }

    info.bn = BN.fromBuffer(buf.slice(1, 32 + 1));

    return info;
  }

  /**
   * Internal function to transform a BN buffer into a private key
   *
   * @param {Buffer} buf
   * @param {Network|string=} network - a {@link Network} object, or a string with the network name
   * @returns {object} an Object with keys: bn, network, and compressed
   * @private
   */
  static _transformBNBuffer(buf, network) {
    var info = {};
    info.network = Networks.get(network) || Networks.defaultNetwork;
    info.bn = BN.fromBuffer(buf);
    info.compressed = false;
    return info;
  }

  /**
   * Internal function to transform a WIF string into a private key
   *
   * @param {string} buf - An WIF string
   * @returns {Object} An object with keys: bn, network and compressed
   * @private
   */
  static _transformWIF(str, network) {
    return PrivateKey._transformBuffer(Base58Check.decode(str), network);
  }

  /**
   * Instantiate a PrivateKey from a Buffer with the DER or WIF representation
   *
   * @param {Buffer} buf
   * @param {Network} network
   * @return {PrivateKey}
   */
  static fromBuffer(buf, network) {
    return new PrivateKey(buf, network);
  }

  static fromHex(hex, network) {
    return PrivateKey.fromBuffer(Buffer.from(hex, "hex"), network);
  }

  /**
   * Internal function to transform a JSON string on plain object into a private key
   * return this.
   *
   * @param {string} json - A JSON string or plain object
   * @returns {Object} An object with keys: bn, network and compressed
   * @private
   */
  static _transformObject(json) {
    var bn = new BN(json.bn, "hex");
    var network = Networks.get(json.network);
    return {
      bn: bn,
      network: network,
      compressed: json.compressed,
    };
  }

  /**
   * Instantiate a PrivateKey from a WIF string
   *
   * @param {string} str - The WIF encoded private key string
   * @returns {PrivateKey} A new valid instance of PrivateKey
   */
  static fromString(str) {
    $.checkArgument(
      _.isString(str),
      "First argument is expected to be a string.",
    );
    return new PrivateKey(str);
  }

  /**
   * Instantiate a PrivateKey from a plain JavaScript object
   *
   * @param {Object} obj - The output from privateKey.toObject()
   */
  static fromObject(obj) {
    $.checkArgument(
      _.isObject(obj),
      "First argument is expected to be an object.",
    );
    return new PrivateKey(obj);
  }

  /**
   * Instantiate a PrivateKey from random bytes
   *
   * @param {string=} network - Either "livenet" or "testnet"
   * @returns {PrivateKey} A new valid instance of PrivateKey
   */
  static fromRandom(network) {
    var bn = PrivateKey._getRandomBN();
    return new PrivateKey(bn, network);
  }

  /**
   * Check if there would be any errors when initializing a PrivateKey
   *
   * @param {string} data - The encoded data in various formats
   * @param {string=} network - Either "livenet" or "testnet"
   * @returns {null|Error} An error if exists
   */

  static getValidationError(data, network) {
    var error;
    try {
      new PrivateKey(data, network); // eslint-disable-line
    } catch (e) {
      error = e;
    }
    return error;
  }

  /**
   * Check if the parameters are valid
   *
   * @param {string} data - The encoded data in various formats
   * @param {string=} network - Either "livenet" or "testnet"
   * @returns {Boolean} If the private key is would be valid
   */
  static isValid(data, network) {
    if (!data) {
      return false;
    }
    return !PrivateKey.getValidationError(data, network);
  }

  /**
   * Will output the PrivateKey in WIF
   *
   * @returns {string}
   */
  toString() {
    return this.toWIF();
  }

  /**
   * Will output the PrivateKey to a WIF string
   *
   * @returns {string} A WIP representation of the private key
   */
  toWIF() {
    var network = this.network;
    var compressed = this.compressed;

    var buf;
    if (compressed) {
      buf = Buffer.concat([
        Buffer.from([network.privatekey]),
        this.bn.toBuffer({ size: 32 }),
        Buffer.from([0x01]),
      ]);
    } else {
      buf = Buffer.concat([
        Buffer.from([network.privatekey]),
        this.bn.toBuffer({ size: 32 }),
      ]);
    }

    return Base58Check.encode(buf);
  }

  /**
   * Will return the private key as a BN instance
   *
   * @returns {BN} A BN instance of the private key
   */
  toBigNumber() {
    return this.bn;
  }

  /**
   * Will return the private key as a BN buffer
   *
   * @returns {Buffer} A buffer of the private key
   */
  toBuffer() {
    return this.bn.toBuffer({ size: 32 });
  }

  toHex() {
    return this.toBuffer().toString("hex");
  }

  /**
   * Will return the corresponding public key
   *
   * @returns {PublicKey} A public key generated from the private key
   */
  toPublicKey() {
    if (!this._pubkey) {
      this._pubkey = PublicKey.fromPrivateKey(this);
    }
    return this._pubkey;
  }

  /**
   * Will return an address for the private key
   * @param {Network=} network - optional parameter specifying
   * the desired network for the address
   *
   * @returns {Address} An address generated from the private key
   */
  toAddress(network) {
    var pubkey = this.toPublicKey();
    return Address.fromPublicKey(pubkey, network || this.network);
  }

  /**
   * Will return a string formatted for the console
   *
   * @returns {string} Private key
   */
  inspect() {
    var uncompressed = !this.compressed ? ", uncompressed" : "";
    return "<PrivateKey: " + this.toHex() + ", network: " + this.network +
      uncompressed + ">";
  }
}

PrivateKey.fromWIF = PrivateKey.fromString;

PrivateKey.fromJSON = PrivateKey.fromObject;

/**
 * @returns {Object} A plain object representation
 */
PrivateKey.prototype.toObject =
  PrivateKey.prototype.toJSON =
    function toObject() {
      return {
        bn: this.bn.toString("hex"),
        compressed: this.compressed,
        network: this.network.toString(),
      };
    };

export default PrivateKey;
