const unique = require('array-unique')
const flatten = require('array-flatten')
const diff = require('array-difference')
const intersect = require('array-intersection')
// const Node = require('./node')
// const Edge = require('./edge')

module.exports = Graph

//  A graph is simply and extended array containing node and edge objects
function Graph(elements) {
  if (!(this instanceof Graph)) return new Graph(elements)
  if (elements instanceof Array) elements.forEach(el => this.add(el))
}

//  Use Array as the prototype
Graph.prototype = Object.create(Array.prototype)

//  Add an element
Graph.prototype.add = function (el) {
  if (el.to && el.from) {

    //  if A (from) and B (to) both already relate to C
    //  then the relationships should be merged [A,B] -> C

    // if (intersect(this.children(el.from.id || el.from), this.children(el.to.id || el.to))) {}
    this.unshift(el)
  } else {
    this.push(el)
  }
}

//  Find all the edges
Graph.prototype.edges = function () {
  return this.filter(el => el.from && el.to)
}

//  Find all the nodes
Graph.prototype.nodes = function () {
  return this.filter(el => !el.from || !el.to )
}

//  Find all the parents of a node or id
Graph.prototype.parents = function (id) {
  if (id instanceof Object) id = id.id

  return unique(flatten(
    this.edges().filter(e => e.to == id || e.to.id == id).map(e => e.from)
  )).map(e => this.find(i => i.id == e))
}

//  Find all children of a node or id
Graph.prototype.children = function (id) {
  if (id instanceof Object) id = id.id
  
  return this.edges().filter(el => flatten([el.from]).map(e => e.id || e).indexOf(id) > -1)
}

//  Is an element an edge?
function isEdge (el) {
  return (el.to && el.from) ? true : false
}

//  Is an element a node?
function isNode (el) {
  return (isEdge(el)) ? false : true
}


// function Graph (graph) {
//   if (!graph) graph = {nodes: {}, edges: []}
//   if (!(this instanceof Graph)) return new Graph(graph)
//   this.nodes = graph.nodes || graph.vertices || graph.reasons
//   this.edges = graph.edges || graph.arcs || graph.relations
// }

// Graph.prototype.children = function (id) {
//   if (! this.edges) return []
//   return unique( flatten( this.edges.map((edge) => { return edge.to })) )
// }

// Graph.prototype.parents = function (id) {
//   if (! this.edges) return []
//   if (id) {
//     return unique( flatten( this.edges.filter((edge) => {
//       return id == edge.to || id.indexOf(edge.to) > -1
//     }).map((edge) => {
//       return edge.from
//     })))
//   } else {
//     return unique( flatten( this.edges.map((edge) => { return edge.from })) )    
//   }
// }

// Graph.prototype.connected = function (id) {
//   return unique( this.parents().concat(this.children()) )
// }

// Graph.prototype.orphans = function () {
//   return diff(Object.keys(this.nodes), this.connected())
// }

// Graph.prototype.ends = function () {
//   return this.children().filter((i) => {
//     return this.parents().indexOf(i) < 0
//   })
// }

// Graph.prototype.addNode = function (id, object) {}

// Graph.prototype.removeNode = function (id) {}

// Graph.prototype.addEdge = function (object) {}

// Graph.prototype.removeEdge = function (object) {}

// Graph.prototype.root = function () {}