!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Reasons=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const Reason = require('./reason')
const Relation = require('./relation')

module.exports = {
  render: (dom, graph) => {
    return new Canvas(dom, graph)
  }
}

function Canvas (dom, graph) {

  let domBB = dom.getBoundingClientRect()
  let last = {}
  let elements = []
  let mouseDown = false
  let dirty = false  
  let canvas = build('canvas', {id: 'reasons-'+dom.id}, {width: domBB.width, height: domBB.height})
  dom.appendChild(canvas)

  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault()
    event.stopPropagation()

    //  set last x & y
    mouseDown = true
    last.x = parseInt(event.x || event.clientX)
    last.y = parseInt(event.y || event.clientY)

    elements.forEach((el) => {
      //  clear selected flag on click
      el.selected = false

      //  flag elements in hit zone      
      if (el.collides(last)) {
        el.draggable = true
      }
    })

    draw(this)
  })

  canvas.addEventListener('mousemove', (event) => {
      //  flag elements in hit zone as hovering
    let current = {
      x: parseInt(event.x || event.clientX),
      y: parseInt(event.y || event.clientY)
    }

    elements.forEach((el) => {
      if (el.collides(current)) {
        dirty = true
        el.hovering = true
      } else {
        el.hovering = false
      }
    })

    //  drag should only fire if mouse is pressed over an element
    if (mouseDown) {
      elements.forEach((el) => {

        //  draggable elements should be dragged
        if (el.draggable) {
          dirty = true
          el.draw()
          el.move(parseInt(event.x || event.clientX) - last.x, parseInt(event.y || event.clientY) - last.y)
          last.x = parseInt(event.x || event.clientX)
          last.y = parseInt(event.y || event.clientY)

          //  is there an overlap?
          elements.forEach((e) => {
            if (el !== e && el.collides(e)) {
              //  add a hover effect

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
    event.stopPropagation()
    mouseDown = false

    //  was there a successful drop?
    let from = elements.filter((el) => {return el.draggable})[0]
    let to = elements.filter((el) => {return el.droppable})[0]
    if (from && to) {
      elements.unshift(new Relation({canvas: canvas, from: from, to: to}))
      draw(this)
    }

    elements.forEach((el) => {
      //  remove draggable & droppable flags from elements
      el.draggable = false
      el.droppable = false
    })
  })

  canvas.addEventListener('dblclick', (event) => {
    //  dblclick on element selects it
    let selected = false

    elements.forEach((el) => {
      if (el.collides(last)) {
        selected = true
        el.selected = true
      } else {
        el.selected = false
      }
    })

    //  dblclick on raw canvas should create a new node
    if (!selected) {
      let reason = new Reason({canvas: canvas, x: last.x, y: last.y})
      elements.push(reason)
    }

    draw(this)      
  })  

  window.addEventListener('keydown', (event) => {

    //  delete a selected elements
    if (event.keyCode == 8) {
      event.preventDefault()
      let i = elements.findIndex((el) => { return el.selected})
      if (i > -1) {
        dirty = true
        if (elements[i] instanceof Reason) {
          
          //  find associated edges first
          let edges = elements.filter((el) => { 
            return (el.from && el.to) && (el.from.id == elements[i].id || el.to.id == elements[i].id)
          })
          //  remove the node
          elements.splice(i, 1)

          //  and then the edges
          edges.forEach((edge) => {
            let ei = elements.indexOf(edge)
            elements.splice(ei, 1)
          })


        } else {
          elements.splice(i, 1)
        }
      }
    }

    if (dirty) draw(this)
  })

  //  set public variables
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.elements = elements
  this.width = domBB.width
  this.height = domBB.height
}

function draw (canvas) {
  clear(canvas)
  canvas.elements.forEach((el) => {
    el.draw()
  })
}

function clear (canvas) {
  canvas.context.clearRect(0, 0, canvas.width, canvas.height)
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
},{"./reason":4,"./relation":6}],2:[function(require,module,exports){
const unique = require('array-unique')
const flatten = require('array-flatten')
const diff = require('array-difference')

module.exports = Graph

function Graph (graph) {
  if (!graph) graph = {nodes: {}, edges: []}
  if (!(this instanceof Graph)) return new Graph(graph)
  this.nodes = graph.nodes || graph.vertices || graph.reasons
  this.edges = graph.edges || graph.arcs || graph.relations
}

Graph.prototype.children = function (id) {
  if (! this.edges) return []
  return unique( flatten( this.edges.map((edge) => { return edge.to })) )
}

Graph.prototype.parents = function (id) {
  if (! this.edges) return []
  if (id) {
    return unique( flatten( this.edges.filter((edge) => {
      return id == edge.to || id.indexOf(edge.to) > -1
    }).map((edge) => {
      return edge.from
    })))
  } else {
    return unique( flatten( this.edges.map((edge) => { return edge.from })) )    
  }
}

Graph.prototype.connected = function (id) {
  return unique( this.parents().concat(this.children()) )
}

Graph.prototype.orphans = function () {
  return diff(Object.keys(this.nodes), this.connected())
}

Graph.prototype.ends = function () {
  return this.children().filter((i) => {
    return this.parents().indexOf(i) < 0
  })
}

Graph.prototype.addNode = function (id, object) {}

Graph.prototype.removeNode = function (id) {}

Graph.prototype.addEdge = function (object) {}

Graph.prototype.removeEdge = function (object) {}

Graph.prototype.root = function () {}
},{"array-difference":7,"array-flatten":8,"array-unique":9}],3:[function(require,module,exports){
const Graph = require('./graph')
const Canvas = require('./canvas')

module.exports = ArgumentMap

function ArgumentMap (dom) {
  if (!this instanceof ArgumentMap) return new ArgumentMap(dom)
  this.dom = document.querySelector(dom)
}

ArgumentMap.prototype.render = function (graph) {
  //  set graph if arg supplied
  this.graph = new Graph(graph || this.graph)

  //  display the layout
  Canvas.render(this.dom, this.graph)
}
},{"./canvas":1,"./graph":2}],4:[function(require,module,exports){
module.exports = Reason

function Reason(opts) {
  if (!this instanceof Reason) return new Reason(opts)

  // public state
  this.canvas = opts.canvas
  this.id = opts.id || Math.random().toString(36).slice(-5)
  this.text = opts.text || "Click to edit..."
  this.width = 200
  this.height = 75
  this.x1 = opts.x
  this.y1 = opts.y
  this.x2 = opts.x + this.width
  this.y2 = opts.y + this.height

  return this
}


Reason.prototype.draw = function(opts={}) {
  let context = this.canvas.getContext('2d')
  let cornerRadius = 6

  //  draw a white rectangle for background
  context.fillStyle = 'rgba(255,255,255,1)'
  context.fillRect(this.x1, this.y1, this.width, this.height)  

  //  draw a solid rounded border
  let rgb = '0,0,0'
  if (this.selected) rgb = '255,0,0'
  let opacity = 0.5
  if (this.hovering) opacity = 0.75
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
module.exports = Relation

function Relation (opts) {
  if (!this instanceof Relation) return new Relation(opts)

  this.canvas = opts.canvas
  this.from = opts.from
  this.to = opts.to
  this.type = opts.type || 'supports'
  
  return this
}

Relation.prototype.draw = function () {
  this.locate()

  let context = this.canvas.getContext('2d')
  let rgb = '0,0,0'
  if (this.selected) rgb = '255,0,0'
  let opacity = 0.5
  if (this.hovering) opacity = 0.75
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.beginPath()
  context.moveTo(this.x1, this.y1)
  context.lineTo(this.x2, this.y2)
  context.stroke()
}

Relation.prototype.collides = function (el) {
  this.locate()
  //  Calculate the difference between 2 vectors el -> x1,y1 and el -> x2,y2
  if (Math.abs((Math.atan2(el.x - this.x1, el.y - this.y1))-( Math.atan2(this.x2 - el.x, this.y2 - el.y))) < 0.02) {
    return true
  } else {
    return false
  }
}

Relation.prototype.locate = function () {
  this.x1 = this.from.x1+(this.from.x2-this.from.x1)/2
  this.x2 = this.to.x1+(this.to.x2-this.to.x1)/2
  this.y1 = this.from.y1+(this.from.y2-this.from.y1)/2
  this.y2 = this.to.y1+(this.to.y2-this.to.y1)/2
}


},{}],7:[function(require,module,exports){
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