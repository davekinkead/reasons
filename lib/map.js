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