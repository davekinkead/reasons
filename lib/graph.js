'use strict'

const Utils = require('./utils')
const Element = require('./element')

module.exports = Graph


/**
 * A Graph is simply an extended array containing node and edge objects.
 *  It is an abstract data structure with no DOM form.
 *  Edges will contain references to node objects.
 *
 * @param elements  the elements (nodes & edges) to consitute the graph
 */
function Graph(elements) {

  //  sort the elements so nodes are added before edges
  if (elements instanceof Array) {
    elements.sort((a,b) => {
      return a.to ? -1: 1 
    }).forEach(el => this.add(el))
  }
}


/**  
 * Use Array as the prototype
 */
Graph.prototype = Object.create(Array.prototype)


/**
 * Adds a new element to the Graph.
 *  Nodes should be added before edges as the latter referrence the former
 *
 * @param element an element to add
 */
Graph.prototype.add = function (element) {

  //  Mixin Element behaviour
  Element.mixin(element)

  
  if (element.isNode()) {
    this.unshift(element)
  } else {

    //  from: should be stored as from: [nodeObj]
    //  to: should be stored as to: nodeObj


    //  Edges can connect independent or conjoined reasons. 
    //  If A B & C both already support D
    //  and a new edge is added from A to B or vice versa
    //  then the relationships should be merged [A,B] -> D
    //  and C -> D kept unchanged  
    let commonChildren = Utils.intersection(
      this.children(element.from), 
      this.children(element.to.id || element.to)
    ).map(el => el.id)

    if (commonChildren.length > 0) {
      let commonParents = Utils.flatten([element.from, element.to]).map(el => el.id || el)
      commonChildren.map((child) => {

        //  remove edges between A -> D and B -> D
        this.edges().forEach((edge) => {
          if (commonParents.includes(edge.from.id) && edge.to.id == child) {
            this.remove(edge)
          }
        })

        //  and replace with [A,B] -> D
        this.add({
          from: commonParents.map(el => this.find(e => e.id == el)), 
          to: this.find(e => e.id == child)
        })
      })
    } else {
      this.push(element)  
    }
  }
}


// Graph.prototype._object_refs = function () {
//   let nodes = this.nodes()
//   let edges = this.edges()

//   edges.forEach((edge) => {

//     // Replace node ids with actual node objects
//     if (edge.from instanceof Array) {
//       edge.from = edge.from.map((el) => {
//         replaceWithObject(el, nodes)
//       })
//     } else {
//       edge.from = replaceWithObject(edge.from, nodes)
//     }

//     if (edge.to instanceof Array) {
//       edge.to = edge.to.map((el) => {
//         replaceWithObject(el, nodes)
//       })
//     } else {
//       edge.to = replaceWithObject(edge.to, nodes)
//     }    
//   })
// }

// function replaceWithObject(id, nodes) {
//   if (typeof(id) === 'string') {
//     return nodes.find((node) => {
//       return node.id === id
//     })
//   }

//   return id
// }


/**
 * Removes an existing Reason or Relation from the Graph.
 *
 * @param el the element to remove
 */
 Graph.prototype.remove = function (el) {
  let i = this.indexOf(el)
  if (i > -1) {

    //  remove edges is el is a node
    if (el.isNode()) {
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


/**
 * Moves an element to the front of the Graph.  Useful for assiting with
 * layouts.
 *
 * @param el an element to focus
 */
 Graph.prototype.focus = function (el) {
  let index = this.indexOf(el)
  if (index > -1) {
    this.push(this.splice(index, 1)[0])
  }

  //  permit chaining during tests
  return this
}


/**
 * Returns an array of all the Graph's edges
 */
 Graph.prototype.edges = function () {
  return this.filter(el => el.from && el.to)
}


/**
 * Returns an array of all the Graph's nodes
 */
Graph.prototype.nodes = function () {
  return this.filter(el => !el.from || !el.to )
}


/**
 * Returns an array of all the Graph's elements
 */
Graph.prototype.elements = function () {
  return this
}


/**
 * Find all the parents for a given node or id
 *  Returns an array of objects
 *
 *  @params id a Node or String id of a Node
 */
Graph.prototype.parents = function (id) {
  if (id instanceof Object) id = id.id

  return Utils.flatten(
      this.edges().filter(el => el.to == id || el.to.id == id).map(el => el.from)
    ).map(el => this.find(i => i.id == el.id))
}


/**
 * Find all the children for a given node or id
 *  Returns an array of objects
 *
 *  @params id a Node or String id of a Node
 */
Graph.prototype.children = function (id) {
  if (id instanceof Object) id = id.id

  return this.edges().filter((el) => {
    return Utils.flatten([el.from]).map(el => el.id || el).indexOf(id) > -1
  }).map(el => el.to)
    .map(el => this.find(i => i == el || i.id == el))
}