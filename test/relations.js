'use strict'

const should = require('should')
const Relation = require('./../lib/relation')

const map = {
  a: {id: 'a', text: 'blah blah A'},
  b: {id: 'b', text: 'blah blah B'},
  aa: {from: 'a', to: 'b', type: 'a relation'}
}

describe('Relation', () => {

  describe('#new', () => {
    it('creates a new relation from ids', () => {
      const relation = new Relation(map.aa)
      relation.should.be.instanceof(Relation)
    })

    it('creates a default type and id', () => {
      const relation = new Relation({from: map.a, to: map.b})
      relation.should.be.instanceof(Relation)
      relation.type.should.equal('supports')
      relation.id.should.be.instanceof(String)
    })    

    it('creates a new relation from objects', () => {
      const relation = new Relation({from: map.a, to: map.b})
      relation.should.be.instanceof(Relation)
    })  
  })

  describe('#draw', () => {})

  describe('#move', () => {})

  describe('#collides', () => {})

  describe('#locate', () => {})

  describe('#export', () => {
    it('exports id:, type:, from:, to: as JSON', () => {
      const relation = new Relation({from: map.a, to: map.b})
      JSON.parse(JSON.stringify(relation.export())).should.be.instanceof(Object)
      relation.export().id.should.be.instanceof(String)
      relation.export().type.should.equal('supports')
      relation.export().from.should.equal(map.a.id)
      relation.export().to.should.equal(map.b.id)
    })
  })
})