'use strict'

const unique = require('array-unique')
const flatten = require('array-flatten')
const diff = require('array-difference')
const intersect = require('array-intersection')

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
  if (el.from && el.to) {

    //  if A (from) and B (to) both already relate to C
    let common = intersect(this.children(el.from.id || el.from), this.children(el.to.id || el.to))
    if (common.length > 0) {

      //  then the relationships should be merged [A,B] -> C
      common.map((el) => {
        let edges = this.edges().filter(e => e.to.id == el.id || e.to == el)
        let keeper = edges.shift()
        edges.map((el) => {
          keeper.from = flatten([keeper.from].concat(el.from))
        }).map(el => this.remove(el))
      })

    } else {
      this.unshift(el)      
    }
  } else {
    this.push(el)
  }
}

//  remove an element from the graph
Graph.prototype.remove = function (el) {
  let i = this.indexOf(el)
  if (i > -1) {

    //  remove edges is el is a node
    if (isNode(el)) {

      //  find associated edges first
      let edges = this.filter((el) => { 
        return (el.from && el.to) && (el.from.id == this[i].id || el.to.id == this[i].id)
      })

      //  remove the node
      this.splice(i, 1)

      //  and then the edges
      edges.forEach((edge) => {
        let ei = this.indexOf(edge)
        this.splice(ei, 1)
      })
    } else {
      this.splice(i, 1)
    }  
  }

  //  permit chaining during tests
  return this
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
    this.edges().filter(el => el.to == id || el.to.id == id).map(el => el.from)
  )).map(el => this.find(i => i.id == el))
}

//  Find all children of a node or id
Graph.prototype.children = function (id) {
  if (id instanceof Object) id = id.id

  return this.edges().filter((el) => {
    return flatten([el.from]).map(el => el.id || el).indexOf(id) > -1
  }).map(el => el.to)
    .map(el => this.find(i => i == el || i.id == el))
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