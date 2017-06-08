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
 * @params elementID  the element id to append the map canvas to
 */
function Map (elementID) {
  if (!this instanceof Map) return new Map(elementID)
  
  let dom = document.querySelector(elementID)
  let domBB = dom.getBoundingClientRect()

  this.canvas = Utils.buildNode(
    'canvas', 
    {id: 'reasons-'+dom.id}, 
    {width: domBB.width, height: domBB.height}
  )

  dom.appendChild(this.canvas)

  //  display the layout
  this.graph = new Graph()
  // new Thingy(this.canvas)
}


/**
 * Populates a Graph with Reasons and Relations
 *
 * @params elements
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

  //  display the layout
  new Thingy(this.canvas, this.graph)
}

Map.prototype.save = function () {
  return this.graph
}


function Thingy (canvas, graph) {

  //  initial & current position of a click event
  let first = {}
  let last = {}

  //  event flags to manage state between events
  let mouseDown = false
  let dragged = false
  let editing = false
  let dirty = false

  //  DOM object event listeners

  //  `Mousedown` is used to identify clicks and drag starts
  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault()

    let current = null

    //  set last x & y
    mouseDown = true
    first = getPosition(event)
    last = first

    graph.forEach((el, i) => {
      //  clear selected flag on click
      el.selected = false

      //  flag elements in hit zone      
      if (el.collides(last)) {
        el.draggable = true
        dirty = true

        //  pop clicked reason to the top
        if (el instanceof Reason) {
          graph.focus(el)
        }
      }
    })

    if (dirty) draw(this)
  })

  //  `Mousemove` is used to identify drags and hovers
  canvas.addEventListener('mousemove', (event) => {

    //  Hover is true if the mouse is moved whilst over an element
    let current = getPosition(event)
    graph.forEach((el) => {
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
      graph.forEach((el) => {

        //  draggable elements should be dragged
        if (el.draggable) {
          dirty = true
          el.move(getPosition(event).x - last.x, getPosition(event).y - last.y)
          last = getPosition(event)

          //  is there an overlap?
          graph.forEach((e) => {
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

    if (dirty) draw(this)
  })


  //  `Mouseup` used to identify clicks and drag ends
  canvas.addEventListener('mouseup', (event) => {
    event.preventDefault()

    //  was this a drag and release
    if (dragged) {
  
      //  was there a successful drop?
      let from = graph.find((el) => {return el.draggable})
      let to = graph.find((el) => {return el.droppable})
      if (from && to) {

        //  snap back position
        from.move(first.x-from.x1, first.y-from.y1)

        //  add new relation to bottom
        graph.add(new Relation({from: from, to: to}))
        draw(this)
      }

      //  remove draggable & droppable flags from elements
      graph.forEach((el) => {
        el.draggable = false
        el.droppable = false
      })

    //  or was it a straight click
    } else {

      //  if so, flag clicked element as selected
      graph.forEach((el) => {
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

    if (dirty) draw(this)
  })

  //  `Dblclicks` used for element creation & editing
  canvas.addEventListener('dblclick', (event) => {

    //  dblclick on element to edit it
    editing = false
    graph.forEach((el) => {
      el.selected = false

      if (el.collides(last)) {
        editing = true
        addOverlay(el)
      } 
    })

    //  dblclick on raw canvas should create a new node
    if (!editing) {
      let reason = new Reason({x: last.x, y: last.y})
      graph.add(reason)
      editing = true
      addOverlay(reason)
    }

    draw(this)      
  })  

  //  TODO: Placeholder for zoom
  canvas.addEventListener('wheel', (event, w) => {})


  window.addEventListener('keydown', (event) => {
    //  update node text
    if (editing) {

      //  return
      if (event.keyCode == 13) {
        removeOverlay(graph)
        editing = false
      }
    } else {

      //  delete a selected element with `backspace` or `delete`
      if (event.keyCode == 8 || event.keyCode == 46) {
        event.preventDefault()
        graph.remove((graph.find(el => el.selected)))
      }
    }

    draw(this)
  })

  //  set public variables
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.graph = graph


  //  draw for the first time
  draw(this)
}

function draw (canvas) {
  clear(canvas)
  canvas.graph.forEach((el) => {
    el.draw(canvas.context)
  })
}

function clear (canvas) {
  canvas.context.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height)
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