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
// const hammer  = require('hammerjs')
const History = []
let   Future  = []


module.exports = {
  addEventListeners
}


function addEventListeners (mapper) {

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
    return {
      x: parseInt(event.x || event.clientX) / mapper.scale,
      y: parseInt(event.y || event.clientY) / mapper.scale
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
  mapper.DOM.addEventListener('dblclick', (event) => {

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
    }

    redraw(mapper)
  })


  //  Draging an element selects and moves it
  //  Selecting nothing unfocuses the graph
  mapper.DOM.addEventListener('mousedown', (event) => {

    const {position, collision} = detect(event)

    if (collision) {
      selected = collision
      mapper.graph.focus(selected)
      mapper.dirty = true
      clickPos = position
      dragging = selected
    }

    redraw(mapper)
  })

  //  Move a selected element on drag
  //  Highlight a hovered element
  mapper.DOM.addEventListener('mousemove', (event) => {

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
  })


  //  Release a drag action and add an edge if needed
  mapper.DOM.addEventListener('mouseup', (event) => {

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
  })


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

        //  Store for redo
        save(Future, mapper)

        const last = History.pop()
        if (last) {
          mapper.graph = new Graph(JSON.parse(last))
          mapper.dirty = true
        }
      }

      //  Redo `⌘-y`
      if (metaKeyPressed && Keycode.isEventKey(event, 'y')) {
        event.preventDefault()

        //  Store for undo
        save(History, mapper)

        const next = Future.pop()
        if (next) {
          mapper.graph = new Graph(JSON.parse(next))
          mapper.dirty = true
        }
      }

      //  Edit selected element on `enter`
      if (selected && Keycode.isEventKey(event, 'Enter')) {
        addOverlay(mapper, selected)
      }

      //  Delete a selected element on `backspace` or `delete`
      if (Keycode.isEventKey(event, 'Delete') || Keycode.isEventKey(event, 'Backspace')) {
        if (!mapper.editMode) event.preventDefault()

        if (selected) {
          mapper.graph.remove(selected)
          mapper.dirty = true
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

  window.addEventListener('wheel', (event) => {
    event.preventDefault();
    // console.log(event);
    mapper.dirty = true
    View.setScale(mapper, event.deltaY)
    View.zero(mapper)
    redraw(mapper)
  }, { passive: false })
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
 * Private: Returns the x,y position of an event
 */
// function getPosition (event) {
//   return {
//     x: parseInt(event.x || event.clientX),
//     y: parseInt(event.y || event.clientY)
//   }
// }


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
},{"./graph":4,"./utils":8,"./view":9,"keycode":13}],8:[function(require,module,exports){
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
    graph.edges().forEach(el => draw_edge(el, mapper.context))
    graph.nodes().forEach(el => draw_node(el, mapper.context))
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
        x: ((mapper.DOM.clientWidth-mapper.DOM.clientLeft)/2 + mapper.DOM.clientLeft)
          - ((nodeBB.x2-nodeBB.x1)/2 + nodeBB.x1),
        y: ((mapper.DOM.clientHeight-mapper.DOM.clientTop)/2 + mapper.DOM.clientTop)
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

  function setScale(mapper, newScale) {
    console.log(newScale)
    // scale = (newScale > 0) ? scale++ : scale
    const relativeScale = (1+ newScale/1000)
    mapper.scale = mapper.scale * relativeScale
    // scale *= newScale/100
    console.log(mapper.scale)
    mapper.context.scale(relativeScale, relativeScale)
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
 */
function draw_node (node, context) {

  //  word wrap the text
  const text = wordWrap(node.text, context)
  const rgb = (node.hovering) ? rgbFocused : rgbDefault
  const opacity = (node.focused) ? 0.9 : (node.hovering) ? 0.75 : 0.5

  //  recalculate the height
  node.height = (text.length * fontSize + fontSize * 2.5)
  resizeNode(node)

  //  clear a white rectangle for background
  context.clearRect(getLocal(node.x1), getLocal(node.y1), getLocal(node.width), getLocal(node.height))
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineJoin = "round"
  context.lineWidth = cornerRadius
  context.strokeRect(
    getLocal(node.x1+cornerRadius/2), getLocal(node.y1+cornerRadius/2),
    getLocal(node.width-cornerRadius), getLocal(node.height-cornerRadius)
  )

  //  set text box styles
  context.fillStyle = 'rgba('+rgb+',0.8)'
  context.font = fontSize + 'px sans-serif'
  context.textAlign = 'center'

  //  add the text content
  text.forEach((line, i) => {
    context.fillText(line, getLocal(node.x1) + getLocal(node.width)/2, getLocal(node.y1)  + getLocal(i+2) * getLocal(fontSize))
  })
}


/**
 * Private: Draws an edge on the canvas
 */
function draw_edge (edge, context) {
  locate(edge)

  //  stroke style
  const rgb = (edge.hovering) ? rgbFocused : rgbDefault
  const opacity = (edge.focused) ? 0.9 : (edge.hovering) ? 0.75 : 0.5
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineWidth = 4

  //  stroke position
  context.beginPath()
  edge.paths.forEach((path) => {
    context.moveTo(getLocal(path.x1), getLocal(path.y1))
    context.lineTo(getLocal(path.x2), getLocal(path.y2))
  })

  //  arrow tip
  let last = edge.paths[edge.paths.length-1]
  let arrow = arrowify(last)
  context.lineTo(getLocal(arrow.x1), getLocal(arrow.y1))
  context.moveTo(getLocal(last.x2), getLocal(last.y2))
  context.lineTo(getLocal(arrow.x2), getLocal(arrow.y2))
  context.stroke()

  //  text stroke
  let textWidth = context.measureText(edge.type).width + padding
  context.clearRect(getLocal(edge.center.x-textWidth/2), getLocal(edge.center.y-15), getLocal(textWidth), getLocal(25))

  //  label
  context.fillStyle = 'rgba('+rgb+',0.8)'
  context.font = getLocal(14) + 'px sans-serif'
  context.textAlign = 'center'
  context.fillText(edge.type, getLocal(edge.center.x), getLocal(edge.center.y))

  if (edge.intersection)
    context.fillRect(getLocal(edge.intersection.x), getLocal(edge.intersection.y), getLocal(10), getLocal(10))
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
  // edge.center.x = parseInt(edge.center.x/(elements.length))
  // edge.center.y = parseInt(edge.center.y/(elements.length))

  //  create pairs from from-points to center to to-point
  edge.paths = edge.from.map((node) => {
    let el = elements.find(e => e.id == node)
    return {
      x1: parseInt(el.x1+(el.x2-el.x1)/2),
      y1: parseInt(el.y1+(el.y2-el.y1)/2),
      x2: parseInt(edge.center.x),
      y2: parseInt(edge.center.y)
    }
  })

  //  move the 'to' point back down the path to just outside the node.
  let to = elements.find(e => e.id == edge.to)
  let offset = pointOfIntersection(edge.center, to, 5)

  // get offset x,y from rectangle intersect
  edge.paths.push({
    x1: parseInt(edge.center.x),
    y1: parseInt(edge.center.y),
    x2: parseInt(to.x1 + (to.x2 - to.x1)/2) - offset.x,
    y2: parseInt(to.y1 + (to.y2 - to.y1)/2) + offset.y
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
