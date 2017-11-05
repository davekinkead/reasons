'use strict'

const View = require('./view')
const Utils = require('./utils')


module.exports = {
  addEventListeners
}

function addEventListeners (argumentMap) {

  //  encapuslate event state in the argumentMap
  argumentMap.flags = {}
  argumentMap.flags.dirty = false
  argumentMap.flags.editing = true
  let mouseDown = false
  let selected = null
  let dragging = null

  argumentMap.DOM.addEventListener('dblclick', (event) => {

    const {position, collision} = detect(argumentMap, event)

    if (collision) {

      //  Double clicks on nodes or edges trigger edit mode
      addOverlay(argumentMap, collision)

    } else {

      //  Double clicks on a bare map creates a new node
      argumentMap.graph.add({x: position.x, y: position.y})
      argumentMap.flags.dirty = true
    }

    //  Redraw the map
    if (argumentMap.flags.dirty) {
      View.draw(argumentMap)
      argumentMap.flags.dirty = false
    }
  })

  argumentMap.DOM.addEventListener('mousedown', (event) => {

    //  Identify the selected element
    selected = detect(argumentMap, event).collision

    //  Set this element as draggable
    dragging = selected
  })

  argumentMap.DOM.addEventListener('mousemove', (event) => {

    //  Drag any selected elements
    if (dragging) {

      //  TODO: add a moveBy function for smother drag
      dragging.move(getPosition(event))
      argumentMap.flags.dirty = true
    }

    //  Redraw the map
    if (argumentMap.flags.dirty) {
      View.draw(argumentMap)
      argumentMap.flags.dirty = false
    }
  })

  argumentMap.DOM.addEventListener('mouseup', (event) => {
    dragging = null
  })

  window.addEventListener('keydown', (event) => {

    //  Escape key
    if (argumentMap.flags.editing && event.keyCode == 27) removeOverlay(argumentMap)

    //  Return key
    if (argumentMap.flags.editing && event.keyCode == 13) {
      submitOverlay(argumentMap)
    }

    //  Delete a selected element on `backspace` or `delete`
    if (event.keyCode == 8 || event.keyCode == 46) {

      //  Removed the selected element from the graph
      if (selected) {
        if (!argumentMap.flags.editing) 
          event.preventDefault()

        argumentMap.graph.remove(selected)
        argumentMap.flags.dirty = true
      }
    }

    //  Redraw the map
    if (argumentMap.flags.dirty) {
      View.draw(argumentMap)
      argumentMap.flags.dirty = false
    }
  })
}


/**
 * Private: Returns mouse event and hovered element
 */
function detect(argumentMap, event) {
  return {
    position: getPosition(event), 
    collision: argumentMap.graph.elements().find(el => el.collides(getPosition(event)))
  }
}


/**
 * Private: Returns the x,y position of an event
 */
function getPosition(event) {
  return {
    x: parseInt(event.x || event.clientX),
    y: parseInt(event.y || event.clientY)
  }
}

//  Overlays a text box to edit a node or edge
function addOverlay(argumentMap, element) {

  //  set the 
  argumentMap.flags.editing = true

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

//  Update the graph from the overlay and remove it
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

//  Remove overlay
function removeOverlay (argumentMap) {
  argumentMap.flags.editing = false
  argumentMap.flags.dirty = true
  document.querySelector('#reason-overlay').remove()  
}