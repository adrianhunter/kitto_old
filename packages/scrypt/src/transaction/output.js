import _ from "../util/_.js";
import BN from "../crypto/bn.js";
import { Buffer as buffer } from "buffer";
import * as JSUtil from "../util/js.js";
import BufferWriter from "../encoding/bufferwriter.js";
import Varint from "../encoding/varint.js";
import Script from "../script/index.js";
import * as $ from "../util/preconditions.js";
import errors from "../errors/index.js";

var MAX_SAFE_INTEGER = 0x1fffffffffffff;

class Output {
  constructor(args) {
    if (!(this instanceof Output)) {
      return new Output(args);
    }
    if (_.isObject(args)) {
      this.satoshis = args.satoshis;
      if (Buffer.isBuffer(args.script)) {
        this.setScriptFromBuffer(args.script);
      } else {
        var script;
        if (_.isString(args.script) && JSUtil.isHexa(args.script)) {
          script = buffer.Buffer.from(args.script, "hex");
        } else {
          script = args.script;
        }
        this.setScript(script);
      }
    } else {
      throw new TypeError("Unrecognized argument for Output");
    }
  }

  get script() {
    return this._script;
  }

  get satoshis() {
    return this._satoshis;
  }

  set satoshis(num) {
    if (num instanceof BN) {
      this._satoshisBN = num;
      this._satoshis = num.toNumber();
    } else if (_.isString(num)) {
      this._satoshis = parseInt(num);
      this._satoshisBN = BN.fromNumber(this._satoshis);
    } else {
      $.checkArgument(
        JSUtil.isNaturalNumber(num),
        "Output satoshis is not a natural number",
      );
      this._satoshisBN = BN.fromNumber(num);
      this._satoshis = num;
    }
    $.checkState(
      JSUtil.isNaturalNumber(this._satoshis),
      "Output satoshis is not a natural number",
    );
  }

  invalidSatoshis() {
    if (this._satoshis > MAX_SAFE_INTEGER) {
      return "transaction txout satoshis greater than max safe integer";
    }
    if (this._satoshis !== this._satoshisBN.toNumber()) {
      return "transaction txout satoshis has corrupted value";
    }
    if (this._satoshis < 0) {
      return "transaction txout negative";
    }
    return false;
  }

  get satoshisBN() {
    return this._satoshisBN;
  }

  set satoshisBN(num) {
    this._satoshisBN = num;
    this._satoshis = num.toNumber();
    $.checkState(
      JSUtil.isNaturalNumber(this._satoshis),
      "Output satoshis is not a natural number",
    );
  }

  static fromObject(data) {
    return new Output(data);
  }

  setScriptFromBuffer(buffer) {
    try {
      this._script = Script.fromBuffer(buffer);
      this._script._isOutput = true;
    } catch (e) {
      if (e instanceof errors.Script.InvalidBuffer) {
        this._script = null;
      } else {
        throw e;
      }
    }
  }

  setScript(script) {
    if (script instanceof Script) {
      this._script = script;
      this._script._isOutput = true;
    } else if (_.isString(script)) {
      this._script = Script.fromString(script);
      this._script._isOutput = true;
    } else if (Buffer.isBuffer(script)) {
      this.setScriptFromBuffer(script);
    } else {
      throw new TypeError("Invalid argument type: script");
    }
    return this;
  }

  inspect() {
    var scriptStr;
    if (this.script) {
      scriptStr = this.script.inspect();
    }
    return "<Output (" + this.satoshis + " sats) " + scriptStr + ">";
  }

  static fromBufferReader(br) {
    var obj = {};
    obj.satoshis = br.readUInt64LEBN();
    var size = br.readVarintNum();
    if (size !== 0) {
      if (br.remaining() < size) {
        throw new TypeError("Unrecognized Output");
      }
      obj.script = br.read(size);
    } else {
      obj.script = buffer.Buffer.from([]);
    }
    return new Output(obj);
  }

  toBufferWriter(writer) {
    if (!writer) {
      writer = new BufferWriter();
    }
    writer.writeUInt64LEBN(this._satoshisBN);
    var script = this._script.toBuffer();
    writer.writeVarintNum(script.length);
    writer.write(script);
    return writer;
  }

  // 8    value
  // ???  script size (VARINT)
  // ???  script
  getSize() {
    var scriptSize = this.script.toBuffer().length;
    var varintSize = Varint(scriptSize).toBuffer().length;
    return 8 + varintSize + scriptSize;
  }
}

Output.prototype.toObject = Output.prototype.toJSON = function toObject() {
  var obj = {
    satoshis: this.satoshis,
  };
  obj.script = this._script.toBuffer().toString("hex");
  return obj;
};

export default Output;
