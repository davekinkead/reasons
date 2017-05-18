const should = require('should')
const Graph = require('./../lib/graph')

should.Assertion.add('haveTheSameItemsAs', function(other) {
  this.params = { operator: 'to be have same items' };
  this.obj.forEach(item => {
    other.should.containEql(item);
  })
  this.obj.length.should.be.equal(other.length);
})

const map = {
    a: {id: 'a', text: 'blah blah a'},
    b: {id: 'b', text: 'blah blah b'},
    c: {id: 'c', text: 'blah blah c'},
    d: {id: 'd', text: 'blah blah d'},
    e: {id: 'e', text: 'blah blah e'},
    f: {id: 'f', text: 'blah blah f'},
    g: {id: 'g', text: 'blah blah g'},
    h: {id: 'h', text: 'blah blah h'},
    i: {id: 'i', from: 'a', to: 'b'}, 
    j: {id: 'j', from: ['b', 'c'], to: 'd'}, 
    k: {id: 'k', from: 'f', to: 'g'},
    l: {id: 'l', from: 'h', to: 'd'},
    m: {id: 'm', from: 'b', to: 'f'}
  }

const elements = []
for (key in map) {
  elements.push(map[key])
}
const graph = new Graph(elements)

describe('Graph', () => {
  describe('#new', () => {
    it('should accept no arguments', () => {
      new Graph()
    })

    it('should accept an array of objects', () => {
      new Graph(elements)
    })

    it('should be an instance of Array', () => {
      new Graph(elements).should.be.instanceof(Array)
    })
  })

  describe('#edges', () => {
    it('should return all the edges', () => {
      graph.edges().should.be.instanceof(Array)
      graph.edges().should.have.length(5)
    })
  })

  describe('#nodes', () => {
    it('should return all the nodes', () => {
      graph.nodes().should.be.instanceof(Array)
      graph.nodes().should.have.length(8)
    })
  })  

  describe('#elements', () => {
    it('should return all the elements', () => {
      graph.elements().should.be.instanceof(Array)
      graph.elements().should.haveTheSameItemsAs(elements)
    })

    it('should reproduce the same elements from itself', () => {
      new Graph(graph.elements()).elements().should.haveTheSameItemsAs(elements)
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
    it('should find all the children of a node id', () => {
      graph.children('b').should.be.instanceof(Array)
      graph.children('b').should.have.length(2)
      graph.children('b')[0].should.be.instanceof(Object)
    })

    it('should find all the children of a node', () => {
      var graph = new Graph([map.a, map.b, map.c, {from: [map.a, map.b], to: map.c}])
      graph.children('a').should.be.instanceof(Array)
      graph.children('a').should.have.length(1)
      graph.children('a')[0].should.be.instanceof(Object)
    })
  })  

  describe('#remove', () => {
    it('should remove an element from the graph', () => {
      var graph = new Graph([map.a, map.b, map.c, {from: map.a, to: map.c}])
      graph.remove(map.a).should.have.length(2)
    })

    it('should remove an complex element from the graph', () => {
      var graph = new Graph([map.a, map.b, map.c, {from: [map.a, map.b], to: map.c}])
      graph.remove(map.a).should.have.length(3)
      graph.edges()[0].from.should.be.equal(map.b)
    })    
  })

  // describe('#connected', () => {
  //   it('should return all connected nodes in the new Graph(elements) when no args are supplied', () => {
  //     new Graph(elements).connected().should.haveTheSameItems(['a', 'b', 'c', 'd', 'f', 'g'])
  //   })
  // })

  // describe('#children', () => {
  //   it('should return all child nodes in the new Graph(elements) when no args are supplied', () => {
  //     new Graph(elements).children().should.haveTheSameItems(['b', 'd', 'g'])
  //   })
  // })

  // describe('#parents', () => {
  //   it('should return all parent nodes in the new Graph(elements) when no args are supplied', () => {
  //     new Graph(elements).parents().should.haveTheSameItems(['a', 'b', 'c', 'f'])
  //   })

  //   it('should return all parent nodes for a given node ID', () => {
  //     new Graph(elements).parents('d').should.haveTheSameItems(['b', 'c'])
  //   })

  //   it('should return all parent nodes for an array of node ID', () => {
  //     new Graph(elements).parents(['g', 'd']).should.haveTheSameItems(['b', 'c', 'f'])
  //   })
  // })

  // describe('#orphans', () => {
  //   it('should return all orphan nodes in the new Graph(elements)', () => {
  //     new Graph(elements).orphans().should.haveTheSameItems(['e', 'h'])
  //   })
  // })

  // describe('#ends', () => {
  //   it('should find the last node in a directed new Graph(elements)', () => {
  //     new Graph(elements).ends().should.haveTheSameItems(['d', 'g'])
  //   })    
  // })
})

