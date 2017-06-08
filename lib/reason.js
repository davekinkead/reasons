'use strict'

module.exports = Reason

const maxWidth = 200
const padding = 10
const fontSize = 16

function Reason (opts) {
  if (!this instanceof Reason) return new Reason(opts)

  // public state
  this.id = opts.id || Math.random().toString(36).slice(-5)
  this.text = opts.text || 'A reason'
  this.width = maxWidth
  this.height = fontSize * 3.5
  this.x1 = opts.x
  this.y1 = opts.y
  this.x2 = opts.x + this.width
  this.y2 = opts.y + this.height
  this.resize()

  return this
}

Reason.prototype.resize = function () {
  this.x2 = this.x1 + this.width
  this.y2 = this.y1 + this.height
}


Reason.prototype.draw = function (context) {

  //  word wrap the text 
  let text = wordWrap(this.text, context)

  //  recalculate the height
  this.height = text.length * fontSize + fontSize * 2.5
  this.resize()

  //  clear a white rectangle for background
  context.clearRect(this.x1, this.y1, this.width, this.height)  

  //  draw a solid rounded border
  let cornerRadius = 4
  let rgb = '0,0,0'
  let opacity = 0.5
  if (this.hovering) opacity = 0.75
  if (this.selected) opacity = 0.9
  context.strokeStyle = 'rgba('+rgb+','+opacity+')'
  context.lineJoin = "round"
  context.lineWidth = cornerRadius
  context.strokeRect(this.x1+cornerRadius/2, this.y1+cornerRadius/2, this.width-cornerRadius, this.height-cornerRadius)

  //  set text box styles
  context.fillStyle = 'rgba(0,0,0,0.8)'
  context.font = '16px sans-serif'
  context.textAlign = 'center'

  //  add the text content
  text.forEach((line, i) => {
    context.fillText(line, this.x1 + this.width/2, this.y1  + (i+2) * fontSize)
  })  }

Reason.prototype.move = function (x, y) {
  this.x1 += x
  this.y1 += y
  this.resize()
}

Reason.prototype.collides = function (el) {
  if (el instanceof Reason) {
    return (this.x2 < el.x1 || this.x1 > el.x2 || this.y1 > el.y2 || this.y2 < el.y1) ? false : true
  } else {
    return (el.x > this.x1 && el.x < this.x2 && el.y > this.y1 && el.y < this.y2) ? true : false
  }
}

Reason.prototype.export = function () {
  return {
    id: this.id, 
    text: this.text,
    x: this.x1,
    y: this.y1
  }
}

function wordWrap(text, context) {
  let words = text.split(' ')
  let lines = []
  let line = ''

  words.forEach((word) => {
    let width = context.measureText(line + ' ' + word).width

    if (width < (maxWidth - padding * 2) ) {
      line += ' ' + word
    } else { 
      lines.push(line)
      line = word
    }
  })

  lines.push(line)
  return lines
}
