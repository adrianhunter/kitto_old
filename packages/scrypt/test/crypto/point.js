const should = await import('chai').should();
import bsv from 'bsv';
const Point = bsv.crypto.Point;
const BN = bsv.crypto.BN;

describe('Point', () => {
  const valid = {
    x: 'ac242d242d23be966085a2b2b893d989f824e06c9ad0395a8a52f055ba39abb2',
    y: '4836ab292c105a711ed10fcfd30999c31ff7c02456147747e03e739ad527c380'
  };

  it('should create a point', () => {
    const p = Point(valid.x, valid.y);
    should.exist(p)
  })

  it('should create a point when called with "new"', () => {
    const p = new Point(valid.x, valid.y);
    should.exist(p)
  })

  describe('#getX', () => {
    it('should return x', () => {
      const p = Point(valid.x, valid.y);
      const x = p.getX();
      x.toString('hex', 64).should.equal(valid.x)
    })

    it('should be convertable to a buffer', () => {
      const p = Point(valid.x, valid.y);
      const a = p.getX().toBuffer({ size: 32 });
      a.length.should.equal(32)
      a.should.deep.equal(Buffer.from(valid.x, 'hex'))
    })
  })

  describe('#getY', () => {
    it('should return y', () => {
      const p = Point(valid.x, valid.y);
      p.getY().toString('hex', 64).should.equal(valid.y)
    })

    it('should be convertable to a buffer', () => {
      const p = Point(valid.x, valid.y);
      const a = p.getY().toBuffer({ size: 32 });
      a.length.should.equal(32)
      a.should.deep.equal(Buffer.from(valid.y, 'hex'))
    })
  })

  describe('#add', () => {
    it('should accurately add g to itself', () => {
      const p1 = Point.getG();
      const p2 = Point.getG();
      const p3 = p1.add(p2);
      p3.getX().toString().should.equal('89565891926547004231252920425935692360644145829622209' +
                                        '833684329913297188986597')
      p3.getY().toString().should.equal('12158399299693830322967808612713398636155367887041628' +
                                        '176798871954788371653930')
    })
  })

  describe('#mul', () => {
    it('should accurately multiply g by 2', () => {
      const g = Point.getG();
      const b = g.mul(new BN(2));
      b.getX().toString().should.equal('8956589192654700423125292042593569236064414582962220983' +
                                       '3684329913297188986597')
      b.getY().toString().should.equal('1215839929969383032296780861271339863615536788704162817' +
                                       '6798871954788371653930')
    })

    it('should accurately multiply g by n-1', () => {
      const g = Point.getG();
      const n = Point.getN();
      const b = g.mul(n.sub(new BN(1)));
      b.getX().toString().should.equal('55066263022277343669578718895168534326250603453777594175' +
                                       '500187360389116729240')
      b.getY().toString().should.equal('83121579216557378445487899878180864668798711284981320763' +
                                       '518679672151497189239')
    })

    // not sure if this is technically accurate or not...
    // normally, you should always multiply g by something less than n
    // but it is the same result in OpenSSL
    it('should accurately multiply g by n+1', () => {
      const g = Point.getG();
      const n = Point.getN();
      const b = g.mul(n.add(new BN(1)));
      b.getX().toString().should.equal('550662630222773436695787188951685343262506034537775941755' +
                                       '00187360389116729240')
      b.getY().toString().should.equal('326705100207588169780830851305070431844712733806592432759' +
                                       '38904335757337482424')
    })
  })

  describe('@fromX', () => {
    it('should return g', () => {
      const g = Point.getG();
      const p = Point.fromX(false, g.getX());
      g.eq(p).should.equal(true)
    })
  })

  describe('@pointToCompressed', () => {
    it('should return g', () => {
      let g = Point.getG()
      let pbuf = Point.pointToCompressed(g)
      pbuf.length.should.equal(33)
      pbuf.toString('hex').should.equal('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
    })
  })

  describe('#toBuffer', () => {
    it('should return g', () => {
      let g = Point.getG()
      let pbuf = g.toBuffer()
      pbuf.length.should.equal(33)
      pbuf.toString('hex').should.equal('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
    })
  })

  describe('@fromBuffer', () => {
    it('should return g', () => {
      let buf = Buffer.from('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 'hex')
      let p = Point.fromBuffer(buf)
      p.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })
  })

  describe('#toHex', () => {
    it('should return g', () => {
      let g = Point.getG()
      let phex = g.toHex()
      phex.length.should.equal(33 * 2)
      phex.should.equal('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
    })
  })

  describe('@fromHex', () => {
    it('should return g', () => {
      let hex = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
      let p = Point.fromHex(hex)
      p.toHex().should.equal(hex)
    })
  })

  describe('#validate', () => {
    it('should describe this point as valid', () => {
      const p = Point(valid.x, valid.y);
      should.exist(p.validate())
    })

    it('should describe this point as invalid because of zero y', () => {
      const x = 'ac242d242d23be966085a2b2b893d989f824e06c9ad0395a8a52f055ba39abb2';
      const y = '0000000000000000000000000000000000000000000000000000000000000000';
      ((() => {
        Point(x, y)
      })).should.throw('Invalid y value for curve.')
    })

    it('should describe this point as invalid because of invalid y', () => {
      const x = 'ac242d242d23be966085a2b2b893d989f824e06c9ad0395a8a52f055ba39abb2';
      const y = '00000000000000000000000000000000000000000000000000000000000000FF';
      ((() => {
        Point(x, y)
      })).should.throw('Invalid y value for curve.')
    })

    it('should describe this point as invalid because out of curve bounds', () => {
      // point larger than max
      const x = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEDCE6AF48A03BBFD25E8CD0364141';
      // calculated y of x
      const y = 'ed3970f129bc2ca7c7c6cf92fa7da4de6a1dfc9c14da4bf056aa868d3dd74034';

      ((() => {
        // set the point
        Point(x, y)
      })).should.throw('Point does not lie on the curve')
    })

    it('should describe this point as invalid because out of curve bounds', () => {
      const x = '0000000000000000000000000000000000000000000000000000000000000000';

      ((() => {
        // set the point
        Point.fromX(false, x)
      })).should.throw('Invalid X')
    })
  })
})
