'use strict'

const Graph = require('./graph')
const UI = require('./ui')
const View = require('./view')


/**
 * This module wraps the DOM UI, Canvas renderer, and Graph data
 */
module.exports = Mapper


/**
 * The Map acts as the UI between the Graph data object and the browser DOM.
 * It is responsible for handling all mouse and keyboard events, and sending 
 * changes in the argument map to the Graph object.
 *
 * The Map contains references to @graph (the data), @canvas (the DOM object)
 * and @context (the 2D drawing API)
 *
 * @params elementID  the element id to append the map canvas to
 */
function Mapper (elementID) {

  //  get the DOM element
  this.DOM = document.querySelector(elementID)

  //  attach the canvas to the HTML if the reference was valid
  if (this.DOM)
    View.init(this)
}


/**
 * Populates a Graph with Reasons and Relations.
 *
 * @params elements   the elements to render
 */
Map.prototype.render = function (elements) {
  this.graph = new Graph(elements)
  View.draw(this)
}


/**
 * Exports a Graph's data structure as an Array
 */
Map.prototype.export = function () {
  return this.graph.map(element => element.export())
}