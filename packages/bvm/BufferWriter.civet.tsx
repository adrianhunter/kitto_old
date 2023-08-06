
export class BufferWriter {
  constructor(
    public buffers: Uint8Array[] = [],
    public length: number = 0
  ){}
  write(buffer: Buf): BufferWriter {
    this.buffers.push(new Uint8Array(buffer))
    this.length += buffer.length
    return this
  }
  toBuffer(): Uint8Array {
    if (this.buffers.length === 1) {
      return this.buffers[0]
    }
    const whole = new Uint8Array(this.length)
    let offset = 0
    this.buffers.forEach(function(part) { 
      whole.set(part, offset)
      return offset += part.length
    })
    return whole
  }
}



describe("BufferWriter", function() {

  it("empty", function() {
    assert.equal(new BufferWriter().toBuffer().length, 0)
    assert.equal(new BufferWriter().buffers.length, 0)
    assert.equal(new BufferWriter().length, 0)
    return
  })
  it("appends and increases length", function() { 
    const writer = new BufferWriter
    writer.write([0, 1, 2])
    assert.equal(writer.length, 3)
    writer.write([3])
    assert.equal(writer.length, 4)
    assert.equal(writer.buffers.length, 2)
    return
  })
  return it("concatenates buffers", function() { 
    const writer = new BufferWriter()
    writer.write([0, 1, 2, 3])
    writer.write([4])
    writer.write([])
    writer.write([5, 6, 7, 8, 9])
    assert.equal(Array.from( writer.toBuffer()), [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ])
    return
  })
})

