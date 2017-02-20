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
  let context = this.canvas.getContext('2d')
  context.strokeStyle = 'rgba(0,0,0,0.5)'
  context.beginPath()
  context.moveTo(this.from.x1+(this.from.x2-this.from.x1)/2, this.from.y1+(this.from.y2-this.from.y1)/2)
  context.lineTo(this.to.x1+(this.to.x2-this.to.x1)/2, this.to.y1+(this.to.y2-this.to.y1)/2)
  context.stroke()
}

Relation.prototype.collides = function () {

}