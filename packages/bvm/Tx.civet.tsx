import { generateTxSignature } from "./Gen.civet";
import { encodeHex, encodeTx } from "./Encode.civet";
import { decodeHex, decodeTx } from "./Decode.civet";
import { extractP2PKHLockScriptPubkeyhash } from "./Gen.civet";
import { isP2PKHLockScript } from "./Validate.civet";
import { writePushData } from "./Write.civet";
import { areBuffersEqual } from "./Validate.civet";
import { calculateTxid } from "./Gen.civet";
import { PrivKey } from "./PrivKey.civet";
import { Script } from "./Script.civet";
import { BufferWriter } from "./BufferWriter.civet";
import { verifyTx } from "./Verify.civet";
import { Input } from "./Input.civet";
// { Address } from ./Address.civet
import { Output } from "./Output.civet"
// { Op } from 

export class Tx {
  _id: number  = Math.round(Math.random() * 100000)
  _hashPrevouts!: any
  _hashOutputsAll!: any
  _hashSequence!: any
  constructor(
    public version: number = 1,
    public inputs: Input[] = [],
    public outputs: Output[] = [],
    public locktime: number = 0
  ){}
}
  // @fromHex(hex: string) hex |> decodeHex |> @fromBuffer
  // @fromString(hex: string) hex |> @fromHex
  // //@ts-ignore
  // @fromBuffer(buffer: Buf) new Tx ...(buffer |> decodeTx |> Object.values)
  // toHex() @toBuffer() |> encodeHex
  // toString() @toHex()
  // toBuffer() 
  //   // @_calculateChange()
  //   @ |> encodeTx
  // // get hash()  @toBuffer() |> calculateTxid
  // sign(privateKey: PrivKey)
  //   for (let vin = 0; vin < this.inputs.length; vin++)
  //     input := this.inputs[vin]
  //     output := this.outputs[vin]
  //     continue if input.script.length
  //     continue if !output
  //     outputScript := output.script
  //     outputSatoshis := output.satoshis

  //     // if (!isP2PKHLockScript(output.script)) continue
  //     // if (
  //     //   !areBuffersEqual(
  //     //     extractP2PKHLockScriptPubkeyhash(output.script),
  //     //     privateKey.toAddress().pubkeyhash,
  //     //   )
  //     // ) continue

  //     txsignature := generateTxSignature(
  //       this
  //       vin
  //       //@ts-ignore
  //       outputScript
  //       outputSatoshis
  //       privateKey.number
  //       privateKey.toPublicKey().point
  //     )

  //     writer := new BufferWriter
  //     writePushData(writer, txsignature)
  //     writePushData(writer, privateKey.toPublicKey().toBuffer())
  //     script := writer.toBuffer()
  //     //@ts-ignore
  //     input.script = script |> Script.fromBuffer

  //   @
  // verify()
  //   parents := @inputs.map (_, i) => @outputs[i]
  //   verifyTx @, parents
  //   @


  // get fee () 
  //   const incompleteInputIndex = this.inputs.findIndex(x => !x.output)
  //   if (incompleteInputIndex !== -1) {
  //     const hint = `Hint: Set tx.inputs[${incompleteInputIndex}].output = new Transaction.Output(script, satoshis)`
  //     throw new Error(`missing previous output information for input ${incompleteInputIndex}\n\n${hint}`)
  //   }

    // const satoshisIn = this.inputs.reduce((prev, curr) => prev + curr.output.satoshis, 0)
    // const satoshisOut = this.outputs.reduce((prev, curr) => prev + curr.satoshis, 0)

    // return satoshisIn - satoshisOut

  // from (output: Output) {
  //   if Object.isFrozen @
  //     throw new Error 'transaction finalized'

  //   if Array.isArray output
  //     output.forEach (output) => @from output
  //     return @
    

  //   input := new Input output.txid, output.vout, [], 0xffffffff, output
  //   // this.inputs.push(input)

  //   return this
  // }

  // to (address: Address, satoshis: bigint)
  //   // if (Object.isFrozen(this)) throw new Error('transaction finalized')

  //   // address = Address.from(address)
  //   // verifySatoshis(satoshis)

  //   // const script = createP2PKHLockScript(address.pubkeyhash)
  //   // const output = new Output(script, satoshis, this)
  //   // this.outputs.push(output)

  //   // return this

  // input (input: Input)
  //   // if (Object.isFrozen(this)) throw new Error('transaction finalized')
  //   // if (typeof input !== 'object' || !input) throw new Error('bad input')

  //   // input = input instanceof Input
  //   //   ? input
  //   //   : new Input(
  //   //     typeof input.txid === 'undefined' && input.output ? input.output.txid : input.txid,
  //   //     typeof input.vout === 'undefined' && input.output ? input.output.vout : input.vout,
  //   //     input.script,
  //   //     input.sequence,
  //   //     input.output)

  //   // this.inputs.push(input)

  //   return @

  // output (output: Output) 
  //   if (Object.isFrozen(this)) throw new Error('transaction finalized')

  //   output = output instanceof Output ? output : new Output(output.script, output.satoshis, this)
  //   output.tx = this

  //   this.outputs.push(output)

  //   return @

  // change (address: Address)
  //   if (Object.isFrozen(this)) throw new Error('transaction finalized')

  //   if (@changeOutput) throw new Error('change output already added')

  //   const script = createP2PKHLockScript(Address.from(address).pubkeyhash)
  //   const output = new Output(script, 0, this)

  //   @outputs.push(output)
  //   @changeOutput = output

  //   return @


  // verify () {
  //   const parents = this.inputs.map(input => input.output)
  //   const minFeePerKb = this.feePerKb
  //   verifyTx(this, parents, minFeePerKb)
  //   return this
  // }

  // Calculates change and then locks a transaction so that no further changes may be made
  // finalize ()
  //   if Object.isFrozen @
  //     return @
  //   // @_calculateChange()
  //   Object.freeze @
  //   Object.freeze @inputs
  //   Object.freeze @outputs
  //   @inputs.forEach (input) => Object.freeze input
  //   @outputs.forEach (output) => Object.freeze output
  //   return @
  

  // _calculateChange () 
  //   if Object.isFrozen @
  //     return

  //   changeIndex := @outputs.indexOf @changeOutput
  //   if changeIndex is -1
  //     @changeOutput = undefined
  //     return

  //   @changeOutput.satoshis = 0

  //   currentFee := @fee
  //   expectedFee := Math.ceil(encodeTx(this).length * this.feePerKb / 1000)

  //   change := currentFee - expectedFee
  //   minDust := 1

  //   if change >= minDust
  //     @changeOutput.satoshis = change
  //   else
  //     @outputs.splice changeIndex, 1
  //     @changeOutput = undefined

  // setFeePerKb (satoshis) {
  //   if (Object.isFrozen(this)) throw new Error('transaction finalized')
  //   verifySatoshis(satoshis)
  //   this.feePerKb = satoshis
  //   return this
  // }

// test "Tx", ->
//   it "@ -> creates empty transaction", -> 
//     tx := new Tx
//     assert.equal tx.inputs.length, 0
//     assert.equal tx.outputs.length, 0
//   it "fromHex -> parses hexxxx string", -> 
//     dummyTxid := new Tx().hash
//     tx := new Tx()
//     // console.log tx
//   it 'fromString -> creates from string', ->
//     tx := new Tx
//     tx2 := tx.toString() |> Tx.fromString
//     assert.equal Array.from(tx2.toBuffer()), Array.from(tx.toBuffer())
//   it 'toString -> returns hex string', ->
//     privateKey := PrivKey.fromRandom()
//     // tx1 := new Tx().to(privateKey.toAddress(), 1000)
//     // tx2 := new Tx().fromOutput(tx1.outputs[0]).to(privateKey.toAddress(), 2000)
//     // expect(new bsv.Transaction(tx2.toString()).toString()).to.deep.equal(tx2.toString())
//     // expect(new bsv.Transaction(tx2.toHex()).toString()).to.deep.equal(tx2.toHex())
//     // it('returns hex string', () => {
   
//   it 'fromBuffer -> parses buffer', ->
//     dummyTxid := new Tx().hash
//     tx := new Tx
//     tx.version = 2
//     tx.locktime = 3

//     return
    // tx.inputs.push({ txid: dummyTxid, vout: 1, script: [], sequence: 5 })
    // tx.outputs.push({ script: [0], satoshis: 4 })
    // buffer := tx.toBuffer()
    // tx2 := Tx.fromBuffer buffer
    // assert.equal tx2.version, tx.version
    // assert.equal tx2.locktime, tx.locktime
    // assert.equal tx2.inputs.length, tx.inputs.length
    // assert.equal tx2.outputs.length, tx.outputs.length
    // assert.equal tx2.inputs[0].txid, tx.inputs[0].txid
    // assert.equal tx2.inputs[0].vout, tx.inputs[0].vout
    // assert.equal Array.from(tx2.inputs[0].script), Array.from(tx.inputs[0].script)
    // assert.equal tx2.inputs[0].sequence, tx.inputs[0].sequence
    // assert.equal Array.from(tx2.outputs[0].script), Array.from(tx.outputs[0].script)
    // assert.equal tx2.outputs[0].satoshis, tx.outputs[0].satoshis
  //   tx.version = 2
  //   tx.locktime = 3
  //   tx.inputs.push
  //     txid: dummyTxid
  //     vout: 1
  //     script: new Script().code
  //     sequence: 5
  //   tx.outputs.push
  //     script: new Script().code
  //     satoshis: 4
  //   hex := tx.toString()
  //   tx2 := Tx.fromHex(hex)

  //   console.log tx2, hex
//       assert.equal(tx2.version, tx.version)
//       // expect(tx2.locktime).to.equal(tx.locktime)
//       // expect(tx2.inputs.length).to.equal(tx.inputs.length)
//       // expect(tx2.outputs.length).to.equal(tx.outputs.length)
//       // expect(tx2.inputs[0].txid).to.equal(tx.inputs[0].txid)
//       // expect(tx2.inputs[0].vout).to.equal(tx.inputs[0].vout)
//       // expect(Array.from([...tx2.inputs[0].script])).to.deep.equal(Array.from([...tx.inputs[0].script]))
//       // expect(tx2.inputs[0].sequence).to.equal(tx.inputs[0].sequence)
//       // expect(Array.from(tx2.outputs[0].script)).to.deep.equal(Array.from(tx.outputs[0].script))
//       // expect(tx2.outputs[0].satoshis).to.equal(tx.outputs[0].satoshis)
//     })

//     // it("throws if not a hex string", () => {
//     //   const buffer = new Tx().toBuffer()
//     //   expect(() => Tx.fromHex(buffer)).to.throw("not a string")
//     // })

//     // it("throws if bad", () => {
//     //   const badHex = new Tx().toString() + "00"
//     //   expect(() => Tx.fromHex(badHex)).to.throw("unconsumed data")
//     // })
//   })




//   //   it('throws if not a buffer', () => {
//   //     const hex = new Transaction().toString()
//   //     expect(() => Transaction.fromBuffer(hex)).to.throw('not a buffer')
//   //   })

//   //   it('throws if bad', () => {
//   //     const badBuffer = [0].concat(Array.from(new Transaction().toBuffer()))
//   //     expect(() => Transaction.fromBuffer(badBuffer)).to.throw('unconsumed data')
//   //   })

  // it 'creates script objects', ->
  //   dummyTxid := new Tx().hash
  //   tx := new Tx()
  //   script := [3, 1, 2, 3, Op.checkSig, Op.add]
  //   tx.inputs.push({ txid: dummyTxid, vout: 1, script: script, sequence: 5 })
  //   tx.outputs.push({ script: [], satoshis: 4 })
  //   tx2 := tx.toBuffer() |> Tx.fromBuffer
    // assert.equal tx2.inputs[0].script, [3, 1, 2, 3, Op.checkSig, Op.add]
    // assert.equal tx2.outputs[0].script <? Script, true

//   //   it('1gb tx', function () {
//   //     this.timeout(10000)
//   //     const tx = { inputs: [], outputs: [] }
//   //     for (let i = 0 i < 1024 i++) {
//   //       tx.outputs.push({ script: new Uint8Array(1 * 1024 * 1024), satoshis: 123 })
//   //     }
//   //     const buffer = nimble.functions.encodeTx(tx)
//   //     const tx2 = Transaction.fromBuffer(buffer)
//   //     expect(tx2.outputs.length).to.equal(tx.outputs.length)
//   //   })
//   // })



//   // describe('toBuffer', () => {
//   //   it('returns buffer', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
//   //     const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000)
//   //     expect(Array.from(new bsv.Transaction(tx2.toString()).toBuffer())).to.deep.equal(Array.from(tx2.toBuffer()))
//   //   })
//   // })

//   // describe('hash', () => {
//   //   it('returns txid', () => {
//   //     const address = PrivateKey.fromRandom().toAddress().toString()
//   //     const bsvtx = new bsv.Transaction().to(address, 1000)
//   //     const nimbletx = nimble.Transaction.fromString(bsvtx.toString())
//   //     expect(nimbletx.hash).to.equal(bsvtx.hash)
//   //   })

//   //   it('caches txid when finalized', () => {
//   //     const tx = new nimble.Transaction().finalize()
//   //     const t0 = new Date()
//   //     tx.hash // eslint-disable-line
//   //     const t1 = new Date()
//   //     for (let i = 0 i < 100 i++) {
//   //       tx.hash // eslint-disable-line
//   //     }
//   //     const t2 = new Date()
//   //     expect(Math.round((t2 - t1) / 100)).to.be.lessThanOrEqual(t1 - t0)
//   //   })

//   //   it('computes change before calculating hash', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(privateKey.toAddress(), 9000)
//   //     const tx2 = new Transaction()
//   //       .from(tx1.outputs[0])
//   //       .to(privateKey.toAddress(), 1000)
//   //       .change(privateKey.toAddress())
//   //       .sign(privateKey)
//   //     const hash = tx2.hash
//   //     expect(tx2.changeOutput.satoshis).not.to.equal(0)
//   //     expect(hash).to.equal(new bsv.Transaction(tx2.toString()).hash)
//   //   })
//   // })

//   // describe('fee', () => {
//   //   it('returns input satoshis minus output satoshis', () => {
//   //     const txid = new Transaction().hash
//   //     const utxo1 = { txid, vout: 0, script: [], satoshis: 2000 }
//   //     const utxo2 = { txid, vout: 1, script: [], satoshis: 100 }
//   //     const address = PrivateKey.fromRandom().toAddress()
//   //     const tx = new Transaction()
//   //       .from(utxo1)
//   //       .from(utxo2)
//   //       .to(address, 1000)
//   //       .to(address, 500)
//   //     expect(tx.fee).to.equal(600)
//   //   })

//   //   it('throws if missing previous output information', () => {
//   //     const txid = new Transaction().hash
//   //     const tx = new Transaction()
//   //       .input({ txid, vout: 0, script: [], sequence: 0 })
//   //     expect(() => tx.fee).to.throw('missing previous output information for input 0')
//   //   })
//   // })

//   // describe('from', () => {
//   //   it('adds transaction output', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(pk.toAddress(), 1000)
//   //     const tx2 = new Transaction().from(tx1.outputs[0])
//   //     expect(tx2.inputs[0].txid).to.equal(tx1.hash)
//   //     expect(tx2.inputs[0].vout).to.equal(0)
//   //     expect(tx2.inputs[0].script.length).to.equal(0)
//   //     expect(tx2.inputs[0].sequence).to.equal(0xffffffff)
//   //     expect(tx2.inputs[0].output).to.equal(tx1.outputs[0])
//   //   })

//   //   it('adds utxo', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(pk.toAddress(), 1000)
//   //     const utxo = {
//   //       txid: tx1.hash,
//   //       vout: 0,
//   //       script: tx1.outputs[0].script,
//   //       satoshis: tx1.outputs[0].satoshis
//   //     }
//   //     const tx2 = new Transaction().from(utxo)
//   //     expect(tx2.inputs[0].txid).to.equal(tx1.hash)
//   //     expect(tx2.inputs[0].vout).to.equal(0)
//   //     expect(tx2.inputs[0].script.length).to.equal(0)
//   //     expect(tx2.inputs[0].sequence).to.equal(0xffffffff)
//   //     expect(tx2.inputs[0].output.script).to.equal(utxo.script)
//   //     expect(tx2.inputs[0].output.satoshis).to.equal(utxo.satoshis)
//   //   })

//   //   it('returns self for chaining', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(pk.toAddress(), 1000)
//   //     const tx2 = new Transaction()
//   //     expect(tx2.from(tx1.outputs[0])).to.equal(tx2)
//   //   })

//   //   it('throws if not an output or utxo', () => {
//   //     expect(() => new Transaction().from()).to.throw()
//   //     expect(() => new Transaction().from(null)).to.throw()
//   //     expect(() => new Transaction().from({})).to.throw()
//   //   })

//   //   it('throws if bad txid', () => {
//   //     const txidBuffer = nimble.functions.decodeHex(new Transaction().hash)
//   //     expect(() => new Transaction().from({ txid: undefined, vout: 0, script: [], satoshis: 1000 })).to.throw('bad txid')
//   //     expect(() => new Transaction().from({ txid: txidBuffer, vout: 0, script: [], satoshis: 1000 })).to.throw('bad txid')
//   //   })

//   //   it('throws if bad vout', () => {
//   //     const txid = new Transaction().hash
//   //     expect(() => new Transaction().from({ txid, vout: -1, script: [], satoshis: 1000 })).to.throw('bad vout')
//   //     expect(() => new Transaction().from({ txid, vout: 1.5, script: [], satoshis: 1000 })).to.throw('bad vout')
//   //     expect(() => new Transaction().from({ txid, vout: null, script: [], satoshis: 1000 })).to.throw('bad vout')
//   //   })

//   //   it('throws if bad script', () => {
//   //     const txid = new Transaction().hash
//   //     expect(() => new Transaction().from({ txid, vout: 0, script: null, satoshis: 1000 })).to.throw('unsupported type')
//   //     expect(() => new Transaction().from({ txid, vout: 0, script: {}, satoshis: 1000 })).to.throw('bad hex char')
//   //   })

//   //   it('throws if bad satoshis', () => {
//   //     const txid = new Transaction().hash
//   //     expect(() => new Transaction().from({ txid, vout: 0, script: [], satoshis: -1 })).to.throw('bad satoshis')
//   //     expect(() => new Transaction().from({ txid, vout: 0, script: [], satoshis: 1.5 })).to.throw('bad satoshis')
//   //     expect(() => new Transaction().from({ txid, vout: 0, script: [], satoshis: Number.MAX_VALUE })).to.throw('bad satoshis')
//   //   })

//   //   it('supports array', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(pk.toAddress(), 1000)
//   //     const tx2 = new Transaction().to(pk.toAddress(), 1000)
//   //     const tx3 = new Transaction().from([tx1.outputs[0], tx2.outputs[0]])

//   //     expect(tx3.inputs[0].txid).to.equal(tx1.hash)
//   //     expect(tx3.inputs[0].vout).to.equal(0)
//   //     expect(tx3.inputs[0].script.length).to.equal(0)
//   //     expect(tx3.inputs[0].sequence).to.equal(0xffffffff)
//   //     expect(tx3.inputs[0].output).to.equal(tx1.outputs[0])

//   //     expect(tx3.inputs[1].txid).to.equal(tx2.hash)
//   //     expect(tx3.inputs[1].vout).to.equal(0)
//   //     expect(tx3.inputs[1].script.length).to.equal(0)
//   //     expect(tx3.inputs[1].sequence).to.equal(0xffffffff)
//   //     expect(tx3.inputs[1].output).to.equal(tx2.outputs[0])
//   //   })
//   // })

//   // describe('to', () => {
//   //   it('adds output', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const tx = new Transaction().to(pk.toAddress(), 1000)
//   //     expect(Array.from(tx.outputs[0].script)).to.deep.equal(Array.from(createP2PKHLockScript(pk.toAddress().pubkeyhash)))
//   //     expect(tx.outputs[0].satoshis).to.equal(1000)
//   //   })

//   //   it('returns self for chaining', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const tx = new Transaction()
//   //     expect(tx.to(pk.toAddress(), 1000)).to.equal(tx)
//   //   })

//   //   it('throws if not a valid address', () => {
//   //     expect(() => new Transaction().to(null, 1000)).to.throw('unsupported type')
//   //     expect(() => new Transaction().to({}, 1000)).to.throw('bad base58 chars')
//   //   })

//   //   it('throws if not a valid satoshis', () => {
//   //     const address = PrivateKey.fromRandom().toAddress()
//   //     expect(() => new Transaction().to(address)).to.throw('bad satoshis')
//   //     expect(() => new Transaction().to(address, -1)).to.throw('bad satoshis')
//   //     expect(() => new Transaction().to(address, 1.5)).to.throw('bad satoshis')
//   //     expect(() => new Transaction().to(address, Number.MAX_VALUE)).to.throw('bad satoshis')
//   //   })
//   // })

//   // describe('input', () => {
//   //   it('adds input object', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(pk.toAddress(), 1000)
//   //     const input = { txid: tx1.hash, vout: 0, script: [1], sequence: 2 }
//   //     const tx2 = new Transaction().input(input)
//   //     expect(tx2.inputs[0].txid).to.equal(tx1.hash)
//   //     expect(tx2.inputs[0].vout).to.equal(0)
//   //     expect(Array.from(tx2.inputs[0].script)).to.deep.equal([1])
//   //     expect(tx2.inputs[0].sequence).to.equal(2)
//   //   })

//   //   it('adds Input instance', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(pk.toAddress(), 1000)
//   //     const input = new Transaction.Input(tx1.hash, 0)
//   //     const tx2 = new Transaction().input(input)
//   //     expect(tx2.inputs[0].txid).to.equal(tx1.hash)
//   //   })

//   //   it('returns self for chaining', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(pk.toAddress(), 1000)
//   //     const input = { txid: tx1.hash, vout: 0, script: [1], sequence: 2 }
//   //     const tx2 = new Transaction()
//   //     expect(tx2.input(input)).to.equal(tx2)
//   //   })

//   //   it('throws if not a valid input', () => {
//   //     expect(() => new Transaction().input()).to.throw('bad input')
//   //     expect(() => new Transaction().input(null)).to.throw('bad input')
//   //   })

//   //   it('throws if bad txid', () => {
//   //     expect(() => new Transaction().input({ txid: undefined, vout: 0, script: [], sequence: 0 })).to.throw('bad txid')
//   //     expect(() => new Transaction().input({ txid: [], vout: 0, script: [], sequence: 0 })).to.throw('bad txid')
//   //     expect(() => new Transaction().input({ txid: 'abc', vout: 0, script: [], sequence: 0 })).to.throw('bad txid')
//   //   })

//   //   it('throws if bad vout', () => {
//   //     const txid = new Transaction().hash
//   //     expect(() => new Transaction().input({ txid, vout: 1.5, script: [], sequence: 0 })).to.throw('bad vout')
//   //     expect(() => new Transaction().input({ txid, vout: -1, script: [], sequence: 0 })).to.throw('bad vout')
//   //   })

//   //   it('throws if bad script', () => {
//   //     const txid = new Transaction().hash
//   //     expect(() => new Transaction().input({ txid, vout: 0, script: 'xy', sequence: 0 })).to.throw('bad hex char')
//   //     expect(() => new Transaction().input({ txid, vout: 0, script: null, sequence: 0 })).to.throw('unsupported type')
//   //   })

//   //   it('throws if bad sequence', () => {
//   //     const txid = new Transaction().hash
//   //     expect(() => new Transaction().input({ txid, vout: 0, script: [], sequence: -1 })).to.throw('bad sequence')
//   //     expect(() => new Transaction().input({ txid, vout: 0, script: [], sequence: '0' })).to.throw('bad sequence')
//   //     expect(() => new Transaction().input({ txid, vout: 0, script: [], sequence: 0xffffffff + 1 })).to.throw('bad sequence')
//   //   })

//   //   it('supports output property', () => {
//   //     const txid = new Transaction().hash
//   //     const output = { script: [2], satoshis: 2 }
//   //     const tx = new Transaction().input({ txid, vout: 0, script: [], sequence: 0, output })
//   //     expect(Array.from(tx.inputs[0].output.script)).to.deep.equal([2])
//   //     expect(tx.inputs[0].output.satoshis).to.equal(2)
//   //   })

//   //   it('uses txid and vout from output property if unspecified', () => {
//   //     const txid = new Transaction().hash
//   //     const output = { txid, vout: 0, script: [2], satoshis: 2 }
//   //     const tx = new Transaction().input({ script: [], sequence: 0, output })
//   //     expect(Array.from(tx.inputs[0].output.script)).to.deep.equal([2])
//   //     expect(tx.inputs[0].output.satoshis).to.equal(2)
//   //   })

//   //   it('throws if bad output property', () => {
//   //     const txid = new Transaction().hash
//   //     const output1 = { script: 'xyz', satoshis: 0 }
//   //     const output2 = { script: [], satoshis: -1 }
//   //     expect(() => new Transaction().input({ txid, vout: 0, script: [], sequence: 0, output: output1 })).to.throw('bad hex char')
//   //     expect(() => new Transaction().input({ txid, vout: 0, script: [], sequence: 0, output: output2 })).to.throw('bad satoshis')
//   //   })
//   // })

//   // describe('output', () => {
//   //   it('adds output object', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const script = createP2PKHLockScript(pk.toAddress().pubkeyhash)
//   //     const output = { script, satoshis: 1000 }
//   //     const tx = new Transaction().output(output)
//   //     expect(Array.from(tx.outputs[0].script)).to.deep.equal(Array.from(script))
//   //     expect(tx.outputs[0].satoshis).to.equal(1000)
//   //   })

//   //   it('adds Output instance', () => {
//   //     const pk = PrivateKey.fromRandom()
//   //     const script = createP2PKHLockScript(pk.toAddress().pubkeyhash)
//   //     const output = new Transaction.Output(script, 1000)
//   //     const tx = new Transaction().output(output)
//   //     expect(Array.from(tx.outputs[0].script)).to.deep.equal(Array.from(script))
//   //   })

//   //   it('returns self for chaining', () => {
//   //     const tx = new Transaction()
//   //     const pk = PrivateKey.fromRandom()
//   //     const script = createP2PKHLockScript(pk.toAddress().pubkeyhash)
//   //     const output = { script, satoshis: 1000 }
//   //     expect(tx.output(output)).to.equal(tx)
//   //   })

//   //   it('throws if not a valid output', () => {
//   //     expect(() => new Transaction().output({ script: null, satoshis: 0 })).to.throw('unsupported type')
//   //     expect(() => new Transaction().output({ script: [], satoshis: null })).to.throw('bad satoshis')
//   //   })
//   // })

//   // describe('change', () => {
//   //   it('creates change output', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(privateKey.toAddress(), 9000)
//   //     const tx2 = new Transaction()
//   //       .from(tx1.outputs[0])
//   //       .to(privateKey.toAddress(), 1000)
//   //       .change(privateKey.toAddress())
//   //       .sign(privateKey)
//   //       .finalize()
//   //     expect(Math.ceil(tx2.toBuffer().length * nimble.feePerKb / 1000)).to.equal(tx2.fee)
//   //   })

//   //   it('returns self for chaining', () => {
//   //     const tx = new Transaction()
//   //     expect(tx.change(PrivateKey.fromRandom().toAddress())).to.equal(tx)
//   //   })

//   //   it('delete change output', () => {
//   //     const utxo = { txid: new Transaction().hash, vout: 0, script: [], satoshis: 1000 }
//   //     const address = PrivateKey.fromRandom().toAddress()
//   //     const tx = new Transaction().from(utxo).change(address)
//   //     tx.outputs = []
//   //     tx.finalize()
//   //     expect(tx.outputs.length).to.equal(0)
//   //   })

//   //   it('throws if already has change output', () => {
//   //     const utxo = { txid: new Transaction().hash, vout: 0, script: [], satoshis: 1000 }
//   //     const address = PrivateKey.fromRandom().toAddress()
//   //     const tx = new Transaction().from(utxo).change(address)
//   //     expect(() => tx.change(address)).to.throw('change output already added')
//   //   })
//   // })

//   // describe('sign', () => {
//   //   it('signs matching p2pkh scripts', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
//   //     const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000).sign(privateKey)
//   //     expect(tx2.inputs[0].script.length > 0).to.equal(true)
//   //     nimble.functions.verifyScript(tx2.inputs[0].script, tx1.outputs[0].script, tx2, 0, tx1.outputs[0].satoshis)
//   //   })

//   //   it('supports string private key', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     new Transaction().sign(privateKey.toString()) // eslint-disable-line
//   //   })

//   //   it('does not sign different addresses', () => {
//   //     const privateKey1 = PrivateKey.fromRandom()
//   //     const privateKey2 = PrivateKey.fromRandom()
//   //     const tx0 = new Transaction().to(privateKey1.toAddress(), 1000)
//   //     const tx1 = new Transaction().to(privateKey2.toAddress(), 1000)
//   //     const tx2 = new Transaction().from(tx0.outputs[0]).from(tx1.outputs[0]).to(privateKey2.toAddress(), 2000).sign(privateKey2)
//   //     expect(tx2.inputs[0].script.length === 0).to.equal(true)
//   //     expect(tx2.inputs[1].script.length > 0).to.equal(true)
//   //   })

//   //   it('does not sign non-p2pkh', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     const script = Array.from([...nimble.functions.createP2PKHLockScript(privateKey.toAddress().pubkeyhash), 1])
//   //     const utxo = { txid: new Transaction().hash, vout: 0, script, satoshis: 1000 }
//   //     const tx = new Transaction().from(utxo).sign(privateKey)
//   //     expect(tx.inputs[0].script.length).to.equal(0)
//   //   })

//   //   it('does not sign without previous outputs', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
//   //     const input = { txid: tx1.hash, vout: 0, script: [], sequence: 0 }
//   //     const tx2 = new Transaction().input(input).to(privateKey.toAddress(), 2000).sign(privateKey)
//   //     expect(tx2.inputs[0].script.length).to.equal(0)
//   //   })

//   //   it('does not sign if already have sign data', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
//   //     const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000)
//   //     tx2.inputs[0].script = [0x01]
//   //     tx2.sign(privateKey)
//   //     expect(tx2.inputs[0].script).to.deep.equal([0x01])
//   //   })

//   //   it('returns self for chaining', () => {
//   //     const tx = new Transaction()
//   //     expect(tx.sign(PrivateKey.fromRandom())).to.equal(tx)
//   //   })

//   //   it('throws if private key not provided', () => {
//   //     expect(() => new Transaction().sign()).to.throw('not a private key: ')
//   //     expect(() => new Transaction().sign({})).to.throw('not a private key: [object Object]')
//   //     expect(() => new Transaction().sign(123)).to.throw('not a private key: 123')
//   //     expect(() => new Transaction().sign('abc')).to.throw('bad checksum')
//   //   })
//   // })

//   // describe('verify', () => {
//   //   it('does not throw if valid', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(privateKey.toAddress(), 2000)
//   //     const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 1000).sign(privateKey)
//   //     expect(() => tx2.verify()).not.to.throw()
//   //   })

//   //   it('throws if invalid', () => {
//   //     expect(() => new Transaction().verify()).to.throw('no inputs')
//   //   })

//   //   it('returns self for chaining', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     const tx1 = new Transaction().to(privateKey.toAddress(), 2000)
//   //     const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 1000).sign(privateKey)
//   //     expect(tx2.verify()).to.equal(tx2)
//   //   })
//   // })

//   // describe('finalize', () => {
//   //   it('locks transaction', () => {
//   //     const privateKey = PrivateKey.fromRandom()
//   //     const address = privateKey.toAddress()
//   //     const txid = new Transaction().hash

//   //     const prev = new Transaction().to(address, 1000)

//   //     const tx = new Transaction()
//   //       .from(prev.outputs[0])
//   //       .to(address, 1000)
//   //       .finalize()

//   //     const err = 'transaction finalized'
//   //     expect(() => tx.from({ txid, vout: 0, script: [], satoshis: 0 })).to.throw(err)
//   //     expect(() => tx.to(address, 1000)).to.throw(err)
//   //     expect(() => tx.input({ txid, vout: 0, script: [], sequence: 0 })).to.throw(err)
//   //     expect(() => tx.output({ script: [], satoshis: 0 })).to.throw(err)
//   //     expect(() => tx.change(address)).to.throw(err)
//   //     expect(() => tx.sign(privateKey)).to.throw(err)

//   //     tx.n = 1
//   //     expect('n' in tx).to.equal(false)
//   //     expect(() => tx.inputs.push({})).to.throw()
//   //     expect(() => tx.outputs.push({})).to.throw()
//   //     tx.inputs[0].vout = 1
//   //     expect(tx.inputs[0].vout).to.equal(0)
//   //     tx.outputs[0].satoshis = 1
//   //     expect(tx.outputs[0].satoshis).to.equal(1000)
//   //   })

//   //   it('returns self for chaining', () => {
//   //     const tx = new Transaction()
//   //     expect(tx.finalize()).to.equal(tx)
//   //   })

//   //   it('call twice ok', () => {
//   //     new Transaction().finalize().finalize() // eslint-disable-line
//   //   })

//   //   it('removes change output if not enough to cover dust', () => {
//   //     const address = PrivateKey.fromRandom().toAddress()
//   //     const utxo = { txid: new Transaction().hash, vout: 0, script: [], satoshis: 1 }
//   //     const tx = new Transaction().from(utxo).change(address).finalize()
//   //     expect(tx.outputs.length).to.equal(0)
//   //     expect(tx.changeOutput).to.equal(undefined)
//   //   })
//   // })

//   // describe('feePerKb', () => {
//   //   it('change the feePerKb', () => {
//   //     const tx = new Transaction().setFeePerKb(0)
//   //     const tx2 = new Transaction()
//   //     const bsvTx = new bsv.Transaction()
//   //     bsvTx.feePerKb = 0

//   //     expect(tx.feePerKb).to.equal(bsvTx.feePerKb)
//   //     expect(tx.feePerKb).to.not.equal(tx2.feePerKb)
//   //     expect(tx.feePerKb).to.equal(0)
//   //     expect(tx2.feePerKb).to.equal(nimble.feePerKb)
//   //   })

//   //   it('throws if invalid', () => {
//   //     expect(() => new Transaction().setFeePerKb(-1)).to.throw('bad satoshis: -1')
//   //     expect(() => new Transaction().finalize().setFeePerKb(-1)).to.throw('transaction finalized')
//   //   })
//   // })
// })