import type { AddressOption, AddressesOption, Network, Provider, SignTransactionOptions, SignatureRequest, SignatureResponse, UTXO, UtxoQueryOptions } from 'scrypt-ts'
import { Signer, bsv, parseAddresses } from 'scrypt-ts'
import { signTx } from 'scryptlib'

// import * as bsv from './bsv.ts'

// import { bsv } from 'https://esm.sh/scryptlib@2.1.24'

import WhatsonchainProvider from './provider.ts'

const DEFAULT_SIGHASH_TYPE = bsv.crypto.Signature.ALL

/**
 * An implemention of a simple wallet which should just be used in dev/test environments.
 * It can hold multiple private keys and have a feature of cachable in-memory utxo management.
 *
 * Reminder: DO NOT USE IT IN PRODUCTION ENV.
 */
export default class Wallet extends Signer {
  declare provider: Provider
  private readonly _privateKeys: bsv.PrivateKey[]

  private _utxoManagers: Map<string, CacheableUtxoManager>

  private splitFeeTx = true

  constructor(privateKey: bsv.PrivateKey | bsv.PrivateKey[], provider: Provider = new WhatsonchainProvider(bsv.Networks.testnet)) {
    super(provider)
    if (Array.isArray(privateKey))
      this._privateKeys = privateKey
    else
      this._privateKeys = [privateKey]

    this.checkPrivateKeys()
    this._utxoManagers = new Map()
  }

  enableSplitFeeTx(on: boolean) {
    this.splitFeeTx = on
  }

  async isAuthenticated(): Promise<boolean> {
    return await Promise.resolve(true)
  }

  async requestAuth(): Promise<{ isAuthenticated: boolean; error: string }> {
    return await Promise.resolve({ isAuthenticated: true, error: '' })
  }

  get network(): Network {
    return this.provider.getNetwork()
  }

  get addresses(): string[] {
    return this._privateKeys.map(p => p.toAddress(this.network).toString())
  }

  addPrivateKey(privateKey: bsv.PrivateKey | bsv.PrivateKey[]): this {
    const keys: bsv.PrivateKey[] = Array.isArray(privateKey) ? privateKey : [privateKey]
    this._privateKeys.push(...keys)
    this.checkPrivateKeys()
    return this
  }

  checkPrivateKeys(): bsv.Networks.Network {
    const networks = this._privateKeys.map(key => key.toAddress().network)

    if (!networks.every(n => n.name === networks[0].name))
      throw new Error(`All private keys should be ${networks[0].name} private key`)

    return networks[0]
  }

  getDefaultAddress(): Promise<bsv.Address> {
    return Promise.resolve(this._defaultPrivateKey.toAddress())
  }

  getDefaultPubKey(): Promise<bsv.PublicKey> {
    return Promise.resolve(this._defaultPrivateKey.toPublicKey())
  }

  getPubKey(address: AddressOption): Promise<bsv.PublicKey> {
    return Promise.resolve(this._getPrivateKeys(address)[0].toPublicKey())
  }

  async signRawTransaction(rawTxHex: string, options: SignTransactionOptions): Promise<string> {
    const sigReqsByInputIndex: Map<number, SignatureRequest> = (options?.sigRequests || []).reduce((m, sigReq) => {
      m.set(sigReq.inputIndex, sigReq)
      return m
    }, new Map())
    const tx = new bsv.Transaction(rawTxHex)
    tx.inputs.forEach((_, inputIndex) => {
      const sigReq = sigReqsByInputIndex.get(inputIndex)
      if (!sigReq)
        throw new Error(`\`SignatureRequest\` info should be provided for the input ${inputIndex} to call #signRawTransaction`)

      const script = sigReq.scriptHex ? new bsv.Script(sigReq.scriptHex) : bsv.Script.buildPublicKeyHashOut(sigReq.address.toString())
      // set ref output of the input
      tx.inputs[inputIndex].output = new bsv.Transaction.Output({
        script,
        satoshis: sigReq.satoshis,
      })
    })
    const signedTx = await this.signTransaction(tx, options)
    return signedTx.toString()
  }

  async signTransaction(tx: bsv.Transaction, options?: SignTransactionOptions): Promise<bsv.Transaction> {
    const addresses = options?.address
    this._checkAddressOption(addresses)
    // TODO: take account of SignatureRequests in options.
    return await Promise.resolve(tx.sign(this._getPrivateKeys(addresses)))
  }

  signMessage(_message: string, _address?: AddressOption): Promise<string> {
    throw new Error('Method #signMessage not implemented.')
  }

  getSignatures(rawTxHex: string, sigRequests: SignatureRequest[]): Promise<SignatureResponse[]> {
    this._checkAddressOption(this._getAddressesIn(sigRequests))
    const tx = new bsv.Transaction(rawTxHex)
    const sigResponses: SignatureResponse[] = sigRequests.flatMap((sigReq) => {
      const script = sigReq.scriptHex ? new bsv.Script(sigReq.scriptHex) : bsv.Script.buildPublicKeyHashOut(parseAddresses(sigReq.address, this.network)[0])
      tx.inputs[sigReq.inputIndex].output = new bsv.Transaction.Output({
        // TODO: support multiSig?
        script,
        satoshis: sigReq.satoshis,
      })
      const privkeys = this._getPrivateKeys(sigReq.address)
      return privkeys.map((privKey) => {
        // Split to subscript if OP_CODESEPARATOR is being employed.
        const subScript = sigReq.csIdx !== undefined ? script.subScript(sigReq.csIdx) : script

        const sig = signTx(tx, privKey, subScript, sigReq.satoshis, sigReq.inputIndex, sigReq.sigHashType)
        return {
          sig: sig as string,
          publicKey: privKey.publicKey.toString(),
          inputIndex: sigReq.inputIndex,
          sigHashType: sigReq.sigHashType || DEFAULT_SIGHASH_TYPE,
          csIdx: sigReq.csIdx,
        }
      })
    })
    return Promise.resolve(sigResponses)
  }

  async connect(provider?: Provider): Promise<this> {
    if (provider) {
      const network = this.checkPrivateKeys()

      const providerNetWork = await provider.getNetwork()

      if (network.name !== providerNetWork.name)
        throw new Error(`Should connect to a ${network.name} provider`)

      if (!provider.isConnected())
        await provider.connect()

      this.provider = provider
    }
    else {
      if (this.provider)
        await this.provider.connect()
      else
        throw new Error('No provider found')
    }

    return this
  }

  override async listUnspent(address: AddressOption, options?: UtxoQueryOptions): Promise<UTXO[]> {
    if (this.splitFeeTx && options) {
      let utxoManager = this._utxoManagers.get(address.toString())
      if (!utxoManager) {
        utxoManager = new CacheableUtxoManager(address, this)
        this._utxoManagers.set(address.toString(), utxoManager)
        await utxoManager.init()
      }

      const unspentValue = options.unspentValue
      const estimateSize = options.estimateSize
      const feePerKb = options.feePerKb

      // providerAmount = ((estimateSize + (180 * n)) / 1000 * feePerKb) - unspentValue
      const providerAmount = Math.ceil(((estimateSize + (180 * 1)) / 1000 * feePerKb) - unspentValue)

      return utxoManager.fetchUtxos(providerAmount, options)
    }
    else {
      return this.provider.listUnspent(address, options)
    }
  }

  private _getAddressesIn(sigRequests?: SignatureRequest[]): AddressesOption {
    return (sigRequests || []).flatMap((req) => {
      return Array.isArray(req.address) ? req.address : [req.address]
    })
  }

  private _checkAddressOption(address?: AddressesOption) {
    if (!address)
      return
    if (Array.isArray(address)) {
      (address as AddressOption[]).forEach(address => this._checkAddressOption(address))
    }
    else {
      if (!this.addresses.includes(address.toString()))
        throw new Error(`the address ${address.toString()} does not belong to this TestWallet`)
    }
  }

  private get _defaultPrivateKey(): bsv.PrivateKey {
    return this._privateKeys[0]
  }

  private _getPrivateKeys(address?: AddressesOption): bsv.PrivateKey[] {
    if (!address)
      return [this._defaultPrivateKey]
    this._checkAddressOption(address)
    const addresses: string[] = []
    if (Array.isArray(address))
      (address as AddressOption[]).forEach(addr => addresses.push(addr.toString()))
    else
      addresses.push(address.toString())

    return this._privateKeys.filter(priv => addresses.includes(priv.toAddress(this.network).toString()))
  }
}

enum InitState {
  UNINITIALIZED,
  INITIALIZING,
  INITIALIZED,
}

class CacheableUtxoManager {
  address: AddressOption

  private readonly signer: Signer

  private availableUtxos: UTXO[] = []
  private initStates: InitState = InitState.UNINITIALIZED
  private initUtxoCnt = 0

  private feePerkb = 50

  constructor(address: AddressOption, signer: Signer) {
    this.address = address
    this.signer = signer
  }

  async init() {
    if (this.initStates === InitState.INITIALIZED)
      return this

    if (this.initStates === InitState.UNINITIALIZED) {
      this.initStates = InitState.INITIALIZING
      this.availableUtxos = await this.signer.connectedProvider.listUnspent(this.address)
      this.feePerkb = await this.signer.connectedProvider.getFeePerKb()
      this.initStates = InitState.INITIALIZED
      this.initUtxoCnt = this.availableUtxos.length
      console.log(`current balance of address ${this.address} is ${this.availableUtxos.reduce((r, utxo) => r + utxo.satoshis, 0)} satoshis`)
    }
    while (this.initStates === InitState.INITIALIZING)
      await sleep(1)

    return this
  }

  async fetchUtxos(targetSatoshis: number, options?: UtxoQueryOptions): Promise<UTXO[]> {
    if (this.initStates === InitState.INITIALIZED
      && this.initUtxoCnt > 0
      && this.availableUtxos.length === 0
    ) {
      const timeoutSec = 30
      for (let i = 0; i < timeoutSec; i++) {
        console.log('waiting for available utxos')
        await sleep(1)
        if (this.availableUtxos.length > 0)
          break
      }
    }

    if (targetSatoshis <= 0) {
      const allUtxos = this.availableUtxos
      this.availableUtxos = []
      return allUtxos
    }

    const targetUtxo = this.availableUtxos.find(u => u.satoshis === targetSatoshis)

    if (targetUtxo)
      return [targetUtxo]

    const sortedUtxos = this.availableUtxos.sort((a, b) => a.satoshis - b.satoshis)

    if (targetSatoshis > sortedUtxos.reduce((r, utxo) => r + utxo.satoshis, 0))
      throw new Error(`no sufficient utxos to pay the fee of ${targetSatoshis}`)

    let idx = 0
    let accAmt = 0
    const dustLimit = 1 // min change amount
    let expectedAmt = 0
    const additional = options?.additional || 0
    for (let i = 0; i < sortedUtxos.length; i++) {
      accAmt += sortedUtxos[i].satoshis
      // estimateFee of splitTx
      // 180 - Input.BASE_SIZE + PublicKeyHashInput.SCRIPT_MAX_SIZE
      // 10 + 34 * 2 - transation header and two output
      // // If `hasPrevouts=true`, you need to consider that increasing the number of inputs will cause the unlock parameter `__scrypt_ts_prevouts` to increase

      const estimateFee = Math.ceil((180 * (i + 1) + (10 + 34) * 2 + (additional * (i + 1))) * this.feePerkb / 1000)
      expectedAmt = targetSatoshis + estimateFee + dustLimit
      if (accAmt >= expectedAmt) {
        idx = i
        break
      }
    }

    const usedUtxos = sortedUtxos.slice(0, idx + 1)

    // update the available utxos, remove used ones
    this.availableUtxos = sortedUtxos.slice(idx + 1)

    if (accAmt >= expectedAmt) {
      // split `accAmt` to `targetSatoshis` + `change`
      const splitTx
        = new bsv.Transaction().from(usedUtxos)
          .addOutput(new bsv.Transaction.Output({
            script: bsv.Script.buildPublicKeyHashOut(this.address),
            satoshis: expectedAmt,
          }))
          .change(this.address) // here generates a new available utxo for address

      const txId = (await this.signer.signAndsendTransaction(splitTx)).id // sendTx(splitTx);

      // update the available utxos, add the new created on as the change
      if (splitTx.outputs.length === 2) {
        this.availableUtxos = this.availableUtxos.concat({
          txId,
          outputIndex: 1,
          script: splitTx.outputs[1].script.toHex(),
          satoshis: splitTx.outputs[1].satoshis,
        })
      }

      // return the new created utxo which has value of `targetSatoshis`
      return [
        {
          txId,
          outputIndex: 0,
          script: splitTx.outputs[0].script.toHex(),
          satoshis: splitTx.outputs[0].satoshis,
        },
      ]
    }
    else {
      return usedUtxos
    }
  }

  collectUtxoFrom(output: bsv.Transaction.Output, txId: string, outputIndex: number) {
    if (output.script.toHex() === this.utxoScriptHex) {
      this.availableUtxos.push({
        txId,
        outputIndex,
        satoshis: output.satoshis,
        script: output.script.toHex(),
      })
    }
  }

  private get utxoScriptHex(): string {
    // all managed utxos should have the same P2PKH script for `this.address`
    return bsv.Script.buildPublicKeyHashOut(this.address).toHex()
  }
}

async function sleep(seconds: number) {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve({})
    }, seconds * 1000)
  })
}
