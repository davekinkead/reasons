(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Reasons = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

const Utils = require('./utils')

module.exports = Graph


/**
 * A Graph is simply an extended array containing node and edge objects.
 * It is an abstract data structure with no DOM form.  
 *
 * @param elements  the elements (nodes & edges) to consitute the graph
 */
function Graph(elements) {
  if (!(this instanceof Graph)) return new Graph(elements)
  if (elements instanceof Array) elements.forEach(el => this.add(el))
}

//  Use Array as the prototype
Graph.prototype = Object.create(Array.prototype)


/**
 * Adds a new Reason or Relation to the Graph.
 *
 * @param el an element to add
 */
Graph.prototype.add = function (element) {

  //  Edges an be independent or conjoined reasons. If A (from node)
  //  and B (to node) both already support C then the relationships
  //  should be merged [A,B] -> C
  if (isEdge(element)) {
    let commonChildren = Utils.intersection(
      this.children(element.from.id || element.from), 
      this.children(element.to.id || element.to)
    )

    if (commonChildren.length > 0) {
      commonChildren.map((el) => {
        let edges = this.edges().filter((e) => {
          return (e.to == el || e.to == el.id || e.to.id == el.id)
        })
        let keeper = edges.shift()
        edges.map(e => keeper.from = Utils.flatten([keeper.from].concat(e.from)))
        edges.map(e => this.remove(e))
      })
    } else {
      this.unshift(element)      
    }
  } else {
    //  otherwise if the element is a node we just add it to the graph
    this.push(element)
  }
}


/**
 * Removes an existing Reason or Relation from the Graph.
 *
 * @param el the element to remove
 */
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
 * @params id a Node or String id of a Node
 */
Graph.prototype.parents = function (id) {
  if (id instanceof Object) id = id.id

  return Utils.unique(Utils.flatten(
    this.edges().filter(el => el.to == id || el.to.id == id).map(el => el.from)
  )).map(el => this.find(i => i.id == el))
}


/**
 * Find all the children for a given node or id
 * @params id a Node or String id of a Node
 */
Graph.prototype.children = function (id) {
  if (id instanceof Object) id = id.id

  return this.edges().filter((el) => {
    return Utils.flatten([el.from]).map(el => el.id || el).indexOf(id) > -1
  }).map(el => el.to)
    .map(el => this.find(i => i == el || i.id == el))
}


/**
 * Returns true if an element is an Edge
 * @params el a Node or Edge
 */
function isEdge (el) {
  return (el.to && el.from) ? true : false
}


/**
 * Returns true if an element is a Node
 * @params el a Node or Edge
 */
function isNode (el) {
  return (isEdge(el)) ? false : true
}
},{"./utils":7}],2:[function(require,module,exports){
const Utils = require('./utils')
const MAP_URL = 'http://dave.kinkead.com.au/reasons'
const reasons = []

module.exports = Highlighter

function Highlighter (dom) {
  if (!(this instanceof Highlighter)) return new Highlighter(dom)

  buildToolTip()

  //  Event listener for text highlight
  const target = document.querySelector(dom)
  target.addEventListener('mouseup', (event) => {
    const selection = document.getSelection()
    const tooltip = document.querySelector('#tooltip')
    
    if (selection.focusOffset - selection.anchorOffset > 0) {
      const offset = window.scrollY
      const rect = selection.getRangeAt(0).getBoundingClientRect()

      //  set some default styling
      tooltip.setAttribute('style', 'position:absolute; display:block; top:'+(rect.top+offset-40)+'px; left:'+(rect.left+rect.width/2-tooltip.offsetWidth/2)+'px; background-color:#FFF; border-radius: 3px; box-shadow: 2px 2px 5px 3px rgba(0,0,0,0.2); height: 34px;')
    } else {
      tooltip.setAttribute('style', 'display:none;')
    }
  })
}

function buildToolTip () {

  const tooltip = Utils.buildNode('div', {id: 'tooltip'}, {style: 'display:none;'})
  document.body.appendChild(tooltip)

  const premise = Utils.buildNode('img', {name: 'premise', title: 'Premise', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERER5ECNjAAAAEXRSTlMAAQYUIyYtLjlLVVZxoLzt7xYSs+QAAABUSURBVCjPzZA5EsAgDMSW+0oA//+zDDCksZt0qFupsoGDzaUkDYahSeXBr0A8hKtCbCRQNTqJJMieyu+Q8crBQrmweLbYw5tbn3hwyzce1Ly0x28PkhUQ+2QwVtEAAAAASUVORK5CYII="})
  premise.setAttribute('style', 'padding:5px;')
  premise.addEventListener('click', addReason)

  const objection = Utils.buildNode('img', {name: 'objection', title: 'Objection', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAgVBMVEUAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERER4EtaNAAAAKnRSTlMAAQMFBgcJDEdLWFlbXF1odXeFiIuRkpSVl5itr7m6vsfIytXX4ubo6f1TzZtTAAAAr0lEQVQoz22Q1xaCQAxEZ6mKBStiwS7q/P8H+rAlAdmn5N6zJ5kAQPleGoQ3areRrVYkD8EUJJvIc3JvhFtTksoUrjsCH1eyNsLJBAuKEX4GTB26R6iuMTrGv1sMDBnH/0zgPXMXDhiZ+80Ux0T9qM0w12ba28qb2V8Oa+Yyt2PGsmcmW2+AVu2v8iSodC6z8/cEoqaT15pXDmfkDpXnQHTiRd1nzWfu61SfB6kBgB9Z7jbscyDPiwAAAABJRU5ErkJggg=="})
  objection.setAttribute('style', 'padding:5px;')
  objection.addEventListener('click', addReason)

  const conclusion = Utils.buildNode('img', {name: 'conclusion', title: 'Conclusion', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAaVBMVEUAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERdclAKAAAAInRSTlMAAQIDBQcLDhEUHCYnKSowQEFCQ2JjZGaOlNrg4u3x9/v9hyAg+QAAAHVJREFUKFO1y0kSgkAQRNEPKoo44Ag4Yef9D+mCDoKedvJ39TIKZm27jnsjs4+7ZA5xl75L3++SJL0XAFnu+6cEKB79zvrN8ZdkqtDzp2QXx1kNl6m4Og5nu3Sew0WTJj7+BA6nhI9L4FAnHOqEw7HdRP0P/QCyxRQBq+KXRQAAAABJRU5ErkJggg=="})
  conclusion.setAttribute('style', 'padding:5px;')
  conclusion.addEventListener('click', addReason)

  tooltip.appendChild(premise)
  tooltip.appendChild(objection)
  tooltip.appendChild(conclusion)

  const button = Utils.buildNode('input', {id: 'create-map-button'}, {
    name: 'create-map-button',
    type: 'submit',
    value: 'Create Map'
  })

  button.onclick = () => {
    sessionStorage.setItem('reasons', JSON.stringify(reasons))
    window.open(MAP_URL, '_blank')  
  }

  document.body.appendChild(button)  
}

function addReason(event) {

  document.querySelector('#create-map-button').setAttribute('style', 'position:fixed;bottom:2rem;right:2rem;padding:1rem;border:1px solid #CCC;border-radius:3px;display:block')
  document.querySelector('#tooltip').setAttribute('style', 'display:none')

  const paragraph = document.getSelection()
  const selection = {
    type: event.target.name,
    text: paragraph.anchorNode.nodeValue.substring(paragraph.anchorOffset, paragraph.focusOffset)
  }
  
  reasons.push(selection)
}
},{"./utils":7}],3:[function(require,module,exports){
'use strict'

const Graph = require('./graph')
const Reason = require('./reason')
const Relation = require('./relation')
const Utils = require('./utils')

module.exports = Map


/**
 * The Map acts as the UI between the Graph data object and the browser DOM.
 * It is responsible for handling all mouse and keyboard events, and sending 
 * changes in the argument map to the Graph object.
 *
 * The Map contains references to @graph (the data), @canvas (the DOM object)
 * and @context (the 2D drawing API)
 *
 * @params elementID  the element id to append the map canvas to
 */
function Map (elementID) {
  if (!this instanceof Map) return new Map(elementID)
  
  let dom = document.querySelector(elementID)
  let domBB = dom.getBoundingClientRect()
  let canvas = Utils.buildNode(
    'canvas', 
    {id: 'reasons-'+dom.id}, 
    {width: domBB.width, height: domBB.height}
  )
  dom.appendChild(canvas)

  //  Set public attributes
  this.graph = new Graph()
  this.canvas = canvas
  this.context = canvas.getContext('2d')

  //  DOM object event listeners
  addEventListeners(this)

  //  draw for the first time
  draw(this)
}


/**
 * Populates a Graph with Reasons and Relations.
 *
 * @params elements   the elements to render
 */
Map.prototype.render = function (elements) {

  //  sets the graph if arg supplied
  if (elements instanceof Array) {

    //  build graph with reasons
    elements.filter(el => !el.from || !el.to).map((el) => {
      this.graph.push(new Reason(el))
    })

    //  and then relations 
    elements.filter(el => el.from && el.to ).map((el) => {
      if (el.from instanceof Array) {
        el.from = this.graph.filter(reason => el.from.indexOf(reason.id) > -1)
      } else {
        el.from = this.graph.find(reason => reason.id == el.from)
      }
      el.to = this.graph.find(reason => reason.id == el.to)
      this.graph.unshift(new Relation(el))
    })
  }

  //  Draw it
  draw(this)

  //  For method chaining
  return this
}

/**
 * Exports a Graph's data
 */
Map.prototype.export = function () {
  return this.graph
}


/**
 * Helper function to add DOM event listeners to the canvas
 */
function addEventListeners (map) {

  //  initial & current position of a click event
  let first = {}
  let last = {}

  //  event flags to manage state between events
  let mouseDown = false
  let dragged = false
  let editing = false
  let dirty = false

  //  `Mousedown` is used to identify clicks and drag starts
  map.canvas.addEventListener('mousedown', (event) => {
    event.preventDefault()

    let current = null

    //  set last x & y
    mouseDown = true
    first = getPosition(event)
    last = first

    map.graph.forEach((el, i) => {
      //  clear selected flag on click
      el.selected = false

      //  flag elements in hit zone      
      if (el.collides(last)) {
        el.draggable = true
        dirty = true

        //  pop clicked reason to the top
        if (el instanceof Reason) {
          map.graph.focus(el)
        }
      }
    })

    if (dirty) draw(map)
  })

  //  `Mousemove` is used to identify drags and hovers
  map.canvas.addEventListener('mousemove', (event) => {

    //  Hover is true if the mouse is moved whilst over an element
    let current = getPosition(event)
    map.graph.forEach((el) => {
      if (el.collides(current)) {
        dirty = true
        el.hovering = true
      } else {
        el.hovering = false
      }
    })

    //  drag should only fire if mouse is pressed over an element
    if (mouseDown) {
      dragged = true
      map.graph.forEach((el) => {

        //  draggable elements should be dragged
        if (el.draggable) {
          dirty = true
          el.move(getPosition(event).x - last.x, getPosition(event).y - last.y)
          last = getPosition(event)

          //  is there an overlap?
          map.graph.forEach((e) => {
            if (el !== e && el.collides(e)) {

              //  flag this element as droppable
              e.droppable = true
            } else {
              e.droppable = false
            }
          })
        }
      })
    }

    if (dirty) draw(map)
  })


  //  `Mouseup` used to identify clicks and drag ends
  map.canvas.addEventListener('mouseup', (event) => {
    event.preventDefault()

    //  was this a drag and release
    if (dragged) {
  
      //  was there a successful drop?
      let from = map.graph.find((el) => {return el.draggable})
      let to = map.graph.find((el) => {return el.droppable})
      if (from && to) {

        //  snap back position
        from.move(first.x-from.x1, first.y-from.y1)

        //  add new relation to bottom
        map.graph.add(new Relation({from: from, to: to}))
        draw(map)
      }

      //  remove draggable & droppable flags from elements
      map.graph.forEach((el) => {
        el.draggable = false
        el.droppable = false
      })

    //  or was it a straight click
    } else {

      //  if so, flag clicked element as selected
      map.graph.forEach((el) => {
        if (el.collides(last)) {
          dirty = true
          el.selected = true
        } else {
          el.selected = false
        }
      })
    }

    mouseDown = false
    dragged = false
    last = getPosition(event)

    if (dirty) draw(map)
  })

  //  `Dblclicks` used for element creation & editing
  map.canvas.addEventListener('dblclick', (event) => {

    //  dblclick on element to edit it
    editing = false
    map.graph.forEach((el) => {
      el.selected = false

      if (el.collides(last)) {
        editing = true
        addOverlay(el)
      } 
    })

    //  dblclick on raw canvas should create a new node
    if (!editing) {
      let reason = new Reason({x: last.x, y: last.y})
      map.graph.add(reason)
      editing = true
      addOverlay(reason)
    }

    draw(map)      
  })  

  //  TODO: Placeholder for zoom
  map.canvas.addEventListener('wheel', (event, w) => {})


  window.addEventListener('keydown', (event) => {
    //  update node text
    if (editing) {

      //  return
      if (event.keyCode == 13) {
        removeOverlay(map.graph)
        editing = false
      }
    } else {

      //  delete a selected element with `backspace` or `delete`
      if (event.keyCode == 8 || event.keyCode == 46) {
        event.preventDefault()
        map.graph.remove((map.graph.find(el => el.selected)))
      }
    }

    draw(map)
  })
}

/**
 * Helper function to draw the map
 */
function draw (map) {
  clear(map)
  map.graph.forEach((el) => {
    el.draw(map.context)
  })
}

function clear (map) {
  map.context.clearRect(0, 0, map.canvas.width, map.canvas.height)
}

function getPosition(event) {
  return {
    x: parseInt(event.x || event.clientX),
    y: parseInt(event.y || event.clientY)
  }
}

//  Overlays a text box to edit a node or edge
function addOverlay(el) {

  //  Create background layer
  let overlay = Utils.buildNode('div', {id: 'reason-overlay'})
  overlay.setAttribute('style', 'position:absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75);')

  // Create text input field
  let input = Utils.buildNode('input', {id: 'edit-reason-input'}, {value: el.text || el.type})
  input.setAttribute('style', 'position:absolute; top: 45%; bottom: 50%; left: 25%; right: 50%; width:50%; padding: 1rem;')
  input.setAttribute('data-element', el.id)

  //  Append to the DOM
  overlay.appendChild(input)
  document.body.appendChild(overlay)

  //  Highlight text on element creation
  input.select()
}


//  Remove overlay and update the Graph
function removeOverlay(elements) {
  let input = document.querySelector('#edit-reason-input')
  let el = elements.find(el => el.id == input.getAttribute('data-element') )
  if (el instanceof Reason) {
    el.text = input.value
  } else {
    el.type = input.value
  }
  document.querySelector('#reason-overlay').remove()
}
},{"./graph":1,"./reason":4,"./relation":6,"./utils":7}],4:[function(require,module,exports){
'use strict'

module.exports = Reason

const maxWidth = 200
const padding = 10
const fontSize = 16

function Reason(opts) {
  if (!this instanceof Reason) return new Reason(opts)

  // public state
  this.id = opts.id || Math.random().toString(36).slice(-5)
  this.text = opts.text || 'A reason'
  this.width = maxWidth
  this.height = fontSize * 3.5
  this.x1 = opts.x
  this.y1 = opts.y
  this.x2 = opts.x + this.width
  this.y2 = opts.y + this.height
  this.resize()

  return this
}

Reason.prototype.resize = function () {
  this.x2 = this.x1 + this.width
  this.y2 = this.y1 + this.height
}


Reason.prototype.draw = function(context) {

  //  word wrap the text 
  let text = wordWrap(this.text, context)

  //  recalculate the height
  this.height = text.length * fontSize + fontSize * 2.5
  this.resize()

  //  clear a white rectangle for background
  context.clearRect(this.x1, this.y1, this.width, this.height)  

  //  draw a solid rounded border
  let cornerRadius = 4
  let rgb = '0,0,0'
  let opacity = 0.5
  if (this.hovering) opacity = 0.75
  if (this.selected) opacity = 0.9
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineJoin = "round"
  context.lineWidth = cornerRadius
  context.strokeRect(this.x1+cornerRadius/2, this.y1+cornerRadius/2, this.width-cornerRadius, this.height-cornerRadius)

  //  set text box styles
  context.fillStyle = 'rgba(0,0,0,0.8)'
  context.font = '16px sans-serif'
  context.textAlign = 'center'

  //  add the text content
  text.forEach((line, i) => {
    context.fillText(line, this.x1 + this.width/2, this.y1  + (i+2) * fontSize)
  })  }

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

Reason.prototype.move = function (x, y) {
  this.x1 += x
  this.y1 += y
  this.resize()
}

Reason.prototype.collides = function(el) {
  if (el instanceof Reason) {
    return (this.x2 < el.x1 || this.x1 > el.x2 || this.y1 > el.y2 || this.y2 < el.y1) ? false : true
  } else {
    return (el.x > this.x1 && el.x < this.x2 && el.y > this.y1 && el.y < this.y2) ? true : false
  }
}
},{}],5:[function(require,module,exports){
//  Reasons.js by Dave Kinkead
//  Copyright (c) 2017 University of Queensland
//  Available under the MIT license

//  Reasons.js API

const Map = require('./map')
const Highlighter = require('./highlighter')

module.exports = {
  map: function (dom) {
    return new Map(dom)
  },

  highlight: function(dom) {
    return new Highlighter(dom)
  }
}
},{"./highlighter":2,"./map":3}],6:[function(require,module,exports){
'use strict'

const flatten = require('array-flatten')

module.exports = Relation

function Relation (opts) {
  if (!this instanceof Relation) return new Relation(opts)

  this.id = opts.id || Math.random().toString(36).slice(-5)
  this.from = opts.from
  this.to = opts.to
  this.type = opts.type || 'supports'
  this.paths = []

  return this
}

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
  let elements = flatten([this.from, this.to])
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
},{"array-flatten":9}],7:[function(require,module,exports){
module.exports = {

  //  build a DOM element
  buildNode: function (type, options, attributes) {
    const node = document.createElement(type)
    for (var key in options) {
      node[key] = options[key]
    }
    for (var key in attributes) {
      node.setAttribute(key, attributes[key])
    }
    return node
  },

  intersection: function (array1, array2) {
    return array1.filter(function(n) {
      return array2.indexOf(n) !== -1;
    })
  },

  unique: require('array-unique'),
  flatten: require('array-flatten'),
  diff: require('array-difference')
}
},{"array-difference":8,"array-flatten":9,"array-unique":10}],8:[function(require,module,exports){
(function(global) {

	var indexOf = Array.prototype.indexOf || function(elem) {
		var idx, len;

		if (this == null) {
			throw new TypeError("indexOf called on null or undefined");
		}

		for (idx = 0, len = this.length; idx < len; ++idx) {
			if (this[idx] === elem) {
				return idx;
			}
		}

		return -1;
	};

	function difference(a, b) {
		var idx, len;
		var res = [];

		for (idx = 0, len = a.length; idx < len; ++idx) {
			if (indexOf.call(b, a[idx]) === -1) {
				res.push(a[idx]);
			}
		}
		for (idx = 0, len = b.length; idx < len; ++idx) {
			if (indexOf.call(a, b[idx]) === -1) {
				res.push(b[idx]);
			}
		}
		return res;
	}

	if (typeof module === "object" && module.exports) {
		module.exports = difference;
	} else if (typeof define === "function" && define.amd) {
		define(function() {
			return difference;
		});
	} else {
		global.difference = difference;
	}

}(this));

},{}],9:[function(require,module,exports){
'use strict'

/**
 * Expose `arrayFlatten`.
 */
module.exports = flatten
module.exports.from = flattenFrom
module.exports.depth = flattenDepth
module.exports.fromDepth = flattenFromDepth

/**
 * Flatten an array.
 *
 * @param  {Array} array
 * @return {Array}
 */
function flatten (array) {
  if (!Array.isArray(array)) {
    throw new TypeError('Expected value to be an array')
  }

  return flattenFrom(array)
}

/**
 * Flatten an array-like structure.
 *
 * @param  {Array} array
 * @return {Array}
 */
function flattenFrom (array) {
  return flattenDown(array, [])
}

/**
 * Flatten an array-like structure with depth.
 *
 * @param  {Array}  array
 * @param  {number} depth
 * @return {Array}
 */
function flattenDepth (array, depth) {
  if (!Array.isArray(array)) {
    throw new TypeError('Expected value to be an array')
  }

  return flattenFromDepth(array, depth)
}

/**
 * Flatten an array-like structure with depth.
 *
 * @param  {Array}  array
 * @param  {number} depth
 * @return {Array}
 */
function flattenFromDepth (array, depth) {
  if (typeof depth !== 'number') {
    throw new TypeError('Expected the depth to be a number')
  }

  return flattenDownDepth(array, [], depth)
}

/**
 * Flatten an array indefinitely.
 *
 * @param  {Array} array
 * @param  {Array} result
 * @return {Array}
 */
function flattenDown (array, result) {
  for (var i = 0; i < array.length; i++) {
    var value = array[i]

    if (Array.isArray(value)) {
      flattenDown(value, result)
    } else {
      result.push(value)
    }
  }

  return result
}

/**
 * Flatten an array with depth.
 *
 * @param  {Array}  array
 * @param  {Array}  result
 * @param  {number} depth
 * @return {Array}
 */
function flattenDownDepth (array, result, depth) {
  depth--

  for (var i = 0; i < array.length; i++) {
    var value = array[i]

    if (depth > -1 && Array.isArray(value)) {
      flattenDownDepth(value, result, depth)
    } else {
      result.push(value)
    }
  }

  return result
}

},{}],10:[function(require,module,exports){
/*!
 * array-unique <https://github.com/jonschlinkert/array-unique>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function unique(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.');
  }

  var len = arr.length;
  var i = -1;

  while (i++ < len) {
    var j = i + 1;

    for (; j < arr.length; ++j) {
      if (arr[i] === arr[j]) {
        arr.splice(j--, 1);
      }
    }
  }
  return arr;
};

module.exports.immutable = function uniqueImmutable(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.');
  }

  var arrLen = arr.length;
  var newArr = new Array(arrLen);

  for (var i = 0; i < arrLen; i++) {
    newArr[i] = arr[i];
  }

  return module.exports(newArr);
};

},{}]},{},[5])(5)
});