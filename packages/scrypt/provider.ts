import type { AddressOption, TransactionResponse, TxHash, UTXO, UtxoQueryOptions } from 'scrypt-ts'
import { Provider, bsv, filterUTXO } from 'scrypt-ts'

// import * as bsv from './bsv.ts'

declare enum ProviderEvent {
  /** The provider will send a 'Connected' event after the connection is successful. */
  Connected = 'connected',
  /** After the network connected to the provider changes, it will issue the 'NetworkChange' event, such as switching from the testnet to the mainnet. */
  NetworkChange = 'networkChange',
}

/**
 * The WhatsonchainProvider is backed by [whatsonchain]{@link https://whatsonchain.com},
 * which is the popular blockchain exxplorer for Bitcoin.
 */
export default class WhatsonchainProvider extends Provider {
  private _network: bsv.Networks.Network
  private _isConnected: boolean

  constructor(network: bsv.Networks.Network) {
    super()
    this._network = network
    this._isConnected = false
  }

  get apiPrefix(): string {
    // TODO: check all avaiable networks
    const networkStr = this._network.name === bsv.Networks.mainnet.name ? 'main' : 'test'
    return `https://api.whatsonchain.com/v1/bsv/${networkStr}`
  }

  isConnected(): boolean {
    return this._isConnected
  }

  async connect(): Promise<this> {
    try {
      const res = await fetch(`${this.apiPrefix}/woc`)

      if (res.ok && (await res.text()) === 'Whats On Chain') {
        this._isConnected = true
        this.emit(ProviderEvent.Connected, true)
      }
      else {
        throw new Error('connect failed: ')
      }
    }
    catch (error) {
      this._isConnected = false
      this.emit(ProviderEvent.Connected, false)
      throw error
    }

    return Promise.resolve(this)
  }

  private assertConnected() {
    if (!this._isConnected)
      throw new Error('Provider is not connected')
  }

  updateNetwork(network: bsv.Networks.Network): void {
    this._network = network
    this.emit(ProviderEvent.NetworkChange, network)
  }

  getNetwork(): bsv.Networks.Network {
    return this._network
  }

  async sendRawTransaction(rawTxHex: string): Promise<TxHash> {
    this.assertConnected()
    // 1 second per KB
    // const size = Math.max(1, rawTxHex.length / 2 / 1024); //KB
    // const timeout = Math.max(10000, 1000 * size);
    try {
      const res = await fetch(
        `${this.apiPrefix}/tx/raw`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ txhex: rawTxHex }),
        },
      )
      return await res.json()
    }
    catch (error) {
      if (error.response && error.response.text) {
        if (needIgnoreError(error.response.text))
          return new bsv.Transaction(rawTxHex).id

        throw new Error(`WhatsonchainProvider ERROR: ${friendlyBIP22RejectionMsg(error.response.text)}`)
      }
      throw new Error(`WhatsonchainProvider ERROR: ${error.message}`)
    }
  }

  async listUnspent(address: AddressOption, options?: UtxoQueryOptions): Promise<UTXO[]> {
    this.assertConnected()
    const res = await fetch(`${this.apiPrefix}/address/${address}/unspent`)

    const json = await res.json()
    const utxos: UTXO[]
      = json.map(item => ({
        txId: item.tx_hash,
        outputIndex: item.tx_pos,
        satoshis: item.value,
        script: bsv.Script.buildPublicKeyHashOut(address).toHex(),
      }))

    if (options)
      return filterUTXO(utxos, options)

    return utxos
  }

  getBalance(address: AddressOption): Promise<{ confirmed: number; unconfirmed: number }> {
    this.assertConnected()
    return this.listUnspent(address).then((utxos) => {
      return {
        confirmed: utxos.reduce((acc, utxo) => {
          acc += utxo.satoshis
          return acc
        }, 0),
        unconfirmed: 0,
      }
    })
  }

  async getTransaction(txHash: string): Promise<TransactionResponse> {
    this.assertConnected()
    return await fetch(`${this.apiPrefix}/tx/${txHash}/hex`).then(async (res) => {
      if (res.ok)
        return new bsv.Transaction(await res.text())
      else
        throw new Error(`getTransaction error ${txHash}`)
    })
  }

  getFeePerKb(): Promise<number> {
    return Promise.resolve(50)
  }
}

function needIgnoreError(inMsg: string): boolean {
  if (inMsg.includes('Transaction already in the mempool'))
    return true
  else if (inMsg.includes('txn-already-known'))
    return true

  return false
}

function friendlyBIP22RejectionMsg(inMsg: string): string {
  if (inMsg.includes('bad-txns-vin-empty'))
    return 'Transaction is missing inputs.'
  else if (inMsg.includes('bad-txns-vout-empty'))
    return 'Transaction is missing outputs.'
  else if (inMsg.includes('bad-txns-oversize'))
    return 'Transaction is too large.'
  else if (inMsg.includes('bad-txns-vout-negative'))
    return 'Transaction output value is negative.'
  else if (inMsg.includes('bad-txns-vout-toolarge'))
    return 'Transaction outputut value is too large.'
  else if (inMsg.includes('bad-txns-txouttotal-toolarge'))
    return 'Transaction total outputut value is too large.'
  else if (inMsg.includes('bad-txns-prevout-null'))
    return 'Transaction inputs previous TX reference is null.'
  else if (inMsg.includes('bad-txns-inputs-duplicate'))
    return 'Transaction contains duplicate inputs.'
  else if (inMsg.includes('bad-txns-inputs-too-large'))
    return 'Transaction inputs too large.'
  else if (inMsg.includes('bad-txns-fee-negative'))
    return 'Transaction network fee is negative.'
  else if (inMsg.includes('bad-txns-fee-outofrange'))
    return 'Transaction network fee is out of range.'
  else if (inMsg.includes('mandatory-script-verify-flag-failed'))
    return 'Script evaluation failed.'
  else
    return inMsg
}
