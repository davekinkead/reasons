'use strict'

const should = require('should')
const Element = require('./../lib/element')

const reasons = {
  a: {id: 'a', text: 'blah blah A'},
  b: {id: 'b', text: 'blah blah B', x: 100, y: 50},
  c: {id: 'c', text: 'blah blah C'},
  ab: {from: 'a', to: 'b', type: 'a relation'}  
}

describe('Element', () => {
  describe('#mixin', () => {
    it('should mixin behaviour in an Object', () => {
      Element.mixin(reasons.a)
      reasons.a.isNode().should.equal(true)
    })    
  })

  describe('#new', () => {
    it('creates a new node', () => {
      Element.mixin(reasons.a).isNode().should.equal(true)
    })    

    it('creates a new edge', () => {
      Element.mixin(reasons.ab).isEdge().should.be.equal(true)
    }) 

    it('generates a default ID if none are supplied', () => {
      Element.mixin({text: 'no id'}).id.should.be.instanceOf(String)
    })

    it('uses the existing ID if supplied',() => {
      Element.mixin(reasons.c).id.should.equal(reasons.c.id)
    })

    it('creates a default type and id', () => {
      const el = Element.mixin({from: reasons.a, to: reasons.b})
      el.isEdge().should.equal(true)
      el.type.should.equal('supports')
    })   

    it('creates a new relation from objects', () => {
      Element.mixin({from: reasons.a, to: reasons.c}).isEdge().should.equal(true)
    })       
  }) 

  describe('#export', () => {
    it('exports a node as {id, text, x, y} in JSON', () => {
      const el = Element.mixin(reasons.b)
      const json = JSON.parse(JSON.stringify(el.export()))
      json.should.be.instanceof(Object)
      json.id.should.equal(reasons.b.id)
      json.text.should.equal(reasons.b.text)
      json.x.should.equal(reasons.b.x)
      json.y.should.equal(reasons.b.y)
    })

    it('exports an edge as {id:, type:, from:, to:} in JSON', () => {
      const el = Element.mixin(reasons.ab)
      const json = JSON.parse(JSON.stringify(el.export()))      
      json.id.should.be.instanceof(String)
      json.type.should.equal(reasons.ab.type)
      json.from.should.equal(reasons.a.id)
      json.to.should.equal(reasons.b.id)
    })

    it('exports conjoined edges as arrays of ids', () => {
      const el = Element.mixin({from: [reasons.a, reasons.b], to: reasons.c})
      el.export().from.should.be.instanceof(Array)
      el.export().from.should.haveTheSameItemsAs([reasons.a.id, reasons.b.id])
    })    
  }) 
})