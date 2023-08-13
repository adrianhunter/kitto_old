import _ from "../../util/_.js";
import * as $ from "../../util/preconditions.js";
import errors from "../../errors/index.js";
import BufferWriter from "../../encoding/bufferwriter.js";
import { Buffer as buffer } from "buffer";
import * as JSUtil from "../../util/js.js";
import Script from "../../script/index.js";
import Sighash from "../sighash.js";
import Output from "../output.js";
import Signature from "../../crypto/signature.js";
import TransactionSignature from "../signature.js";
import Hash from "../../crypto/hash.js";
import Interpreter from "../../script/interpreter.js";
import Opcode from "../../opcode.js";
import PrivateKey from "../../privatekey.js";

var MAXINT = 0xffffffff; // Math.pow(2, 32) - 1;
var DEFAULT_RBF_SEQNUMBER = MAXINT - 2;
var DEFAULT_SEQNUMBER = MAXINT;
var DEFAULT_LOCKTIME_SEQNUMBER = MAXINT - 1;

function getLowSPreimage(
  tx,
  sigtype,
  inputIndex,
  inputLockingScript,
  inputAmount,
) {
  var i = 0;
  do {
    var preimage = Sighash.sighashPreimage(
      tx,
      sigtype,
      inputIndex,
      inputLockingScript,
      inputAmount,
    );

    var sighash = Hash.sha256sha256(preimage);

    if (
      _.isPositiveNumber(sighash.readUInt8()) &&
      _.isPositiveNumber(sighash.readUInt8(31))
    ) {
      return preimage;
    }

    tx.nLockTime++;
  } while (i < Number.MAX_SAFE_INTEGER);
}

class Input {
  constructor(params) {
    if (!(this instanceof Input)) {
      return new Input(params);
    }
    if (params) {
      return this._fromObject(params);
    }
  }

  get script() {
    if (this.isNull()) {
      return null;
    }
    if (!this._script) {
      this._script = new Script(this._scriptBuffer);
      this._script._isInput = true;
    }
    return this._script;
  }

  static fromObject(obj) {
    $.checkArgument(_.isObject(obj));
    var input = new Input();
    return input._fromObject(obj);
  }

  _fromObject(params) {
    var prevTxId;
    if (_.isString(params.prevTxId) && JSUtil.isHexa(params.prevTxId)) {
      prevTxId = buffer.Buffer.from(params.prevTxId, "hex");
    } else {
      prevTxId = params.prevTxId;
    }
    this.output = params.output
      ? (params.output instanceof Output
        ? params.output
        : new Output(params.output))
      : undefined;
    this.prevTxId = prevTxId || params.txidbuf;
    this.outputIndex = _.isUndefined(params.outputIndex)
      ? params.txoutnum
      : params.outputIndex;
    this.sequenceNumber = _.isUndefined(params.sequenceNumber)
      ? (_.isUndefined(params.seqnum) ? DEFAULT_SEQNUMBER : params.seqnum)
      : params.sequenceNumber;
    if (_.isUndefined(params.script) && _.isUndefined(params.scriptBuffer)) {
      throw new errors.Transaction.Input.MissingScript();
    }
    this.setScript(params.scriptBuffer || params.script);
    return this;
  }

  static fromBufferReader(br) {
    var input = new Input();
    input.prevTxId = br.readReverse(32);
    input.outputIndex = br.readUInt32LE();
    input._scriptBuffer = br.readVarLengthBuffer();
    input.sequenceNumber = br.readUInt32LE();
    // TODO: return different classes according to which input it is
    // e.g: CoinbaseInput, PublicKeyHashInput, MultiSigScriptHashInput, etc.
    return input;
  }

  toBufferWriter(writer) {
    if (!writer) {
      writer = new BufferWriter();
    }
    writer.writeReverse(this.prevTxId);
    writer.writeUInt32LE(this.outputIndex);
    var script = this._scriptBuffer;
    writer.writeVarintNum(script.length);
    writer.write(script);
    writer.writeUInt32LE(this.sequenceNumber);
    return writer;
  }

  setScript(script) {
    this._script = null;
    if (script instanceof Script) {
      this._script = script;
      this._script._isInput = true;
      this._scriptBuffer = script.toBuffer();
    } else if (script === null) {
      this._script = Script.empty();
      this._script._isInput = true;
      this._scriptBuffer = this._script.toBuffer();
    } else if (JSUtil.isHexa(script)) {
      // hex string script
      this._scriptBuffer = buffer.Buffer.from(script, "hex");
    } else if (_.isString(script)) {
      // human readable string script
      this._script = new Script(script);
      this._script._isInput = true;
      this._scriptBuffer = this._script.toBuffer();
    } else if (Buffer.isBuffer(script)) {
      // buffer script
      this._scriptBuffer = buffer.Buffer.from(script);
    } else {
      throw new TypeError("Invalid argument type: script");
    }
    return this;
  }

  /**
   * Retrieve signatures for the provided PrivateKey.
   *
   * @param {Transaction} transaction - the transaction to be signed
   * @param {PrivateKey | Array} privateKeys - the private key to use when signing
   * @param {number} inputIndex - the index of this input in the provided transaction
   * @param {number} sigType - defaults to Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID
   * @abstract
   */
  getSignatures(transaction, privateKeys, inputIndex, sigtype) {
    $.checkState(this.output instanceof Output);
    sigtype = sigtype || (Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID);
    var results = [];
    if (privateKeys instanceof PrivateKey) {
      results.push(
        new TransactionSignature({
          publicKey: privateKeys.publicKey,
          prevTxId: this.prevTxId,
          outputIndex: this.outputIndex,
          inputIndex: inputIndex,
          signature: Sighash.sign(
            transaction,
            privateKeys,
            sigtype,
            inputIndex,
            this.output.script,
            this.output.satoshisBN,
          ),
          sigtype: sigtype,
        }),
      );
    } else if (_.isArray(privateKeys)) {
      var self = this;

      _.each(privateKeys, function (privateKey, index) {
        var sigtype_ = sigtype;
        if (_.isArray(sigtype)) {
          sigtype_ = sigtype[index] ||
            (Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID);
        }
        results.push(
          new TransactionSignature({
            publicKey: privateKey.publicKey,
            prevTxId: self.prevTxId,
            outputIndex: self.outputIndex,
            inputIndex: inputIndex,
            signature: Sighash.sign(
              transaction,
              privateKey,
              sigtype_,
              inputIndex,
              self.output.script,
              self.output.satoshisBN,
            ),
            sigtype: sigtype_,
          }),
        );
      });
    }
    return results;
  }

  /**
   * Retrieve preimage for the Input.
   *
   * @param {Transaction} transaction - the transaction to be signed
   * @param {number} inputIndex - the index of this input in the provided transaction
   * @param {number} sigType - defaults to Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID
   * @param {boolean} isLowS - true if the sig hash is safe for low s.
   * @abstract
   */
  getPreimage(transaction, inputIndex, sigtype, isLowS) {
    $.checkState(this.output instanceof Output);
    sigtype = sigtype || (Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID);
    isLowS = isLowS || false;
    return isLowS
      ? getLowSPreimage(
        transaction,
        sigtype,
        inputIndex,
        this.output.script,
        this.output.satoshisBN,
      )
      : Sighash.sighashPreimage(
        transaction,
        sigtype,
        inputIndex,
        this.output.script,
        this.output.satoshisBN,
      );
  }

  isFullySigned() {
    throw new errors.AbstractMethodInvoked("Input#isFullySigned");
  }

  isFinal() {
    return this.sequenceNumber === Input.MAXINT;
  }

  addSignature() {
    // throw new errors.AbstractMethodInvoked('Input#addSignature')
  }

  clearSignatures() {
    // throw new errors.AbstractMethodInvoked('Input#clearSignatures')
  }

  isValidSignature(transaction, signature) {
    // FIXME: Refactor signature so this is not necessary
    signature.signature.nhashtype = signature.sigtype;
    return Sighash.verify(
      transaction,
      signature.signature,
      signature.publicKey,
      signature.inputIndex,
      this.output.script,
      this.output.satoshisBN,
    );
  }

  /**
   * @returns true if this is a coinbase input (represents no input)
   */
  isNull() {
    return this.prevTxId.toString("hex") ===
        "0000000000000000000000000000000000000000000000000000000000000000" &&
      this.outputIndex === 0xffffffff;
  }

  _estimateSize() {
    return this.toBufferWriter().toBuffer().length;
  }

  verify(transaction, inputIndex) {
    $.checkState(this.output instanceof Output);
    $.checkState(this.script instanceof Script);
    $.checkState(this.output.script instanceof Script);

    var us = this.script;
    var ls = this.output.script;
    var inputSatoshis = this.output.satoshisBN;

    Interpreter.MAX_SCRIPT_ELEMENT_SIZE = Number.MAX_SAFE_INTEGER;
    Interpreter.MAXIMUM_ELEMENT_SIZE = Number.MAX_SAFE_INTEGER;

    const bsi = new Interpreter();

    let failedAt = {};

    bsi.stepListener = function (step) {
      if (
        step.fExec ||
        (Opcode.OP_IF <= step.opcode.toNumber() &&
          step.opcode.toNumber() <= Opcode.OP_ENDIF)
      ) {
        if (
          (Opcode.OP_IF <= step.opcode.toNumber() &&
            step.opcode.toNumber() <= Opcode.OP_ENDIF) ||
          step.opcode.toNumber() === Opcode.OP_RETURN
        ) {
          /** Opreturn */ failedAt.opcode = step.opcode;
        } else {
          failedAt = step;
        }
      }
    };

    var success = bsi.verify(
      us,
      ls,
      transaction,
      inputIndex,
      Interpreter.DEFAULT_FLAGS,
      inputSatoshis,
    );

    if (failedAt.opcode) {
      failedAt.opcode = failedAt.opcode.toNumber();
    }

    return { success, error: bsi.errstr, failedAt: success ? {} : failedAt };
  }
}

Input.MAXINT = MAXINT;
Input.DEFAULT_SEQNUMBER = DEFAULT_SEQNUMBER;
Input.DEFAULT_LOCKTIME_SEQNUMBER = DEFAULT_LOCKTIME_SEQNUMBER;
Input.DEFAULT_RBF_SEQNUMBER = DEFAULT_RBF_SEQNUMBER;
// txid + output index + sequence number
Input.BASE_SIZE = 32 + 4 + 4;

Input.prototype.toObject = Input.prototype.toJSON = function toObject() {
  var obj = {
    prevTxId: this.prevTxId.toString("hex"),
    outputIndex: this.outputIndex,
    sequenceNumber: this.sequenceNumber,
    script: this._scriptBuffer.toString("hex"),
  };
  // add human readable form if input contains valid script
  if (this.script) {
    obj.scriptString = this.script.toString();
  }
  if (this.output) {
    obj.output = this.output.toObject();
  }
  return obj;
};

export default Input;
