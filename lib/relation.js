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
  context.moveTo(this.x1, this.y1)
  context.lineTo(this.x2, this.y2)
  context.stroke()

  //  label background
  let center = {
    x: this.x1+(this.x2-this.x1)/2,
    y: this.y1+(this.y2-this.y1)/2
  }
  let textWidth = context.measureText(this.type).width + 5
  context.clearRect(center.x-textWidth/2, center.y-15, textWidth, 20)

  //  label
  context.fillStyle = 'rgba(0,0,0,0.8)'
  context.font = '14px sans-serif'
  context.textAlign = 'center'
  context.fillText(this.type, center.x, center.y) 

}

Relation.prototype.collides = function (el) {
  this.locate()

  //  Calculate the difference between 2 vectors el -> x1,y1 and el -> x2,y2
  return (Math.abs((Math.atan2(el.x - this.x1, el.y - this.y1))-( Math.atan2(this.x2 - el.x, this.y2 - el.y))) < 0.02) ? true: false
}

Relation.prototype.move = function () {
  this.locate()
}

Relation.prototype.locate = function () {
  this.x1 = this.from.x1+(this.from.x2-this.from.x1)/2
  this.y1 = this.from.y1+(this.from.y2-this.from.y1)/2
  this.x2 = this.to.x1+(this.to.x2-this.to.x1)/2
  this.y2 = this.to.y1+(this.to.y2-this.to.y1)/2
}