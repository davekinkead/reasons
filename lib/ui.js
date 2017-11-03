'use strict'

const View = require('./view')

module.exports = {
  addEventListeners
}

function addEventListeners (argumentMap) {
  let mouseDown = false
  let selected = null
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
  })

  argumentMap.DOM.addEventListener('mousemove', (event) => {

    //  Drag any selected elements
    if (selected) {
      selected.move(getPosition(event))
      dirty = true
    }

    //  Redraw the map
    if (dirty) {
      View.draw(argumentMap)
      dirty = false
    }
  })

  argumentMap.DOM.addEventListener('mouseup', (event) => {
    selected = null
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