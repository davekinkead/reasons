'use strict'

const Utils = require('./utils')

module.exports = Relation


/**
 * Creates a Relation element to be used in a Graph.
 * Opts must specify at least a from: and to: 
 * id: and type: are optional with defaults set.
 *
 * @params opts  a hash of arguments
 */
function Relation (opts) {
  if (!this instanceof Relation) return new Relation(opts)

  this.id = opts.id || Math.random().toString(36).slice(-5)
  this.from = opts.from
  this.to = opts.to
  this.type = opts.type || 'supports'
  this.paths = []

  return this
}


/**
 * Renders the relation using HTML Canvas.
 *
 * @params context  the canvas context to render in
 */
Relation.prototype.draw = function (context) {
  this.locate()

  //  stroke style
  let rgb = '0,0,0'
  let opacity = 0.5
  if (this.hovering) opacity = 0.75
  if (this.selected) opacity = 0.9
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineWidth = 4

  //  stroke position
  context.beginPath()
  this.paths.forEach((path) => {
    context.moveTo(path.x1, path.y1)
    context.lineTo(path.x2, path.y2)    
  })

  //  arrow tip
  let last = this.paths[this.paths.length-1]
  let arrow = arrowify(last)
  context.lineTo(arrow.x1, arrow.y1)
  context.moveTo(last.x2, last.y2)
  context.lineTo(arrow.x2, arrow.y2)
  context.stroke()

  //  text stroke
  let textWidth = context.measureText(this.type).width + 5
  context.clearRect(this.center.x-textWidth/2, this.center.y-15, textWidth, 20)

  //  label
  context.fillStyle = 'rgba(0,0,0,0.8)'
  context.font = '14px sans-serif'
  context.textAlign = 'center'
  context.fillText(this.type, this.center.x, this.center.y) 

  if (this.intersection)
    context.fillRect(this.intersection.x, this.intersection.y, 10, 10)
}

//  Returns a boolean if there is a coordinate overlap
Relation.prototype.collides = function (point) {
  this.locate()

  //  Deterine a hit for each of the paths
  let hit = false
  this.paths.forEach((path) => {
    if (differenceOfVectors(point, path) < 0.05)
      hit = true
  })

  //  Estimate collision of the label box
  let width = this.type.length * 5
  hit = (point.x < this.center.x - width || point.x > this.center.x + width || point.y < this.center.y - 10 ||  point.y > this.center.y +  10) ? false : true

  //  otherwise
  return hit
}

Relation.prototype.move = function () {
  this.locate()
}

//  Returns a list of `paths` between nodes for this relation
Relation.prototype.locate = function () {

  //  find the weighted center point
  let elements = Utils.flatten([this.from, this.to])
  this.center = elements.map((el) => {
      return {x: (el.x1+(el.width)/2), y: (el.y1+(el.height )/2)}
    }).reduce((acc, el) => {
      return {x: acc.x + el.x, y: acc.y + el.y}
    })
  this.center.x = parseInt(this.center.x/(elements.length))
  this.center.y = parseInt(this.center.y/(elements.length))

  //  create paths between from and to elements
  if (this.from instanceof Array) {

    //  create pairs from from-points to center to to-point
    this.paths = this.from.map((el) => {
      return {
        x1: parseInt(el.x1+(el.x2-el.x1)/2),
        y1: parseInt(el.y1+(el.y2-el.y1)/2),
        x2: parseInt(this.center.x),
        y2: parseInt(this.center.y)
      }
    })

    //  move the 'to' point back down the path to just outside the node.
    let offset = pointOfIntersection(this.center, this.to, 5)

    // get offset x,y from rectangle intersect
    this.paths.push({
      x1: parseInt(this.center.x),
      y1: parseInt(this.center.y),
      x2: parseInt(this.to.x1+(this.to.x2-this.to.x1)/2)-offset.x,
      y2: parseInt(this.to.y1+(this.to.y2-this.to.y1)/2)+offset.y 
    })
  } else {

    //  when only a single from element exists
    let offset = pointOfIntersection(this.center, this.to, 5)

    this.paths = [{
      x1: parseInt(this.from.x1+(this.from.x2-this.from.x1)/2),
      y1: parseInt(this.from.y1+(this.from.y2-this.from.y1)/2),
      x2: parseInt(this.to.x1+(this.to.x2-this.to.x1)/2)-offset.x,
      y2: parseInt(this.to.y1+(this.to.y2-this.to.y1)/2)+offset.y 
    }]
  }
}

/**
 * Exports the relation data structure as an Object.
 * from: and to: are exported as IDs only.
 */
Relation.prototype.export = function () {
  return {
    id: this.id,
    type: this.type,
    from: convertObjectsToIds(this.from),
    to: convertObjectsToIds(this.to)
  }
}

//  When exporting Reasons, only IDs should be passed
function convertObjectsToIds (obj) {
  if (obj instanceof Array) {
    return obj.map(el => el.id || el)
  } else {
    return obj.id || obj    
  }
}

//  Helper function to make arrow tips
function arrowify(path) {
  let angle = Math.atan2(path.y1-path.y2, path.x1-path.x2)
  return {
    x1: path.x2 + 10*Math.cos(angle+0.5),
    y1: path.y2 + 10*Math.sin(angle+0.5),
    x2: path.x2 + 10*Math.cos(angle-0.5),
    y2: path.y2 + 10*Math.sin(angle-0.5)    
  }
}


//  Calculates the difference between 2 vectors el -> x1,y1 and el -> x2,y2
//  TODO: Add tests
function differenceOfVectors (point, path) {
  return Math.abs((Math.atan2(point.y-path.y1, point.x-path.x1))
        -(Math.atan2(path.y2-point.y, path.x2-point.x)))
}


//  determines the intersection x,y from a point to center of rectangle
//  TODO: Add tests
function pointOfIntersection (from, rect, buffer) {
  let center = {x: rect.x1 + rect.width/2, y: rect.y1 + rect.height/2}

  //  determine the angle of the path
  let angle = Math.atan2(from.y - center.y, center.x - from.x)
  let absCos = Math.abs(Math.cos(angle))
  let absSin = Math.abs(Math.sin(angle))  

  let distance = (rect.width/2*absSin <= rect.height/2*absCos) ? rect.width/2/absCos : rect.height/2/absSin
  distance += buffer || 0

  return {x: distance * Math.cos(angle), y: distance * Math.sin(angle)}
}