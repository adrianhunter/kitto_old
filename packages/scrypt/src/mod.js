// // // module information
// // // bsv.version = 'v' + "1.5.6"
// // // bsv.versionGuard = function (version) {
// // //   if (version !== undefined) {
// // //     var message = `
// // //       More than one instance of bsv found.
// // //       Please make sure to require bsv and check that submodules do
// // //       not also include their own bsv dependency.`
// // //     console.warn(message)
// // //   }
// // // }

// // // crypto
import BN from "./crypto/bn.js";

import ECDSA from "./crypto/ecdsa.js";
import Hash from "./crypto/hash.js";
import Random from "./crypto/random.js";
import Point from "./crypto/point.js";
import Signature from "./crypto/signature.js";

export const crypto = {
  BN,
  ECDSA,
  Hash,
  Random,
  Point,
  Signature,
};

console.log(crypto);

// // encoding
// // bsv.encoding = {}
import Base58 from "./encoding/base58.js";
import Base58Check from "./encoding/base58check.js";
import BufferReader from "./encoding/bufferreader.js";
import BufferWriter from "./encoding/bufferwriter.js";
import Varint from "./encoding/varint.js";

export const encoding = {
  Base58,
  Base58Check,
  BufferReader,
  BufferWriter,
  Varint,
};

// // utilities
// // bsv.util = {}
import * as js from "./util/js.js";
import * as preconditions from "./util/preconditions.js";
export const util = {
  js,
  preconditions,
};
// // errors thrown by the library
// export * as errors from "./errors/index.js";

// // main bitcoin library
// // import Address from "./address.js";

// // console.log(Address);
import Block from "./block/index.js";
import MerkleBlock from "./block/merkleblock.js";
import BlockHeader from "./block/blockheader.js";
import HDPrivateKey from "./hdprivatekey.js";
import HDPublicKey from "./hdpublickey.js";
import Networks from "./networks.js";
import Opcode from "./opcode.js";
import PrivateKey from "./privatekey.js";
import PublicKey from "./publickey.js";
import Script from "./script/index.js";
import Transaction from "./transaction/index.js";
import Address from "./address.js";

export { Block };
export { MerkleBlock };
export { BlockHeader };
export { HDPrivateKey };
export { HDPublicKey };
export { Networks };
export { Opcode };
export { PrivateKey };
export { PublicKey };
export { Script };
export { Transaction };

export default {
  encoding,
  crypto,
  util,
  Block,
  MerkleBlock,
  BlockHeader,
  HDPrivateKey,
  HDPublicKey,
  Networks,
  Opcode,
  PrivateKey,
  PublicKey,
  Script,
  Transaction,
  Address,
};
// // // dependencies, subject to change
// // // bsv.deps = {}

// // import * as bnjs from "bn.js";
// // import * as bs58 from "bs58";
// // // import * as Buffer = Buffer
// // import * as elliptic from "elliptic";
// // import _ from "./util/_.js";

// // Internal usage, exposed for testing/advanced tweaking
// // bsv.Transaction.sighash = require('./lib/transaction/sighash')
