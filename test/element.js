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
    it('should compose behaviour into a plain JS Object', () => {
      Element.mixin(reasons.a)
      reasons.a.isNode().should.equal(true)
    })    
  })

  describe('#new', () => {
    it('should create a new node', () => {
      Element.mixin(reasons.a).isNode().should.equal(true)
    })    

    it('should create a new edge', () => {
      Element.mixin(reasons.ab).isEdge().should.be.equal(true)
    }) 

    it('should expose an edges to: property as a string id', () => {
      Element.mixin(reasons.ab)
      reasons.ab.to.should.equal('b')

      const el = Element.mixin({from: reasons.a, to: reasons.b})
      el.to.should.equal('b')
    })

    it('should expose an edges from: property as an array of string ids', () => {
      const el = Element.mixin({from: [reasons.a, reasons.b], to: reasons.c})
      el.from.should.haveTheSameItemsAs(['a', 'b'])
    })

    it('should generate a default ID if none are supplied', () => {
      Element.mixin({text: 'no id'}).id.should.be.instanceOf(String)
    })

    it('should use the existing ID if supplied',() => {
      Element.mixin(reasons.c).id.should.equal(reasons.c.id)
    })

    it('should create a default type and id for edges', () => {
      const el = Element.mixin({from: reasons.a, to: reasons.b})
      el.isEdge().should.equal(true)
      el.type.should.equal('supports')
    })   

    it('should create a new relation from objects', () => {
      Element.mixin({from: reasons.a, to: reasons.c}).isEdge().should.equal(true)
    })
  }) 

  describe('#export', () => {
    it('should export a node as {id, text, x, y} in JSON', () => {
      const el = Element.mixin(reasons.b)
      const json = JSON.parse(JSON.stringify(el.export()))
      json.should.be.instanceof(Object)
      json.id.should.equal(reasons.b.id)
      json.text.should.equal(reasons.b.text)
      json.x.should.equal(reasons.b.x)
      json.y.should.equal(reasons.b.y)
    })

    it('should export an edge as {id:, type:, from:, to:} in JSON', () => {
      const el = Element.mixin(reasons.ab)
      const json = JSON.parse(JSON.stringify(el.export()))      
      json.id.should.be.instanceof(String)
      json.type.should.equal(reasons.ab.type)
    })

    it('should export an edge from: and to: as id strings', () => {
      const el = Element.mixin(reasons.ab)
      const json = JSON.parse(JSON.stringify(el.export()))      
      json.from[0].should.equal(reasons.a.id)
      json.to.should.equal(reasons.b.id)
    })

    it('should export conjoined edges as arrays of ids', () => {
      const el = Element.mixin({from: [reasons.a, reasons.b], to: reasons.c})
      el.export().from.should.be.instanceof(Array)
      el.export().from.should.haveTheSameItemsAs([reasons.a.id, reasons.b.id])
    })    
  }) 
})