//  Reasons.js by Dave Kinkead
//  Copyright 2017-2019 University of Queensland
//  Available under the MIT license

'use strict'

const View    = require('./view')
const Utils   = require('./utils')
const Graph   = require('./graph')
const Keycode = require('keycode')
const Hammer  = require('hammerjs')
const History = []
let   Future  = []


module.exports = {
  addEventListeners,
  setup
}

function setup(mapper) {
  const styleTag = Utils.buildNode('style')
  styleTag.innerHTML = `
    #${mapper.DOM.id} {
      height: 100vh;
      border: 1px solid grey;
    }
    #reason-overlay {
      font-size: 18px;
      position:absolute;
      top: 0; left: 0; right: 0;
      height: 100vh;
      background: rgba(0,0,0,0.75);
    }
    #edit-reason-input {
      font-size: 18px;
      margin-top: 10vh;
    }
    #reason-overlay__wrapper {
      margin: auto;
      margin-top: 40vh;
      width:50%;
      padding: 1rem;
      flex-direction: column;
      display: flex;
    }
    #reasons-overlay-toolbar {
      margin: 0.75rem -0.5rem;
    }
    .reason-overlay__button {
      font-size: inherit;
      background-color: white;
      padding: 0.5rem 1rem;
      border: 1px solid grey;
      border-radius: 4px;
      margin: 0 0.5rem;
    }
  `
  document.head.appendChild(styleTag)
  View.resize(mapper)
}

function addEventListeners (mapper) {

  const hammer = new Hammer(mapper.DOM, {})
  hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL })
  hammer.get('pinch').set({ enable: true })

  // 3 finger swipes for undo/redo
  hammer.add(new Hammer.Swipe({ pointers: 3 }))

  //  encapuslate event state in the argumentMap
  mapper.altered = true
  mapper.editMode = false
  mapper.dirty = false     //  for when changes shouldnt be added to history
  let mouseDown = false
  let selected = null
  let dragging = null
  let clickPos = null
  let metaKeyPressed = false

  const localPosition = (event) => {
    const {x,y} = mapper.offset
    return {
      x: (parseInt(event.x || event.pageX) / mapper.scale) - x,
      y: (parseInt(event.y || event.pageY) / mapper.scale) - y
    }
  }

  /**
   * Private: Returns mouse event and hovered element
   */
  function detect (event) {
    return {
      position: localPosition(event),
      collision: mapper.graph.elements().find(el => el.collides(localPosition(event)))
    }
  }

  //  Double click creates or edits element
  const doubleClick = (event) => {

    const {position, collision} = detect(event)

    if (collision) {
      //  Double click on nodes or edges trigger edit mode
      addOverlay(mapper, collision)
    } else {
      //  Double clicks on a bare map creates a new node
      mapper.graph.add({x: position.x, y: position.y})
      selected = mapper.graph.last()
      mapper.graph.focus(selected)
      mapper.altered = true
      addOverlay(mapper, selected, true)
    }

    redraw(mapper)
  }
  hammer.on('doubletap', (hammerEvent) => {
    const event = hammerEvent.srcEvent
    doubleClick(event)
  })

  function triggerRedo() {
    //  Store for undo
    save(History, mapper)
    const next = Future.pop()
    if (next) {
      mapper.graph = new Graph(JSON.parse(next))
      mapper.dirty = true
    }
  }

  function triggerUndo() {
    //  Store for redo
    save(Future, mapper)
    const last = History.pop()
    if (last) {
      mapper.graph = new Graph(JSON.parse(last))
      mapper.dirty = true
    }
  }

  hammer.on('swipe', (hammerEvent) => {
    if (hammerEvent.direction & Hammer.DIRECTION_HORIZONTAL) {
      mapper._isSwipping = true
      if (hammerEvent.direction === Hammer.DIRECTION_LEFT) {
        triggerUndo()
      } else {
        triggerRedo()
      }
      setTimeout(() => {
        mapper._isSwipping = false
      }, 250)
    }
  })

  hammer.on('panstart', function(hammerEvent) {
    const event = hammerEvent.srcEvent
    const {collision} = detect(event)
    if (mapper._isSwipping) { return }
    if (collision) {
      dragStart(event)
    } else {
      mapper._startPan = { ...mapper.offset }
    }
  })

  hammer.on('panmove', function (hammerEvent) {
    const event = hammerEvent.srcEvent
    const {collision} = detect(event)
    if (collision) { return dragMove(event) }
    if (dragging || mapper._isSwipping) { return }

    mapper.offset = {
      x: mapper._startPan.x + (hammerEvent.deltaX / mapper.scale),
      y: mapper._startPan.y + (hammerEvent.deltaY / mapper.scale),
    }
    mapper.dirty = true
    View.zero(mapper)
    redraw(mapper)
  })

  //  Draging an element selects and moves it
  //  Selecting nothing unfocuses the graph
  const dragStart = (event) => {

    const {position, collision} = detect(event)

    if (collision) {
      selected = collision
      mapper.graph.focus(selected)
      mapper.dirty = true
      clickPos = position
      dragging = selected
    }

    redraw(mapper)
  }
  mapper.DOM.addEventListener('mousedown', dragStart)
  // mapper.DOM.addEventListener('touchstart', dragStart)

  //  Move a selected element on drag
  //  Highlight a hovered element
  const dragMove = (event) => {

    // Set element hover flag on mouseover
    const mouse = localPosition(event)

    mapper.graph.forEach((el) => {
      if (el.collides(mouse)) {
        if (!el.hovering) mapper.dirty = true
        el.hovering = true
      } else {
        if (el.hovering) mapper.dirty = true
        el.hovering = false
      }
    })

    //  Specify a node as the drag target when clicked
    if (dragging) {
      dragging.move(localPosition(event))
      mapper.dirty = true
    }

    redraw(mapper)
  }
  mapper.DOM.addEventListener('mousemove', dragMove)


  //  Release a drag action and add an edge if needed
  const dragEnd = (event) => {

    const {collision} = detect(event)

    //  Check for node drop and add a new edge to the graph if required
    if (dragging) {
      const target = mapper.graph.nodes().find(el => dragging.collides(el) && dragging.id !== el.id)
      if (target) {
        mapper.graph.add({from: dragging, to: target})
        dragging.move(clickPos)
      }

      mapper.altered = true
      dragging = null
    } else if (!collision) {
      selected = null
      mapper.graph.unfocus()
      mapper.dirty = true
    }

    redraw(mapper)
  }
  mapper.DOM.addEventListener('mouseup', dragEnd)
  mapper.DOM.addEventListener('touchend', dragEnd)


  //  Close modal if click occurs outside text box
  window.addEventListener('click', (event) => {

    if (mapper.editMode && event.target.id === 'reason-overlay') {
      removeOverlay(mapper)
    }
  })


  window.addEventListener('keydown', (event) => {

    if (mapper.editMode) {
      //  Escape key
      if (Keycode.isEventKey(event, 'Escape')) removeOverlay(mapper)

      //  Return key
      if (Keycode.isEventKey(event, 'Enter')) submitOverlay(mapper)

    } else {
      // this is a hack to get multiple presses working on windows
      // if removing it, ensure you remove it from the keyup event too
      if (isMetaKey(event)) metaKeyPressed = true

      //  Focus on `Tab`
      if (!isMetaKey(event) && Keycode.isEventKey(event, 'tab')) {
        event.preventDefault()
        selected = mapper.graph[0]
        mapper.graph.focus(selected)
        mapper.dirty = true
      }


      //  Undo `⌘-z`
      if (metaKeyPressed && Keycode.isEventKey(event, 'z')) {
        event.preventDefault()
        triggerUndo()
      }

      //  Redo `⌘-y`
      if (metaKeyPressed && Keycode.isEventKey(event, 'y')) {
        event.preventDefault()
        triggerRedo()
      }

      //  Edit selected element on `enter`
      if (selected && Keycode.isEventKey(event, 'Enter')) {
        addOverlay(mapper, selected)
      }

      //  Delete a selected element on `backspace` or `delete`
      if (Keycode.isEventKey(event, 'Delete') || Keycode.isEventKey(event, 'Backspace')) {
        if (!mapper.editMode) event.preventDefault()

        if (selected) {
          deleteElement(mapper, selected)
        }
      }
    }

    redraw(mapper)
  })

  window.addEventListener('keyup', (event) => {

    //  remove the metakey flag
    if (isMetaKey(event)) metaKeyPressed = false
  })


  window.addEventListener('resize', (event) => {
    mapper.dirty = true
    View.resize(mapper)
    View.zero(mapper)
    redraw(mapper)
  })

  const zoomAction = (event) => {

    event.preventDefault()
    mapper.dirty = true
    View.setScale(mapper, event.deltaY)
    View.zero(mapper)
    redraw(mapper)
  }
  window.addEventListener('wheel', zoomAction, { passive: false })

  //  Use _lastScale to help calculate the diff of the event's movement
  let _lastScale = 1

  hammer.on('pinch', (hammerEvent) => {
    if (mapper._isSwipping) { return }
    hammerEvent.preventDefault()
    let tmpScale = hammerEvent.scale - _lastScale

    mapper.dirty = true
    View.setScale(mapper, tmpScale * 1000, true)
    View.zero(mapper)
    redraw(mapper)
    _lastScale = hammerEvent.scale
  })

  hammer.on('pinchend', () => {
    _lastScale = 1
  })

}

let timeout

function deleteElement(mapper, selected) {
  mapper.graph.remove(selected)
  mapper.dirty = true
}

function redraw(mapper) {
  if (mapper.altered || mapper.dirty) {
    // If there's a timer, cancel it
    if (timeout) {
      window.cancelAnimationFrame(timeout)
    }

      // Setup the new requestAnimationFrame()
    timeout = window.requestAnimationFrame(function () {
      _redraw(mapper)
    })
  }
}

/**
 * Private: Redraws the canvas if changes have occured
 */
function _redraw (mapper) {
  if (mapper.altered || mapper.dirty) {
    if (mapper.altered) {
      save(History, mapper)
      Future = [] //  Reset the redo buffer
    }

    View.draw(mapper)
    mapper.altered = false
    mapper.dirty = false
  }
}


/**
 * Private: Saves a serialized copy of the graph
 */
function save (store, mapper) {
  const last = (store.length == 0) ? JSON.stringify([]) : store[store.length-1]
  const current = JSON.stringify(
      mapper.graph.map(function (element) {
        return element.export(mapper.offset)
      })
    )

  if (current !== last) store.push(current)
}



/**
 * Private: Returns the x,y position of an event
 */
// function getPosition (event) {
//   return {
//     x: parseInt(event.x || event.clientX),
//     y: parseInt(event.y || event.clientY)
//   }
// }

/**
 * Private: Creates the html for the overlaytoolbar
 */
function toolbarNode(mapper, element) {
  const node = Utils.buildNode('div', {id: 'reasons-overlay-toolbar'})
  node.setAttribute('style', 'display: flex; flex-direction: row;')
  node.appendChild(Utils.buildNode('div', { style: 'flex-grow: 1;' }))
  node.appendChild(toolButton({
    name: 'Delete',
    onclick: () => {
      if (confirm("Really remove this?")) {
        deleteElement(mapper, element)
        removeOverlay(mapper)
        redraw(mapper)
      }
    }
  }))
  node.appendChild(toolButton({
    name: 'OK',
    onclick: () => {
      submitOverlay(mapper)
      redraw(mapper)
    }
  }))
  return node
}

function toolButton(opts) {
  const {name} = opts
  delete opts.name
  const button = Utils.buildNode('button', opts, {class: 'reason-overlay__button'})
  button.innerText = name
  return button
}

/**
 * Private: Overlays a text box to edit a node or edge
 */
function addOverlay (mapper, element, highlightAll = false) {

  //  set the
  mapper.editMode = true

  //  Create background layer
  let overlay = Utils.buildNode('div', {id: 'reason-overlay'})

  // create modal content wrapper
  const wrapper = Utils.buildNode('div', {id: 'reason-overlay__wrapper'})

  // Create text input field
  let input = Utils.buildNode('textarea', {id: 'edit-reason-input', value: element.text || element.type})
  input.setAttribute('data-element', element.id)

  //  Append to the DOM
  overlay.appendChild(wrapper)
  wrapper.appendChild(input)
  wrapper.appendChild(toolbarNode(mapper, element))
  document.body.appendChild(overlay)

  //  Highlight text on element creation
  if (highlightAll) {
    input.select()
    input.setSelectionRange(0, input.value.length)
  }
  wrapper.scrollIntoView()
}


/**
 * Private: Updates the graph from the overlay and removes it
 */
function submitOverlay (mapper) {
  let input = document.querySelector('#edit-reason-input')
  let el = mapper.graph.elements().find(el => el.id == input.getAttribute('data-element') )

  if (el.isNode()) {
    el.text = input.value
  } else {
    el.type = input.value
  }
  removeOverlay(mapper)
}


/**
 * Private: Removes the overlay
 */
function removeOverlay (argumentMap) {
  argumentMap.editMode = false
  argumentMap.altered = true
  document.querySelector('#reason-overlay').remove()
}

function isMetaKey (event) {
  return (
    event.metaKey ||
    Keycode.isEventKey(event, 'Alt') ||
    Keycode.isEventKey(event, 'Meta') ||
    Keycode.isEventKey(event, 'Command') ||
    Keycode.isEventKey(event, 'Control') ||
    Keycode.isEventKey(event, 'Win') ||
    Keycode.isEventKey(event, 'ControlLeft') ||
    Keycode.isEventKey(event, 'ControlRight')
  ) ? true : false
}