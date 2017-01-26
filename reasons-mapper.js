// Reasons.js
// Copyright (c) 2017 Dave Kinkead
// Available under the MIT license


const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
const fontSize = 14
const boxPaddingFactor = 1
const boxHeightInLines = 3
const boxHeight = fontSize * (boxHeightInLines + 2.5)
const boxWidth = (width) => {
  return (parseInt(width)+boxPaddingFactor) * fontSize/2
}
const reasons = []
const relations = []

// let counter = 1
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


let svg = buildNS('svg', {}, {height: screenHeight,  version: '1.1', width: screenWidth, xmlns: "http://www.w3.org/2000/svg", 'xmlns:xlink':"http://www.w3.org/1999/xlink"})
document.querySelector('#canvas').appendChild(svg)


let clicks = 1
let currentReason


function Relation(element, type, target) {
  this.element = element
  this.type = type
  this.target = target

  let ec = getCenter(element)
  let tc = getCenter(target)

  let path = buildNS('path', {id: element.id+ '-' +target.id}, {
    stroke: '#CCC',
    'stroke-width': 5,
    d: 'M'+ec.x+' '+ec.y+' L '+tc.x+' '+tc.y
  })

  svg.appendChild(path)

  return this
}

function getCenter(element) {
  let box = element.getBoundingClientRect()
  return {x: box.x + (box.right-box.left)/2, y: box.y + (box.bottom-box.top)/2}
}

function Reason(content, x, y) {

  let reason = build('div', {id: clicks++}, {
    class:'reason',
    x: x,
    y: y, 
    style: 'position: absolute; top: '+y+'px; left: '+x+'px;',
    draggable: true
  })

  reason.innerHTML = content
  // reason.setAttribute('ondragstart', "event.dataTransfer.setData('text/html',"+this+")")

  reason.addEventListener('dragstart', (event) => {
    currentReason = event.target
    event.target.classList.add('current')
    event.dataTransfer.setData('text/html', event.target.outerHTML)
    event.dataTransfer.effectAllowed = "copy"
  })

  reason.addEventListener('drag', (event) => {
    // console.log(event) //.clientX+','+event.clientY)
  }, false)

  reason.addEventListener('dragend', (event) => {
    currentReason = event.target
    event.target.classList.remove('current')
  })

  reason.addEventListener('dragenter', (event) => {
    event.preventDefault()
    if (event.target.classList)
      event.target.classList.add('droppable')
  }, false)

  reason.addEventListener('dragover', (event) => {
    event.preventDefault()
  })

  reason.addEventListener('dragleave', (event) => {
    if (event.target.classList)
      event.target.classList.remove('droppable')
  }, false)

  reason.addEventListener('drop', (event) => {
    event.preventDefault()
    event.target.classList.remove('droppable')
    if (currentReason.id !== event.target.id)
      relations.push(new Relation(currentReason, 'supports', event.target))
  }, false)

  document.querySelector('#canvas').appendChild(reason)

  return reason

  // let text = new Text(content, x, y)
  // let inDrag = false
  // let moved = false
  // let mx,my

  // let rect = buildNS('rect', {}, {
  //   x: x, 
  //   y: y,
  //   rx: 8,
  //   width: boxWidth(text.getAttribute('width')), 
  //   height: boxHeight, 
  //   fill: '#FFF', 
  //   stroke: '#CCC'
  // })

  // let g = buildNS('g', {}, {class: 'reason', draggable: true})
  
  // g.addEventListener('mousedown', (event) => {
  //   inDrag = true
  //   mx = event.clientX
  //   my = event.clientY
  // }, false)

  // g.addEventListener('drag', (event) => {
  //   // if (inDrag) {
  //     console.log('draggins...')
  //     moved = true
  //     g.setAttributeNS(null, "transform", 'translate('+(event.clientX - mx)+', '+(event.clientY - my)+')')
  //   // }
  // }, false)

  // g.addEventListener('mouseup', (event) => {
  //   if (moved) {
  //     alert('drag end')
  //   }
  //   inDrag = false
  //   moved = false
  // }, false)

  // g.appendChild(rect)
  // g.appendChild(text)
  // svg.appendChild(g)
}


// function Text(content, x, y) {

//   // Need to manually wrap the text based on its length
//   // In this case, the fixed constraint is the number of lines
//   let breakPoint = Math.floor(content.length/boxHeightInLines)
//   let lines = []
//   let words = content.split(' ')
//   let line = ''
//   while(words[0] !== undefined) {
//     if (line.length < breakPoint) {
//       line += words.shift() + ' '
//     } else {
//       lines.push(line)
//       line = ''
//     }
//   }
//   lines.push(line)

//   let xPos = x+boxPaddingFactor*fontSize
//   let yPos = y+boxPaddingFactor*fontSize*2
//   let text = buildNS('text', {}, {x: xPos, y: yPos, fill: '#666', 'font-size': fontSize, width: breakPoint})

//   lines.forEach((line, index) => {
//     let tspan = buildNS('tspan', {}, {x: x + boxWidth(breakPoint)/2, y: yPos + (index*fontSize), 'text-anchor': 'middle'})
//     tspan.appendChild(document.createTextNode(line))
//     text.appendChild(tspan)
//   })
//   return text
// }


document.querySelector('#canvas').addEventListener('dblclick', (event) => {
  let reason = new Reason('Lorem ipsum dolor sit amet, ut mattis risus suspendisse natoque, pede ipsum massa quam nam nec parturient.', event.clientX, event.clientY)
})

function overlaps(a, b) {
  return (a.x < (b.x + b.width) && (a.x + a.width) > b.x &&
    a.y < (b.y + b.height) && (a.y + a.height) > b.y) ? true : false
}


function addRelation(reason, relation, target) {
  relations.push({reason: reason, type: relation, target: target})
}