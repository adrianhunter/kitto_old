import inherits from "inherits";

import * as $ from "../../util/preconditions.js";

import Input from "./input.js";
import Output from "../output.js";
import Sighash from "../sighash.js";
import Script from "../../script/index.js";
import Signature from "../../crypto/signature.js";
import TransactionSignature from "../signature.js";

/**
 * Represents a special kind of input of PayToPublicKey kind.
 * @constructor
 */
class PublicKeyInput extends Input {
  constructor() {
    Input.apply(this, arguments);
  }

  /**
   * @param {Transaction} transaction - the transaction to be signed
   * @param {PrivateKey} privateKey - the private key with which to sign the transaction
   * @param {number} index - the index of the input in the transaction input vector
   * @param {number=} sigtype - the type of signature, defaults to Signature.SIGHASH_ALL
   * @return {Array} of objects that can be
   */
  getSignatures(transaction, privateKey, index, sigtype) {
    $.checkState(this.output instanceof Output);
    sigtype = sigtype || (Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID);
    var publicKey = privateKey.toPublicKey();
    if (
      publicKey.toString() === this.output.script.getPublicKey().toString("hex")
    ) {
      return [
        new TransactionSignature({
          publicKey: publicKey,
          prevTxId: this.prevTxId,
          outputIndex: this.outputIndex,
          inputIndex: index,
          signature: Sighash.sign(
            transaction,
            privateKey,
            sigtype,
            index,
            this.output.script,
            this.output.satoshisBN,
          ),
          sigtype: sigtype,
        }),
      ];
    }
    return [];
  }

  /**
   * Add the provided signature
   *
   * @param {Object} signature
   * @param {PublicKey} signature.publicKey
   * @param {Signature} signature.signature
   * @param {number=} signature.sigtype
   * @return {PublicKeyInput} this, for chaining
   */
  addSignature(transaction, signature) {
    $.checkState(
      this.isValidSignature(transaction, signature),
      "Signature is invalid",
    );
    this.setScript(Script.buildPublicKeyIn(
      signature.signature.toDER(),
      signature.sigtype,
    ));
    return this;
  }

  /**
   * Clear the input's signature
   * @return {PublicKeyHashInput} this, for chaining
   */
  clearSignatures() {
    this.setScript(Script.empty());
    return this;
  }

  /**
   * Query whether the input is signed
   * @return {boolean}
   */
  isFullySigned() {
    return this.script.isPublicKeyIn();
  }

  _estimateSize() {
    return Input.BASE_SIZE + PublicKeyInput.SCRIPT_MAX_SIZE;
  }
}

// 32   txid
// 4    output index
// ---
// 1    script size (VARINT)
// 1    signature size (OP_PUSHDATA)
// <=72 signature (DER + SIGHASH type)
// ---
// 4    sequence number
PublicKeyInput.SCRIPT_MAX_SIZE = 74;

export default PublicKeyInput;
