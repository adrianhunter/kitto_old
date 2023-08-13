'use strict'

class Stack {
  constructor(rawstack, varStack) {
    this.stack = rawstack
    this.varStack = varStack || []
  }

  pushVar(varName) {
    this.varStack.push(varName || '$tmp')
  }

  popVar() {
    this.varStack.pop()
  }

  push(n, varName) {
    this.pushVar(varName)
    this.stack.push(n)
    this.checkConsistency()
  }

  pop() {
    this.popVar()
    let top = this.stack.pop()
    this.checkConsistency()
    return top
  }

  updateTopVars(vars) {
    if (vars.length > this.varStack.length) {
      throw new Error(`updateTopVars fail, stack: ${this.stack.length},  varStack: ${this.varStack.length}, vars:${vars.length}`)
    }
    vars = vars.reverse()
    this.varStack.splice(this.varStack.length - vars.length, vars.length, ...vars)
  }

  stacktop(i) {
    return this.stack[this.stack.length + i]
  }

  vartop(i) {
    return this.varStack[this.varStack.length + i]
  }

  slice(start, end) {
    return this.stack.slice(start, end)
  }

  splice(start, deleteCount, ...items) {
    this.varStack.splice(start, deleteCount, ...items)
    return this.stack.splice(start, deleteCount, ...items)
  }

  write(i, value) {
    this.stack[this.stack.length + i] = value
  }

  copy() {
    return new Stack(this.stack.slice() || [], this.varStack.slice() || [])
  }

  printVarStack() {
    let array = this.varStack.map((v, i) => ({
      name: v,
      value: bytesToHexString(this.rawstack[i].data)
    }))
    console.log(JSON.stringify(array, null, 4))
  }

  checkConsistency() {
    if (this.stack.length !== this.varStack.length) {
      this.printVarStack()
      throw new Error(`checkConsistency fail, stack: ${this.stack.length}, varStack:${this.varStack.length}`)
    }
  }

  checkConsistencyWithVars(varStack) {
    if (this.stack.length < varStack.length) {
      this.printVarStack()
      throw new Error(`checkConsistencyWithVars fail, stack: ${this.stack.length}, varStack:${varStack.length}`)
    }
  }

  get length() {
    return this.stack.length
  }

  get rawstack() {
    return this.stack
  }
}

export default Stack;

function bytesToHexString (bytearray) {
  return bytearray.reduce(function (o, c) {
    o += ('0' + (c & 0xFF).toString(16)).slice(-2)
    return o
  }, '')
}
