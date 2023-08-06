import type { Tx } from "./Tx.civet";
import { encodeTx } from "./Encode.civet";
import { evalScript } from "./Bvm.civet";
import { decodeDER } from "./Decode.civet";
import { sighashAsync } from "./Hash.civet";
import { verifyEcdsa } from "./Crypto.civet";
import { PubKey } from "./PubKey.civet"
// {
//   getEcdsaExports,
//   PT_SIZE,
// } from ../wasm/wasm-secp256k1.civet
// {
//   BN_SIZE,
//   getBnExports,
//   getMemoryBuffer,
//   getNPos,
//   writeBN,
// } from ../wasm/wasm-secp256k1.civet


export function verifyTx (tx: Tx, parents: any[], minFeePerKb: number = 50) {
  const version = typeof tx.version !== "undefined" ? tx.version : 1;
  const locktime = typeof tx.locktime !== "undefined" ? tx.locktime : 0;

  if (version !== 1) throw new Error("bad version");
  if (locktime < 0 || locktime > 0xffffffff || !Number.isInteger(locktime)) {
    throw new Error("bad locktime");
  }

  if (tx.inputs.length === 0) throw new Error("no inputs");
  if (tx.outputs.length === 0) throw new Error("no outputs");

  const inputSatoshis = parents.reduce(
    (prev: any, curr: { satoshis: any }) => prev + curr.satoshis,
    0,
  );
  const outputSatoshis = tx.outputs.reduce(
    (prev, curr) => prev + curr.satoshis,
    0,
  );
  if (
    inputSatoshis - outputSatoshis < encodeTx(tx).length * minFeePerKb / 1000
  ) throw new Error("insufficient priority");

  tx.inputs.forEach((input, vin) => {
    forEach: tx.inputs.slice(vin + 1).forEach((input2) => {
      if (input.txid === input2.txid && input.vout === input2.vout) {
        throw new Error("duplicate input");
      };return
    })
  })

  return tx.inputs.forEach((input, vin) => {
    verifyScript: verifyScript(
      input.script,
      parents[vin].script,
      tx,
      vin,
      parents[vin].satoshis,
    )
  })
}


export async function verifyTxSignature (
  tx: any,
  vin: any,
  signature: Uint8Array,
  pubkey: any,
  parentScript: any,
  parentSatoshis: any,
) {
  const dersig = signature.slice(0, signature.length - 1)
  const sighashFlags = signature[signature.length - 1]
  const hash = await sighashAsync(
    tx,
    vin,
    parentScript,
    parentSatoshis,
    sighashFlags,
  )
  try {
    return await verifyEcdsa(dersig, hash, pubkey)
  }
  catch (e) {
    return false
  }
}


import { ecdsaVerifyAsync } from "./Ecdsa.civet"

export async function verifyTxSignatureAsync(
  tx: any,
  vin: any,
  signature: Uint8Array,
  pubkey: Point,
  parentScript: any,
  parentSatoshis: any,
) {
  const dersig = signature.slice(0, signature.length - 1);
  const sighashFlags = signature[signature.length - 1];
  const hash = await sighashAsync(
    tx,
    vin,
    parentScript,
    parentSatoshis,
    sighashFlags,
  );
  try {
    return await ecdsaVerifyAsync(decodeDER(dersig), hash, pubkey);
  } catch (e) {
    return false;
  }
}



export const verifyScript = (
  unlockScript: Buf,
  lockScript: Buf,
  tx: Tx,
  vin: number,
  parentSatoshis: any,
  async = false,
) => {
  const vm = evalScript(unlockScript, lockScript, tx, vin, parentSatoshis, {
    // async,
    trace: false,
  });

  if (async) {
    //@ts-ignore
    return vm.then((vm: { error: any; success: any }) => {
      return vm.error ? Promise.reject(vm.error) : vm.success;
    });
  } else {
    //@ts-ignore
    if (vm.error) throw vm.error;
    //@ts-ignore
    return vm.success;
  }
};



export const verifyScriptAsync = (unlockScript: any, lockScript: any, tx: any, vin: any, parentSatoshis: any) => {
  return verifyScript(unlockScript, lockScript, tx, vin, parentSatoshis, true)
}



export function verifyPrivateKey (privateKey: Uint8Array) {}
  // if privateKey.length is not 32
  //   throw new Error "bad length"
  // const memory = getMemoryBuffer()
  // const privateKeyPos = memory.length - BN_SIZE
  // const bnCmp = getBnExports().bn_cmp
  // const N_POS = getNPos()

  // writeBN memory, privateKeyPos, privateKey

  // //@ts-ignore
  // if (bnCmp(privateKeyPos, N_POS) >= 0) throw new Error("outside range")

  // return privateKey



export function verifyPoint (publicKey: Point) {};
  // memory := getMemoryBuffer()
  // pos := memory.length - PT_SIZE

  // writeBN(memory, pos, publicKey.x)
  // writeBN(memory, pos + BN_SIZE, publicKey.y)
  // //@ts-ignore
  // verified := getEcdsaExports().validate_point(pos)

  // if verified !== 0
  //   throw new Error(
  //     verified === 1
  //       ? "outside range"
  //       : verified === 2
  //         ? "not on curve"
  //         : "bad point",
  //   )

  // return publicKey

import { generatePrivateKey } from "./Crypto.civet"

describe("verify", function() {


  return it('verifyPrivateKey -> does not throw for valid key', function() {
    return verifyPrivateKey(generatePrivateKey())
  })
})

  // it('throws if bad length', () => {
  //   expect(() => verifyPrivateKey([])).to.throw('bad length')
  //   expect(() => verifyPrivateKey(new Array(33))).to.throw('bad length')
  // })

  // it('throws if out of range', () => {
  //   expect(() => verifyPrivateKey(new Array(32).fill(255))).to.throw('outside range')
  // })
// })