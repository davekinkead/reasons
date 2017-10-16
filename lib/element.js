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
  init(element)
  return element
}


/**
 * Initialize an Element
 *  @params element Node or Edge
 */
function init (element) {
  element.id = element.id || Math.random().toString(36).slice(-5)

  if (element.isEdge()) {

    //  Default Edge values
    element.from = element.from
    element.to = element.to
    element.type = element.type || 'supports'
    element.paths = []
  } else {

    //  Default Node values
    element.text = element.text || 'A reason'
    element.width = maxWidth
    element.height = fontSize * 3.5
    element.x1 = element.x || 0
    element.y1 = element.y || 0
    element.x2 = element.x + element.width
    element.y2 = element.y + element.height
  }
}


/**
 * Returns true if an element is an Edge
 */
function isEdge () {
  return (this.to && this.from) ? true : false
}


/**
 * Returns true if an element is a Node
 */
function isNode () {
  return (this.isEdge()) ? false : true
}


/**
 * Exports an element's data
 */
function save () {
  if (this.isEdge()) {

    //  Export an Edge
    return {
      id: this.id,
      type: this.type,
      from: convertObjectsToIds(this.from),
      to: convertObjectsToIds(this.to)
    }
  } else {

    //  Export a Node
    return {
      id: this.id, 
      text: this.text,
      x: this.x1,
      y: this.y1
    }    
  }
}

/**
 * Helper function to ensure permit edge references to both nodes and node.ids
 */
 function convertObjectsToIds (obj) {
  if (obj instanceof Array) {
    return obj.map(el => el.id || el)
  } else {
    return obj.id || obj    
  }
}