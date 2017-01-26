// Reasons.js
// Copyright (c) 2017 Dave Kinkead
// Available under the MIT license


const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
const boxWidth = 50
const boxHeight = 50
const reasons = []
const relations = []

let counter = 1
// let r = Raphael('canvas', screenWidth, screenHeight)
// function Reason(content, x, y) {
//   this.content = content
//   this.x = x
//   this.y = y
//   this.width = boxWidth
//   this.height = boxHeight
//   this.text = r.text(x, y, content)
//   this.text.attr({
//     'font-size': 20, 
//     'fill': '#333',
//   })
//   this.rect = r.rect(x - this.width/2, y - this.height/2, this.width, this.height, 8)
//   this.rect.attr({
//     'stroke': '#BBB'
//   })
//   this.id = this.rect.id

//   let set = r.set()
//   set.push(this.rect, this.text)
//   set.x = set.y = 0

//   set.drag((dx, dy) => {
//     set.transform('...T'+(dx-set.cx)+','+(dy-set.cy))
//     set.cx = dx
//     set.cy = dy
//   }, () => {}, (event) => {
//     set.cx = 0
//     set.cy = 0


//     reasons.forEach((res) => {

//       if(res.id !== this.id && overlaps(res, this))
//         alert('hit!')
//     })
//   })

//   this.set = set
//   reasons.push(this)
// }


// ---

function build(type, options, attributes) {
  let node = document.createElementNS('http://www.w3.org/2000/svg', type)
  for (var key in options) {
    node[key] = options[key]
  }
  for (var key in attributes) {
    node.setAttribute(key, attributes[key])
  }
  return node
}

let svg = build('svg', {}, {height: screenHeight,  version: '1.1', width: screenWidth, xmlns: "http://www.w3.org/2000/svg", 'xmlns:xlink':"http://www.w3.org/1999/xlink"})
document.querySelector('#canvas').appendChild(svg)

function Reason(content, x, y) {
  let rect = build('rect', {}, {width: 100, height: 75, x: x, y: y, rx: 8, fill: '#FFF', stroke: '#CCC'})

  let text = build('text', {}, {x: x+ 45, y: y+40, fill: '#666', 'font-size': 20,})
  text.appendChild(document.createTextNode(counter))

  let g = build('g', {}, {class: 'reason'})
  g.appendChild(rect)
  g.appendChild(text)
  svg.appendChild(g)
}

document.querySelector('#canvas').addEventListener('dblclick', (event) => {
  let reason = new Reason(counter++, event.clientX, event.clientY)
})

function overlaps(a, b) {
  return (a.x < (b.x + b.width) && (a.x + a.width) > b.x &&
    a.y < (b.y + b.height) && (a.y + a.height) > b.y) ? true : false
}


function addRelation(reason, relation, target) {
  relations.push({reason: reason, type: relation, target: target})
}