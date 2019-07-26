(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Reasons = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//  Reasons.js by Dave Kinkead
//  Copyright 2017-2019 University of Queensland
//  Available under the MIT license

'use strict'

const Utils = require('./Utils')
const maxWidth = 200
const padding = 10
const fontSize = 16


module.exports = {
  mixin, isEdge, isNode, save
}


/**
 * Mixes in specific behaviour of an Element to an Object
 */
function mixin(element) {
  element.isEdge = isEdge
  element.isNode = isNode
  element.export = save
  element.collides = collides
  element.move = move

  return init(element)
}


/**
 * Initialize an Element
 *  @params element Node or Edge
 */
function init (element) {
  element.id = element.id || Math.random().toString(36).slice(-5)

  if (element.isEdge()) {

    /**
     * Default Edge values:
     *  From should return ['node_id', 'node_id']
     *  To should return 'node_id'
     *  Path should be an empty array to be set in the View/UI
     */
    element.from = Utils.flatten([element.from]).map((from) => { return from.id || from })
    element.to = element.to.id || element.to
    element.type = element.type || 'supports'
    element.paths = []
  } else {

    //  Default Node values
    element.text = element.text || 'A reason'
    element.width = maxWidth
    element.height = fontSize * 3.5
    locate(element, {x: element.x || 0, y: element.y || 0})
  }

  return element
}


/**
 * Returns true if an element is an Edge
 */
function isEdge () {
  return (this.to && this.from) ? true : false
}


/**
 * Returns true if an element is a Node
 */
function isNode () {
  return (this.isEdge()) ? false : true
}

/**
 * Determines if an point is withing the boundaries of an element
 */
function collides (el) {
  if (this.isEdge()) {

    //  Determine a hit for each of the paths
    let hit = false
    this.paths.forEach((path) => {
      if (differenceOfVectors(el, path) < 0.05)
        hit = true
    })

    if (!this.center) return false

    //  Estimate collision of the label box
    let width = this.type.length * 5
    hit = (el.x < this.center.x - width || el.x > this.center.x + width ||
            el.y < this.center.y - 10 ||  el.y > this.center.y +  10) ? false : true

    //  otherwise
    return hit
  } else {

    //  is the element a node or x,y coordinate
    if (el.isNode && el.isNode())
      return (this.x2 < el.x1 || this.x1 > el.x2 || this.y1 > el.y2 || this.y2 < el.y1) ? false : true
    else
      return (el.x > this.x1 && el.x < this.x2 && el.y > this.y1 && el.y < this.y2) ? true : false
  }
}

/**
 * Increases the x & y values of an element
 */
function move (position) {
  if (this.isNode()) {
    this.x = position.x
    this.y = position.y
    locate(this, position)
  }
}

/**
 * Exports an element's data
 */
function save () {
  if (this.isEdge()) {

    //  Export an Edge
    return {
      id: this.id,
      type: this.type,
      from: convertObjectsToIds(this.from),
      to: convertObjectsToIds(this.to)
    }
  } else {

    //  Export a Node
    return {
      id: this.id,
      text: this.text,
      x: parseInt(this.x1 + this.width/2),
      y: parseInt(this.y1 + this.height/2)
    }
  }
}


/**
 * Helper function to set position values
 */
function locate (element, position) {
  if (element.isNode()) {
    element.x1 = parseInt(position.x - element.width/2)
    element.x2 = parseInt(position.x + element.width/2)
    element.y1 = parseInt(position.y - element.height/2)
    element.y2 = parseInt(position.y + element.height/2)
  }
}


/**
 * Helper function to ensure permit edge references to both nodes and node.ids
 */
 function convertObjectsToIds (obj) {
  if (obj instanceof Array) {
    return obj.map(el => el.id || el)
  } else {
    return obj.id || obj
  }
}

/**
 * Helper function to calculate the difference between 2 vectors el -> x1,y1 and el -> x2,y2
 */
function differenceOfVectors (point, path) {
  return Math.abs((Math.atan2(point.y-path.y1, point.x-path.x1))
        -(Math.atan2(path.y2-point.y, path.x2-point.x)))
}
},{"./Utils":2}],2:[function(require,module,exports){
//  Reasons.js by Dave Kinkead
//  Copyright 2017-2019 University of Queensland
//  Available under the MIT license

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
},{"array-difference":10,"array-flatten":11,"array-unique":12}],3:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"./Utils":2,"dup":1}],4:[function(require,module,exports){
//  Reasons.js by Dave Kinkead
//  Copyright 2017-2019 University of Queensland
//  Available under the MIT license

'use strict'

const Utils   = require('./utils')
const Element = require('./element')

module.exports = Graph


/**
 * A Graph is simply an extended array containing node and edge objects.
 *  It is an abstract data structure with no DOM form.
 *  Edges will contain references to node objects.
 *
 * @param elements  the elements (nodes & edges) to consitute the graph
 */
function Graph(elements) {
  //  sort the elements so nodes are added before edges
  if (elements instanceof Array) {
    elements.sort((a,b) => {
      return a.to ? 1: -1
    }).forEach(el => this.add(el))
  }
}


/**
 * Use Array as the prototype
 */
Graph.prototype = Object.create(Array.prototype)


/**
 * Adds a new element to the Graph.
 *  Nodes should be added before edges as the latter referrence the former
 *
 * @param element an element to add
 */
Graph.prototype.add = function (element) {

  //  Mixin Element behaviour
  Element.mixin(element)

  if (element.isNode()) {
    this.push(element)
  } else {

    //  Sanity check to ensure that edges only join nodes
    if (this.hasDuplicate(element) || this.isFromEdge(element) || this.isToEdge(element)) {
      return false
    }

    //  Edges can connect independent or conjoined reasons.
    //  If A B & C both already support D
    //  and a new edge is added from A to B or vice versa
    //  then the relationships should be merged [A,B] -> D
    //  and C -> D kept unchanged
    let commonChildren = Utils.intersection(
      Utils.flatten(element.from.map(e => this.children(e))),
      this.children(element.to)
    ).map(el => el.id)

    if (commonChildren.length > 0) {
      let commonParents = Utils.flatten([element.from, element.to]).map(el => el.id || el)

      //  remove the edge that contains element.from to common children
      this.edges().forEach((edge) => {
        if (Utils.intersection(element.from, edge.from).length > 0)
          this.remove(edge)

        if (edge.from.includes(element.to)) {
          this.push(Element.mixin({
            from: Utils.flatten([edge.from, element.from]),
            to: edge.to,
            type: edge.type
          }))
          this.remove(edge)
        }
      })
    } else {
      this.push(element)
    }
  }
}


/**
 * Removes an existing element from the Graph.
 *  If a node is removed, it should also remove relevent edges
 *
 *  @param el the element to remove
 */
 Graph.prototype.remove = function (el) {
  let i = this.indexOf(el)

  if (i > -1) {
    if (el.isNode()) {

      //  find associated edges first
      let edgesTo = this.edges().filter(edge => edge.to == el.id)
      let edgesFrom = this.edges().filter(edge => edge.from.includes(el.id))

      //  determine if any associated edge is conjoined
      let conjoined = edgesFrom.filter(edge => edge.from.length > 1)

      //  remove the node
      this.splice(i, 1)

      //  and then the associated edges
      edgesTo.forEach((edge) => {
        if (this.indexOf(edge) > -1)
          this.splice(this.indexOf(edge), 1)
      })

      edgesFrom.forEach((edge) => {
        if (this.indexOf(edge) > -1)
          this.splice(this.indexOf(edge), 1)
      })

      //  also remove node from any complex relations
      edgesFrom.filter(e => e.from instanceof Array).map((e) => {
        if (e.from.indexOf(el) > -1)
          e.from.splice(e.from.indexOf(el), 1)
        if (e.from.length === 1)
          e.from = e.from[0]
      })

      //  and now modify the conjoined edges and add them back
      conjoined.forEach((edge) => {
        edge.from.splice(edge.from.indexOf(el.id), 1)
        this.push(edge)
      })
    } else {
      this.splice(i, 1)
    }
  }

  //  permit chaining during tests
  return this
}


/**
 * Moves an element to the front of the Graph and sets the focused flag.
 * Useful for assiting with layouts.
 *
 * @param el an element to focus
 */
 Graph.prototype.focus = function (el) {
  let index = this.indexOf(el)

  if (index > -1) {
    this.push(this.splice(index, 1)[0])
  }

  this.forEach(function (e) {
    e.focused = (e === el) ? true : false
  })

  //  permit chaining during tests
  return el
}

 Graph.prototype.undoFocus = function () {
  const last = this.pop();
  this.unshift(last);

  this.forEach(function (e) {
    e.focused = (e === last) ? true : false
  })

  //  permit chaining during tests
  return last
}


/**
 * Unsets the focused flag of an element
 */
Graph.prototype.unfocus = function () {
  this.forEach(function (el) {
    el.focused = false
  })

  //  permit chaining during tests
  return this
}


/**
 * Returns the last element of the array
 */
Graph.prototype.last = function () {
  return this[this.length - 1]
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
 *  Returns an array of objects
 *
 *  @params id a Node or String id of a Node
 */
Graph.prototype.parents = function (id) {
  if (id instanceof Object) id = id.id

  return Utils.flatten(
      this.edges().filter(el => el.to == id).map(el => el.from)
    ).map(el => this.find(i => i.id == el))
}


/**
 * Find all the children for a given node or id
 *  Returns an array of objects
 *
 *  @params id a Node or String id of a Node
 */
Graph.prototype.children = function (id) {
  if (id instanceof Object) id = id.id

  return Utils.unique(this.edges().filter((el) => {
    return Utils.flatten([el.from]).map(el => el.id || el).indexOf(id) > -1
  }).map(el => el.to)
    .map(el => this.find(i => i == el || i.id == el)))
}


/**
 * Determine if the proposed element is a dupliucate
 *  Returns boolean
 *
 *  @params edge object
 */
Graph.prototype.hasDuplicate = function (el) {
  Element.mixin(el)
  let dupe = false

  if (el.isEdge()) {
    this.edges().forEach((edge) => {
      if (el.to === edge.to && el.from.toString() === edge.from.toString()) {
        dupe = true
      }
    })
  }
  return dupe
}


/**
 * Determine if the proposed Edge is from an Edge
 *  Returns boolean
 *
 *  @params edge object
 */
Graph.prototype.isFromEdge = function (element) {
  var fromEdge = false
  element.from.forEach((el) => {
    var match = this.edges().find((e) => e.id == el)
    if (match) fromEdge = true
  })

  return fromEdge
}


/**
 * Determine if the proposed Edge is to an Edge
 *  Returns boolean
 *
 *  @params edge object
 */
Graph.prototype.isToEdge = function (element) {
  let to = this.find((el) => el.id == element.to)
  if (to && to.isEdge()) {
    return true
  }
}
},{"./element":3,"./utils":8}],5:[function(require,module,exports){
//  Reasons.js by Dave Kinkead
//  Copyright 2017-2019 University of Queensland
//  Available under the MIT license

'use strict'

const Graph = require('./graph')
const UI = require('./ui')
const View = require('./view')


/**
 * This module wraps the DOM UI, Canvas renderer, and Graph data
 */
module.exports = Mapper


/**
 * The Mapper acts as the interface between the Graph data object and the browser DOM.
 * It contains references to @graph (the data) and @DOM (the DOM object)
 *
 * @params elementID  the element id to append the map canvas to
 */
function Mapper (elementID) {

  //  get the DOM element
  this.DOM = document.querySelector(elementID)

  //  attach the canvas and event listeners to the HTML if the reference was valid
  if (this.DOM) {
    View.init(this)
    UI.setup(this)
    UI.addEventListeners(this)
  }
}


/**
 * Populates a Graph with nodes and edges.
 *
 * @params elements   the elements to render
 */
Mapper.prototype.render = function (elements) {
  // console.log(elements)
  this.graph = new Graph(elements)
  View.zero(this)
  View.draw(this)
  return this
}


/**
 * Exports a Graph's data structure as an Array
 */
Mapper.prototype.export = function () {
  return this.graph.map(element => element.export())
}
},{"./graph":4,"./ui":7,"./view":9}],6:[function(require,module,exports){
//  Reasons.js by Dave Kinkead
//  Copyright 2017-2019 University of Queensland
//  Available under the MIT license

/**
 * The Reasons.js API.  This module forms the top level wrapper
 */
const Mapper = require('./mapper')

module.exports = {
  mapper: function (dom) {
    return new Mapper(dom)
  }
}
},{"./mapper":5}],7:[function(require,module,exports){
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
      padding: 1rem;
      height: 1.25rem;
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
        if (event.shiftKey) {
          mapper.graph.undoFocus()
        } else {
          selected = mapper.graph[0]
          mapper.graph.focus(selected)
        }
        console.log(mapper.graph.map(g => g.id))
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
    if (event.target.id != 'reasons-element') {
      return
    }

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

function changeLine(mapper, element, type) {
  element.lineType = type
  mapper.altered = true
  redraw(mapper)
}

/**
 * Private: Creates the html for the overlaytoolbar
 */
function toolbarNode(mapper, element) {
  const node = Utils.buildNode('div', {id: 'reasons-overlay-toolbar'})
  node.setAttribute('style', 'display: flex; flex-direction: row;')
  node.appendChild(Utils.buildNode('div', { style: 'flex-grow: 1;' }))

  node.appendChild(toolButton({
    name: '<b>—</b>',
    onclick:() => changeLine(mapper, element, 'solid')
  }))
  node.appendChild(toolButton({
    name: '<b>- -</b>',
    onclick:() => changeLine(mapper, element, 'dashed')
  }))
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
  button.innerHTML = name
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
},{"./graph":4,"./utils":8,"./view":9,"hammerjs":13,"keycode":14}],8:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"array-difference":10,"array-flatten":11,"array-unique":12,"dup":2}],9:[function(require,module,exports){
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
 *
 * @param {any} node
 * @param {Object} opts
 * @param {CanvasRenderingContext2D} opts.context
 */
function draw_node (node, {context, offset}) {
  // Set font size before calculating text widths
  context.font = fontSize + 'px sans-serif'

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
},{"./Element":1,"./utils":8}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

},{}],14:[function(require,module,exports){
// Source: http://jsfiddle.net/vWx8V/
// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

/**
 * Conenience method returns corresponding value for given keyName or keyCode.
 *
 * @param {Mixed} keyCode {Number} or keyName {String}
 * @return {Mixed}
 * @api public
 */

function keyCode(searchInput) {
  // Keyboard Events
  if (searchInput && 'object' === typeof searchInput) {
    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode
    if (hasKeyCode) searchInput = hasKeyCode
  }

  // Numbers
  if ('number' === typeof searchInput) return names[searchInput]

  // Everything else (cast to string)
  var search = String(searchInput)

  // check codes
  var foundNamedKey = codes[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // check aliases
  var foundNamedKey = aliases[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // weird character?
  if (search.length === 1) return search.charCodeAt(0)

  return undefined
}

/**
 * Compares a keyboard event with a given keyCode or keyName.
 *
 * @param {Event} event Keyboard event that should be tested
 * @param {Mixed} keyCode {Number} or keyName {String}
 * @return {Boolean}
 * @api public
 */
keyCode.isEventKey = function isEventKey(event, nameOrCode) {
  if (event && 'object' === typeof event) {
    var keyCode = event.which || event.keyCode || event.charCode
    if (keyCode === null || keyCode === undefined) { return false; }
    if (typeof nameOrCode === 'string') {
      // check codes
      var foundNamedKey = codes[nameOrCode.toLowerCase()]
      if (foundNamedKey) { return foundNamedKey === keyCode; }
    
      // check aliases
      var foundNamedKey = aliases[nameOrCode.toLowerCase()]
      if (foundNamedKey) { return foundNamedKey === keyCode; }
    } else if (typeof nameOrCode === 'number') {
      return nameOrCode === keyCode;
    }
    return false;
  }
}

exports = module.exports = keyCode;

/**
 * Get by name
 *
 *   exports.code['enter'] // => 13
 */

var codes = exports.code = exports.codes = {
  'backspace': 8,
  'tab': 9,
  'enter': 13,
  'shift': 16,
  'ctrl': 17,
  'alt': 18,
  'pause/break': 19,
  'caps lock': 20,
  'esc': 27,
  'space': 32,
  'page up': 33,
  'page down': 34,
  'end': 35,
  'home': 36,
  'left': 37,
  'up': 38,
  'right': 39,
  'down': 40,
  'insert': 45,
  'delete': 46,
  'command': 91,
  'left command': 91,
  'right command': 93,
  'numpad *': 106,
  'numpad +': 107,
  'numpad -': 109,
  'numpad .': 110,
  'numpad /': 111,
  'num lock': 144,
  'scroll lock': 145,
  'my computer': 182,
  'my calculator': 183,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222
}

// Helper aliases

var aliases = exports.aliases = {
  'windows': 91,
  '⇧': 16,
  '⌥': 18,
  '⌃': 17,
  '⌘': 91,
  'ctl': 17,
  'control': 17,
  'option': 18,
  'pause': 19,
  'break': 19,
  'caps': 20,
  'return': 13,
  'escape': 27,
  'spc': 32,
  'spacebar': 32,
  'pgup': 33,
  'pgdn': 34,
  'ins': 45,
  'del': 46,
  'cmd': 91
}

/*!
 * Programatically add the following
 */

// lower case chars
for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

// numbers
for (var i = 48; i < 58; i++) codes[i - 48] = i

// function keys
for (i = 1; i < 13; i++) codes['f'+i] = i + 111

// numpad keys
for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96

/**
 * Get by code
 *
 *   exports.name[13] // => 'Enter'
 */

var names = exports.names = exports.title = {} // title for backward compat

// Create reverse mapping
for (i in codes) names[codes[i]] = i

// Add aliases
for (var alias in aliases) {
  codes[alias] = aliases[alias]
}

},{}]},{},[6])(6)
});
