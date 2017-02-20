module.exports = Reason

function Reason(opts) {
  if (!this instanceof Reason) return new Reason(opts)

  // public state
  this.canvas = opts.canvas
  this.text = opts.text
  this.width = 250
  this.height = 100
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
  context.lineJoin = "round"
  context.lineWidth = cornerRadius
  context.strokeStyle = 'rgba(0,0,0,0.5)'
  context.strokeRect(this.x1+cornerRadius/2, this.y1+cornerRadius/2, this.width-cornerRadius, this.height-cornerRadius)

  //  add the text content
  context.fillStyle = 'rgba(0,0,0,0.8)'
  context.font = '16px sans-serif'
  context.textAlign = 'center'
  context.fillText(this.text || 'Click to edit...', this.x1+this.width/2, this.y1+this.height/2)
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