const Utils = require('./utils')
const MAP_URL = 'http://dave.kinkead.com.au/reasons'
const reasons = []

module.exports = Highlighter

function Highlighter (dom, args={}) {
  if (!(this instanceof Highlighter)) return new Highlighter(dom)

  buildToolTip(args)

  //  Event listener for text highlight
  const target = document.querySelector(dom)
  target.addEventListener('mouseup', (event) => {
    const selection = document.getSelection()
    const tooltip = document.querySelector('#tooltip')
    
    if (selection.focusOffset - selection.anchorOffset > 0) {
      const offset = window.scrollY
      const rect = selection.getRangeAt(0).getBoundingClientRect()

      //  set some default styling
      tooltip.setAttribute('style', 'position:absolute; display:block; top:'+(rect.top+offset-40)+'px; left:'+(rect.left+rect.width/2-tooltip.offsetWidth/2)+'px; background-color:#FFF; border-radius: 3px; box-shadow: 2px 2px 5px 3px rgba(0,0,0,0.2); height: 34px;')
    } else {
      tooltip.setAttribute('style', 'display:none;')
    }
  })
}

function buildToolTip (args) {

  const tooltip = Utils.buildNode('div', {id: 'tooltip'}, {style: 'display:none;'})
  document.body.appendChild(tooltip)

  const reason = Utils.buildNode('img', {name: 'reason', title: 'Add reason', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAulBMVEUAAAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMPBiuWAAAAPXRSTlMAAQIEBQcLDxASEx8hJykvMTU2PUJDS1VWWVxmZ21vcHR3e4OFjo+SmJuqwczO09XX3N7g4unr7fP1+fv9w3a8WAAAALdJREFUKFO9jtkCgVAQhiciJGtRiFD2Nck67/9azlrnlgv/1TfzzTkzAD+kMwtJ5oMSYWNIOQwswj6KXHUwXrKwQXtLxi6MMj6CnjG6EObFX0RBFYEiYKMISxV6dM8EOKdc8DS4YCluFQGE+5I9RdAbbFlMEGPJTSJMwdoFcSW4liKmmuhHZKhFoect6R0O7dZdPya8p2zy+/jjM+OHwYYYT/lHCeVDhXH59tyNq2LZApN1Wyz7Mh9XIkV0Nq93/gAAAABJRU5ErkJggg=="})
  reason.setAttribute('style', 'padding:5px;')
  reason.addEventListener('click', addReason)

  const trash = Utils.buildNode('img', {name: 'trash', title: 'Delete reason', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAP1BMVEUAAAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM12c1RAAAAFHRSTlMAAQUGN1FYXl9xdHuAzNPe7/H1+3a+Qu0AAABiSURBVChT5ZBLDoAgDAVfFb+g/Hr/s7qgRovKBZykCZlJWRQokE3MzMkSNDMLk/YUcg8AXQ56xbArD8fmdJ5f8K0APL181gxE16gAXPOv8HkSjYS99puEsQ6DBFrjXceFABz1gBh+m/xpHAAAAABJRU5ErkJggg=="})
  trash.setAttribute('style', 'padding:5px;')
  trash.addEventListener('click', addReason)

  tooltip.appendChild(reason)
  tooltip.appendChild(trash)

  const button = Utils.buildNode('input', {id: 'create-map-button'}, {
    name: 'create-map-button',
    type: 'submit',
    value: 'Create Map'
  })

  button.onclick = () => {
    sessionStorage.setItem('reasons', JSON.stringify(reasons))
    window.open(args.url || MAP_URL, '_blank')  
  }

  document.body.appendChild(button)  
}

function addReason(event) {

  document.querySelector('#create-map-button').setAttribute('style', 'position:fixed;bottom:2rem;right:2rem;padding:1rem;border:1px solid #CCC;border-radius:3px;display:block')
  document.querySelector('#tooltip').setAttribute('style', 'display:none')

  const paragraph = document.getSelection()
  const selection = {
    type: event.target.name,
    text: paragraph.anchorNode.nodeValue.substring(paragraph.anchorOffset, paragraph.focusOffset)
  }
  
  reasons.push(selection)
}