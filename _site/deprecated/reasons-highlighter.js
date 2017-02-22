// Reasons.js
// Copyright (c) 2017 Dave Kinkead
// Available under the MIT license


//--  Settings  --//

const MAP_URL = 'map.html'
let reasons = []

//---  reason highlighter ---//

document.addEventListener('mouseup', (event) => {
  let selection = document.getSelection()
  let tooltip = document.querySelector('#tooltip')
  
  if (selection.focusOffset - selection.anchorOffset > 0) {
    let offset = window.scrollY
    let rect = selection.getRangeAt(0).getBoundingClientRect()
    tooltip.setAttribute('style', 'position:absolute;')
    tooltip.setAttribute('style', 'position:absolute;display:block;top:'+(rect.top+offset-40)+'px;left:'+(rect.left+rect.width/2-tooltip.offsetWidth/2)+'px;')
  } else {
    tooltip.setAttribute('style', 'display:none;')
  }
})


//--- iconography ---//

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

let rocket = build('img', {name: 'rocket', title: 'Rocket Away', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAyVBMVEUAAABEREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREQhBLeMAAAAQnRSTlMAAQIDBAUHCAkKDA4REhMWHiEjJC0vMTU3PD1CR0pLTU5YWWhpa2xweYOLkZWXmKittLfBxczOz9Xe4OTp7fHz+fvbhV3OAAAAtUlEQVQYGY3B6UKCQBgF0KtgpJVoKVmBlUuLlprQRjrZff+Hkhkt4Zt+eA4sJ9fjZPF9AOEspuGhoDziloM875XktNoml8irpcycAws+IecwpTavX5GX2HHe+WflQnPbF1FvGHNnAGNC4cuB1qTUgFZ6oxDCCCncwqgoFkXYCEh+3Clu/bTwqxsdAb7iRgLBVzRmkHxF7RmWDrVHWPrU7mH5ZEadQjpm5qECS4t8qeM/NwH2sgaq+Dn2vlip8AAAAABJRU5ErkJggg=="})

rocket.addEventListener('click', addReason)

let floppy = build('img', {name: 'floppy', title: 'Save stuff', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAALVBMVEUAAABEREREREREREREREREREREREREREREREREREREREREREREREREREREREQUsNWbAAAADnRSTlMAAQIEBkdfmpvDxdzz9bWdnlgAAABpSURBVBhXY4h5BwHbFBgYGO5BOe8mAznvGIAMAaZ3Hq8MoBwgxVi3GMFhEAdKwTmMdZMQHAaJZ1ADGIEcltdADtjwNxCDGWJBnKtQDhyQwIG6+yiYA3X3GzDnHUIRxRx4gIAMj0VwrgIAX8yGk+6r9SwAAAAASUVORK5CYII="})

floppy.addEventListener('click', addReason)


let frown = build('img', {name: 'frown', title: 'Cheer up', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAtFBMVEUAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERETZeLDLAAAAO3RSTlMAAQIEBQYUFRYcHR4fICEiJCUpMjM0Njc4OWtsbW90dXd4e3yChYaIo6iqurzAyszOz+Tm6O3v8ff7/dPeyp8AAAEUSURBVCjPdZLbUsJAEERPsqyIkqAImCA3wx2RcCex//+/fAipBCn7pXenq3p6dwYymGAWn8/xNDCUYXqprki7Jck/Khn61nFsY5RoX8/rHSmq5Bc7ltrZ0VMalH3DH9UBzEGdm4aE2hugpwiqm80D5DxWF0yaWIilDeRsk9QQasRfgZECZvKBxziuUnBDU7ay3MEq5iLnXnB0/l/Y5Vatxem0eCus5vIA3FX2hysXwNeMUAOApdZPrvv8rSXAUAGVNKnAq75cAHetl+sD6esTJqpl7jVNIFIPMEe1sc08UNMS6GAAGkpb5aydNMsD79JnMahIxRgaRyUDzzqO9UeJDl5pGfrFMnzc7kklnO8ul+0szMu/DK0oKoFSoK0AAAAASUVORK5CYII="})

frown.addEventListener('click', addReason)


let anchor = build('img', {name: 'anchor', title: 'Aarrgh!', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAflBMVEUAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERETkr36CAAAAKXRSTlMAAQQFBgsUGhscHR8gLS4wMjNFRk5PX2lzeYKFtMHD0dPV19zk5ujx/UJv+k0AAACuSURBVCjPlc/RFoFAFIXhPRQaCiFFFCL/+7+gi0gZF+y7Od+adc6WXgmBeygngxqgHjgwg/EEpg4EsN5A4IApAUp3h/wznP0voD3s9TOYgmcK04MhbYb9em/4qBhEUQ55FLlF/rzqC9wAll1YAlwFkPZ/pAACiPuwaoHEvMEkNJDugFPsNeDFJ2CXorm0BeBSQXUBYCstJEn2SCcH2znaZlUzrTL72c8bWTvy2ucD5v8e9rjByyUAAAAASUVORK5CYII="})

anchor.addEventListener('click', addReason)


let comment = build('img', {name: 'comment', title: 'Blah blah', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAA6lBMVEUAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERETUtopyAAAATXRSTlMAAQIEBgcIDA4QERMaHR8gISMmKC0zOTo7PD0/RktSVFtcX2NmaGlsbXFzdX+CjI6jpqq5wMPFx8jKzM7P1dna3N7i5Obo6+3x8/X3/SbLVUEAAADfSURBVBgZrcHpUoJQAAbQ7xK4FGlhi7a5ZGn7CkVQUJrAvX7v/zoxajoiM/3pHPxBs7oPoZTB/em2wEKhr0gmrpuQTLo6Zo4Ug7YpkBJmO2RygIlrDuoCc6Ix5AVSHT4bWGLYPAHKfNOQofnjIq64iRUV9vA+Qo7Ig3SQw5Z4VcgReejQwooKezCkt4YMzWcR2OGTjiWGzSZSe+NoFwuiPuQlJtYdNjAlzFZIeYiZY5ZRePly3JikPNfxyw9QHfEjVp+PZ5bA3D5v7hjXkLWhSN7qyBIDfvdLyLFVwr/4AUwqIE9Encb+AAAAAElFTkSuQmCC"})

comment.addEventListener('click', addReason)


let tooltip = build('div', {id: 'tooltip'}, {style: 'display:none;'})
tooltip.appendChild(anchor)
tooltip.appendChild(comment)
tooltip.appendChild(frown)
tooltip.appendChild(floppy)
tooltip.appendChild(rocket)

let button = build('input', {id: 'create-map-button'}, {
  name: 'create-map-button',
  type: 'submit',
  value: 'Create Map'
})
button.onclick = () => {
  window.open(MAP_URL, '_blank')  
}

document.body.appendChild(button)
document.body.appendChild(tooltip)

function addReason() {
  document.querySelector('#create-map-button').setAttribute('style', 'position:fixed;bottom:2rem;right:2rem;padding:1rem;border:1px solid #CCC;border-radius:3px;display:block')

  document.querySelector('#tooltip').setAttribute('style', 'display:none')

  let paragraph = document.getSelection()
  let selection = paragraph.anchorNode.nodeValue.substring(paragraph.anchorOffset, paragraph.focusOffset)
  reasons.push(selection)
  sessionStorage.setItem('reasons', JSON.stringify(reasons))
}