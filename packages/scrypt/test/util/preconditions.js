const should = await import('chai').should();

import bsv from 'bsv';
const errors = bsv.errors;
const $ = bsv.util.preconditions;
const PrivateKey = bsv.PrivateKey;

describe('preconditions', () => {
  it('can be used to assert state', () => {
    ((() => {
      $.checkState(false, 'testing')
    })).should.throw(errors.InvalidState)
  })
  it('throws no false negative', () => {
    ((() => {
      $.checkState(true, 'testing')
    })).should.not.throw()
  })

  it('can be used to check an argument', () => {
    ((() => {
      $.checkArgument(false, 'testing')
    })).should.throw(errors.InvalidArgument);

    ((() => {
      $.checkArgument(true, 'testing')
    })).should.not.throw(errors.InvalidArgument)
  })

  it('can be used to check an argument type', () => {
    let error;
    try {
      $.checkArgumentType(1, 'string', 'argumentName')
    } catch (e) {
      error = e
      e.message.should.equal('Invalid Argument for argumentName, expected string but got number')
    }
    should.exist(error)
  })
  it('has no false negatives when used to check an argument type', () => {
    ((() => {
      $.checkArgumentType('a String', 'string', 'argumentName')
    })).should.not.throw()
  })

  it('can be used to check an argument type for a class', () => {
    let error;
    try {
      $.checkArgumentType(1, PrivateKey)
    } catch (e) {
      error = e
      const fail = !(~e.message.indexOf('Invalid Argument for (unknown name)'));
      fail.should.equal(false)
    }
    should.exist(error)
  })
  it('has no false negatives when checking a type for a class', () => {
    ((() => {
      $.checkArgumentType(new PrivateKey(), PrivateKey)
    })).should.not.throw()
  })

  it('formats correctly a message on InvalidArgument()', () => {
    const error = new errors.InvalidArgument();
    error.message.should.equal('Invalid Argument')
  })

  it('formats correctly a message on checkArgument', () => {
    let error;
    try {
      $.checkArgument(null, 'parameter must be provided')
    } catch (e) {
      error = e
    }
    error.message.should.equal('Invalid Argument: parameter must be provided')
  })
})
