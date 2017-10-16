'use strict'

const should = require('should')
const Reason = require('./../lib/reason')

const reasons = {
  a: {id: 'a', text: 'blah blah A'},
  b: {id: 'b', text: 'blah blah B', x: 100, y: 50}
}

describe('Reason', () => {

  describe('#new', () => {
    it('creates a new reason', () => {
      const reason = new Reason(reasons.a)
      reason.should.be.instanceof(Reason)
    })    

    it('generates a default ID if none are supplied', () => {
      const reason = new Reason({text: 'no id'})
      reason.id.should.be.instanceof(String)
    })
  })

  describe('#resize', () => {})

  describe('#draw', () => {})

  describe('#move', () => {})

  describe('#collides', () => {})

  describe('#export', () => {
    it('exports id, text, x, y as JSON', () => {
      const reason = new Reason(reasons.b)
      const json = JSON.parse(JSON.stringify(reason.export()))
      json.should.be.instanceof(Object)
      json.id.should.equal(reasons.b.id)
      json.text.should.equal(reasons.b.text)
      json.x.should.equal(reasons.b.x)
      json.y.should.equal(reasons.b.y)
    })
  })
})