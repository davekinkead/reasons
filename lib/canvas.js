const Reason = require('./reason')
const Relation = require('./relation')
const Graph = require('./graph')

module.exports = {
  render: (dom, graph) => {
    return new Canvas(dom)
  }
}

function Canvas (dom) {

  let domBB = dom.getBoundingClientRect()
  let first = {}
  let last = {}
  let graph = new Graph()
  let mouseDown = false
  let dragged = false
  let editing = false
  let dirty = false  
  let canvas = build('canvas', {id: 'reasons-'+dom.id}, {width: domBB.width, height: domBB.height})
  dom.appendChild(canvas)

  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault()

    let current = null

    //  set last x & y
    mouseDown = true
    first = getPosition(event)
    last = first

    graph.elements.forEach((el, i) => {
      //  clear selected flag on click
      el.selected = false

      //  flag elements in hit zone      
      if (el.collides(last)) {
        el.draggable = true

        //  pop clicked reason to the top
        if (el instanceof Reason) {
          current = graph.elements.splice(i, 1)[0]
          graph.elements.push(current)
        }

        // if (current) 
      }
    })

    
    draw(this)
  })

  canvas.addEventListener('mousemove', (event) => {
      //  flag elements in hit zone as hovering
    let current = getPosition(event)

    graph.elements.forEach((el) => {
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
      graph.elements.forEach((el) => {

        //  draggable elements should be dragged
        if (el.draggable) {
          dirty = true
          el.move(getPosition(event).x - last.x, getPosition(event).y - last.y)
          last = getPosition(event)

          //  is there an overlap?
          graph.elements.forEach((e) => {
            if (el !== e && el.collides(e)) {

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
      let from = graph.elements.find((el) => {return el.draggable})
      let to = graph.elements.find((el) => {return el.droppable})
      if (from && to) {
        
        //  snap back position
        from.move(first.x-from.x1, first.y-from.y1)

        //  add new relation to bottom
        graph.elements.unshift(new Relation({canvas: canvas, from: from, to: to}))
        draw(this)
      }

      graph.elements.forEach((el) => {

        //  remove draggable & droppable flags from elements
        el.draggable = false
        el.droppable = false
      })

    //  or was it a straight click
    } else {

      //  if so, flag clicked element as selected
      graph.elements.forEach((el) => {
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
    last = getPosition(event)

    if (dirty) draw(this)
  })

  canvas.addEventListener('dblclick', (event) => {

    //  dblclick on element to edit it
    editing = false

    graph.elements.forEach((el) => {
      el.selected = false

      if (el.collides(last)) {
        editing = true
        addOverlay(el)
      } 
    })

    //  dblclick on raw canvas should create a new node
    if (!editing) {
      let reason = new Reason({canvas: canvas, x: last.x, y: last.y})
      graph.elements.push(reason)
      editing = true
      addOverlay(reason)
    }

    draw(this)      
  })  

  window.addEventListener('keydown', (event) => {

    //  update node text
    if (editing) {

      //  return
      if (event.keyCode == 13) {
        removeOverlay(graph.elements)
        dirty = true
        editing = false
      }
    } else {

      //  delete a selected element
      if (event.keyCode == 8) {
        event.preventDefault()
        let i = graph.elements.findIndex((el) => { return el.selected})
        if (i > -1) {
          dirty = true

          if (graph.elements[i] instanceof Reason) {

            //  find associated edges first
            let edges = graph.elements.filter((el) => { 
              return (el.from && el.to) && (el.from.id == graph.elements[i].id || el.to.id == graph.elements[i].id)
            })
            //  remove the node
            graph.elements.splice(i, 1)

            //  and then the edges
            edges.forEach((edge) => {
              let ei = graph.elements.indexOf(edge)
              graph.elements.splice(ei, 1)
            })

          } else {
            graph.elements.splice(i, 1)
          }
        }
      }
    }

    if (dirty) draw(this)
  })

  //  set public variables
  this.canvas = canvas
  this.context = canvas.getContext('2d')
  this.graph = graph
  this.width = domBB.width
  this.height = domBB.height
}

function draw (canvas) {
  clear(canvas)
  canvas.graph.elements.forEach((el) => {
    el.draw()
  })
}

function clear (canvas) {
  canvas.context.clearRect(0, 0, canvas.width, canvas.height)
}

function getPosition(event) {
  return {
    x: parseInt(event.x || event.clientX),
    y: parseInt(event.y || event.clientY)
  }
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

  let input = build('input', {id: 'edit-reason-input'}, {value: el.text || el.type})
  input.setAttribute('style', 'position:absolute; top: 45%; bottom: 50%; left: 25%; right: 50%; width:50%; padding: 1rem;')
  input.setAttribute('data-element', el.id)

  overlay.appendChild(input)
  document.body.appendChild(overlay)
}

function removeOverlay(elements) {
  let input = document.querySelector('#edit-reason-input')
  let el = elements.find(el => el.id == input.getAttribute('data-element') )
  if (el instanceof Reason) {
    el.text = input.value
  } else {
    el.type = input.value
  }
  document.querySelector('#reason-overlay').remove()
}