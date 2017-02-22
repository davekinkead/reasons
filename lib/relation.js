const flatten = require('array-flatten')

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
  this.paths.forEach((path) => {
    context.moveTo(path.x1, path.y1)
    context.lineTo(path.x2, path.y2)    
  })
  context.stroke()

  //  text stroke
  let textWidth = context.measureText(this.type).width + 5
  context.clearRect(this.center.x-textWidth/2, this.center.y-15, textWidth, 20)

  //  label
  context.fillStyle = 'rgba(0,0,0,0.8)'
  context.font = '14px sans-serif'
  context.textAlign = 'center'
  context.fillText(this.type, this.center.x, this.center.y) 

}

Relation.prototype.collides = function (point) {
  this.locate()

  //  Deterine a hit for each of the paths
  let hit = false
  this.paths.forEach((path) => {

    //  Calculate the difference between 2 vectors el -> x1,y1 and el -> x2,y2
    if (
      Math.abs((Math.atan2(point.y-path.y1, point.x-path.x1))
        -(Math.atan2(path.y2-point.y, path.x2-point.x))) < 0.05
    ) { hit = true }
  })

  //  otherwise
  return hit
}

Relation.prototype.move = function () {
  this.locate()
}

Relation.prototype.locate = function () {

  //  find the weighted center point
  let elements = flatten([this.from, this.to])
  this.center = elements.map((el) => {
      return {x: (el.x1+(el.x2-el.x1)/2), y: (el.y1+(el.y2-el.y1)/2)}
    }).reduce((acc, el) => {
      return {x: acc.x + el.x, y: acc.y + el.y}
    })
  this.center.x = parseInt(this.center.x/(elements.length))
  this.center.y = parseInt(this.center.y/(elements.length))

  //  when multiple from elements exist
  if (this.from instanceof Array) {

    //  create pairs from from-points to center to to-point
    this.paths = this.from.map((el) => {
      return {
        x1: parseInt(el.x1+(el.x2-el.x1)/2),
        y1: parseInt(el.y1+(el.y2-el.y1)/2),
        x2: parseInt(this.center.x),
        y2: parseInt(this.center.y)
      }
    })
   let offset = edgeOfView(this.to, Math.atan2(this.center.y-this.to.y1, this.center.x-this.to.x1))
   this.paths.push({
      x1: parseInt(this.center.x),
      y1: parseInt(this.center.y),
      x2: parseInt(this.to.x1+(this.to.x2-this.to.x1)/2+offset.x),
      y2: parseInt(this.to.y1+(this.to.y2-this.to.y1)/2+offset.y) 
    })
  } else {

    //  when only a single from element exists
    let offset = edgeOfView(this.to, Math.atan2(this.from.y1-this.to.y1, this.from.x1-this.to.x1))
    this.paths = [{
      x1: parseInt(this.from.x1+(this.from.x2-this.from.x1)/2),
      y1: parseInt(this.from.y1+(this.from.y2-this.from.y1)/2),
      x2: parseInt(this.to.x1+(this.to.x2-this.to.x1)/2+offset.x),
      y2: parseInt(this.to.y1+(this.to.y2-this.to.y1)/2+offset.y) 
    }]
  }
}

//  Bahh stackoverflow
function edgeOfView(rect, theta) {
  var twoPI = Math.PI*2;
  // var theta = deg * Math.PI / 180;
  
  while (theta < -Math.PI) {
    theta += twoPI;
  }
  
  while (theta > Math.PI) {
    theta -= twoPI;
  }
  
  var rectAtan = Math.atan2(rect.height, rect.width);
  var tanTheta = Math.tan(theta);
  var region;
  
  if ((theta > -rectAtan) && (theta <= rectAtan)) {
      region = 1;
  } else if ((theta > rectAtan) && (theta <= (Math.PI - rectAtan))) {
      region = 2;
  } else if ((theta > (Math.PI - rectAtan)) || (theta <= -(Math.PI - rectAtan))) {
      region = 3;
  } else {
      region = 4;
  }
  
  var edgePoint = {x: rect.width/2, y: rect.height/2};
  var xFactor = 1;
  var yFactor = 1;
  
  switch (region) {
    case 1: yFactor = -1; break;
    case 2: yFactor = -1; break;
    case 3: xFactor = -1; break;
    case 4: xFactor = -1; break;
  }
  
  if ((region === 1) || (region === 3)) {
    edgePoint.x += xFactor * (rect.width / 2.);
    edgePoint.y += yFactor * (rect.width / 2.) * tanTheta;
  } else {
    edgePoint.x += xFactor * (rect.height / (2. * tanTheta));
    edgePoint.y += yFactor * (rect.height /  2.);
  }

  //  fix up for center reference rather than bottom left
  edgePoint.x -= rect.width/2
  edgePoint.y -= rect.height/2
  edgePoint.y *= -1
  
  return edgePoint;
};
