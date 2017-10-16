'use strict'

const should = require('should')
const Element = require('./../lib/element')

const reasons = {
  a: {id: 'a', text: 'blah blah A'},
  b: {id: 'b', text: 'blah blah B', x: 100, y: 50}
}

describe('Element', () => {
  it('should mixin behaviour in an Object', () => {
    Element.mixin(reasons.a)
    reasons.a.isNode().should.equal(true)
  })
})