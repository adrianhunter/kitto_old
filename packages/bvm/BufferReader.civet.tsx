export class BufferReader {
  constructor(public buffer: Buf, public pos = 0){}
  read(length: number): Buf {
    this.checkRemaining(length)
    const start = this.pos
    const end = start + length
    this.pos = end
    return this.buffer.slice(start, end)
  }
  close() { 
    if (this.pos !== this.buffer.length) {
      throw new Error("unconsumed data")
    };return
  }
  checkRemaining(length: number) { 
    if (this.buffer.length - this.pos < length) {
      throw new Error("not enough data")
    };return
  }
}


console.log(BufferReader)



describe("BufferReader", function() {
  it("@", () => { 
    const buffer = [0x00, 0x01]
    const reader = new BufferReader(buffer)
    assert.equal(Array.from(reader.buffer) , buffer)
    return assert.equal(reader.pos, 0)
  })
  it("reads buffer", () => { 
    assert.equal(Array.from(new BufferReader([]).read(0)), [])
    return assert.equal(Array.from(new BufferReader([0x00, 0x01, 0x02]).read(3)), [0x00, 0x01, 0x02])
  })
  it("throws if not enough data", () => { 
    assert.throws(() => new BufferReader([]).read(1), Error, "not enough data")
    assert.throws(() => new BufferReader([0x00]).read(2), Error, "not enough data")
    const reader = new BufferReader([0x00])
    reader.read(1)
    return assert.throws(() => reader.read(1), Error, "not enough data")
  })
  // it "does not throw if read all", =>
  //   // expect(() => new BufferReader([]).close()).not.to.throw()
  //   reader := new BufferReader([0x00, 0x00, 0x00, 0x00])
  //   reader.read(4)
  //   expect(() => reader.close()).not.to.throw()
  it("throws if unconsumed data", async () => {
    assert.throws(() => new BufferReader([0x00]).close(), Error, "unconsumed data")
    const reader = new BufferReader([0x00, 0x00, 0x00, 0x00, 0x00])
    reader.read(4)
    return assert.throws(() => reader.close(), Error, "unconsumed data")
  })
  return it("checkRemaining -> throws if not enough data left", () => {
    assert.throws(() => new BufferReader([]).checkRemaining(1), Error,  "not enough data")
    return assert.throws(() => new BufferReader([2]).checkRemaining(2), Error, "not enough data")
  })
})
  // it "checkRemaining ->  does not throw if data left", =>
  //   // expect(() => new BufferReader([]).checkRemaining()).not.to.throw()
  //   expect(() => new BufferReader([1]).checkRemaining(1)).not.to.throw()
