// Reasons.js
// Copyright (c) 2017 Dave Kinkead
// Available under the MIT license


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

let screenWidth = screen().width
let screenHeight = screen().height
let screenCenter = {x: screenWidth/2, y: screenHeight/2}
let clicks = 1    // this is a temp id marker
let currentReason


let svg = createSVG()
let overlay = createOverlay()
let button = createButton()

document.addEventListener('reposition', reposition)
reposition()

document.addEventListener('resize', () => {
  console.log(screen())
  screenWidth = screen().width
  screenHeight = screen().height
})


//-------------------------------
//  Object Constructors
//-------------------------------


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

  reason.addEventListener('blur', reposition)

  document.querySelector('#canvas').appendChild(reason)
  return reason
}

function Relation(element, type, target) {
  this.reasons = [element.id]
  this.type = type
  this.target = target.id
  drawEdge(element.id, target.id)
  return this
}


//----------------------------------
//  GUI functions
//----------------------------------


//  A layout is the container for reasons and their relations
function Layout(reasons, relations) {
  let layers = []

  //  1. clone reasons and find the conclusion
  let orphans = reasons.slice(0)
  let related = []
  relations.forEach((relation) => {
    related = related.concat(remove(orphans, relation.target))
    related = related.concat(remove(orphans, relation.reasons))
  })

  //  2. add conclusions to layout
  let conclusions = related.filter((reason) => {
    let children = [].concat.apply([], relations.map((relation) => {
        return relation.reasons
      })
    )
    return !(children.indexOf(reason) > -1)
  })

  //  3. from the conclusion, add children to the layers
  layers = addLevel(conclusions, layers)  

  //  4. finally add the orphans
  if (orphans.length > 0)
    layers.push(orphans)

  return layers
  
  function addLevel(current, layout) {
    if (current.length > 0) {
      layout.push(current)
      let children = collectChildren(current)
      if (children.length > 0) {
        addLevel(children, layout)
      }
    }
    return layout
  }

  function collectChildren(arr) {
    let list = arr.map((id) => {
      return childrenOf(id)
    })
    return [].concat.apply([], list)
  }

  //  return the children ids of a reason
  function childrenOf(id) {
    let kids = relations.filter((relation) => {
      return relation.target == id
    }).map((relation) => {
      return relation.reasons
    })
    return [].concat.apply([],kids)
  }

  function remove(arr, item) {
    let results = []
    if (typeof item !== 'object')
      item = [item]
    item.forEach((i) => {
      let index = arr.indexOf(i)
      if (index > -1) {
        results = results.concat(arr.splice(index, 1))
      }
    })
    return results
  }
}

function drawEdge(from, to) {
  let reason = find(from, reasons)
  let target = find(to, reasons)
  let fc = getCenter(reason)
  let tc = getCenter(target)

  let path = buildNS('path', {id: reason.id+ '-' +target.id}, {
    class: 'edge relation supports',
    stroke: '#CCC',
    'stroke-width': 5,
    d: 'M'+fc.x+' '+fc.y+' L '+tc.x+' '+tc.y
  })

  svg.appendChild(path)
}

function createSVG() {
  let svg = buildNS('svg', {}, {height: screenHeight,  version: '1.1', width: screenWidth, xmlns: "http://www.w3.org/2000/svg", 'xmlns:xlink':"http://www.w3.org/1999/xlink"})
  document.querySelector('#canvas').appendChild(svg)

  document.querySelector('#canvas').addEventListener('dblclick', (event) => {
    let reason = new Reason('Click to edit...', event.clientX, event.clientY)
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

function reposition() {
  //  get the layout of ids
  let ids = reasons.map((r) => {
    return r.id
  })
  let layout = new Layout(ids, relations)

  //  position reasons based on layout
  let lineHeight = screenHeight / (layout.length+1)

  layout.forEach((line, index) => {
    let lineY = screenHeight - (lineHeight*(index+1))
    let elementWidth = screenWidth / (line.length+1)

    line.forEach((id, i) => {
      let reason = reasons.find((r) => {
        return r.id == id
      })
      let bb = reason.getBoundingClientRect()
      let translation = {
        x: (screenWidth - elementWidth * (i+1)) - reason.offsetLeft - bb.width/2,
        y: (screenHeight - lineY) - reason.offsetTop - bb.height
      }
      reason.style.transform = 'translate('+translation.x+'px, '+translation.y +'px)'
    })
  })

  //  re-position relations with delay
  setTimeout(repositionRelations, 500)

}

function repositionRelations() {
  let paths = document.querySelectorAll('.edge')
  paths.forEach((path) => {
    path.id.split('-')
    path.remove()
    let from = find(path.id.split('-')[0], reasons)
    let to = find(path.id.split('-')[1], reasons)
    drawEdge(from.id, to.id)
  }) 
}

//----------------------------------
//  Helper functions
//----------------------------------

function find(id, arr) {
  return arr.find((reason) => {
    return reason.id == id
  })
}

function screen() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  }
}

 // Actions on page load -- get reasons from session storage
 //   and reset the session data afterwards
JSON.parse(sessionStorage.getItem('reasons')).map((text) => {
  reasons.push(new Reason(text, 0, 0))
})

reposition()

//  Replace this with some kind of force displayment between reasons
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