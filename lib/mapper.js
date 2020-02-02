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
  this.graph = new Graph(elements)
  View.draw(this)   //  this is repeated to generate node heights
  View.resize(this)
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