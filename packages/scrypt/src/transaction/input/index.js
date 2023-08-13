// let _module_exports_ = {};
// export {_module_exports_ as default};
import Input   from './input.js'

import PublicKey from './publickey.js'
import PublicKeyHash from './publickeyhash.js'
import MultiSig from './multisig.js'
import MultiSigScriptHash from './multisigscripthash.js'



Input.PublicKey = PublicKey
Input.PublicKeyHash = PublicKeyHash
Input.MultiSig = MultiSig
Input.MultiSigScriptHash = MultiSigScriptHash

export default Input
