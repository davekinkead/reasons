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


Reason.prototype.draw = function() {
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


Reason.prototype.bounds = function(point) {
  return (point.x > this.x1 && point.x < this.x2 && point.y > this.y1 && point.y < this.y2) ? true : false
} 