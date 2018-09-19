//  Reasons.js by Dave Kinkead
//  Copyright (c) 2017-2018 University of Queensland
//  Available under the MIT license

'use strict'

const View    = require('./view')
const Utils   = require('./utils')
const Graph   = require('./graph')
const Keycode = require('keycode')
const History = []
let   Future  = []

module.exports = {
  addEventListeners
}


function addEventListeners (argumentMap) {

  //  encapuslate event state in the argumentMap
  argumentMap.altered = true
  argumentMap.editMode = false
  argumentMap.dirty = false
  let mouseDown = false
  let selected = null
  let dragging = null
  let clickPos = null

  //  Double click creates or edits element
  argumentMap.DOM.addEventListener('dblclick', (event) => {

    const {position, collision} = detect(argumentMap, event)

    if (collision) {
      //  Double click on nodes or edges trigger edit mode
      addOverlay(argumentMap, collision)
    } else {
      //  Double clicks on a bare map creates a new node
      argumentMap.graph.add({x: position.x, y: position.y})
      selected = argumentMap.graph.last()
      argumentMap.graph.focus(selected)
      argumentMap.altered = true
    }

    redraw(argumentMap)
  })


  //  Draging an element selects and moves it
  //  Selecting nothing unfocuses the graph
  argumentMap.DOM.addEventListener('mousedown', (event) => {

    const {position, collision} = detect(argumentMap, event)

    if (collision) {
      selected = collision
      argumentMap.graph.focus(selected)      
      argumentMap.dirty = true
      clickPos = position
      dragging = selected
    }

    redraw(argumentMap)
  })

  //  Move a selected element on drag
  //  Highlight a hovered element
  argumentMap.DOM.addEventListener('mousemove', (event) => {

    // Set element hover flag on mouseover
    const mouse = getPosition(event)

    argumentMap.graph.forEach((el) => {
      if (el.collides(mouse)) {
        if (!el.hovering) argumentMap.dirty = true
        el.hovering = true
      } else {
        if (el.hovering) argumentMap.dirty = true
        el.hovering = false
      }
    })

    //  Specify a node as the drag target when clicked
    if (dragging) {
      dragging.move(getPosition(event))
      argumentMap.dirty = true
    }

    redraw(argumentMap)
  })


  //  Release a drag action and add an edge if needed
  argumentMap.DOM.addEventListener('mouseup', (event) => {

    const {position, collision} = detect(argumentMap, event)

    //  Check for node drop and add a new edge to the graph if required
    if (dragging) {
      const target = argumentMap.graph.nodes().find(el => dragging.collides(el) && dragging.id !== el.id)
      if (target) {
        argumentMap.graph.add({from: dragging, to: target})
        dragging.move(clickPos)
      }

      argumentMap.altered = true
      dragging = null
    } else if (!collision) {
      selected = null
      argumentMap.graph.unfocus()
      argumentMap.dirty = true
    }

    redraw(argumentMap)
  })


  window.addEventListener('keydown', (event) => {

    if (argumentMap.editMode) {
      //  Escape key
      if (Keycode.isEventKey(event, 'escape')) removeOverlay(argumentMap)

      //  Return key
      if (Keycode.isEventKey(event, 'enter')) submitOverlay(argumentMap)

    } else {
      //  Focus on `Tab`
      if (!event.metaKey && Keycode.isEventKey(event, 'tab')) {
        event.preventDefault()
        selected = argumentMap.graph[0]
        argumentMap.graph.focus(selected)
        argumentMap.altered = true
      }

      //  Undo `⌘-z`
      if (
        (event.metaKey || Keycode.isEventKey(event, 'control') || Keycode.isEventKey(event, 'command'))
         && Keycode.isEventKey(event, 'z')) {

        //  Store for redo
        save(Future, argumentMap)

        const last = History.pop()
        if (last) {
          argumentMap.graph = new Graph(JSON.parse(last))
          argumentMap.dirty = true
        }
      }

      //  Redo `⌘-y`
      if (
        (event.metaKey || Keycode.isEventKey(event, 'control') || Keycode.isEventKey(event, 'command'))
         && Keycode.isEventKey(event, 'y')) {

        //  Store for undo
        save(History, argumentMap)

        const next = Future.pop()
        if (next) {
          argumentMap.graph = new Graph(JSON.parse(next))
          argumentMap.dirty = true
        }
      }

      //  Edit selected element on `enter`
      if (selected && Keycode.isEventKey(event, 'enter')) {
        addOverlay(argumentMap, selected)
      }

      //  Delete a selected element on `backspace` or `delete`
      if (selected && (Keycode.isEventKey(event, 'delete') || Keycode.isEventKey(event, 'backspace'))) {
        event.preventDefault()
        argumentMap.graph.remove(selected)
        argumentMap.dirty = true
      }      
    }

    redraw(argumentMap)
  })


  window.addEventListener('resize', (event) => {
    argumentMap.altered = true
    View.resize(argumentMap)
    View.zero(argumentMap)
    redraw(argumentMap)
  })
}


/**
 * Private: Redraws the canvas if changes have occured
 */
function redraw (argumentMap) {
  if (argumentMap.altered || argumentMap.dirty) {
    if (argumentMap.altered) {
      save(History, argumentMap)
      Future = [] //  Reset the redo buffer
    }

    View.draw(argumentMap)
    argumentMap.altered = false
    argumentMap.dirty = false
  }
}


/**
 * Private: Saves a serialized copy of the graph
 */
function save (store, argumentMap) {
  const last = (store.length == 0) ? JSON.stringify([]) : store[store.length-1]
  const current = JSON.stringify(
      argumentMap.graph.map(function (element) { 
        return element.export() 
      })
    )

  if (current !== last) store.push(current)
}


/**
 * Private: Returns mouse event and hovered element
 */
function detect (argumentMap, event) {
  return {
    position: getPosition(event), 
    collision: argumentMap.graph.elements().find(el => el.collides(getPosition(event)))
  }
}


/**
 * Private: Returns the x,y position of an event
 */
function getPosition (event) {
  return {
    x: parseInt(event.x || event.clientX),
    y: parseInt(event.y || event.clientY)
  }
}


/**
 * Private: Overlays a text box to edit a node or edge
 */
function addOverlay (argumentMap, element) {

  //  set the 
  argumentMap.editMode = true

  //  Create background layer
  let overlay = Utils.buildNode('div', {id: 'reason-overlay'})
  overlay.setAttribute('style', 'position:absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75);')

  // Create text input field
  let input = Utils.buildNode('input', {id: 'edit-reason-input'}, {value: element.text || element.type})
  input.setAttribute('style', 'position:absolute; top: 45%; bottom: 50%; left: 25%; right: 50%; width:50%; padding: 1rem;')
  input.setAttribute('data-element', element.id)

  //  Append to the DOM
  overlay.appendChild(input)
  document.body.appendChild(overlay)

  //  Highlight text on element creation
  input.select()
}


/**
 * Private: Updates the graph from the overlay and removes it
 */
function submitOverlay (argumentMap) {
  let input = document.querySelector('#edit-reason-input')
  let el = argumentMap.graph.elements().find(el => el.id == input.getAttribute('data-element') )

  if (el.isNode()) {
    el.text = input.value
  } else {
    el.type = input.value
  }
  removeOverlay(argumentMap)
}


/**
 * Private: Removes the overlay
 */
function removeOverlay (argumentMap) {
  argumentMap.editMode = false
  argumentMap.altered = true
  document.querySelector('#reason-overlay').remove()  
}