'use strict'

const View = require('./view')

module.exports = {
  addEventListeners
}

function addEventListeners (argumentMap) {
  let mouseDown = false
  let selected = null
  let dragging = null
  let dirty = false

  argumentMap.DOM.addEventListener('dblclick', (event) => {

    const {position, collision} = detect(argumentMap, event)

    if (collision) {

      //  Double clicks on nodes or edges trigger edit mode
      //  TODO: Add overlay to edit node

      //  TODO: Add overlay to edit edge
      console.log('overlay here')

    } else {

      //  Double clicks on bare maps create new reasons
      argumentMap.graph.add({x: position.x, y: position.y})
      dirty = true
    }

    //  Redraw the map
    if (dirty) {
      View.draw(argumentMap)
      dirty = false
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
      dirty = true
    }

    //  Redraw the map
    if (dirty) {
      View.draw(argumentMap)
      dirty = false
    }
  })

  argumentMap.DOM.addEventListener('mouseup', (event) => {
    dragging = null
  })

  window.addEventListener('keydown', (event) => {

    //  Delete a selected element on `backspace` or `delete`
    if (event.keyCode == 8 || event.keyCode == 46) {

      //  Removed the selected element from the graph
      if (selected) {
        argumentMap.graph.remove(selected)
        dirty = true
      }
    }


    //  Redraw the map
    if (dirty) {
      View.draw(argumentMap)
      dirty = false
    }
  })
}

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