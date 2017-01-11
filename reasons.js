// Reasons.js

document.addEventListener('mouseup', (event) => {
  let selection = document.getSelection()
  if (selection.focusOffset - selection.anchorOffset > 0)
    console.log(selection)
})
