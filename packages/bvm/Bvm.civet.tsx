
import { encodeHex } from "./Encode.civet";
import { decodeHex, decodePublicKey, decodeScriptChunks } from "./Decode.civet";
import { verifyTxSignature,verifyTxSignatureAsync } from "./Verify.civet";
import { ripemd160Async, sha1Async, sha256Async } from "./Hash.civet";
import { areBuffersEqual } from "./Validate.civet";
import { Op } from "./Op"

interface Opts {
  trace: boolean
}
interface Result {
  success: true
  error: null | unknown
  stackTrace: any[]
}
interface Num {
  num: bigint
  neg: boolean
};
const defaults: Opts =  {
  trace: true,
}
export function run (
  a: readonly number[],
  b: readonly number[],
  tx?: any,
  vin?: any,
  parentSatoshis?: any,
  opts: any = {}
): Promise<Result> { 
  return evalScript((new Uint8Array(a)), (new Uint8Array(b)), tx, vin, parentSatoshis, opts)
}

export function evalScript (
  unlockScript: Buf,
  lockScript: Buf,
  tx?: any,
  vin?: any,
  parentSatoshis?: any,
  opts?: Opts 
): Promise<Result> { 
  const { trace } = {
    ...defaults
  };

  const chunks: any[] = [];
  const stack: any[] = []
  const push = (...args: any[]) => stack.push(...args);
  const altStack: any[] = [];
  const branchExec: any[] = []
  const stackTrace: (any[] | { opcode: any; exec: boolean })[][] = []
  let checkIndex = 0
  let done = false

  function traceStack (i: number, exec = true) {
    if (trace && i >= 0) {
      const { opcode } = chunks[i]
      return stackTrace.push([{ opcode, exec }, [...stack], [...altStack]])
    };return
  }

  function finish (error: null | unknown = null) {
    if (stackTrace.length) { 
      traceStack(stackTrace.length)
    }
    if (!error && branchExec.length) {
      error = new Error("ENDIF missing")
    }
    const success = !error && !!stack.length && stack[stack.length - 1].some((x: any) => x)
    if (!error && !success) { 
      error = new Error("top of stack is false")
    }
    return ({
      success,
      error,
      chunks,
      stack,
      stackTrace
    })
  }

  try {
    const unlockChunks = decodeScriptChunks(unlockScript)
    const lockChunks = decodeScriptChunks(lockScript)

    if (unlockChunks.some((x) => x.opcode && x.opcode > 96)) {
      throw new Error("non-push data in unlock script")
    }
    chunks.push(...unlockChunks)
    chunks.push(...lockChunks)

    const pop = () => { 
      if (!stack.length) { 
        throw new Error("stack empty")
      }
      return stack.pop()
    }

    const altpop = () => { 
      if (!altStack.length) {
        throw new Error("alt stack empty")
      }
      return altStack.pop()
    }

    const popBool = () => pop().some((x: any) => x)
    const encodeNum = (num: any, neg?: boolean) => {
      if (typeof num === 'object') { 
        neg = num.neg 
        num = num.num 
      }
      if (BigInt(num) === BigInt(0)) return []
      const arr = Array.from(decodeHex(BigInt(num).toString(16))).reverse()
      const full = arr[arr.length - 1] & 0x80
      if (full) arr.push(0x00)
      if (neg) arr[arr.length - 1] |= 0x80
      return arr
    }

    const decodeNum = (arr: any) => {
      if (!arr.length) return { num: BigInt(0), neg: false }
      const neg = !!(arr[arr.length - 1] & 0x80)
      arr[arr.length - 1] &= 0x7F
      //@ts-ignore
      const num = BigInt(`0x${encodeHex(Array.from(arr).reverse())}`)
      return { num, neg }
    }
    function addNum (a: Num, b: Num) { 
      if (a.neg === b.neg) { 
        return { num: a.num + b.num, neg: a.neg }
      }
      else {
        return a.num > b.num
          ? ({ num: a.num - b.num, neg: a.neg })
          : ({ num: b.num - a.num, neg: b.neg })
      }
    }

    function subNum (
      b: Num,
      a: Num
    ) { return addNum(a, { num: b.num, neg: !b.neg }) }

    function lessThan (b: Num, a: Num) {
      return a.neg !== b.neg
        ? a.neg
        : (a.neg && a.num > b.num) || (!a.neg && a.num < b.num)
    }

    function greaterThan (
      b: Num,
      a: Num
    ) {
      if (a.neg !== b.neg) {
        return !a.neg
      }
      else {
        return (a.neg && a.num < b.num) || (!a.neg && a.num > b.num)
      }
    }

    function lessThanOrEqual (
      b: Num,
      a: Num
    ) {
      return a.neg !== b.neg
        ? a.neg
        : (a.neg && a.num >= b.num) || (!a.neg && a.num <= b.num)
    }

    function greaterThanOrEqual (
      b: Num,
      a: Num
    ) {
      return a.neg !== b.neg
        ? !a.neg
        : (a.neg && a.num <= b.num) || (!a.neg && a.num >= b.num)
    }

    let i = 0

    async function step () {
      // Skip branch
      if (branchExec.length > 0 && !branchExec[branchExec.length - 1]) {
        let sub = 0 // sub branch
        let psub = 0 // previous sub
        while(true) {
          if (i >= chunks.length) { break }
          const opcode = chunks[i].opcode
          const prevOp = chunks[i - 1].opcode
          // Because we trace the previous chunk, this funky code works out if
          // it is an opcode that is executed or not
          const executed = (prevOp === Op.if && sub === 0) 
            || ([Op.else, Op.endif].includes(prevOp) && psub === 0)
          traceStack(i - 1, executed)
          psub = sub
          if (opcode === Op.if || opcode === Op.NOTIF) {
            sub++
          }
          else if (opcode === Op.endif) {
            if (sub === 0) { break }
            sub--
          }
          else if (opcode === Op.else) {
            if (!sub) { break }
          }
          i++
        }
        if (i >= chunks.length) { 
          done = true
          return
        }
      }
      else {
        traceStack(i - 1)
      }
      const chunk = chunks[i++]
      async function checkSig () {
        const pubkeybytes = pop()
        const pubkey = decodePublicKey(pubkeybytes)
        const signature = pop()
        const cleanedScript = lockScript.slice(checkIndex)
        const check = (verified: any) => { 
          if (chunk.opcode === Op.checkSig) {
            return stack.push(encodeNum(verified ? 1 : 0))
          }
          else { 
            if (!verified) {
              throw new Error("OP_CHECKSIGVERIFY failed")
            };return
          }
        }
        return await verifyTxSignatureAsync(
            tx,
            vin,
            signature,
            pubkey,
            cleanedScript,
            parentSatoshis
          ).then(check)
      }

      if (chunk.buf) { 
        stack.push(chunk.buf)
        return
      }
      const op = chunk.opcode
      if (op >= 81 && op <= 96) { 
        push([op - 80])
        return
      }
      switch(op) { 
        case Op.negate1: { return push([0x81])
        }
        case Op._0: { return push([])
        }
        case Op.nop: { break
        }
        case Op.if: { return branchExec.push(popBool())
        }
        case Op.NOTIF: { return branchExec.push(!popBool())
        }
        case Op.else: {
          if (!branchExec.length) { 
            throw new Error("ELSE found without matching IF")
          }
          return branchExec[branchExec.length - 1] = !branchExec[branchExec.length - 1]
        }
        case Op.endif: {
          if (!branchExec.length) {
            throw new Error("ENDIF found without matching IF")
          }
          return branchExec.pop()
        }
        case Op.verify: { 
          if (!popBool()) { 
            throw new Error("OP_VERIFY failed")
          };return
        }
        case Op.return: { return done = true
        }
        case Op.toAltstack: { return altStack.push(pop())
        }
        case Op.fromAltstack: { return push(altpop())
        }
        case Op.ifDup: {
          const v = pop()
          stack.push(v)
          if (v.some((x: any) => x)) {
            return stack.push(Array.from(v))
          };return
        }
        case Op.depth: { return push(encodeNum(BigInt(stack.length)))
        }
        case Op.drop: { return pop()
        }
        case Op.dup: {
          const v = pop()
          stack.push(v)
          return stack.push(Array.from(v))
        }
        case Op.nip: {
          const x2 = pop()
          pop()
          return stack.push(x2)
        }
        case Op.over: {
          const x2 = pop()
          const x1 = pop()
          return stack.push(x1, x2, x1)
        }
        case Op.pick: {
          const n = decodeNum(pop())
          if (n.neg || n.num >= stack.length) {
            throw new Error("OP_PICK failed, out of range")
          }
          return stack.push(Array.from(stack[stack.length - Number(n.num) - 1]))
        }
        case Op.roll: {
          const n = decodeNum(pop())
          if (n.neg || Number(n.num) >= stack.length) {
            throw new Error("OP_ROLL failed, out of range")
          }
          return stack.push(stack.splice(stack.length - Number(n.num) - 1, 1)[0])
        }
        case Op.rot: {
          const x3 = pop()
          const x2 = pop()
          const x1 = pop()
          return push(x2, x3, x1)
        }
        case Op.swap: {
          const x2 = pop()
          const x1 = pop()
          return push(x2, x1)
        }
        case Op.tuck: {
          const x2 = pop()
          const x1 = pop()
          return push(x2, x1, x2)
        }
        case Op.drop2: { 
          pop()
          return pop()
        }
        case Op.dup2: {
          const x2 = pop()
          const x1 = pop()
          return stack.push(x1, x2, x1, x2)
        }
        case Op.dup3: {
          const x3 = pop()
          const x2 = pop()
          const x1 = pop()
          return stack.push(x1, x2, x3, x1, x2, x3)
        }
        case Op.over2: {
          const x4 = pop()
          const x3 = pop()
          const x2 = pop()
          const x1 = pop()
          return stack.push(x1, x2, x3, x4, x1, x2)
        }
        case Op.rot2: {
          const x6 = pop()
          const x5 = pop()
          const x4 = pop()
          const x3 = pop()
          const x2 = pop()
          const x1 = pop()
          return stack.push(x3, x4, x5, x6, x1, x2)
        }
        case Op.swap2: {
          const x4 = pop()
          const x3 = pop()
          const x2 = pop()
          const x1 = pop()
          return stack.push(x3, x4, x1, x2)
        }
        case Op.cat: {
          const x2 = pop()
          const x1 = pop()
          return stack.push(Array.from([...x1, ...x2]))
        }
        case Op.split: {
          const n = decodeNum(pop())
          const x = pop()
          if (n.neg || Number(n.num) > x.length) {
            throw new Error("OP_SPLIT failed, out of range")
          }
          return stack.push(x.slice(0, Number(n.num)), x.slice(Number(n.num)))
        }
        case Op.size: {
          const x = pop()
          stack.push(x)
          return stack.push(encodeNum(x.length))
        }
        case Op.invert: { 
          const r = pop().map((ai: number) => ai ^ 0xFF)
          return push(r)
        }
        case Op.and: {
          const a = pop()
          const b = pop()
          if (a.length !== b.length) { 
            throw new Error("OP_AND failed, different sizes")
          }
          return stack.push(a.map((ai: number, i: string | number) => ai & b[i]))
        }
        case Op.or: {
          const a = pop()
          const b = pop()
          if (a.length !== b.length) {
            throw new Error("OP_OR failed, different sizes")
          }
          return stack.push(a.map((ai: number, i: string | number) => ai | b[i]))
        }
        case Op.xor: {
          const a = pop()
          const b = pop()
          if (a.length !== b.length) {
            throw new Error("OP_XOR failed, different sizes")
          }
          return stack.push(a.map((ai: number, i: string | number) => ai ^ b[i]))
        }
        case Op.equal: {
          const a = pop()
          const b = pop()
          const equal = areBuffersEqual(a, b)
          const r = encodeNum(equal ? 1 : 0)
          return stack.push(r)
        }
        case Op.equalVerify: {
          const a = pop()
          const b = pop()
          const equal = a.length === b.length &&
            !a.some((ai: any, i: string | number) => ai !== b[i])
          if (!equal) {
            throw new Error("'OP_EQUALVERIFY failed\"")
          };return
        }
        case Op.lshift: {
          const n = decodeNum(pop())
          if (n.neg) {
            throw new Error("OP_LSHIFT failed, n negative")
          }
          return stack.push(lshift(pop(), Number(n.num)))
        }
        case Op.RSHIFT: {
          const n = decodeNum(pop())
          if (n.neg) {
            throw new Error("OP_RSHIFT failed, n negative")
          }
          return stack.push(rshift(pop(), Number(n.num)))
        }
        case Op.add1: { 
          return push(encodeNum(addNum(decodeNum(pop()), { num: BigInt(1), neg: false })))
        }
        case Op.sub1: { return push(encodeNum(addNum(decodeNum(pop()), ({num: BigInt(1), neg: true}))))
        }
        case Op.negate: { return push(((x) => encodeNum({num: x.num, neg: !x.neg}))(decodeNum(pop())))
        }
        case Op.abs: { 
          const a = pop()
          const n = decodeNum(a)
          const r = encodeNum(n.num)
          return push(r)
        }
        case Op.not: { 
          const wow = decodeNum(pop())
          const r = wow.num === BigInt(0) ? encodeNum(1) : encodeNum(0)
          return push(r)
        }
        case Op.notequal0: { 
          const wow = decodeNum(pop())
          return push(wow.num === BigInt(0) ? encodeNum(0) : encodeNum(1))
        }
        case Op.add: { 
          const a = decodeNum(pop())
          const b = decodeNum(pop())
          return push(encodeNum(addNum(a ,b)))
        }
        case Op.sub: { return stack.push(encodeNum(subNum(decodeNum(pop()), decodeNum(pop()))))
        }
        case Op.mul: {
          const b = decodeNum(pop())
          const a = decodeNum(pop())
          return stack.push(encodeNum(a.num * b.num, a.neg !== b.neg))
        }
        case Op.div: {
          const b = decodeNum(pop())
          const a = decodeNum(pop())
          if (b.num === BigInt(0)) {
            throw new Error("OP_DIV failed, divide by 0")
          }
          return stack.push(encodeNum(a.num / b.num, a.neg !== b.neg))
        }
        case Op.mod: {
          const b = decodeNum(pop())
          const a = decodeNum(pop())
          if (b.num === BigInt(0)) {
            throw new Error("OP_DIV failed, divide by 0")
          }
          const r = encodeNum(a.num % b.num, a.neg)
          return stack.push(r)
        }
        case Op.BOOLAND: {
          const a = popBool()
          const b = popBool()
          return stack.push(encodeNum(a && b ? 1 : 0))
        }
        case Op.BOOLOR: {
          const a = popBool()
          const b = popBool()
          return stack.push(encodeNum(a || b ? 1 : 0))
        }
        case Op.NUMEQUAL: {
          const b = decodeNum(pop())
          const a = decodeNum(pop())
          const r = encodeNum(a.num === b.num && a.neg === b.neg ? 1 : 0)
          return stack.push(r)
        }
        case Op.NUMEQUALVERIFY: {
          const b = decodeNum(pop())
          const a = decodeNum(pop())
          if (a.num !== b.num || a.neg !== b.neg) {
            throw new Error("OP_NUMEQUALVERIFY failed")
          };return
        }
        case Op.NUMNOTEQUAL: {
          const b = decodeNum(pop())
          const a = decodeNum(pop())
          return stack.push(encodeNum(a.num !== b.num || a.neg !== b.neg ? 1 : 0))
        }
        case Op.LESSTHAN: {
          return stack.push(
            encodeNum(lessThan(decodeNum(pop()), decodeNum(pop())) ? 1 : 0),
          )
        }
        case Op.GREATERTHAN: {
          const a = decodeNum(pop())
          const b = decodeNum(pop())
          return stack.push(
            encodeNum(greaterThan(a,b) ? 1 : 0),
          )
        }
        case Op.LESSTHANOREQUAL: { return stack.push(
            encodeNum(
              lessThanOrEqual(decodeNum(pop()), decodeNum(pop())) ? 1 : 0,
            )
          )
        }
        case Op.GREATERTHANOREQUAL: { return stack.push(
            encodeNum(
              greaterThanOrEqual(decodeNum(pop()), decodeNum(pop())) ? 1 : 0,
            )
          )
        }
        case Op.MIN: {
          const b = decodeNum(pop())
          const a = decodeNum(pop())
          return stack.push(encodeNum(lessThan(b, a) ? a : b))
        }
        case Op.MAX: {
          const b = decodeNum(pop())
          const a = decodeNum(pop())
          return stack.push(encodeNum(greaterThan(b, a) ? a : b))
        }
        case Op.WITHIN: {
          const max = decodeNum(pop())
          const min = decodeNum(pop())
          const x = decodeNum(pop())
          return stack.push(
            encodeNum(greaterThanOrEqual(min, x) && lessThan(max, x) ? 1 : 0),
          )
        }
        case Op.BIN2NUM: { return stack.push(encodeNum(decodeNum(pop())))
        }
        case Op.NUM2BIN: {
          const m = decodeNum(pop())
          const narr = pop()
          const n = decodeNum(narr)
          const oor = m.neg 
            || m.num < BigInt(1)
            || m.num < BigInt(narr.length) 
            || m.num > BigInt(2147483647)
          if (oor) {
            throw new Error("OP_NUM2BIN failed, out of range")
          }
          const arr = Array.from(decodeHex(BigInt(n.num).toString(16)))
          for (let i = arr.length; i < Number(m.num); i++) {
             arr.push(0x00)
          }
          const full = arr[arr.length - 1] & 0x80
          if (full) {
            arr.push(0x00)
          }
          if (n.neg) {
            arr[arr.length - 1] |= n.neg ? 0x80 : 0x00
          }
          return stack.push(arr)
        }
        case Op.RIPEMD160: { return ripemd160Async(pop()).then((x) => stack.push(x))
        }
        case Op.sha1: { return sha1Async(pop()).then((x) => stack.push(x))
        }
        case Op.sha256: { return sha256Async(pop()).then((x) => stack.push(x))
        }
        case Op.hash160: { return sha256Async(pop()).then((x) => ripemd160Async(x)).then((x) => {
              return stack.push(x)
        }
            )
        }
        case Op.hash256: { return sha256Async(pop()).then((x) => sha256Async(x)).then((x) => {
              return stack.push(x)
        }
            )
        }
        case Op.CODESEPARATOR: { return checkIndex = i + 1
        }
        case Op.checkSig: { 
          return await checkSig()
        }
        case Op.CHECKSIGVERIFY: { 
          return await checkSig()
        }
        case Op.CHECKMULTISIG: {return
        }
        case Op.CHECKMULTISIGVERIFY: {
          const total = decodeNum(pop())
          if (total.neg) {
            throw new Error("OP_CHECKMULTISIG failed, out of range")
          }
          const keys = []
          for (let i = 0; i < Number(total.num); i++) {
            const pubkey = decodePublicKey(pop())
            keys.push(pubkey)
          }
          
          // Pop the sigs
          const required = decodeNum(pop())
          if (required.neg || required.num > total.num) {
            throw new Error("OP_CHECKMULTISIG failed, out of range")
          }
          const sigs = []
          for (let i = 0; i < Number(required.num); i++) { 
            sigs.push(pop())
          }
          // Pop one more off. This isn't used and can't be changed.
          pop()
          // Verify the sigs
          let key = 0
          let sig = 0
          let success = true
          const cleanedScript = lockScript.slice(checkIndex)
          const check = (success: boolean) => {
            if (chunk.opcode === Op.checkMultiSig) {
              return stack.push(encodeNum(success ? 1 : 0))
            }
            else {
              if (!success) {
                throw new Error("OP_CHECKMULTISIGVERIFY failed")
              };return
            }
          }
          while(true) {
            if (sig < sigs.length) { break }
            if (key === keys.length) {
              success = false
              break
            }
            const verified = await verifyTxSignatureAsync(
              tx,
              vin,
              sigs[sig],
              keys[key],
              cleanedScript,
              parentSatoshis,
            )
            if (verified) { 
              sig++
            }
            key++
          }
          return check(success)
        }
        case Op.NOP1: { break
        }
        case Op.NOP2: { break
        }
        case Op.NOP3: { break
        }
        case Op.NOP4: { break
        }
        case Op.NOP5: { break
        }
        case Op.NOP6: { break
        }
        case Op.NOP7: { break
        }
        case Op.NOP8: { break
        }
        case Op.NOP9: { break
        }
        case Op.NOP10: { break
        }
        default: { 
          throw new Error(`reserved opcode: ${chunk}`)
        }
      }
    }
    return (async () => {
      try {
        while (i < chunks.length && !done) {
          // console.log i, done, chunks
          await step()
        }
        return finish()
      } catch (e) {
        const vm = finish(e)
        return Promise.resolve(vm)
      }
    })()
  }
  catch (e) { 
    const vm = finish(e)
    return Promise.resolve(vm)
  }
}

const LSHIFT_MASK = [0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01]
function lshift (arr: any[], n: number) {
  const bitshift = n % 8
  const byteshift = Math.floor(n / 8)
  const mask = LSHIFT_MASK[bitshift]
  const overflowmask = mask ^ 0xFF
  //@ts-ignore
  const result = Array.from<number>(arr.length).fill(0)
  for (let i = arr.length - 1; i >= 0; i--) {
    const k = i - byteshift
    if (k >= 0) {
      let val = arr[i] & mask
      val <<= bitshift
      result[k] |= val
    }
    if (k - 1 >= 0) {
      let carryval = arr[i] & overflowmask
      carryval >>= (8 - bitshift) % 8
      result[k - 1] |= carryval
    }
  }
  return result
}


const RSHIFT_MASK = [0xff, 0xfE, 0xfc, 0xf8, 0xf0, 0xe0, 0xc0, 0x80]
function rshift (arr: string | any[], n: number) {
  const bitshift = n % 8
  const byteshift = Math.floor(n / 8)
  const mask = RSHIFT_MASK[bitshift]
  const overflowmask = mask ^ 0xFF
  const result = new Array(arr.length).fill(0)
  for (let i = 0; i < arr.length; i++) {
    const k = i + byteshift
    if (k < arr.length) {
      let val = arr[i] & mask
      val >>= bitshift
      result[k] |= val
    }
    if (k + 1 < arr.length) {
      let carryval = arr[i] & overflowmask
      carryval <<= (8 - bitshift) % 8
      result[k + 1] |= carryval
    }
  }
  return result
}
