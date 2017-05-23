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
    i: {id: 'i', text: 'blah blah i'},
    j: {id: 'j', text: 'blah blah j'},
    k: {id: 'k', text: 'blah blah k'},
    l: {id: 'l', text: 'blah blah l'},
    ab: {id: 'ab', from: 'a', to: 'b'}, 
    ac: {id: 'ac', from: 'a', to: 'c'}, 
    bc: {id: 'bc', from: 'b', to: 'c'}, 
    ca: {id: 'ca', from: 'c', to: 'a'}, 
    cd: {id: 'cd', from: 'c', to: 'd'}, 
  }

describe('Graph', () => {
  describe('#new', () => {
    it('should accept no arguments', () => {
      new Graph()
    })

    it('should accept an array of objects', () => {
      new Graph([map.a, map.b])
    })

    it('should be an instance of Array', () => {
      new Graph([map.a, map.b]).should.be.instanceof(Array)
    })
  })

  describe('#add', () => {
    it('should add a new node to the graph', () => {
      const graph = new Graph([map.a, map.b, map.c, map.ac, map.bc])
      graph.add(map.d)
      graph.nodes().length.should.equal(4)
    })

    it('should add a new edge to the graph', () => {
      const graph = new Graph([map.a, map.b, map.c, map.ac, map.bc])
      graph.add(map.cd)
      graph.edges().length.should.equal(3)
    })

    it('should add circular edge to the graph', () => {
      const graph = new Graph([map.a, map.b, map.c])
      graph.add(map.ab)
      graph.add(map.bc)
      graph.add(map.ca)
      graph.edges().should.have.length(3)
    })    

    it('should add conjoined edge to the graph', () => {
      const graph = new Graph([map.a, map.b, map.c, map.ac, map.bc])
      graph.add(map.ab)
      graph.edges().should.equal(1)
    })
  })

  describe('#edges', () => {
    it('should return all the edges', () => {
      const graph = new Graph([map.a, map.b, map.c, map.ac, map.bc])
      graph.edges().should.be.instanceof(Array)
      graph.edges().should.have.length(2)
    })
  })

  describe('#nodes', () => {
    it('should return all the nodes', () => {
      const graph = new Graph([map.a, map.b, map.c, map.ac, map.bc])
      graph.nodes().should.be.instanceof(Array)
      graph.nodes().should.have.length(3)
    })
  })  

  describe('#elements', () => {
    it('should return all the elements', () => {
      const graph = new Graph([map.a, map.b, map.c, map.ac, map.bc])
      graph.elements().should.be.instanceof(Array)
      graph.elements().should.have.length(5)
    })

    it('should reproduce the same elements from itself', () => {
      const elements = [map.a, map.b, map.c, map.ac, map.bc]
      const graph = new Graph(elements)
      new Graph(graph.elements()).elements().should.haveTheSameItemsAs(elements)
    })
  })

  describe('#parents', () => {
    it('should find all the parents of a node', () => {
      const graph = new Graph([map.a, map.b, map.c, map.d, map.ac, map.bc, map.cd])
      graph.parents('d').should.be.instanceof(Array)
      graph.parents('d').should.have.length(1)
      graph.parents('d')[0].should.be.equal(map.c)
    })
  })  

  describe('#children', () => {
    it('should find all the children of a node id', () => {
      const graph = new Graph([map.a, map.b, map.c, map.d, map.ac, map.bc, map.cd])
      graph.children('b').should.be.instanceof(Array)
      graph.children('b').should.have.length(1)
      graph.children('b')[0].should.be.equal(map.c)
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

