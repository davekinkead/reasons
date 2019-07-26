//  Reasons.js by Dave Kinkead
//  Copyright 2017-2019 University of Queensland
//  Available under the MIT license

'use strict'

const Utils   = require('./utils')
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
      return a.to ? 1: -1
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
    this.push(element)
  } else {

    //  Sanity check to ensure that edges only join nodes
    if (this.hasDuplicate(element) || this.isFromEdge(element) || this.isToEdge(element)) {
      return false
    }

    //  Edges can connect independent or conjoined reasons.
    //  If A B & C both already support D
    //  and a new edge is added from A to B or vice versa
    //  then the relationships should be merged [A,B] -> D
    //  and C -> D kept unchanged
    let commonChildren = Utils.intersection(
      Utils.flatten(element.from.map(e => this.children(e))),
      this.children(element.to)
    ).map(el => el.id)

    if (commonChildren.length > 0) {
      let commonParents = Utils.flatten([element.from, element.to]).map(el => el.id || el)

      //  remove the edge that contains element.from to common children
      this.edges().forEach((edge) => {
        if (Utils.intersection(element.from, edge.from).length > 0)
          this.remove(edge)

        if (edge.from.includes(element.to)) {
          this.push(Element.mixin({
            from: Utils.flatten([edge.from, element.from]),
            to: edge.to,
            type: edge.type
          }))
          this.remove(edge)
        }
      })
    } else {
      this.push(element)
    }
  }
}


/**
 * Removes an existing element from the Graph.
 *  If a node is removed, it should also remove relevent edges
 *
 *  @param el the element to remove
 */
 Graph.prototype.remove = function (el) {
  let i = this.indexOf(el)

  if (i > -1) {
    if (el.isNode()) {

      //  find associated edges first
      let edgesTo = this.edges().filter(edge => edge.to == el.id)
      let edgesFrom = this.edges().filter(edge => edge.from.includes(el.id))

      //  determine if any associated edge is conjoined
      let conjoined = edgesFrom.filter(edge => edge.from.length > 1)

      //  remove the node
      this.splice(i, 1)

      //  and then the associated edges
      edgesTo.forEach((edge) => {
        if (this.indexOf(edge) > -1)
          this.splice(this.indexOf(edge), 1)
      })

      edgesFrom.forEach((edge) => {
        if (this.indexOf(edge) > -1)
          this.splice(this.indexOf(edge), 1)
      })

      //  also remove node from any complex relations
      edgesFrom.filter(e => e.from instanceof Array).map((e) => {
        if (e.from.indexOf(el) > -1)
          e.from.splice(e.from.indexOf(el), 1)
        if (e.from.length === 1)
          e.from = e.from[0]
      })

      //  and now modify the conjoined edges and add them back
      conjoined.forEach((edge) => {
        edge.from.splice(edge.from.indexOf(el.id), 1)
        this.push(edge)
      })
    } else {
      this.splice(i, 1)
    }
  }

  //  permit chaining during tests
  return this
}


/**
 * Moves an element to the front of the Graph and sets the focused flag.
 * Useful for assiting with layouts.
 *
 * @param el an element to focus
 */
 Graph.prototype.focus = function (el) {
  let index = this.indexOf(el)

  if (index > -1) {
    this.push(this.splice(index, 1)[0])
  }

  this.forEach(function (e) {
    e.focused = (e === el) ? true : false
  })

  //  permit chaining during tests
  return el
}

 Graph.prototype.undoFocus = function () {
  const last = this.pop();
  this.unshift(last);

  this.forEach(function (e) {
    e.focused = (e === last) ? true : false
  })

  //  permit chaining during tests
  return last
}


/**
 * Unsets the focused flag of an element
 */
Graph.prototype.unfocus = function () {
  this.forEach(function (el) {
    el.focused = false
  })

  //  permit chaining during tests
  return this
}


/**
 * Returns the last element of the array
 */
Graph.prototype.last = function () {
  return this[this.length - 1]
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
      this.edges().filter(el => el.to == id).map(el => el.from)
    ).map(el => this.find(i => i.id == el))
}


/**
 * Find all the children for a given node or id
 *  Returns an array of objects
 *
 *  @params id a Node or String id of a Node
 */
Graph.prototype.children = function (id) {
  if (id instanceof Object) id = id.id

  return Utils.unique(this.edges().filter((el) => {
    return Utils.flatten([el.from]).map(el => el.id || el).indexOf(id) > -1
  }).map(el => el.to)
    .map(el => this.find(i => i == el || i.id == el)))
}


/**
 * Determine if the proposed element is a dupliucate
 *  Returns boolean
 *
 *  @params edge object
 */
Graph.prototype.hasDuplicate = function (el) {
  Element.mixin(el)
  let dupe = false

  if (el.isEdge()) {
    this.edges().forEach((edge) => {
      if (el.to === edge.to && el.from.toString() === edge.from.toString()) {
        dupe = true
      }
    })
  }
  return dupe
}


/**
 * Determine if the proposed Edge is from an Edge
 *  Returns boolean
 *
 *  @params edge object
 */
Graph.prototype.isFromEdge = function (element) {
  var fromEdge = false
  element.from.forEach((el) => {
    var match = this.edges().find((e) => e.id == el)
    if (match) fromEdge = true
  })

  return fromEdge
}


/**
 * Determine if the proposed Edge is to an Edge
 *  Returns boolean
 *
 *  @params edge object
 */
Graph.prototype.isToEdge = function (element) {
  let to = this.find((el) => el.id == element.to)
  if (to && to.isEdge()) {
    return true
  }
}