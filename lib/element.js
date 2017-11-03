'use strict'

const Utils = require('./Utils')
const maxWidth = 200
const padding = 10
const fontSize = 16


module.exports = {
  mixin, isEdge, isNode, save
}


/**
 * Mixes in specific behaviour of an Element to an Object
 */
function mixin(element) {
  element.isEdge = isEdge
  element.isNode = isNode
  element.export = save
  element.collides = collides
  element.move = move
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

    /** 
     * Default Edge values:
     *  From should return ['node_id', 'node_id'] 
     *  To should return 'node_id'
     *  Path should be an empty array to be set in the View/UI
     */
    element.from = Utils.flatten([element.from]).map((from) => { return from.id || from })
    element.to = element.to.id || element.to
    element.type = element.type || 'supports'
    element.paths = []
  } else {

    //  Default Node values
    element.text = element.text || 'A reason'
    element.width = maxWidth
    element.height = fontSize * 3.5
    element.x1 = element.x || 0
    element.y1 = element.y || 0
    element.x2 = element.x1 + element.width
    element.y2 = element.y1 + element.height
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
 * Determines if an point is withing the boundaries of an element
 */
function collides (el) {
  if (this.isEdge()) {
    return false
  } else {
    //  when the element has an x,y value
    return (el.x > this.x1 && el.x < this.x2 && el.y > this.y1 && el.y < this.y2) ? true : false
  }
}

/**
 * Increases the x & y values of an element
 */
function move (pos) {
  if (this.isNode()) {
    // this.x = x
    this.x1 = pos.x
    this.x2 = parseInt(this.width + pos.x)
    // this.y = y
    this.y1 = pos.y
    this.y2 = parseInt(this.height + pos.y)
  }
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