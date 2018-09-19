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

  return init(element)
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
    locate(element, {x: element.x || 0, y: element.y || 0})
  }

  return element
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

    //  Determine a hit for each of the paths
    let hit = false
    this.paths.forEach((path) => {
      if (differenceOfVectors(el, path) < 0.05)
        hit = true
    })

    //  Estimate collision of the label box
    let width = this.type.length * 5
    hit = (el.x < this.center.x - width || el.x > this.center.x + width || 
            el.y < this.center.y - 10 ||  el.y > this.center.y +  10) ? false : true

    //  otherwise
    return hit
  } else {

    //  is the element a node or x,y coordinate
    if (el.isNode && el.isNode())
      return (this.x2 < el.x1 || this.x1 > el.x2 || this.y1 > el.y2 || this.y2 < el.y1) ? false : true
    else
      return (el.x > this.x1 && el.x < this.x2 && el.y > this.y1 && el.y < this.y2) ? true : false      
  }
}

/**
 * Increases the x & y values of an element
 */
function move (position) {
  if (this.isNode()) {
    this.x = position.x
    this.y = position.y
    locate(this, position)
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
      x: parseInt(this.x1 + this.width/2),
      y: parseInt(this.y1 + this.height/2)
    }    
  }
}


/**
 * Helper function to set position values
 */
function locate (element, position) {
  if (element.isNode()) {
    element.x1 = parseInt(position.x - element.width/2)
    element.x2 = parseInt(position.x + element.width/2)
    element.y1 = parseInt(position.y - element.height/2)
    element.y2 = parseInt(position.y + element.height/2)
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

/**
 * Helper function to calculate the difference between 2 vectors el -> x1,y1 and el -> x2,y2
 */
function differenceOfVectors (point, path) {
  return Math.abs((Math.atan2(point.y-path.y1, point.x-path.x1))
        -(Math.atan2(path.y2-point.y, path.x2-point.x)))
}