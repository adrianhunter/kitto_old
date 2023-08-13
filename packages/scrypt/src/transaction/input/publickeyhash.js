import inherits from "inherits";

import * as $ from "../../util/preconditions.js";

import Hash from "../../crypto/hash.js";
import Input from "./input.js";
import Output from "../output.js";
import Sighash from "../sighash.js";
import Script from "../../script/index.js";
import Signature from "../../crypto/signature.js";
import TransactionSignature from "../signature.js";

/**
 * Represents a special kind of input of PayToPublicKeyHash kind.
 * @constructor
 */
class PublicKeyHashInput extends Input {
  constructor() {
    Input.apply(this, arguments);
  }

  /**
   * @param {Transaction} transaction - the transaction to be signed
   * @param {PrivateKey} privateKey - the private key with which to sign the transaction
   * @param {number} index - the index of the input in the transaction input vector
   * @param {number=} sigtype - the type of signature, defaults to Signature.SIGHASH_ALL
   * @param {Buffer=} hashData - the precalculated hash of the public key associated with the privateKey provided
   * @return {Array} of objects that can be
   */
  getSignatures(transaction, privateKey, index, sigtype, hashData) {
    $.checkState(this.output instanceof Output);
    hashData = hashData ||
      Hash.sha256ripemd160(privateKey.publicKey.toBuffer());
    sigtype = sigtype || (Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID);

    if (hashData.equals(this.output.script.getPublicKeyHash())) {
      return [
        new TransactionSignature({
          publicKey: privateKey.publicKey,
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
   * @return {PublicKeyHashInput} this, for chaining
   */
  addSignature(transaction, signature) {
    $.checkState(
      this.isValidSignature(transaction, signature),
      "Signature is invalid",
    );

    this.setScript(Script.buildPublicKeyHashIn(
      signature.publicKey,
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
    return this.script.isPublicKeyHashIn();
  }

  _estimateSize() {
    return Input.BASE_SIZE + PublicKeyHashInput.SCRIPT_MAX_SIZE;
  }
}

// 32   txid
// 4    output index
// --- script ---
// 1    script size (VARINT)
// 1    signature size (OP_PUSHDATA)
// <=72 signature (DER + SIGHASH type)
// 1    public key size (OP_PUSHDATA)
// 65   uncompressed public key
//
// 4    sequence number
PublicKeyHashInput.SCRIPT_MAX_SIZE = 140;

export default PublicKeyHashInput;
