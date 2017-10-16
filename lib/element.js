'use strict'

const maxWidth = 200
const padding = 10
const fontSize = 16


module.exports = {
  mixin, isEdge, isNode, save
}


/**
 * Mixes in the behaviour of an Element to an Object
 */
function mixin(element) {
  element.isEdge = isEdge
  element.isNode = isNode
  element.export = save
}


/**
 * Returns true if an element is an Edge
 *  @params el a Node or Edge
 */
function isEdge () {
  return (this.to && this.from) ? true : false
}


/**
 * Returns true if an element is a Node
 *  @params el a Node or Edge
 */
function isNode () {
  return (this.isEdge()) ? false : true
}


/**
 * Exports an element's data
 */
function save () {
  if (this.isEdge()) {

  } else {
    return {
      id: this.id, 
      text: this.text,
      x: this.x1,
      y: this.y1
    }    
  }
}