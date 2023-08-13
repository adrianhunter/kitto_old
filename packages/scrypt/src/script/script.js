import Address from "../address.js";
import BufferWriter from "../encoding/bufferwriter.js";
import Hash from "../crypto/hash.js";
import Opcode from "../opcode.js";
import PublicKey from "../publickey.js";
import Signature from "../crypto/signature.js";
import Networks from "../networks.js";
import * as $ from "../util/preconditions.js";
import _ from "../util/_.js";
import errors from "../errors/index.js";
import { Buffer as buffer } from "buffer";
import * as JSUtil from "../util/js.js";
import decodeScriptChunks from "../encoding/decode-script-chunks.js";
import decodeASM from "../encoding/decode-asm.js";
import encodeHex from "../encoding/encode-hex.js";
import { Buffer } from "buffer";

// These WeakMap caches allow the objects themselves to maintain their immutability
const SCRIPT_TO_CHUNKS_CACHE = new WeakMap();

/**
 * A bitcoin transaction script. Each transaction's inputs and outputs
 * has a script that is evaluated to validate it's spending.
 *
 * See https://en.bitcoin.it/wiki/Script
 *
 * @constructor
 * @param {Object|string|Buffer=} from optional data to populate script
 */
class Script {
  constructor(from) {
    if (!(this instanceof Script)) {
      return new Script(from);
    }
    this.buffer = Buffer.from([]);

    if (Buffer.isBuffer(from)) {
      return Script.fromBuffer(from);
    } else if (from instanceof Address) {
      return Script.fromAddress(from);
    } else if (from instanceof Script) {
      return Script.fromBuffer(from.toBuffer());
    } else if (_.isString(from)) {
      return Script.fromString(from);
    } else if (_.isObject(from) && _.isArray(from.chunks)) {
      return Script.fromChunks(from.chunks);
    } else if (_.isObject(from) && Buffer.isBuffer(from.buffer)) {
      return Script.fromBuffer(from.buffer);
    }
  }

  set(obj) {
    $.checkArgument(_.isObject(obj));
    if (obj.chunks && _.isArray(obj.chunks)) {
      var s = Script.fromChunks(obj.chunks);
      this.buffer = s.buffer;
      return this;
    }

    $.checkArgument(Buffer.isBuffer(obj.buffer));
    this.buffer = obj.buffer;
    return this;
  }

  static fromBuffer(buffer) {
    $.checkArgument(Buffer.isBuffer(buffer));
    var script = new Script();
    script.buffer = buffer;
    return script;
  }

  static fromChunks(chunks) {
    var script = new Script();

    const bw = new BufferWriter();

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      bw.writeUInt8(chunk.opcodenum);
      if (chunk.buf) {
        if (chunk.opcodenum < Opcode.OP_PUSHDATA1) {
          bw.write(chunk.buf);
        } else if (chunk.opcodenum === Opcode.OP_PUSHDATA1) {
          bw.writeUInt8(chunk.len);
          bw.write(chunk.buf);
        } else if (chunk.opcodenum === Opcode.OP_PUSHDATA2) {
          bw.writeUInt16LE(chunk.len);
          bw.write(chunk.buf);
        } else if (chunk.opcodenum === Opcode.OP_PUSHDATA4) {
          bw.writeUInt32LE(chunk.len);
          bw.write(chunk.buf);
        }
      }
    }

    script.buffer = bw.toBuffer();
    return script;
  }

  toBuffer() {
    return this.buffer;
  }

  static fromASM(str) {
    return Script.fromBuffer(decodeASM(str));
  }

  static fromHex(str) {
    return new Script(buffer.Buffer.from(str, "hex"));
  }

  static fromString(str) {
    if (JSUtil.isHexa(str) || str.length === 0) {
      return new Script(buffer.Buffer.from(str, "hex"));
    }

    var chunks = [];

    var tokens = str.split(" ");
    var i = 0;
    while (i < tokens.length) {
      var token = tokens[i];
      var opcode = Opcode(token);
      var opcodenum = opcode.toNumber();

      if (_.isUndefined(opcodenum)) {
        opcodenum = parseInt(token);
        if (opcodenum > 0 && opcodenum < Opcode.OP_PUSHDATA1) {
          var buf = Buffer.from(tokens[i + 1].slice(2), "hex");
          if (buf.length !== opcodenum) {
            throw new Error("Invalid script buf len: " + JSON.stringify(str));
          }
          chunks.push({
            buf: Buffer.from(tokens[i + 1].slice(2), "hex"),
            len: opcodenum,
            opcodenum: opcodenum,
          });
          i = i + 2;
        } else {
          throw new Error("Invalid script: " + JSON.stringify(str));
        }
      } else if (
        opcodenum === Opcode.OP_PUSHDATA1 ||
        opcodenum === Opcode.OP_PUSHDATA2 ||
        opcodenum === Opcode.OP_PUSHDATA4
      ) {
        if (tokens[i + 2].slice(0, 2) !== "0x") {
          throw new Error("Pushdata data must start with 0x");
        }
        chunks.push({
          buf: Buffer.from(tokens[i + 2].slice(2), "hex"),
          len: parseInt(tokens[i + 1]),
          opcodenum: opcodenum,
        });
        i = i + 3;
      } else {
        chunks.push({
          opcodenum: opcodenum,
        });
        i = i + 1;
      }
    }
    return Script.fromChunks(chunks);
  }

  slice(start, end) {
    return this.buffer.slice(start, end);
  }

  get chunks() {
    if (SCRIPT_TO_CHUNKS_CACHE.has(this)) {
      return SCRIPT_TO_CHUNKS_CACHE.get(this);
    }
    const chunks = decodeScriptChunks(this.buffer);
    SCRIPT_TO_CHUNKS_CACHE.set(this, chunks);
    return chunks;
  }

  get length() {
    return this.buffer.length;
  }

  _chunkToString(chunk, type) {
    var opcodenum = chunk.opcodenum;
    var asm = type === "asm";
    var str = "";
    if (!chunk.buf) {
      // no data chunk
      if (typeof Opcode.reverseMap[opcodenum] !== "undefined") {
        if (asm) {
          // A few cases where the opcode name differs from reverseMap
          // aside from 1 to 16 data pushes.
          if (opcodenum === 0) {
            // OP_0 -> 0
            str = str + " 0";
          } else if (opcodenum === 79) {
            // OP_1NEGATE -> 1
            str = str + " -1";
          } else {
            str = str + " " + Opcode(opcodenum).toString();
          }
        } else {
          str = str + " " + Opcode(opcodenum).toString();
        }
      } else {
        var numstr = opcodenum.toString(16);
        if (numstr.length % 2 !== 0) {
          numstr = "0" + numstr;
        }
        if (asm) {
          str = str + " " + numstr;
        } else {
          str = str + " " + "0x" + numstr;
        }
      }
    } else {
      // data chunk
      if (
        !asm && (opcodenum === Opcode.OP_PUSHDATA1 ||
          opcodenum === Opcode.OP_PUSHDATA2 ||
          opcodenum === Opcode.OP_PUSHDATA4)
      ) {
        str = str + " " + Opcode(opcodenum).toString();
      }
      if (chunk.len > 0) {
        if (asm) {
          str = str + " " + chunk.buf.toString("hex");
        } else {
          str = str + " " + chunk.len + " " + "0x" + chunk.buf.toString("hex");
        }
      }
    }
    return str;
  }

  toASM() {
    var str = "";
    var chunks = this.chunks;
    for (var i = 0; i < chunks.length; i++) {
      var chunk = this.chunks[i];
      str += this._chunkToString(chunk, "asm");
    }

    return str.substr(1);
  }

  toString() {
    var str = "";
    for (var i = 0; i < this.chunks.length; i++) {
      var chunk = this.chunks[i];
      str += this._chunkToString(chunk);
    }

    return str.substr(1);
  }

  toHex() {
    return encodeHex(this.buffer);
  }

  inspect() {
    return "<Script: " + this.toString() + ">";
  }

  // script classification methods

  /**
   * @returns {boolean} if this is a pay to pubkey hash output script
   */
  isPublicKeyHashOut() {
    return !!(this.chunks.length === 5 &&
      this.chunks[0].opcodenum === Opcode.OP_DUP &&
      this.chunks[1].opcodenum === Opcode.OP_HASH160 &&
      this.chunks[2].buf &&
      this.chunks[2].buf.length === 20 &&
      this.chunks[3].opcodenum === Opcode.OP_EQUALVERIFY &&
      this.chunks[4].opcodenum === Opcode.OP_CHECKSIG);
  }

  /**
   * @returns {boolean} if this is a pay to public key hash input script
   */
  isPublicKeyHashIn() {
    if (this.chunks.length === 2) {
      var signatureBuf = this.chunks[0].buf;
      var pubkeyBuf = this.chunks[1].buf;
      if (
        signatureBuf &&
        signatureBuf.length &&
        signatureBuf[0] === 0x30 &&
        pubkeyBuf &&
        pubkeyBuf.length
      ) {
        var version = pubkeyBuf[0];
        if (
          (version === 0x04 ||
            version === 0x06 ||
            version === 0x07) && pubkeyBuf.length === 65
        ) {
          return true;
        } else if (
          (version === 0x03 || version === 0x02) && pubkeyBuf.length === 33
        ) {
          return true;
        }
      }
    }
    return false;
  }

  getPublicKey() {
    $.checkState(
      this.isPublicKeyOut(),
      "Can't retrieve PublicKey from a non-PK output",
    );
    return this.chunks[0].buf;
  }

  getPublicKeyHash() {
    $.checkState(
      this.isPublicKeyHashOut(),
      "Can't retrieve PublicKeyHash from a non-PKH output",
    );
    return this.chunks[2].buf;
  }

  /**
   * @returns {boolean} if this is a public key output script
   */
  isPublicKeyOut() {
    if (
      this.chunks.length === 2 &&
      this.chunks[0].buf &&
      this.chunks[0].buf.length &&
      this.chunks[1].opcodenum === Opcode.OP_CHECKSIG
    ) {
      var pubkeyBuf = this.chunks[0].buf;
      var version = pubkeyBuf[0];
      var isVersion = false;
      if (
        (version === 0x04 ||
          version === 0x06 ||
          version === 0x07) && pubkeyBuf.length === 65
      ) {
        isVersion = true;
      } else if (
        (version === 0x03 || version === 0x02) && pubkeyBuf.length === 33
      ) {
        isVersion = true;
      }
      if (isVersion) {
        return PublicKey.isValid(pubkeyBuf);
      }
    }
    return false;
  }

  /**
   * @returns {boolean} if this is a pay to public key input script
   */
  isPublicKeyIn() {
    if (this.chunks.length === 1) {
      var signatureBuf = this.chunks[0].buf;
      if (
        signatureBuf &&
        signatureBuf.length &&
        signatureBuf[0] === 0x30
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * @returns {boolean} if this is a p2sh output script
   */
  isScriptHashOut() {
    var buf = this.toBuffer();
    return (buf.length === 23 &&
      buf[0] === Opcode.OP_HASH160 &&
      buf[1] === 0x14 &&
      buf[buf.length - 1] === Opcode.OP_EQUAL);
  }

  /**
   * @returns {boolean} if this is a p2sh input script
   * Note that these are frequently indistinguishable from pubkeyhashin
   */
  isScriptHashIn() {
    if (this.chunks.length <= 1) {
      return false;
    }
    var redeemChunk = this.chunks[this.chunks.length - 1];
    var redeemBuf = redeemChunk.buf;
    if (!redeemBuf) {
      return false;
    }

    var redeemScript;
    try {
      redeemScript = Script.fromBuffer(redeemBuf);
    } catch (e) {
      if (e instanceof errors.Script.InvalidBuffer) {
        return false;
      }
      throw e;
    }
    var type = redeemScript.classify();
    return type !== Script.types.UNKNOWN;
  }

  /**
   * @returns {boolean} if this is a mutlsig output script
   */
  isMultisigOut() {
    return (this.chunks.length > 3 &&
      Opcode.isSmallIntOp(this.chunks[0].opcodenum) &&
      this.chunks.slice(1, this.chunks.length - 2).every(function (obj) {
        return obj.buf && Buffer.isBuffer(obj.buf);
      }) &&
      Opcode.isSmallIntOp(this.chunks[this.chunks.length - 2].opcodenum) &&
      this.chunks[this.chunks.length - 1].opcodenum === Opcode.OP_CHECKMULTISIG);
  }

  /**
   * @returns {boolean} if this is a multisig input script
   */
  isMultisigIn() {
    return this.chunks.length >= 2 &&
      this.chunks[0].opcodenum === 0 &&
      this.chunks.slice(1, this.chunks.length).every(function (obj) {
        return obj.buf &&
          Buffer.isBuffer(obj.buf) &&
          Signature.isTxDER(obj.buf);
      });
  }

  /**
   * @returns {boolean} true if this is a valid standard OP_RETURN output
   */
  isDataOut() {
    var step1 = this.buffer.length >= 1 &&
      this.buffer[0] === Opcode.OP_RETURN;
    if (!step1) return false;
    var buffer = this.buffer.slice(1);
    var script2 = new Script({ buffer: buffer });
    return script2.isPushOnly();
  }

  isSafeDataOut() {
    if (this.buffer.length < 2) {
      return false;
    }
    if (this.buffer[0] !== Opcode.OP_FALSE) {
      return false;
    }
    var buffer = this.buffer.slice(1);
    var script2 = new Script({ buffer });
    return script2.isDataOut();
  }

  /**
   * Retrieve the associated data for this script.
   * In the case of a pay to public key hash or P2SH, return the hash.
   * In the case of safe OP_RETURN data, return an array of buffers
   * In the case of a standard deprecated OP_RETURN, return the data
   * @returns {Buffer}
   */
  getData() {
    if (this.isSafeDataOut()) {
      var chunks = this.chunks.slice(2);
      var buffers = chunks.map((chunk) => chunk.buf);
      return buffers;
    }
    if (this.isDataOut() || this.isScriptHashOut()) {
      if (_.isUndefined(this.chunks[1])) {
        return Buffer.alloc(0);
      } else {
        return Buffer.from(this.chunks[1].buf);
      }
    }
    if (this.isPublicKeyHashOut()) {
      return Buffer.from(this.chunks[2].buf);
    }
    throw new Error("Unrecognized script type to get data from");
  }

  /**
   * @returns {boolean} if the script is only composed of data pushing
   * opcodes or small int opcodes (OP_0, OP_1, ..., OP_16)
   */
  isPushOnly() {
    return _.every(this.chunks, function (chunk) {
      return chunk.opcodenum <= Opcode.OP_16 ||
        chunk.opcodenum === Opcode.OP_PUSHDATA1 ||
        chunk.opcodenum === Opcode.OP_PUSHDATA2 ||
        chunk.opcodenum === Opcode.OP_PUSHDATA4;
    });
  }

  /**
   * @returns {object} The Script type if it is a known form,
   * or Script.UNKNOWN if it isn't
   */
  classify() {
    if (this._isInput) {
      return this.classifyInput();
    } else if (this._isOutput) {
      return this.classifyOutput();
    } else {
      var outputType = this.classifyOutput();
      return outputType !== Script.types.UNKNOWN
        ? outputType
        : this.classifyInput();
    }
  }

  /**
   * @returns {object} The Script type if it is a known form,
   * or Script.UNKNOWN if it isn't
   */
  classifyOutput() {
    for (var type in Script.outputIdentifiers) {
      if (Script.outputIdentifiers[type].bind(this)()) {
        return Script.types[type];
      }
    }
    return Script.types.UNKNOWN;
  }

  /**
   * @returns {object} The Script type if it is a known form,
   * or Script.UNKNOWN if it isn't
   */
  classifyInput() {
    for (var type in Script.inputIdentifiers) {
      if (Script.inputIdentifiers[type].bind(this)()) {
        return Script.types[type];
      }
    }
    return Script.types.UNKNOWN;
  }

  /**
   * @returns {boolean} if script is one of the known types
   */
  isStandard() {
    // TODO: Add BIP62 compliance
    return this.classify() !== Script.types.UNKNOWN;
  }

  // Script construction methods

  /**
   * Adds a script element at the start of the script.
   * @param {*} obj a string, number, Opcode, Buffer, or object to add
   * @returns {Script} this script instance
   */
  prepend(obj) {
    this._addByType(obj, true);
    return this;
  }

  /**
   * Compares a script with another script
   */
  equals(script) {
    $.checkState(script instanceof Script, "Must provide another script");
    if (this.buffer.length !== script.buffer.length) {
      return false;
    }
    var i;
    for (i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i] !== script.buffer[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Adds a script element to the end of the script.
   *
   * @param {*} obj a string, number, Opcode, Buffer, or object to add
   * @returns {Script} this script instance
   */
  add(obj) {
    this._addByType(obj, false);
    return this;
  }

  _addByType(obj, prepend) {
    if (typeof obj === "string") {
      this._addOpcode(obj, prepend);
    } else if (typeof obj === "number") {
      this._addOpcode(obj, prepend);
    } else if (obj instanceof Opcode) {
      this._addOpcode(obj, prepend);
    } else if (Buffer.isBuffer(obj)) {
      this._addBuffer(obj, prepend);
    } else if (obj instanceof Script) {
      this._insertAtPosition(obj.buffer, prepend);
    } else if (typeof obj === "object") {
      var s = Script.fromChunks([obj]);
      this._insertAtPosition(s.toBuffer(), prepend);
    } else {
      throw new Error("Invalid script chunk");
    }
  }

  _insertAtPosition(buf, prepend) {
    var bw = new BufferWriter();

    if (prepend) {
      bw.write(buf);
      bw.write(this.buffer);
    } else {
      bw.write(this.buffer);
      bw.write(buf);
    }
    this.buffer = bw.toBuffer();
  }

  _addOpcode(opcode, prepend) {
    var op;
    if (typeof opcode === "number") {
      op = opcode;
    } else if (opcode instanceof Opcode) {
      op = opcode.toNumber();
    } else {
      op = Opcode(opcode).toNumber();
    }

    // OP_INVALIDOPCODE
    if (op > 255) {
      throw new errors.Script.InvalidOpcode(op);
    }
    this._insertAtPosition(
      Script.fromChunks([{
        opcodenum: op,
      }]).toBuffer(),
      prepend,
    );
    return this;
  }

  _addBuffer(buf, prepend) {
    var bw = new BufferWriter();
    var opcodenum;
    var len = buf.length;
    if (len === 0) {
      opcodenum = 0;
      bw.writeUInt8(opcodenum);
    } else if (len > 0 && len < Opcode.OP_PUSHDATA1) {
      opcodenum = len;
      bw.writeUInt8(opcodenum);
      bw.write(buf);
    } else if (len < Math.pow(2, 8)) {
      opcodenum = Opcode.OP_PUSHDATA1;
      bw.writeUInt8(opcodenum);
      bw.writeUInt8(len);
      bw.write(buf);
    } else if (len < Math.pow(2, 16)) {
      opcodenum = Opcode.OP_PUSHDATA2;
      bw.writeUInt8(opcodenum);
      bw.writeUInt16LE(len);
      bw.write(buf);
    } else if (len < Math.pow(2, 32)) {
      opcodenum = Opcode.OP_PUSHDATA4;
      bw.writeUInt8(opcodenum);
      bw.writeUInt32LE(len);
      bw.write(buf);
    } else {
      throw new Error("You can't push that much data");
    }

    this._insertAtPosition(bw.toBuffer(), prepend);
    return this;
  }

  clone() {
    return Script.fromBuffer(this.buffer.slice());
  }

  removeCodeseparators() {
    var chunks = [];
    for (var i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].opcodenum !== Opcode.OP_CODESEPARATOR) {
        chunks.push(this.chunks[i]);
      }
    }
    SCRIPT_TO_CHUNKS_CACHE.delete(this);

    this.buffer = Script.fromChunks(chunks).toBuffer();
    return this;
  }

  /**
   * If the script does not contain any OP_CODESEPARATOR, Return all scripts
   * If the script contains any OP_CODESEPARATOR, the scriptCode is the script but removing everything up to and including the last executed OP_CODESEPARATOR before the signature checking opcode being executed
   * @param {n} The {n}th codeseparator in the script
   *
   * @returns {Script} Subset of script starting at the {n}th codeseparator
   */
  subScript(n) {
    var idx = 0;

    for (var i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].opcodenum === Opcode.OP_CODESEPARATOR) {
        if (idx === n) {
          return Script.fromChunks(this.chunks.slice(i + 1));
        } else {
          idx++;
        }
      }
    }

    return this;
  }

  // high level script builder methods

  /**
   * @returns {Script} a new Multisig output script for given public keys,
   * requiring m of those public keys to spend
   * @param {PublicKey[]} publicKeys - list of all public keys controlling the output
   * @param {number} threshold - amount of required signatures to spend the output
   * @param {Object=} opts - Several options:
   *        - noSorting: defaults to false, if true, don't sort the given
   *                      public keys before creating the script
   */
  static buildMultisigOut(publicKeys, threshold, opts) {
    $.checkArgument(
      threshold <= publicKeys.length,
      "Number of required signatures must be less than or equal to the number of public keys",
    );
    opts = opts || {};
    var script = new Script();
    script.add(Opcode.smallInt(threshold));
    publicKeys = _.map(publicKeys, PublicKey);
    var sorted = publicKeys;
    if (!opts.noSorting) {
      sorted = publicKeys.map((k) => k.toString("hex")).sort().map((k) =>
        new PublicKey(k)
      );
    }
    for (var i = 0; i < sorted.length; i++) {
      var publicKey = sorted[i];
      script.add(publicKey.toBuffer());
    }
    script.add(Opcode.smallInt(publicKeys.length));
    script.add(Opcode.OP_CHECKMULTISIG);
    return script;
  }

  /**
   * A new Multisig input script for the given public keys, requiring m of those public keys to spend
   *
   * @param {PublicKey[]} pubkeys list of all public keys controlling the output
   * @param {number} threshold amount of required signatures to spend the output
   * @param {Array} signatures and array of signature buffers to append to the script
   * @param {Object=} opts
   * @param {boolean=} opts.noSorting don't sort the given public keys before creating the script (false by default)
   * @param {Script=} opts.cachedMultisig don't recalculate the redeemScript
   *
   * @returns {Script}
   */
  static buildMultisigIn(pubkeys, threshold, signatures, opts) {
    $.checkArgument(_.isArray(pubkeys));
    $.checkArgument(_.isNumber(threshold));
    $.checkArgument(_.isArray(signatures));
    opts = opts || {};
    var s = new Script();
    s.add(Opcode.OP_0);
    _.each(signatures, function (signature) {
      $.checkArgument(
        Buffer.isBuffer(signature),
        "Signatures must be an array of Buffers",
      );
      // TODO: allow signatures to be an array of Signature objects
      s.add(signature);
    });
    return s;
  }

  /**
   * A new P2SH Multisig input script for the given public keys, requiring m of those public keys to spend
   *
   * @param {PublicKey[]} pubkeys list of all public keys controlling the output
   * @param {number} threshold amount of required signatures to spend the output
   * @param {Array} signatures and array of signature buffers to append to the script
   * @param {Object=} opts
   * @param {boolean=} opts.noSorting don't sort the given public keys before creating the script (false by default)
   * @param {Script=} opts.cachedMultisig don't recalculate the redeemScript
   *
   * @returns {Script}
   */
  static buildP2SHMultisigIn(pubkeys, threshold, signatures, opts) {
    $.checkArgument(_.isArray(pubkeys));
    $.checkArgument(_.isNumber(threshold));
    $.checkArgument(_.isArray(signatures));
    opts = opts || {};
    var s = new Script();
    s.add(Opcode.OP_0);
    _.each(signatures, function (signature) {
      $.checkArgument(
        Buffer.isBuffer(signature),
        "Signatures must be an array of Buffers",
      );
      // TODO: allow signatures to be an array of Signature objects
      s.add(signature);
    });
    s.add(
      (opts.cachedMultisig || Script.buildMultisigOut(pubkeys, threshold, opts))
        .toBuffer(),
    );
    return s;
  }

  /**
   * @returns {Script} a new pay to public key hash output for the given
   * address or public key
   * @param {(Address|PublicKey)} to - destination address or public key
   */
  static buildPublicKeyHashOut(to) {
    $.checkArgument(!_.isUndefined(to));
    $.checkArgument(
      to instanceof PublicKey || to instanceof Address || _.isString(to),
    );
    if (to instanceof PublicKey) {
      to = to.toAddress();
    } else if (_.isString(to)) {
      to = new Address(to);
    }
    var s = new Script();
    s.add(Opcode.OP_DUP)
      .add(Opcode.OP_HASH160)
      .add(to.hashBuffer)
      .add(Opcode.OP_EQUALVERIFY)
      .add(Opcode.OP_CHECKSIG);
    s._network = to.network;
    return s;
  }

  /**
   * @returns {Script} a new pay to public key output for the given
   *  public key
   */
  static buildPublicKeyOut(pubkey) {
    $.checkArgument(pubkey instanceof PublicKey);
    var s = new Script();
    s.add(pubkey.toBuffer())
      .add(Opcode.OP_CHECKSIG);
    return s;
  }

  /**
   * @returns {Script} a new OP_RETURN script with data
   * @param {(string|Buffer|Array)} data - the data to embed in the output - it is a string, buffer, or array of strings or buffers
   * @param {(string)} encoding - the type of encoding of the string(s)
   */
  static buildDataOut(data, encoding) {
    $.checkArgument(
      _.isUndefined(data) || _.isString(data) || _.isArray(data) ||
        Buffer.isBuffer(data),
    );
    var datas = data;
    if (!_.isArray(datas)) {
      datas = [data];
    }
    var s = new Script();
    s.add(Opcode.OP_RETURN);
    for (let data of datas) {
      $.checkArgument(
        _.isUndefined(data) || _.isString(data) || Buffer.isBuffer(data),
      );
      if (_.isString(data)) {
        data = Buffer.from(data, encoding);
      }
      if (!_.isUndefined(data)) {
        s.add(data);
      }
    }
    return s;
  }

  /**
   * @returns {Script} a new OP_RETURN script with data
   * @param {(string|Buffer|Array)} data - the data to embed in the output - it is a string, buffer, or array of strings or buffers
   * @param {(string)} encoding - the type of encoding of the string(s)
   */
  static buildSafeDataOut(data, encoding) {
    var s2 = Script.buildDataOut(data, encoding);
    var s1 = new Script();
    s1.add(Opcode.OP_FALSE);
    s1.add(s2);
    return s1;
  }

  /**
   * @param {Script|Address} script - the redeemScript for the new p2sh output.
   *    It can also be a p2sh address
   * @returns {Script} new pay to script hash script for given script
   */
  static buildScriptHashOut(script) {
    $.checkArgument(
      script instanceof Script ||
        (script instanceof Address && script.isPayToScriptHash()),
    );
    var s = new Script();
    s.add(Opcode.OP_HASH160)
      .add(
        script instanceof Address
          ? script.hashBuffer
          : Hash.sha256ripemd160(script.toBuffer()),
      )
      .add(Opcode.OP_EQUAL);

    s._network = script._network || script.network;
    return s;
  }

  /**
   * Builds a scriptSig (a script for an input) that signs a public key output script.
   *
   * @param {Signature|Buffer} signature - a Signature object, or the signature in DER canonical encoding
   * @param {number=} sigtype - the type of the signature (defaults to SIGHASH_ALL)
   */
  static buildPublicKeyIn(signature, sigtype) {
    $.checkArgument(signature instanceof Signature || Buffer.isBuffer(signature));
    $.checkArgument(_.isUndefined(sigtype) || _.isNumber(sigtype));
    if (signature instanceof Signature) {
      signature = signature.toBuffer();
    }
    var script = new Script();
    script.add(Buffer.concat([
      signature,
      Buffer.from([(sigtype || Signature.SIGHASH_ALL) & 0xff]),
    ]));
    return script;
  }

  /**
   * Builds a scriptSig (a script for an input) that signs a public key hash
   * output script.
   *
   * @param {Buffer|string|PublicKey} publicKey
   * @param {Signature|Buffer} signature - a Signature object, or the signature in DER canonical encoding
   * @param {number=} sigtype - the type of the signature (defaults to SIGHASH_ALL)
   */
  static buildPublicKeyHashIn(publicKey, signature, sigtype) {
    $.checkArgument(signature instanceof Signature || Buffer.isBuffer(signature));
    $.checkArgument(_.isUndefined(sigtype) || _.isNumber(sigtype));
    if (signature instanceof Signature) {
      signature = signature.toBuffer();
    }
    var script = new Script()
      .add(Buffer.concat([
        signature,
        Buffer.from([(sigtype || Signature.SIGHASH_ALL) & 0xff]),
      ]))
      .add(new PublicKey(publicKey).toBuffer());
    return script;
  }

  /**
   * @returns {Script} an empty script
   */
  static empty() {
    return new Script();
  }

  /**
   * @returns {Script} a new pay to script hash script that pays to this script
   */
  toScriptHashOut() {
    return Script.buildScriptHashOut(this);
  }

  /**
   * @return {Script} an output script built from the address
   */
  static fromAddress(address) {
    address = Address(address);
    if (address.isPayToScriptHash()) {
      return Script.buildScriptHashOut(address);
    } else if (address.isPayToPublicKeyHash()) {
      return Script.buildPublicKeyHashOut(address);
    }
    throw new errors.Script.UnrecognizedAddress(address);
  }

  /**
   * Will return the associated address information object
   * @return {Address|boolean}
   */
  getAddressInfo(opts) {
    if (this._isInput) {
      return this._getInputAddressInfo();
    } else if (this._isOutput) {
      return this._getOutputAddressInfo();
    } else {
      var info = this._getOutputAddressInfo();
      if (!info) {
        return this._getInputAddressInfo();
      }
      return info;
    }
  }

  /**
   * Will return the associated output scriptPubKey address information object
   * @return {Address|boolean}
   * @private
   */
  _getOutputAddressInfo() {
    var info = {};
    if (this.isScriptHashOut()) {
      info.hashBuffer = this.getData();
      info.type = Address.PayToScriptHash;
    } else if (this.isPublicKeyHashOut()) {
      info.hashBuffer = this.getData();
      info.type = Address.PayToPublicKeyHash;
    } else {
      return false;
    }
    return info;
  }

  /**
   * Will return the associated input scriptSig address information object
   * @return {Address|boolean}
   * @private
   */
  _getInputAddressInfo() {
    var info = {};
    if (this.isPublicKeyHashIn()) {
      // hash the publickey found in the scriptSig
      info.hashBuffer = Hash.sha256ripemd160(this.chunks[1].buf);
      info.type = Address.PayToPublicKeyHash;
    } else if (this.isScriptHashIn()) {
      // hash the redeemscript found at the end of the scriptSig
      info.hashBuffer = Hash.sha256ripemd160(
        this.chunks[this.chunks.length - 1].buf,
      );
      info.type = Address.PayToScriptHash;
    } else {
      return false;
    }
    return info;
  }

  /**
   * @param {Network=} network
   * @return {Address|boolean} the associated address for this script if possible, or false
   */
  toAddress(network) {
    var info = this.getAddressInfo();
    if (!info) {
      return false;
    }
    info.network = Networks.get(network) || this._network ||
      Networks.defaultNetwork;
    return new Address(info);
  }

  /**
   * Analogous to bitcoind's FindAndDelete. Find and delete equivalent chunks,
   * typically used with push data chunks.  Note that this will find and delete
   * not just the same data, but the same data with the same push data op as
   * produced by default. i.e., if a pushdata in a tx does not use the minimal
   * pushdata op, then when you try to remove the data it is pushing, it will not
   * be removed, because they do not use the same pushdata op.
   */
  findAndDelete(script) {
    var buf = script.toBuffer();
    var hex = buf.toString("hex");
    var chunks = this.chunks;
    for (var i = 0; i < chunks.length; i++) {
      var script2 = Script.fromChunks([chunks[i]]);
      var buf2 = script2.toBuffer();
      var hex2 = buf2.toString("hex");
      if (hex === hex2) {
        chunks.splice(i, 1);
        this.buffer = Script.fromChunks(chunks).toBuffer();
      }
    }
    return this;
  }

  /**
   * Comes from bitcoind's script interpreter CheckMinimalPush function
   * @returns {boolean} if the chunk {i} is the smallest way to push that particular data.
   */
  checkMinimalPush(i) {
    var chunk = this.chunks[i];
    var buf = chunk.buf;
    var opcodenum = chunk.opcodenum;
    if (!buf) {
      return true;
    }
    if (buf.length === 0) {
      // Could have used OP_0.
      return opcodenum === Opcode.OP_0;
    } else if (buf.length === 1 && buf[0] >= 1 && buf[0] <= 16) {
      // Could have used OP_1 .. OP_16.
      return opcodenum === Opcode.OP_1 + (buf[0] - 1);
    } else if (buf.length === 1 && buf[0] === 0x81) {
      // Could have used OP_1NEGATE
      return opcodenum === Opcode.OP_1NEGATE;
    } else if (buf.length <= 75) {
      // Could have used a direct push (opcode indicating number of bytes pushed + those bytes).
      return opcodenum === buf.length;
    } else if (buf.length <= 255) {
      // Could have used OP_PUSHDATA.
      return opcodenum === Opcode.OP_PUSHDATA1;
    } else if (buf.length <= 65535) {
      // Could have used OP_PUSHDATA2.
      return opcodenum === Opcode.OP_PUSHDATA2;
    }
    return true;
  }

  /**
   * Comes from bitcoind's script DecodeOP_N function
   * @param {number} opcode
   * @returns {number} numeric value in range of 0 to 16
   */
  _decodeOP_N(opcode) {
    if (opcode === Opcode.OP_0) {
      return 0;
    } else if (opcode >= Opcode.OP_1 && opcode <= Opcode.OP_16) {
      return opcode - (Opcode.OP_1 - 1);
    } else {
      throw new Error("Invalid opcode: " + JSON.stringify(opcode));
    }
  }

  /**
   * Comes from bitcoind's script GetSigOpCount(boolean) function
   * @param {boolean} use current (true) or pre-version-0.6 (false) logic
   * @returns {number} number of signature operations required by this script
   */
  getSignatureOperationsCount(accurate) {
    accurate = _.isUndefined(accurate) ? true : accurate;
    var self = this;
    var n = 0;
    var lastOpcode = Opcode.OP_INVALIDOPCODE;
    _.each(self.chunks, function getChunk(chunk) {
      var opcode = chunk.opcodenum;
      if (opcode === Opcode.OP_CHECKSIG || opcode === Opcode.OP_CHECKSIGVERIFY) {
        n++;
      } else if (
        opcode === Opcode.OP_CHECKMULTISIG ||
        opcode === Opcode.OP_CHECKMULTISIGVERIFY
      ) {
        if (accurate && lastOpcode >= Opcode.OP_1 && lastOpcode <= Opcode.OP_16) {
          n += self._decodeOP_N(lastOpcode);
        } else {
          n += 20;
        }
      }
      lastOpcode = opcode;
    });
    return n;
  }
}

Script.types = {};
Script.types.UNKNOWN = "Unknown";
Script.types.PUBKEY_OUT = "Pay to public key";
Script.types.PUBKEY_IN = "Spend from public key";
Script.types.PUBKEYHASH_OUT = "Pay to public key hash";
Script.types.PUBKEYHASH_IN = "Spend from public key hash";
Script.types.SCRIPTHASH_OUT = "Pay to script hash";
Script.types.SCRIPTHASH_IN = "Spend from script hash";
Script.types.MULTISIG_OUT = "Pay to multisig";
Script.types.MULTISIG_IN = "Spend from multisig";
Script.types.DATA_OUT = "Data push";
Script.types.SAFE_DATA_OUT = "Safe data push";

Script.OP_RETURN_STANDARD_SIZE = 220;

Script.outputIdentifiers = {};
Script.outputIdentifiers.PUBKEY_OUT = Script.prototype.isPublicKeyOut;
Script.outputIdentifiers.PUBKEYHASH_OUT = Script.prototype.isPublicKeyHashOut;
Script.outputIdentifiers.MULTISIG_OUT = Script.prototype.isMultisigOut;
Script.outputIdentifiers.SCRIPTHASH_OUT = Script.prototype.isScriptHashOut;
Script.outputIdentifiers.DATA_OUT = Script.prototype.isDataOut;
Script.outputIdentifiers.SAFE_DATA_OUT = Script.prototype.isSafeDataOut;

Script.inputIdentifiers = {};
Script.inputIdentifiers.PUBKEY_IN = Script.prototype.isPublicKeyIn;
Script.inputIdentifiers.PUBKEYHASH_IN = Script.prototype.isPublicKeyHashIn;
Script.inputIdentifiers.MULTISIG_IN = Script.prototype.isMultisigIn;
Script.inputIdentifiers.SCRIPTHASH_IN = Script.prototype.isScriptHashIn;

export default Script;
