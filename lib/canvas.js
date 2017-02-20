const Reason = require('./reason')
const Relation = require('./relation')

module.exports = {
  render: (dom, graph) => {
    return new Canvas(dom, graph)
  }
}

function Canvas (dom, graph) {

  let domBB = dom.getBoundingClientRect()
  let last = {}
  let elements = []
  let mouseDown = false
  let dirty = false  
  let canvas = build('canvas', {id: 'reasons-'+dom.id}, {width: domBB.width, height: domBB.height})
  dom.appendChild(canvas)

  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault()
    event.stopPropagation()

    //  set last x & y
    mouseDown = true
    last.x = parseInt(event.x || event.clientX)
    last.y = parseInt(event.y || event.clientY)

    //  flag elements in hit zone
    elements.forEach((el) => {
      if (el.collides(last)) {
        el.draggable = true
      }
    })
  })

  canvas.addEventListener('mousemove', (event) => {

      //  flag elements in hit zone as hovering
    let current = {
      x: parseInt(event.x || event.clientX),
      y: parseInt(event.y || event.clientY)
    }
    elements.forEach((el) => {
      if (el.collides(current)) {
        dirty = true
        el.hovering = true
      } else {
        el.hovering = false
      }
    })
    //  drag should only fire if mouse is pressed over an element
    if (mouseDown) {
      elements.forEach((el) => {
        //  draggable elements should be dragged
        if (el.draggable) {
          dirty = true
          el.draw()
          el.move(parseInt(event.x || event.clientX) - last.x, parseInt(event.y || event.clientY) - last.y)
          last.x = parseInt(event.x || event.clientX)
          last.y = parseInt(event.y || event.clientY)

          //  is there an overlap?
          elements.forEach((e) => {
            if (el !== e && el.collides(e)) {
              //  add a hover effect

              //  flag this element as droppable
              e.droppable = true
            } else {
              e.droppable = false
            }
          })
        }
      })
    }

    if (dirty) draw(this)
  })

  canvas.addEventListener('mouseup', (event) => {
    event.preventDefault()
    event.stopPropagation()
    mouseDown = false

    //  was there a successful drop?
    let from = elements.filter((el) => {return el.draggable})[0]
    let to = elements.filter((el) => {return el.droppable})[0]
    if (from && to) {
      elements.unshift(new Relation({canvas: canvas, from: from, to: to}))
      draw(this)
    }

    elements.forEach((el) => {
      //  remove draggable & droppable flags from elements
      el.draggable = false
      el.droppable = false
    })
  })

  canvas.addEventListener('dblclick', (event) => {
    // dblclick on raw canvas should create a new node
    let reason = new Reason({canvas: canvas, x: last.x, y: last.y})
    elements.push(reason)
    draw(this)
  })  

  //  set public variables
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.elements = elements
  this.width = domBB.width
  this.height = domBB.height
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