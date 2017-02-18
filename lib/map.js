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