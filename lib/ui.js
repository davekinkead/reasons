'use strict'

const View    = require('./view')
const Utils   = require('./utils')
const History = []

module.exports = {
  addEventListeners
}


function addEventListeners (argumentMap) {

  //  encapuslate event state in the argumentMap
  argumentMap.flags = {}
  argumentMap.flags.dirty = false
  argumentMap.flags.editing = false
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
      argumentMap.flags.dirty = true
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
      argumentMap.flags.dirty = true
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
        if (!el.hovering) argumentMap.flags.dirty = true
        el.hovering = true
      } else {
        if (el.hovering) argumentMap.flags.dirty = true
        el.hovering = false
      }
    })

    //  Specify a node as the drag target when clicked
    if (dragging) {
      dragging.move(getPosition(event))
      argumentMap.flags.dirty = true
    }

    redraw(argumentMap)
  })


  //  Release a drag action and add an edge if needed
  argumentMap.DOM.addEventListener('mouseup', (event) => {

    const {position, collision} = detect(argumentMap, event)

    if (dragging) {
      //  Check for node drop and add a new edge to the graph if required
      const target = argumentMap.graph.nodes().find(el => dragging.collides(el) && dragging.id !== el.id)
      if (target) {
        argumentMap.graph.add({from: dragging, to: target})
        dragging.move(clickPos)
        argumentMap.flags.dirty = true
      }

      dragging = null
    } else if (!collision) {
      selected = null
      argumentMap.graph.unfocus()
      argumentMap.flags.dirty = true
    }

    redraw(argumentMap)
  })


  window.addEventListener('keydown', (event) => {

    if (argumentMap.flags.editing) {
      //  Escape key
      if (event.keyCode == 27) removeOverlay(argumentMap)

      //  Return key
      if (event.keyCode == 13) submitOverlay(argumentMap)

    } else {
      //  Focus on `Tab`
      if (!event.metaKey && event.keyCode == 9) {
        event.preventDefault()
        selected = argumentMap.graph[0]
        argumentMap.graph.focus(selected)
        argumentMap.flags.dirty = true
      }

      //  Undo `⌘-z`
      if (event.metaKey && event.keyCode == 90) {
        console.log('undo here')
      }

      //  Redo `⌘-y`
      if (event.metaKey && event.keyCode == 89) {
        console.log('redo here')
      }

      //  Edit selected element on `enter`
      if (selected && event.keyCode == 13) {
        addOverlay(argumentMap, selected)
      }

      //  Delete a selected element on `backspace` or `delete`
      if (selected && (event.keyCode == 8 || event.keyCode == 46)) {
        event.preventDefault()
        argumentMap.graph.remove(selected)
        argumentMap.flags.dirty = true
      }      
    }

    redraw(argumentMap)
  })


  window.addEventListener('resize', (event) => {
    argumentMap.flags.dirty = true
    View.resize(argumentMap)
    View.zero(argumentMap)
    redraw(argumentMap)
  })
}


/**
 * Private: Redraws the canvas if dirty
 */
function redraw (argumentMap) {
  if (argumentMap.flags.dirty) {
    // History.push(argumentMap.graph)
    View.draw(argumentMap)
    argumentMap.flags.dirty = false
    // console.log(Math.random())
  }
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
  argumentMap.flags.editing = false
  argumentMap.flags.dirty = true
  document.querySelector('#reason-overlay').remove()  
}