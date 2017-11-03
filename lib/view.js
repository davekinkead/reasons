'use strict'

const Element = require('./Element')
const Utils = require('./utils')

const maxWidth = 200
const padding = 10
const fontSize = 16

let graph = {}


/**
 * Singleton View module to render a canvas.
 */
module.exports = (function () {
  
  /**
   * Initialise the view for this argument map instance 
   *  by appending a HTML canvas element.
   *
   *  @params mapper  The argument map to provide a view for
   */
  function init (argument) {
    let domBB = argument.DOM.getBoundingClientRect()
    let canvas = Utils.buildNode(
      'canvas', 
      {id: 'reasons-'+argument.DOM.id}, 
      {width: domBB.width, height: domBB.height}
    )

    argument.DOM.appendChild(canvas)
    argument.context = canvas.getContext('2d')
  }


  /**
   * Render an argument map instance
   */
  function draw (argument) {
    graph = argument.graph

    //  draw edges before nodes
    graph.edges().forEach(el => draw_edge(el, argument.context))
    graph.nodes().forEach(el => draw_node(el, argument.context))
  }

  return {
    init,
    draw
  }

})();


/**
 * Private: Draws a node on the canvas
 */
function draw_node (node, context) {

  //  word wrap the text 
  let text = wordWrap(node.text, context)

  //  recalculate the height
  let height = text.length * fontSize + fontSize * 2.5
  resize(node)

  //  clear a white rectangle for background
  context.clearRect(node.x1, node.y1, node.width, node.height)  

  //  draw a solid rounded border
  let cornerRadius = 4
  let rgb = '0,0,0'
  let opacity = 0.5
  if (node.hovering) opacity = 0.75
  if (node.selected) opacity = 0.9
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineJoin = "round"
  context.lineWidth = cornerRadius
  context.strokeRect(
    node.x1+cornerRadius/2, node.y1+cornerRadius/2, 
    node.width-cornerRadius, node.height-cornerRadius
  )

  //  set text box styles
  context.fillStyle = 'rgba(0,0,0,0.8)'
  context.font = '16px sans-serif'
  context.textAlign = 'center'

  //  add the text content
  text.forEach((line, i) => {
    context.fillText(line, node.x1 + node.width/2, node.y1  + (i+2) * fontSize)
  })  
}

/**
 * Private: Draws an edge on the canvas
 */
function draw_edge (edge, context) {
  locate(edge)

  //  stroke style
  let rgb = '0,0,0'
  let opacity = 0.5
  if (edge.hovering) opacity = 0.75
  if (edge.selected) opacity = 0.9
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineWidth = 4

  //  stroke position
  context.beginPath()
  edge.paths.forEach((path) => {
    context.moveTo(path.x1, path.y1)
    context.lineTo(path.x2, path.y2)    
  })

  //  arrow tip
  let last = edge.paths[edge.paths.length-1]
  let arrow = arrowify(last)
  context.lineTo(arrow.x1, arrow.y1)
  context.moveTo(last.x2, last.y2)
  context.lineTo(arrow.x2, arrow.y2)
  context.stroke()

  //  text stroke
  let textWidth = context.measureText(edge.type).width + 5
  context.clearRect(edge.center.x-textWidth/2, edge.center.y-15, textWidth, 20)

  //  label
  context.fillStyle = 'rgba(0,0,0,0.8)'
  context.font = '14px sans-serif'
  context.textAlign = 'center'
  context.fillText(edge.type, edge.center.x, edge.center.y) 

  if (edge.intersection)
    context.fillRect(edge.intersection.x, edge.intersection.y, 10, 10)
}


/**
 * Private: Returns a list of `paths` between nodes for this relation
 *  Requires reference to @graph from outside of function
 */
function locate (edge) {

  //  collect all the nodes involved
  let ids = Utils.flatten([edge.from, edge.to])
  let elements = graph.filter((el) => {
    return ids.includes(el.id)
  })

  //  find the weighted center point of those nodes
  edge.center = elements.map((el) => {
      return {x: (el.x1+(el.width)/2), y: (el.y1+(el.height )/2)}
    }).reduce((acc, el) => {
      return {x: acc.x + el.x, y: acc.y + el.y}
    })
  edge.center.x = parseInt(edge.center.x/(elements.length))
  edge.center.y = parseInt(edge.center.y/(elements.length))

  //  create pairs from from-points to center to to-point
  edge.paths = edge.from.map((node) => {
    let el = elements.find(e => e.id == node)
    return {
      x1: parseInt(el.x1+(el.x2-el.x1)/2),
      y1: parseInt(el.y1+(el.y2-el.y1)/2),
      x2: parseInt(edge.center.x),
      y2: parseInt(edge.center.y)
    }
  })

  //  move the 'to' point back down the path to just outside the node.
  let to = elements.find(e => e.id == edge.to)
  let offset = pointOfIntersection(edge.center, to, 5)

  // get offset x,y from rectangle intersect
  edge.paths.push({
    x1: parseInt(edge.center.x),
    y1: parseInt(edge.center.y),
    x2: parseInt(to.x1 + (to.x2 - to.x1)/2) - offset.x,
    y2: parseInt(to.y1 + (to.y2 - to.y1)/2) + offset.y 
  })
}

function resize (node) {
  node.x2 = node.x1 + node.width
  node.y2 = node.y1 + node.height
}

function wordWrap(text, context) {
  let words = text.split(' ')
  let lines = []
  let line = ''

  words.forEach((word) => {
    let width = context.measureText(line + ' ' + word).width

    if (width < (maxWidth - padding * 2) ) {
      line += ' ' + word
    } else { 
      lines.push(line)
      line = word
    }
  })

  lines.push(line)
  return lines
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

//  determines the intersection x,y from a point to center of rectangle
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