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

let clicks = 1    // this is a temp id marker
let currentReason

let svg = buildNS('svg', {}, {height: screenHeight,  version: '1.1', width: screenWidth, xmlns: "http://www.w3.org/2000/svg", 'xmlns:xlink':"http://www.w3.org/1999/xlink"})
document.querySelector('#canvas').appendChild(svg)

document.querySelector('#canvas').addEventListener('dblclick', (event) => {
  let reason = new Reason('When I get around to it, you will be able to edit me!', event.clientX, event.clientY)
})


//  Object Constructors

function Reason(content, x, y) {

  let reason = build('div', {id: clicks++}, {
    class:'reason',
    x: x,
    y: y, 
    style: 'position: absolute; top: '+y+'px; left: '+x+'px;',
    draggable: true
  })

  reason.innerHTML = content

  reason.addEventListener('dragstart', (event) => {
    currentReason = event.target
    event.target.classList.add('current')
    event.dataTransfer.setData('text/html', event.target.outerHTML)
    event.dataTransfer.effectAllowed = "copy"
  })

  reason.addEventListener('drag', (event) => {
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
}

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


//  Helper Functions

function getCenter(element) {
  let box = element.getBoundingClientRect()
  return {x: element.offsetLeft + (box.right-box.left)/2, y: element.offsetTop + (box.bottom-box.top)/2}
}

function overlaps(a, b) {
  return (a.x < (b.x + b.width) && (a.x + a.width) > b.x &&
    a.y < (b.y + b.height) && (a.y + a.height) > b.y) ? true : false
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


//  Actions on page load -- get reasons from session storage
//    and reset the session data afterwards
postData = JSON.parse(sessionStorage.getItem('reasons'))

//  Replace this with some kind of force displayment between reasons
let maxElementsPerLine = Math.floor(screenWidth/300)
const reasonWidth = 250

if (postData !== null) {
  let layoutMatrix = []
  let layoutLine = 0
  let lineHeight = 250
  while (postData.length > 0) {
    if (postData.length > maxElementsPerLine) {
      layoutMatrix.push(postData.splice(0,maxElementsPerLine))
    } else {
      layoutMatrix.push(postData.splice(0))
    }    
  }

  layoutMatrix.forEach((line, lineIndex) => {
    let lineBuffer = (screenWidth - (reasonWidth * line.length+1)) / (line.length+1)
    line.forEach((reason, index) => {
      new Reason(reason, lineBuffer + (lineBuffer+reasonWidth)*index , lineHeight)
    })
    lineHeight += 250
  })

}


//  Action menu
let button = build('input', {id: 'create-map-button'}, {
  name: 'clear-map-button',
  type: 'submit',
  value: 'Clear Map'
})

button.setAttribute('style', 'position:fixed;bottom:2rem;right:2rem;padding:1rem;border:1px solid #CCC;border-radius:3px;display:block')  

button.addEventListener('click', () => {
  sessionStorage.setItem('reasons', null)
  location.reload()
})

document.body.appendChild(button)