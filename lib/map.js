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

    //  TODO: convert this to a zoom function
    //  Scale the reasons if they are bigger than the DOM
    let rightest = this.canvas.width
    let lowest = this.canvas.height
    elements.filter(el => !(el.from && el.to)).map((el) => {
      rightest = Math.max(rightest, el.x)
      lowest = Math.max(lowest, el.y)
    })

    if (rightest > this.canvas.width || lowest > this.canvas.height) {
      elements.filter(el => !(el.from && el.to)).map((el) => {
        // el.x1 *= ((this.canvas.width-100) / rightest)
        el.x *= ((this.canvas.width-200) / rightest)
        // el.y1 *= ((this.canvas.height-100) / lowest)
        el.y *= ((this.canvas.height-75) / lowest)
      })
    }   


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
 * Exports a Graph's data structure as an Array
 */
Map.prototype.export = function () {
  return this.graph.map(element => element.export())
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
    /**** variable leakage of 'editing' here when adding a reaon/relation. */

    //  Escape key
    if (editing && event.keyCode == 27) removeOverlay()
    //  Return key
    if (editing && event.keyCode == 13) submitOverlay(map.graph)

    //  update node text

    //  delete a selected element with `backspace` or `delete`
    if (event.keyCode == 8 || event.keyCode == 46) {
      event.preventDefault()

      map.graph.forEach((el) => {
        if (el.selected) map.graph.remove(el)
      })
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

//  Update the graph from the overlay and remove it
function submitOverlay (elements) {
  let input = document.querySelector('#edit-reason-input')
  let el = elements.find(el => el.id == input.getAttribute('data-element') )
  if (el instanceof Reason) {
    el.text = input.value
  } else {
    el.type = input.value
  }
  removeOverlay()
}

//  Remove overlay
function removeOverlay () {
  document.querySelector('#reason-overlay').remove()  
}