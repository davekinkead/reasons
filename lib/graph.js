const unique = require('array-unique')
const flatten = require('array-flatten')
const diff = require('array-difference')

module.exports = Graph

function Graph (graph) {
  if (!(this instanceof Graph)) return new Graph(graph)
  this.nodes = graph.nodes || graph.vertices
  this.edges = graph.edges || graph.arcs
}

Graph.prototype.addNode = function (id, object) {}

Graph.prototype.removeNode = function (id) {}

Graph.prototype.addEdge = function (object) {}

Graph.prototype.removeEdge = function (object) {}

Graph.prototype.children = function (id) {
  return unique( flatten( this.edges.map((edge) => { return edge.to })) )
}

Graph.prototype.parents = function (id) {
  if (id) {
    return unique( flatten( this.edges.filter((edge) => {
      return id == edge.to || id.indexOf(edge.to) > -1
    }).map((edge) => {
      return edge.from
    })))
  } else {
    return unique( flatten( this.edges.map((edge) => { return edge.from })) )    
  }
}

Graph.prototype.connected = function (id) {
  return unique( this.parents().concat(this.children()) )
}

Graph.prototype.orphans = function () {
  return diff(Object.keys(this.nodes), this.connected())
}

Graph.prototype.ends = function () {
  return this.children().filter((i) => {
    return this.parents().indexOf(i) < 0
  })
}

Graph.prototype.root = function () {}