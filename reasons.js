!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Reasons=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const Reason = require('./reason')
const Relation = require('./relation')
const Graph = require('./graph')

module.exports = {
  render: (dom, graph) => {
    return new Canvas(dom, graph)
  }
}

function Canvas (dom, graph) {

  //  initial & current position of a click event
  let first = {}
  let last = {}

  //  event flags to manage state between events
  let mouseDown = false
  let dragged = false
  let editing = false
  let dirty = false

  //  canvas DOM object
  let domBB = dom.getBoundingClientRect()
  let canvas = build('canvas', {id: 'reasons-'+dom.id}, {width: domBB.width, height: domBB.height})
  dom.appendChild(canvas)

  //  DOM object event listeners
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

        //  pop clicked reason to the top
        if (el instanceof Reason) {
          current = graph.splice(i, 1)[0]
          graph.push(current)
        }

        // if (current) 
      }
    })

    
    draw(this)
  })

  canvas.addEventListener('mousemove', (event) => {
      //  flag elements in hit zone as hovering
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
        graph.unshift(new Relation({canvas: canvas, from: from, to: to}))
        draw(this)
      }

      graph.forEach((el) => {

        //  remove draggable & droppable flags from elements
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
      let reason = new Reason({canvas: canvas, x: last.x, y: last.y})
      graph.push(reason)
      editing = true
      addOverlay(reason)
    }

    draw(this)      
  })  

  window.addEventListener('keydown', (event) => {

    //  update node text
    if (editing) {

      //  return
      if (event.keyCode == 13) {
        removeOverlay(graph)
        dirty = true
        editing = false
      }
    } else {

      //  delete a selected element
      if (event.keyCode == 8) {
        event.preventDefault()
        let i = graph.findIndex((el) => { return el.selected})
        if (i > -1) {
          dirty = true

          if (graph[i] instanceof Reason) {

            //  find associated edges first
            let edges = graph.filter((el) => { 
              return (el.from && el.to) && (el.from.id == graph[i].id || el.to.id == graph[i].id)
            })
            //  remove the node
            graph.splice(i, 1)

            //  and then the edges
            edges.forEach((edge) => {
              let ei = graph.indexOf(edge)
              graph.splice(ei, 1)
            })

          } else {
            graph.splice(i, 1)
          }
        }
      }
    }

    if (dirty) draw(this)
  })

  //  set public variables
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.graph = graph
  this.width = domBB.width
  this.height = domBB.height

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
  canvas.context.clearRect(0, 0, canvas.width, canvas.height)
}

function getPosition(event) {
  return {
    x: parseInt(event.x || event.clientX),
    y: parseInt(event.y || event.clientY)
  }
}

function build(type, options, attributes) {
  let node = document.createElement(type)
  for (var key in options) {
    node[key] = options[key]
  }
  for (var key in attributes) {
    node.setAttribute(key, attributes[key])
  }
  return node
}

function addOverlay(el) {
  let overlay = build('div', {id: 'reason-overlay'})
  overlay.setAttribute('style', 'position:absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75);')

  let input = build('input', {id: 'edit-reason-input'}, {value: el.text || el.type})
  input.setAttribute('style', 'position:absolute; top: 45%; bottom: 50%; left: 25%; right: 50%; width:50%; padding: 1rem;')
  input.setAttribute('data-element', el.id)

  overlay.appendChild(input)
  document.body.appendChild(overlay)
}

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
},{"./graph":2,"./reason":4,"./relation":6}],2:[function(require,module,exports){
const unique = require('array-unique')
const flatten = require('array-flatten')
const diff = require('array-difference')

module.exports = Graph

//  A graph is simply and extended array containing node and edge objects
function Graph() {
  if (!(this instanceof Graph)) return new Graph()
}

//  Use Array as the prototype
Graph.prototype = Object.create(Array.prototype)




// function Graph (graph) {
//   if (!graph) graph = {nodes: {}, edges: []}
//   if (!(this instanceof Graph)) return new Graph(graph)
//   this.nodes = graph.nodes || graph.vertices || graph.reasons
//   this.edges = graph.edges || graph.arcs || graph.relations
// }

// Graph.prototype.children = function (id) {
//   if (! this.edges) return []
//   return unique( flatten( this.edges.map((edge) => { return edge.to })) )
// }

// Graph.prototype.parents = function (id) {
//   if (! this.edges) return []
//   if (id) {
//     return unique( flatten( this.edges.filter((edge) => {
//       return id == edge.to || id.indexOf(edge.to) > -1
//     }).map((edge) => {
//       return edge.from
//     })))
//   } else {
//     return unique( flatten( this.edges.map((edge) => { return edge.from })) )    
//   }
// }

// Graph.prototype.connected = function (id) {
//   return unique( this.parents().concat(this.children()) )
// }

// Graph.prototype.orphans = function () {
//   return diff(Object.keys(this.nodes), this.connected())
// }

// Graph.prototype.ends = function () {
//   return this.children().filter((i) => {
//     return this.parents().indexOf(i) < 0
//   })
// }

// Graph.prototype.addNode = function (id, object) {}

// Graph.prototype.removeNode = function (id) {}

// Graph.prototype.addEdge = function (object) {}

// Graph.prototype.removeEdge = function (object) {}

// Graph.prototype.root = function () {}
},{"array-difference":7,"array-flatten":8,"array-unique":9}],3:[function(require,module,exports){
const Graph = require('./graph')
const Canvas = require('./canvas')
const Reason = require('./reason')
const Relation = require('./relation')

module.exports = ArgumentMap

function ArgumentMap (dom) {
  if (!this instanceof ArgumentMap) return new ArgumentMap(dom)
  this.dom = document.querySelector(dom)
}

ArgumentMap.prototype.render = function (elements) {

  //  sets the graph if arg supplied
  if (elements instanceof Array) {
    this.graph = new Graph()

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
  Canvas.render(this.dom, this.graph)
}
},{"./canvas":1,"./graph":2,"./reason":4,"./relation":6}],4:[function(require,module,exports){
module.exports = Reason

function Reason(opts) {
  if (!this instanceof Reason) return new Reason(opts)

  // public state
  this.id = opts.id || Math.random().toString(36).slice(-5)
  this.text = opts.text || 'A reason'
  this.width = 200
  this.height = 75
  this.x1 = opts.x
  this.y1 = opts.y
  this.x2 = opts.x + this.width
  this.y2 = opts.y + this.height

  return this
}


Reason.prototype.draw = function(context) {

  //  clear a white rectangle for background
  context.clearRect(this.x1, this.y1, this.width, this.height)  

  //  draw a solid rounded border
  let cornerRadius = 4
  let rgb = '0,0,0'
  let opacity = 0.5
  if (this.hovering) opacity = 0.75
  if (this.selected) opacity = 0.9
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineJoin = "round"
  context.lineWidth = cornerRadius
  context.strokeRect(this.x1+cornerRadius/2, this.y1+cornerRadius/2, this.width-cornerRadius, this.height-cornerRadius)

  //  add the text content
  context.fillStyle = 'rgba(0,0,0,0.8)'
  context.font = '16px sans-serif'
  context.textAlign = 'center'
  context.fillText(this.text, this.x1+this.width/2, this.y1+this.height/2)
}

Reason.prototype.move = function (x, y) {
  this.x1 += x
  this.x2 = this.x1 + this.width
  this.y1 += y
  this.y2 = this.y1 + this.height
}

Reason.prototype.collides = function(el) {
  if (el instanceof Reason) {
    return (this.x2 < el.x1 || this.x1 > el.x2 || this.y1 > el.y2 || this.y2 < el.y1) ? false : true
  } else {
    return (el.x > this.x1 && el.x < this.x2 && el.y > this.y1 && el.y < this.y2) ? true : false
  }
}
},{}],5:[function(require,module,exports){
//  Reasons.js
//  Copyright (c) 2017 Dave Kinkead
//  Available under the MIT license

//  Reasons.js API

const ArgumentMap = require('./map')

module.exports = {
  create: function (dom) {
    return new ArgumentMap(dom)
  }
}
},{"./map":3}],6:[function(require,module,exports){
const flatten = require('array-flatten')

module.exports = Relation

function Relation (opts) {
  if (!this instanceof Relation) return new Relation(opts)

  this.id = opts.id || Math.random().toString(36).slice(-5)
  this.from = opts.from
  this.to = opts.to
  this.type = opts.type || 'supports'
  this.paths = []

  return this
}

Relation.prototype.draw = function (context) {
  this.locate()

  //  stroke style
  let rgb = '0,0,0'
  let opacity = 0.5
  if (this.hovering) opacity = 0.75
  if (this.selected) opacity = 0.9
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineWidth = 4

  //  stroke position
  context.beginPath()
  this.paths.forEach((path) => {
    context.moveTo(path.x1, path.y1)
    context.lineTo(path.x2, path.y2)    
  })
  context.stroke()

  //  text stroke
  let textWidth = context.measureText(this.type).width + 5
  context.clearRect(this.center.x-textWidth/2, this.center.y-15, textWidth, 20)

  //  label
  context.fillStyle = 'rgba(0,0,0,0.8)'
  context.font = '14px sans-serif'
  context.textAlign = 'center'
  context.fillText(this.type, this.center.x, this.center.y) 

}

Relation.prototype.collides = function (el) {
  this.locate()

  //  Deterine a hit for each of the paths
  let hit = false
  this.paths.forEach((path) => {

    //  Calculate the difference between 2 vectors el -> x1,y1 and el -> x2,y2
    if (
      Math.abs((Math.atan2(el.x-path.x1, el.y-path.y1))
        -(Math.atan2(path.x2-el.x, path.y2-el.y))) < 0.05
    ) { hit = true }
  })

  //  otherwise
  return hit
}

Relation.prototype.move = function () {
  this.locate()
}

Relation.prototype.locate = function () {

  //  find the weighted center point
  let elements = flatten([this.from, this.to])
  this.center = elements.map((el) => {
      return {x: (el.x1+(el.x2-el.x1)/2), y: (el.y1+(el.y2-el.y1)/2)}
    }).reduce((acc, el) => {
      return {x: acc.x + el.x, y: acc.y + el.y}
    })
  this.center.x = parseInt(this.center.x/(elements.length))
  this.center.y = parseInt(this.center.y/(elements.length))

  //  when multiple from elements exist
  if (this.from instanceof Array) {

    //  create pairs from from-points to center to to-point
    this.paths = this.from.map((el) => {
      return {
        x1: parseInt(el.x1+(el.x2-el.x1)/2),
        y1: parseInt(el.y1+(el.y2-el.y1)/2),
        x2: parseInt(this.center.x),
        y2: parseInt(this.center.y)
      }
    })
    this.paths.push({
      x1: parseInt(this.center.x),
      y1: parseInt(this.center.y),
      x2: parseInt(this.to.x1+(this.to.x2-this.to.x1)/2),
      y2: parseInt(this.to.y1+(this.to.y2-this.to.y1)/2)
    })
  } else {

    //  when only a single from element exists
    this.paths = [{
      x1: parseInt(this.from.x1+(this.from.x2-this.from.x1)/2),
      y1: parseInt(this.from.y1+(this.from.y2-this.from.y1)/2),
      x2: parseInt(this.to.x1+(this.to.x2-this.to.x1)/2),
      y2: parseInt(this.to.y1+(this.to.y2-this.to.y1)/2) 
    }]
  }
}
},{"array-flatten":8}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}]},{},[5])(5)
});