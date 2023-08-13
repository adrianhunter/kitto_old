// let _module_exports_ = {};
// export {_module_exports_ as default};
import Transaction from './transaction.js'

import Input from './input/index.js'
import Output from './output.js'
import UnspentOutput from './unspentoutput.js'
import Signature from './signature.js'
import Sighash from './sighash.js'


Transaction.Input = Input

Transaction.Output = Output
Transaction.UnspentOutput = UnspentOutput
Transaction.Signature = Signature
Transaction.Sighash = Sighash


export default Transaction
