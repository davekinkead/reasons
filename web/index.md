---
title: index
layout: template
permalink: /
---

# Reasons.js

<script src="reasons.js"></script>
<script>

  //  Variables for some randomized defaults
  let canvas = document.querySelector('#content')
  let box = canvas.getBoundingClientRect()

  let cat = ['humans', 'philosophers', 'doctors', 'students', 'winners', 'cats', 'dogs', 'birds', 'democrats', 'republicans'][Math.floor(Math.random() * 10)]
  let name = ['Socrates', 'Plato', 'Bob', 'Lucy', 'Dazza', 'Shazza', 'Nathan', 'Deborah', 'Dave', 'Pete'][Math.floor(Math.random() * 10)]
  let adj = ['mortal', 'smart', 'lucky', 'poor', 'cute', 'slow', 'fast', 'unlucky', 'fury', 'fluffy'][Math.floor(Math.random() * 10)]

  let graph = [
    {id: 'p1', text: 'All '+cat+' are '+adj, x: box.width*1/3-125, y: box.height*1/3},
    {id: 'p2', text: name+' is a '+cat.substring(0, cat.length-1), x: box.width*2/3-125, y: box.height*1/3-25},
    {id: 'c1', text: name+' is '+adj, x: box.width*1/2, y: box.height*2/3},
    {from: ['p1', 'p2'], to: 'c1'}
  ]

  //  Invoke the Reasons.js API
  Reasons.create('#content').render(graph)

  //  Generate a PNG image of the argument map
  function toPNG () {
    let canvas = document.querySelector('#content')
    window.open(canvas.toDataURL('image/png'), '_blank')
  }
</script>