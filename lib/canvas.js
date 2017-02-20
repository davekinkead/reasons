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
  let dragged = false
  let editing = false
  let dirty = false  
  let canvas = build('canvas', {id: 'reasons-'+dom.id}, {width: domBB.width, height: domBB.height})
  dom.appendChild(canvas)

  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault()

    //  set last x & y
    mouseDown = true
    last.x = parseInt(event.x || event.clientX)
    last.y = parseInt(event.y || event.clientY)

    elements.forEach((el) => {
      //  clear selected flag on click
      el.selected = false

      //  flag elements in hit zone      
      if (el.collides(last)) {
        el.draggable = true
      }
    })

    draw(this)
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
      dragged = true
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

    //  was this a drag and release
    if (dragged) {
  
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

    //  or was it a straight click
    } else {

      //  if so, flag clicked element as selected
      elements.forEach((el) => {
        if (el.collides(last)) {
          dirty = true
          el.selected = true
        } else {
          el.selected = false
        }
      })
    }

    mouseDown = false
    dragged = false

    if (dirty) draw(this)
  })

  canvas.addEventListener('dblclick', (event) => {
console.log(elements)
    //  dblclick on element to edit it
    editing = false

    elements.forEach((el) => {
      el.selected = false

      if (el instanceof Reason && el.collides(last)) {
        editing = true
        addOverlay(el)
      } 
    })

    //  dblclick on raw canvas should create a new node
    if (!editing) {
      let reason = new Reason({canvas: canvas, x: last.x, y: last.y})
      elements.push(reason)
    }

    draw(this)      
  })  

  window.addEventListener('keydown', (event) => {

    //  update node text
    if (editing && event.keyCode == 13) {
      removeOverlay(elements)
      dirty = true
    }

    //  delete a selected element
    if (!editing && event.keyCode == 8) {
      event.preventDefault()
      let i = elements.findIndex((el) => { return el.selected})
      if (i > -1) {
        dirty = true

        if (elements[i] instanceof Reason) {

          //  find associated edges first
          let edges = elements.filter((el) => { 
            return (el.from && el.to) && (el.from.id == elements[i].id || el.to.id == elements[i].id)
          })
          //  remove the node
          elements.splice(i, 1)

          //  and then the edges
          edges.forEach((edge) => {
            let ei = elements.indexOf(edge)
            elements.splice(ei, 1)
          })

        } else {
          elements.splice(i, 1)
        }
      }
    }

    if (dirty) draw(this)
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

function addOverlay(el) {
  let overlay = build('div', {id: 'reason-overlay'})
  overlay.setAttribute('style', 'position:absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75);')

  let input = build('input', {id: 'edit-reason-input'}, {value: el.text})
  input.setAttribute('style', 'position:absolute; top: 45%; bottom: 50%; left: 25%; right: 50%; width:50%; padding: 1rem;')
  input.setAttribute('data-element', el.id)

  overlay.appendChild(input)
  document.body.appendChild(overlay)
}

function removeOverlay(elements) {
  let input = document.querySelector('#edit-reason-input')
  let el = elements.find(el => el.id == input.getAttribute('data-element') )
  console.log(el)
  el.text = input.value
  document.querySelector('#reason-overlay').remove()
}