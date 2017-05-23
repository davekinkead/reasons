'use strict'

const unique = require('array-unique')
const flatten = require('array-flatten')
const diff = require('array-difference')
const intersect = require('array-intersection')

module.exports = Graph

//  A Graph is simply and extended array containing node and edge objects
//  It is an abstract data structure with no DOM form 
//  We instantiate a new Graph by supplying the function with an array of elements
function Graph(elements) {
  if (!(this instanceof Graph)) return new Graph(elements)
  if (elements instanceof Array) elements.forEach(el => this.add(el))
}

//  Use Array as the prototype
Graph.prototype = Object.create(Array.prototype)

//  Add an element to the graph
Graph.prototype.add = function (el) {

  if (isEdge(el)) {
    //  if A (from node) and B (to node) both already relate to C
    //  then the relationships should be merged [A,B] -> C
    let common = intersect(this.children(el.from.id || el.from), this.children(el.to.id || el.to))
    if (common.length > 0) {
      common.map((el) => {
        let edges = this.edges().filter(e => e.to.id == el.id || e.to == el)
        let keeper = edges.shift()
        edges.map(e => keeper.from = flatten([keeper.from].concat(e.from)))
        edges.map(e => this.remove(e))
      })
    } else {
      this.unshift(el)      
    }
  } else {
    //  otherwise if the element is a node we just add it to the graph
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

      //  also remove node from any complex relations
      this.edges().filter(e => e.from instanceof Array).map((e) => {
        let ei = e.from.indexOf(el)
        e.from.splice(ei, 1)
        if (e.from.length ==1) e.from = e.from[0]
      })
    } else {
      this.splice(i, 1)
    }  
  }

  //  permit chaining during tests
  return this
}

//  Move an element to the top of the graph
Graph.prototype.focus = function (el) {
  let index = this.indexOf(el)
  if (index > -1) {
    this.push(this.splice(index, 1)[0])
  }
}

//  Return an array all the edges
Graph.prototype.edges = function () {
  return this.filter(el => el.from && el.to)
}

//  Return an array of all the nodes
Graph.prototype.nodes = function () {
  return this.filter(el => !el.from || !el.to )
}

//  Return an array of all the elements
Graph.prototype.elements = function () {
  return this
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