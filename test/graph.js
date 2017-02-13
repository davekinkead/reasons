const should = require('should')
const Graph = require('./../lib/graph')

should.Assertion.add('haveTheSameItems', function(other) {
  this.params = { operator: 'to be have same items' };
  this.obj.forEach(item => {
    other.should.containEql(item);
  })
  this.obj.length.should.be.equal(other.length);
})

const graph = Graph({
  nodes: {a: {}, b: {}, c: {}, d: {}, e: {}, f: {}, g: {}, h: {}}, 
  edges: [
    {from: 'a', to: 'b'}, 
    {from: ['b', 'c'], to: 'd'}, 
    {from: 'f', to: 'g'}
  ]
})

describe('Graph', () => {
  describe('#connected', () => {
    it('should return all connected nodes in the graph when no args are supplied', () => {
      graph.connected().should.haveTheSameItems(['a', 'b', 'c', 'd', 'f', 'g'])
    })
  })

  describe('#children', () => {
    it('should return all child nodes in the graph when no args are supplied', () => {
      graph.children().should.haveTheSameItems(['b', 'd', 'g'])
    })
  })

  describe('#parents', () => {
    it('should return all parent nodes in the graph when no args are supplied', () => {
      graph.parents().should.haveTheSameItems(['a', 'b', 'c', 'f'])
    })

    it('should return all parent nodes for a given node ID', () => {
      graph.parents('d').should.haveTheSameItems(['b', 'c'])
    })

    it('should return all parent nodes for an array of node ID', () => {
      graph.parents(['g', 'd']).should.haveTheSameItems(['b', 'c', 'f'])
    })
  })

  describe('#orphans', () => {
    it('should return all orphan nodes in the graph', () => {
      graph.orphans().should.haveTheSameItems(['e', 'h'])
    })
  })

  describe('#ends', () => {
    it('should find the last node in a directed graph', () => {
      graph.ends().should.haveTheSameItems(['d', 'g'])
    })    
  })
})

