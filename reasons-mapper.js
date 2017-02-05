// Reasons.js
// Copyright (c) 2017 Dave Kinkead
// Available under the MIT license


const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
const screenCenter = {x: screenWidth/2, y: screenHeight/2}
const fontSize = 14
const boxPaddingFactor = 1
const boxHeightInLines = 3
const boxHeight = fontSize * (boxHeightInLines + 2.5)
const boxWidth = (width) => {
  return (parseInt(width)+boxPaddingFactor) * fontSize/2
}
const reasons = []
const relations = []
const reasonWidth = 250


let clicks = 1    // this is a temp id marker
let currentReason


let svg = createSVG()
let overlay = createOverlay()
let button = createButton()


function createSVG() {
  let svg = buildNS('svg', {}, {height: screenHeight,  version: '1.1', width: screenWidth, xmlns: "http://www.w3.org/2000/svg", 'xmlns:xlink':"http://www.w3.org/1999/xlink"})
  document.querySelector('#canvas').appendChild(svg)

  document.querySelector('#canvas').addEventListener('dblclick', (event) => {
    let reason = new Reason('When I get around to it, you will be able to edit me!', event.clientX, event.clientY)
    reasons.push(reason)
    reposition()
  })

  return svg
}

function createOverlay() {
  let overlay = build('div', {id: 'overlay'}, {})
  overlay.addEventListener('click', (event) => {
    overlay.classList.remove('display')
    document.querySelectorAll('.reason').forEach((reason) => {
      reason.classList.remove('front')
      reason.setAttribute('contentEditable', false)
    })
  })
  document.body.appendChild(overlay)

  return overlay
}

function createButton() {
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

  return button
}



//  Object Constructors

function Reason(content, x, y) {

  let reason = build('div', {id: clicks++}, {
    class:'reason',
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
      reposition()
      // document.dispatchEvent(new CustomEvent('reposition', {foo:'bar'}))
  }, false)

  reason.addEventListener('click', (event) => {
    document.querySelector('#overlay').classList.add('display')
    reason.classList.add('front')
    reason.setAttribute('contentEditable', true)
  })

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
  return {x: box.left + box.width/2, y: box.top + box.height/2}
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
  let vectors = []




document.addEventListener('reposition', reposition)

function reposition() {
  const gravity = (distance) => {
    return Math.min(distance, 10)
  }
  const displacement = (distance) => {
    return (distance > 150) ? 0 : 150-distance
  }

  let repositioning = 50

  while (repositioning-- > 0) {
    reasons.forEach((reason, index) => {
      //  we start with either the existing vector or a blank
      let vc = vectors[index] || {x: 0, y: 0}
      let sc = getVector(addVectors(getOffset(reason), vc), screenCenter, gravity)
      vc = addVectors(vc, sc)

      // reasons.forEach((other) => {
      //   if (other.id !== reason.id) {

      //     //  displace reasons from each other
      //     let dc = getVector(vc, getCenter(other), displacement)
      //     vc.x -= dc.x
      //     vc.y -= dc.y
      //   }
      // })

      vectors[index] = vc
    })
  }

  reasons.forEach((reason, index) => {
    reason.style.transform = 'translate('+(vectors[index].x)+'px, '+(vectors[index].y)+'px)'
  })
}

function getAngleBetween(a, b) {
  return Math.atan2(b.y-a.y, b.x-a.x)
}

function getDistanceBetween(a, b) {
  return Math.sqrt( Math.pow(b.x-a.x, 2) + Math.pow(b.y-a.y, 2) )
}

function getVector(current, other, fn) {
  let direction = getAngleBetween(current, other)
  let distance = getDistanceBetween(current, other)
  return {
    x: Math.cos(direction) * fn(distance), 
    y: Math.sin(direction) * fn(distance)
  }
}

function getOffset(reason) {
  let box = reason.getBoundingClientRect()
  return {
    x: (reason.offsetLeft + box.width/2),
    y: (reason.offsetTop + box.height/2)
  }
}

function addVectors(a, b) {
  return {x: a.x + b.x, y: a.y + b.y}
}

function find(id, array) {
  let match
  array.forEach((reason) => {
    if (reason.id == id.toString()) {
      match = reason     
    }
  })
  return match
}

//  Actions on page load -- get reasons from session storage
//    and reset the session data afterwards
// postData = JSON.parse(sessionStorage.getItem('reasons'))

// //  Replace this with some kind of force displayment between reasons
// let maxElementsPerLine = Math.floor(screenWidth/300)

// if (postData !== null) {
//   let layoutMatrix = []
//   let layoutLine = 0
//   let lineHeight = 250
//   while (postData.length > 0) {
//     if (postData.length > maxElementsPerLine) {
//       layoutMatrix.push(postData.splice(0,maxElementsPerLine))
//     } else {
//       layoutMatrix.push(postData.splice(0))
//     }    
//   }

//   layoutMatrix.forEach((line, lineIndex) => {
//     let lineBuffer = (screenWidth - (reasonWidth * line.length+1)) / (line.length+1)
//     line.forEach((reason, index) => {
//       new Reason(reason, lineBuffer + (lineBuffer+reasonWidth)*index , lineHeight)
//     })
//     lineHeight += 250
//   })
// }

reposition()
