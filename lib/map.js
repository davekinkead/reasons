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

    //  build graph with reasons and relations
    elements.forEach((el) => {
      if (el.from && el.to) {
        this.graph.push(new Relation(el))
      } else {
        this.graph.push(new Reason(el))
      }
    })
  }

  //  display the layout
  Canvas.render(this.dom, this.graph)
}