const Reason = require('./reason')

module.exports = {
  render: (dom, graph) => {
    return new Canvas(dom, graph)
  }
}

function Canvas (dom, graph) {

  let domBB = dom.getBoundingClientRect()
  let last = {}
  let mouseDown = false
  let dirty = false  

  this.width = domBB.width
  this.height = domBB.height
  this.elements = []

  let canvas = build('canvas', {id: 'reasons-'+dom.id}, {width: domBB.width, height: domBB.height})
  this.context = canvas.getContext('2d')

  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault()
    event.stopPropagation()

    //  set last x & y
    mouseDown = true
    last.x = parseInt(event.x || event.clientX)
    last.y = parseInt(event.y || event.clientY)

    //  flag elements in hit zone
    this.elements.forEach((el) => {
      if (el.bounds(last)) {
        el.draggable = true
      }
    })
  })

  canvas.addEventListener('mousemove', (event) => {
    if (mouseDown) {
      //  drag should only fire if mouse is pressed over an element
      this.elements.forEach((el) => {
        if (el.draggable) {
          dirty = true
          el.draw()
          el.x1 += parseInt(event.x || event.clientX) - last.x
          el.x2 = el.x1 + el.width
          el.y1 += parseInt(event.y || event.clientY) - last.y
          el.y2 = el.y1 + el.height
          last.x = parseInt(event.x || event.clientX)
          last.y = parseInt(event.y || event.clientY)
        }
      })

      if (dirty) draw(this)
    }
  })

  canvas.addEventListener('mouseup', (event) => {
    event.preventDefault()
    event.stopPropagation()
    mouseDown = false

    //  remove draggable flag from elements
    this.elements.forEach((el) => {
      el.draggable = false
    })
  })

  canvas.addEventListener('dblclick', (event) => {
    // dblclick on raw canvas should create a new node
    let reason = new Reason({canvas: canvas, x: last.x, y: last.y})
    this.elements.push(reason)
    draw(this)
  })  

  dom.appendChild(canvas)
  this.canvas = canvas
}

function draw (canvas) {
  clear(canvas)
  canvas.elements.forEach((el) => {
    el.draw()
  })
}

function clear (canvas) {
  canvas.context.clearRect(0, 0, canvas.width, canvas.height)
}


function build(type, options, attributes) {
  let node = document.createElement(type)
  for (var key in options) {
    node[key] = options[key]
  }
  for (var key in attributes) {
    node.setAttribute(key, attributes[key])
  }
  return node
}