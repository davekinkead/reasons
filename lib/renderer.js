const Layout = require('./layout')
const Reason = require('./reason')

module.exports = {
  ArgumentMap: (dom, graph) => {

    let domBB = dom.getBoundingClientRect()
    let canvas = build('canvas', {id: 'reasons-'+dom.id}, {width: domBB.width, height: domBB.height})
    let elements = []
    let last = {}
    let mouseDown = false
    let dirty = false

    dom.appendChild(canvas)

    canvas.addEventListener('mousedown', (event) => {
      //  set last x & y
      mouseDown = true
      last.x = event.x || event.clientX
      last.y = event.y || event.clientY
    })

    canvas.addEventListener('mousemove', (event) => {
      if (mouseDown) {
        //  drag should only fire if mouse is pressed over an element
        elements.forEach((el) => {
          if (el.bounds(last)) {
            dirty = true

            el.draw()
            el.x1 += (event.x || event.clientX) - last.x
            el.y1 += (event.y || event.clientY) - last.y
            last.x = event.x || event.clientX
            last.y = event.y || event.clientY
          }
        })

        if (dirty) redraw(elements, canvas)
      }
    })

    canvas.addEventListener('mouseup', (event) => {
      mouseDown = false
    })

    canvas.addEventListener('dblclick', (event) => {
      // dblclick on raw canvas should create a new node
      let reason = new Reason({canvas: canvas, x: last.x, y: last.y})
      elements.push(reason)
      redraw(elements, canvas)
    })    

    // create an abstract layout
    //  begin with the conclusion(s)
    // const reasons = {}
    // const levels = []
    // let current = graph.ends()

    // //  get parents of each level of reasons
    // while(current.length > 0) {
    //   levels.unshift(current)
    //   current = graph.parents(current)
    // }

    // //  finally add any orphans to the last layer
    // let orphans = graph.orphans()
    // if (orphans.length > 0) levels.unshift(orphans)


    // // -----> now draw the nodes
    // let area = dom.getBoundingClientRect()
    // let lineHeight = area.height / levels.length

    // levels.forEach((level, index) => {
    //   let lineWidth = area.width / (level.length + 1)
    //   level.forEach((id, i) => {
    //     let reason = build('div', {id: 'node-'+id}, {
    //       class:'reason',
    //       style: 'position: absolute; top: '+index*lineHeight+'px; left: '+((i+1)*lineWidth-125)+'px;'
    //     })
    //     reason.innerHTML = graph.nodes[id]
    //     reasons[id] = reason
    //     // dom.appendChild(reason)     
    //   })
    // })

    //  ------> now draw the edges
    // let svg = buildNS('svg', {id: 'my-svg'}, {height: area.height, width: area.width, version: '1.1', xmlns: "http://www.w3.org/2000/svg", 'xmlns:xlink':"http://www.w3.org/1999/xlink"})
       
//     graph.edges.forEach((edge) => {
//       if (edge.from.constructor === Array) {


// // --------------------->
//       } else {
//         let fBox = reasons[edge.from].getBoundingClientRect()
//         let tBox = reasons[edge.to].getBoundingClientRect()
//         console.log(dom.offsetLeft)
//         let path = buildNS('path', {id: 'edge-'+edge.from+ '-' +edge.to}, {
//           class: 'edge relation',
//           stroke: '#CCC',
//           'stroke-width': 5,
//           d: 'M'+(fBox.left)+' '+(fBox.top)+' L '+(tBox.left-tBox.width/2)+' '+tBox.y
//         })
//         svg.appendChild(path)
//         console.log(svg.offsetTop)
//       }
//     })

//     dom.appendChild(svg)

  },
  Tree: (dom, graph) => {},
  FlowChart: (dom, graph) => {}
}

function redraw(elements, canvas) {
    let context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    elements.forEach((el) => {
      el.draw()
    })    
}

//  element build helpers -- extract these later
function buildNS(type, options, attributes) {
  let node = document.createElementNS('http://www.w3.org/2000/svg', type)
  for (var key in options) {
    node[key] = options[key]
  }
  for (var key in attributes) {
    node.setAttribute(key, attributes[key])
  }
  return node
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
