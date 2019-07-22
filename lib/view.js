//  Reasons.js by Dave Kinkead
//  Copyright 2017-2019 University of Queensland
//  Available under the MIT license

'use strict'

const Element = require('./Element')
const Utils = require('./utils')

//  Display Settings
const maxWidth     = 200
const padding      = 10
const fontSize     = 16
const cornerRadius = 4
const rgbFocused   = '81,36,122'
const rgbDefault   = '0,0,0'

let dpr = 1
let graph = {}

function getLocal(point) {
  return point //* dpr
}

function getGlobal(point) {
  return point / dpr
}

/**
 * Singleton View module to render a canvas.
 */
module.exports = (function () {

  /**
   * Initialise the view for this mapper map instance
   *  by appending a HTML canvas element.
   *
   *  @params mapper  The mapper map to provide a view for
   */
  function init (mapper) {
    dpr = window.devicePixelRatio || 1
    mapper.scale = 1
    mapper.offset = { x: 0, y: 0 }

    let domBB = mapper.DOM.getBoundingClientRect()
    let canvas = Utils.buildNode(
      'canvas',
      {id: 'reasons-'+mapper.DOM.id},
      {width: domBB.width, height: domBB.height || window.innerHeight }
    )
    mapper.context = canvas.getContext('2d', {alpha: true})

    mapper.DOM.style['min-height'] = "100px";
    mapper.DOM.style['min-width'] = "100px";
    mapper.DOM.appendChild(canvas)

    resize(mapper)
  }


  /**
   * Render an mapper map instance
   */
  function draw (mapper) {
    clear(mapper)

    //  draw edges before nodes
    graph = mapper.graph
    graph.edges().forEach(el => draw_edge(el, mapper))
    graph.nodes().forEach(el => draw_node(el, mapper))
  }

  function zero (mapper) {
    //  find bb of nodes and DOM
    let nodeBB = mapper.graph.nodes().map((node) => {
      return { x1: node.x1, x2: node.x2, y1: node.y1, y2: node.y2 }
    }).reduce( (acc, cur) => {
      return {
        x1: Math.min(acc.x1, cur.x1),
        x2: Math.max(acc.x2, cur.x2),
        y1: Math.min(acc.y1, cur.y1),
        y2: Math.max(acc.y2, cur.y2),
      }
    })

    let mid = {
        x: ((mapper.DOM.clientWidth-mapper.DOM.clientLeft)/2/mapper.scale + mapper.DOM.clientLeft)
          - ((nodeBB.x2-nodeBB.x1)/2 + nodeBB.x1),
        y: ((mapper.DOM.clientHeight-mapper.DOM.clientTop)/2/mapper.scale + mapper.DOM.clientTop)
          - ((nodeBB.y2-nodeBB.y1)/2 + nodeBB.y1)
      }

    //  translate node position to centre of DOM
    mapper.graph.nodes().forEach((node) => {
      node.x1 += mid.x
      node.x2 += mid.x
      node.y1 += mid.y
      node.y2 += mid.y
    })
  }

  function resize (mapper) {
    mapper.DOM.width = (mapper.DOM.clientWidth - mapper.DOM.clientLeft)
    mapper.DOM.height = (mapper.DOM.clientHeight - mapper.DOM.clientTop)
    const canvas = mapper.DOM.querySelector('canvas')
    canvas.width = mapper.DOM.width * dpr
    canvas.height = mapper.DOM.height * dpr

    mapper.DOM.style.overflow = 'hidden'
    canvas.style['transform-origin'] = "top left"
    canvas.style.transform = 'scale(' + 1/dpr + ')'
    mapper.context.scale(dpr * mapper.scale, dpr * mapper.scale)
  }

  function setScale(mapper, newScale, transform=true) {
    const relativeScale = transform ? (1+ newScale/1000) : (newScale)
    // mapper.scale = Math.max(mapper.scale * relativeScale, 3)
    const updatedScale = mapper.scale * relativeScale
    if (updatedScale < 10 && updatedScale > 0.4) {
      mapper.scale = mapper.scale * relativeScale
      mapper.context.scale(relativeScale, relativeScale)
    }
  }

  return {
    init,
    draw,
    zero,
    setScale,
    resize,
  }
})()


/**
 *  Private: Clear the canvas before drawing
 */
function clear (mapper) {
  let domBB = mapper.DOM.getBoundingClientRect()
  mapper.context.clearRect(0, 0, domBB.width / mapper.scale, domBB.height / mapper.scale)
}


/**
 * Private: Draws a node on the canvas
 */
function draw_node (node, {context, offset}) {

  //  word wrap the text
  const text = wordWrap(node.text, context)
  const rgb = (node.hovering) ? rgbFocused : rgbDefault
  const opacity = (node.focused) ? 0.9 : (node.hovering) ? 0.75 : 0.5
  const ox = offset.x
  const oy = offset.y

  //  recalculate the height with extra padding when multi-line
  node.height = (text.length * fontSize) + fontSize * ((text.length > 1 ) ? 2.25 : 2)
  resizeNode(node)

  //  clear a white rectangle for background
  context.clearRect(node.x1+ox, node.y1+oy, node.width, node.height)

  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineJoin = "round"
  context.lineWidth = cornerRadius
  if (node.lineType == 'dashed') {
    context.setLineDash([10, 10])
    context.lineWidth *= 0.75
  }
  context.strokeRect(
    node.x1+cornerRadius/2+ox, node.y1+cornerRadius/2+oy,
    node.width-cornerRadius, node.height-cornerRadius
  )
  context.setLineDash([])

  //  set text box styles
  context.fillStyle = 'rgba('+rgb+',0.8)'
  context.font = fontSize + 'px sans-serif'
  context.textAlign = 'center'

  const lineHeight = fontSize * 1.25;
  const textX = node.x1 + ox + node.width/2
  const textY = node.y1 + oy + cornerRadius * 2

  text.forEach((line, i) => {
    context.fillText(line, textX, textY + ((i+1) * lineHeight), node.width)
  })
}


/**
 * Private: Draws an edge on the canvas
 */
function draw_edge (edge, {context, offset}) {
  locate(edge)
  const ox = offset.x
  const oy = offset.y

  //  stroke style
  const rgb = (edge.hovering) ? rgbFocused : rgbDefault
  const opacity = (edge.focused) ? 0.9 : (edge.hovering) ? 0.75 : 0.5
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineWidth = 4

  //  stroke position
  context.beginPath()
  edge.paths.forEach((path) => {
    context.moveTo(path.x1+ox, path.y1+oy)
    context.lineTo(path.x2+ox, path.y2+oy)
  })

  //  arrow tip
  let last = edge.paths[edge.paths.length-1]
  let arrow = arrowify(last)
  context.lineTo(arrow.x1+ox, arrow.y1+oy)
  context.moveTo(last.x2+ox, last.y2+oy)
  context.lineTo(arrow.x2+ox, arrow.y2+oy)
  context.stroke()

  //  text stroke
  let textWidth = context.measureText(edge.type).width + padding
  context.clearRect(edge.center.x+ox-textWidth/2, edge.center.y+oy-15, textWidth, 25)

  //  label
  context.fillStyle = 'rgba('+rgb+',0.8)'
  context.font = 14 + 'px sans-serif'
  context.textAlign = 'center'
  context.fillText(edge.type, edge.center.x+ox, edge.center.y+oy)

  if (edge.intersection)
    context.fillRect(edge.intersection.x+ox, edge.intersection.y+oy, 10, 10)
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

  //  find the mid point between the connected nodes
  let coords = elements.map((el) => {
    return {x: getLocal((el.x1+(el.width)/2)), y: getLocal((el.y1+(el.height )/2))}
  })

  let xs = coords.map(el => el.x)
  let ys = coords.map(el => el.y)
  edge.center = {
    x: getLocal(Math.max(...xs) - (Math.max(...xs) - Math.min(...xs)) / 2),
    y: getLocal(Math.max(...ys) - (Math.max(...ys) - Math.min(...ys)) / 2)
  }

  //  find the weighted center point of those nodes
  // edge.center = elements.map((el) => {
  //     return {x: (el.x1+(el.width)/2), y: (el.y1+(el.height )/2)}
  //   }).reduce((acc, el) => {
  //     return {x: acc.x + el.x, y: acc.y + el.y}
  //   })
  // edge.center.x = edge.center.x/(elements.length)
  // edge.center.y = edge.center.y/(elements.length)

  //  create pairs from from-points to center to to-point
  edge.paths = edge.from.map((node) => {
    let el = elements.find(e => e.id == node)
    return {
      x1: el.x1+(el.x2-el.x1)/2,
      y1: el.y1+(el.y2-el.y1)/2,
      x2: edge.center.x,
      y2: edge.center.y
    }
  })

  //  move the 'to' point back down the path to just outside the node.
  let to = elements.find(e => e.id == edge.to)
  let offset = pointOfIntersection(edge.center, to, 5)

  // get offset x,y from rectangle intersect
  edge.paths.push({
    x1: edge.center.x,
    y1: edge.center.y,
    x2: (to.x1 + (to.x2 - to.x1)/2) - offset.x,
    y2: (to.y1 + (to.y2 - to.y1)/2) + offset.y
  })
}


function resizeNode (node) {
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