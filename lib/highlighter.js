const Utils = require('./utils')
const MAP_URL = 'map.html' //'http::/dave.kinkead.com.au/reasons'
const reasons = []

module.exports = Highlighter

function Highlighter (dom) {
  if (!(this instanceof Highlighter)) return new Highlighter(dom)

  buildToolTip()

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

function buildToolTip () {

  const tooltip = Utils.buildNode('div', {id: 'tooltip'}, {style: 'display:none;'})
  document.body.appendChild(tooltip)

  const premise = Utils.buildNode('img', {name: 'premise', title: 'Premise', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERER5ECNjAAAAEXRSTlMAAQYUIyYtLjlLVVZxoLzt7xYSs+QAAABUSURBVCjPzZA5EsAgDMSW+0oA//+zDDCksZt0qFupsoGDzaUkDYahSeXBr0A8hKtCbCRQNTqJJMieyu+Q8crBQrmweLbYw5tbn3hwyzce1Ly0x28PkhUQ+2QwVtEAAAAASUVORK5CYII="})
  premise.setAttribute('style', 'padding:5px;')
  premise.addEventListener('click', addReason)

  const objection = Utils.buildNode('img', {name: 'objection', title: 'Objection', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAgVBMVEUAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERER4EtaNAAAAKnRSTlMAAQMFBgcJDEdLWFlbXF1odXeFiIuRkpSVl5itr7m6vsfIytXX4ubo6f1TzZtTAAAAr0lEQVQoz22Q1xaCQAxEZ6mKBStiwS7q/P8H+rAlAdmn5N6zJ5kAQPleGoQ3areRrVYkD8EUJJvIc3JvhFtTksoUrjsCH1eyNsLJBAuKEX4GTB26R6iuMTrGv1sMDBnH/0zgPXMXDhiZ+80Ux0T9qM0w12ba28qb2V8Oa+Yyt2PGsmcmW2+AVu2v8iSodC6z8/cEoqaT15pXDmfkDpXnQHTiRd1nzWfu61SfB6kBgB9Z7jbscyDPiwAAAABJRU5ErkJggg=="})
  objection.setAttribute('style', 'padding:5px;')
  objection.addEventListener('click', addReason)

  const conclusion = Utils.buildNode('img', {name: 'conclusion', title: 'Conclusion', src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAaVBMVEUAAABERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERdclAKAAAAInRSTlMAAQIDBQcLDhEUHCYnKSowQEFCQ2JjZGaOlNrg4u3x9/v9hyAg+QAAAHVJREFUKFO1y0kSgkAQRNEPKoo44Ag4Yef9D+mCDoKedvJ39TIKZm27jnsjs4+7ZA5xl75L3++SJL0XAFnu+6cEKB79zvrN8ZdkqtDzp2QXx1kNl6m4Og5nu3Sew0WTJj7+BA6nhI9L4FAnHOqEw7HdRP0P/QCyxRQBq+KXRQAAAABJRU5ErkJggg=="})
  conclusion.setAttribute('style', 'padding:5px;')
  conclusion.addEventListener('click', addReason)

  tooltip.appendChild(premise)
  tooltip.appendChild(objection)
  tooltip.appendChild(conclusion)

  const button = Utils.buildNode('input', {id: 'create-map-button'}, {
    name: 'create-map-button',
    type: 'submit',
    value: 'Create Map'
  })

  button.onclick = () => {
    sessionStorage.setItem('reasons', JSON.stringify(reasons))
    window.open(MAP_URL, '_blank')  
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