const should = require('should')
const Graph = require('./../lib/graph')

should.Assertion.add('haveTheSameItems', function(other) {
  this.params = { operator: 'to be have same items' };
  this.obj.forEach(item => {
    other.should.containEql(item);
  })
  this.obj.length.should.be.equal(other.length);
})

const graph = new Graph([
    {id: 'a', text: 'blah blah'},
    {id: 'b', text: 'blah blah'},
    {id: 'c', text: 'blah blah'},
    {id: 'd', text: 'blah blah'},
    {id: 'e', text: 'blah blah'},
    {id: 'f', text: 'blah blah'},
    {id: 'g', text: 'blah blah'},
    {id: 'h', text: 'blah blah'},
    {from: 'a', to: 'b'}, 
    {from: ['b', 'c'], to: 'd'}, 
    {from: 'f', to: 'g'},
    {from: 'h', to: 'd'},
    {from: 'b', to: 'f'}
   ])

describe('Graph', () => {
  describe('#new', () => {
    it('should accept no arguments', () => {
      new Graph()
    })

    it('should accept an array of objects', () => {
      new Graph([{id: 1}])
    })

    it('should be an instance of Array', () => {
      graph.should.be.instanceof(Array)
    })
  })

  describe('#edges', () => {
    it('should find all the edges', () => {
      graph.edges().should.be.instanceof(Array)
      graph.edges().should.have.length(5)
    })
  })

  describe('#nodes', () => {
    it('should find all the nodes', () => {
      graph.nodes().should.be.instanceof(Array)
      graph.nodes().should.have.length(8)
    })
  })  

  describe('#parents', () => {
    it('should find all the parents of a node', () => {
      graph.parents('d').should.be.instanceof(Array)
      graph.parents('d').should.have.length(3)
      graph.parents('d')[0].should.be.instanceof(Object)
    })
  })  

  describe('#children', () => {
    it('should find all the children of a node', () => {
      graph.children('b').should.be.instanceof(Array)
      graph.children('b').should.have.length(2)
      graph.children('b')[0].should.be.instanceof(Object)
    })
  })  

  // describe('#connected', () => {
  //   it('should return all connected nodes in the graph when no args are supplied', () => {
  //     graph.connected().should.haveTheSameItems(['a', 'b', 'c', 'd', 'f', 'g'])
  //   })
  // })

  // describe('#children', () => {
  //   it('should return all child nodes in the graph when no args are supplied', () => {
  //     graph.children().should.haveTheSameItems(['b', 'd', 'g'])
  //   })
  // })

  // describe('#parents', () => {
  //   it('should return all parent nodes in the graph when no args are supplied', () => {
  //     graph.parents().should.haveTheSameItems(['a', 'b', 'c', 'f'])
  //   })

  //   it('should return all parent nodes for a given node ID', () => {
  //     graph.parents('d').should.haveTheSameItems(['b', 'c'])
  //   })

  //   it('should return all parent nodes for an array of node ID', () => {
  //     graph.parents(['g', 'd']).should.haveTheSameItems(['b', 'c', 'f'])
  //   })
  // })

  // describe('#orphans', () => {
  //   it('should return all orphan nodes in the graph', () => {
  //     graph.orphans().should.haveTheSameItems(['e', 'h'])
  //   })
  // })

  // describe('#ends', () => {
  //   it('should find the last node in a directed graph', () => {
  //     graph.ends().should.haveTheSameItems(['d', 'g'])
  //   })    
  // })
})

