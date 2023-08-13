import _ from "../../util/_.js";
import Input from "./input.js";
import Output from "../output.js";
import * as $ from "../../util/preconditions.js";

import Script from "../../script/index.js";
import Signature from "../../crypto/signature.js";
import Sighash from "../sighash.js";
import TransactionSignature from "../signature.js";
import PublicKey from "../../publickey.js";
import Varint from "../../encoding/varint.js";

/**
 * @constructor
 */
class MultiSigInput extends Input {
  constructor(input, pubkeys, threshold, signatures) {
    Input.apply(this, arguments);
    var self = this;
    pubkeys = pubkeys || input.publicKeys;
    threshold = threshold || input.threshold;
    signatures = signatures || input.signatures;
    this.publicKeys = pubkeys.map((k) => k.toString("hex")).sort().map((k) =>
      new PublicKey(k)
    );
    $.checkState(
      Script.buildMultisigOut(this.publicKeys, threshold).equals(
        this.output.script,
      ),
      "Provided public keys don't match to the provided output script",
    );
    this.publicKeyIndex = {};
    _.each(this.publicKeys, function (publicKey, index) {
      self.publicKeyIndex[publicKey.toString()] = index;
    });
    this.threshold = threshold;
    // Empty array of signatures
    this.signatures = signatures
      ? this._deserializeSignatures(signatures)
      : new Array(this.publicKeys.length);
  }

  toObject() {
    var obj = Input.prototype.toObject.apply(this, arguments);
    obj.threshold = this.threshold;
    obj.publicKeys = _.map(this.publicKeys, function (publicKey) {
      return publicKey.toString();
    });
    obj.signatures = this._serializeSignatures();
    return obj;
  }

  _deserializeSignatures(signatures) {
    return _.map(signatures, function (signature) {
      if (!signature) {
        return undefined;
      }
      return new TransactionSignature(signature);
    });
  }

  _serializeSignatures() {
    return _.map(this.signatures, function (signature) {
      if (!signature) {
        return undefined;
      }
      return signature.toObject();
    });
  }

  getSignatures(transaction, privateKey, index, sigtype) {
    $.checkState(this.output instanceof Output);
    sigtype = sigtype || (Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID);

    var self = this;
    var results = [];
    _.each(this.publicKeys, function (publicKey) {
      if (publicKey.toString() === privateKey.publicKey.toString()) {
        results.push(
          new TransactionSignature({
            publicKey: privateKey.publicKey,
            prevTxId: self.prevTxId,
            outputIndex: self.outputIndex,
            inputIndex: index,
            signature: Sighash.sign(
              transaction,
              privateKey,
              sigtype,
              index,
              self.output.script,
              self.output.satoshisBN,
            ),
            sigtype: sigtype,
          }),
        );
      }
    });

    return results;
  }

  addSignature(transaction, signature) {
    $.checkState(
      !this.isFullySigned(),
      "All needed signatures have already been added",
    );
    $.checkArgument(
      !_.isUndefined(this.publicKeyIndex[signature.publicKey.toString()]),
      "Signature has no matching public key",
    );
    $.checkState(this.isValidSignature(transaction, signature));
    this.signatures[this.publicKeyIndex[signature.publicKey.toString()]] =
      signature;
    this._updateScript();
    return this;
  }

  _updateScript() {
    this.setScript(Script.buildMultisigIn(
      this.publicKeys,
      this.threshold,
      this._createSignatures(),
    ));
    return this;
  }

  _createSignatures() {
    return _.map(
      _.filter(this.signatures, function (signature) {
        return !_.isUndefined(signature);
      }),
      function (signature) {
        return Buffer.concat([
          signature.signature.toDER(),
          Buffer.from([signature.sigtype & 0xff]),
        ]);
      },
    );
  }

  clearSignatures() {
    this.signatures = new Array(this.publicKeys.length);
    this._updateScript();
  }

  isFullySigned() {
    return this.countSignatures() === this.threshold;
  }

  countMissingSignatures() {
    return this.threshold - this.countSignatures();
  }

  countSignatures() {
    return _.reduce(this.signatures, function (sum, signature) {
      return sum + (!!signature);
    }, 0);
  }

  publicKeysWithoutSignature() {
    var self = this;
    return _.filter(this.publicKeys, function (publicKey) {
      return !(self.signatures[self.publicKeyIndex[publicKey.toString()]]);
    });
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
   * @param {Buffer[]} signatures
   * @param {PublicKey[]} publicKeys
   * @param {Transaction} transaction
   * @param {Integer} inputIndex
   * @param {Input} input
   * @returns {TransactionSignature[]}
   */
  static normalizeSignatures(
    transaction,
    input,
    inputIndex,
    signatures,
    publicKeys,
  ) {
    return publicKeys.map(function (pubKey) {
      var signatureMatch = null;
      signatures = signatures.filter(function (signatureBuffer) {
        if (signatureMatch) {
          return true;
        }

        var signature = new TransactionSignature({
          signature: Signature.fromTxFormat(signatureBuffer),
          publicKey: pubKey,
          prevTxId: input.prevTxId,
          outputIndex: input.outputIndex,
          inputIndex: inputIndex,
          sigtype: Signature.SIGHASH_ALL,
        });

        signature.signature.nhashtype = signature.sigtype;
        var isMatch = Sighash.verify(
          transaction,
          signature.signature,
          signature.publicKey,
          signature.inputIndex,
          input.output.script,
        );

        if (isMatch) {
          signatureMatch = signature;
          return false;
        }

        return true;
      });

      return signatureMatch || null;
    });
  }

  _estimateSize() {
    var scriptSize = 1 + this.threshold * MultiSigInput.SIGNATURE_SIZE;
    return Input.BASE_SIZE + Varint(scriptSize).toBuffer().length + scriptSize;
  }
}

// 32   txid
// 4    output index
// --- script ---
// ??? script size (VARINT)
// 1    OP_0
// --- signature list ---
//      1       signature size (OP_PUSHDATA)
//      <=72    signature (DER + SIGHASH type)
//
// 4    sequence number
MultiSigInput.SIGNATURE_SIZE = 73;

export default MultiSigInput;
