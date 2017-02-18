!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Reasons=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const unique = require('array-unique')
const flatten = require('array-flatten')
const diff = require('array-difference')

module.exports = Graph

function Graph (graph) {
  if (!(this instanceof Graph)) return new Graph(graph)
  this.nodes = graph.nodes || graph.vertices || graph.reasons
  this.edges = graph.edges || graph.arcs || graph.relations
}

Graph.prototype.addNode = function (id, object) {}

Graph.prototype.removeNode = function (id) {}

Graph.prototype.addEdge = function (object) {}

Graph.prototype.removeEdge = function (object) {}

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

Graph.prototype.root = function () {}
},{"array-difference":6,"array-flatten":7,"array-unique":8}],2:[function(require,module,exports){
module.exports = {

  //  transforms a graph {nodes: {}, edges: []} into a 
  //  hierarchically ordered array
  hierarchical: (graph) => {

    //  begin with the conclusion(s)
    let levels = []
    let current = graph.ends()

    //  get parents of each level of reasons
    while(current.length > 0) {
      levels.push(current)
      current = graph.parents(current)
    }

    //  finally add any orphans to the last layer
    let orphans = graph.orphans()
    if (orphans.length > 0) levels.push(orphans)

    return levels
  }
}
},{}],3:[function(require,module,exports){
const Renderer = require('./renderer')
const Graph = require('./graph')

module.exports = ArgumentMap

function ArgumentMap (graph) {
  if (!this instanceof ArgumentMap) return new ArgumentMap()
  this.graph = new Graph(graph)
}

ArgumentMap.prototype.render = function (dom, graph) {
  //  set graph if arg supplied
  if (graph) this.graph = new Graph(graph)

  //  display the layout
  let canvas = document.querySelector(dom)
  Renderer.ArgumentMap(canvas, this.graph)

}
},{"./graph":1,"./renderer":5}],4:[function(require,module,exports){
//  Reasons.js
//  Copyright (c) 2017 Dave Kinkead
//  Available under the MIT license

//  Reasons.js API

const ArgumentMap = require('./map')

module.exports = {
  create: function (graph) {
    return new ArgumentMap(graph)
  }
}
},{"./map":3}],5:[function(require,module,exports){
const Layout = require('./layout')

module.exports = {
  ArgumentMap: (dom, graph) => {
    // create an abstract layout
    //  begin with the conclusion(s)
    const reasons = {}
    const levels = []
    let current = graph.ends()

    //  get parents of each level of reasons
    while(current.length > 0) {
      levels.unshift(current)
      current = graph.parents(current)
    }

    //  finally add any orphans to the last layer
    let orphans = graph.orphans()
    if (orphans.length > 0) levels.unshift(orphans)

    // -----> now draw the nodes
    let area = dom.getBoundingClientRect()
    let lineHeight = area.height / levels.length

    levels.forEach((level, index) => {
      let lineWidth = area.width / (level.length + 1)
      level.forEach((id, i) => {
        let reason = build('div', {id: 'node-'+id}, {
          class:'reason',
          style: 'position: absolute; top: '+index*lineHeight+'px; left: '+((i+1)*lineWidth-125)+'px;'
        })
        reason.innerHTML = graph.nodes[id]
        reasons[id] = reason
        dom.appendChild(reason)     
      })
    })

    //  ------> now draw the edges
    let svg = buildNS('svg', {id: 'my-svg'}, {height: area.height, width: area.width, version: '1.1', xmlns: "http://www.w3.org/2000/svg", 'xmlns:xlink':"http://www.w3.org/1999/xlink"})
       
    graph.edges.forEach((edge) => {
      if (edge.from.constructor === Array) {


// --------------------->
      } else {
        let fBox = reasons[edge.from].getBoundingClientRect()
        let tBox = reasons[edge.to].getBoundingClientRect()
        console.log(dom.offsetLeft)
        let path = buildNS('path', {id: 'edge-'+edge.from+ '-' +edge.to}, {
          class: 'edge relation',
          stroke: '#CCC',
          'stroke-width': 5,
          d: 'M'+(fBox.left)+' '+(fBox.top)+' L '+(tBox.left-tBox.width/2)+' '+tBox.y
        })
        svg.appendChild(path)
        console.log(svg.offsetTop)
      }
    })

    dom.appendChild(svg)

  },
  Tree: (dom, graph) => {},
  FlowChart: (dom, graph) => {}
}

//  element build helpers -- extract these later
function buildNS(type, options, attributes) {
  let node = document.createElementNS('http://www.w3.org/2000/svg', type)
  for (var key in options) {
    node[key] = options[key]
  }
  for (var key in attributes) {
    node.setAttribute(key, attributes[key])
  }
  return node
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

},{"./layout":2}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}]},{},[4])(4)
});