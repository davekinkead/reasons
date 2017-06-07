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
      const graph = new Graph([map.a, map.b, map.c])
      graph.add({from: map.a, to: map.b})
      graph.edges().length.should.equal(1)
    })

    it('should conjoin shared edge to the graph', () => {
      const graph = new Graph([map.a, map.b, map.c, map.ac, map.bc])
      graph.add({from: map.a, to: map.b})
      graph.edges().length.should.equal(1)
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
      const graph = new Graph([map.a, map.b, map.c, map.d, map.ac, map.bc, map.cd])
      graph.children(map.b).should.be.instanceof(Array)
      graph.children(map.b).should.have.length(1)
      graph.children(map.b)[0].should.be.equal(map.c)
    })

    it('should find all the children of a conjoined node', () => {
      var graph = new Graph([map.a, map.b, map.c, {from: [map.a, map.b], to: map.c}])
      graph.children(map.a).should.be.instanceof(Array)
      graph.children(map.a).should.have.length(1)
      graph.children(map.a)[0].should.be.instanceof(Object)
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
})

