# Reasons

`Reasons` is a digital argument mapping library designed for modern web browsers. 

Argument mapping is the process of visually representating the logical structure of arguments.  Argument maps are an important pedagogical tool in the analysis of argumentation and have been [associated with substantial increases in student cognative gains](https://www.pdcnet.org/teachphil/content/teachphil_2004_0027_0002_0095_0116).

Argument mapping forms the middle of the three stages of informal logical analysis - identification of truth claims within arguments, the analysis of logical structure, and synthesis of logcial structure into writen form. `Reasons` is designed to seemlessly integrate these stages into existing teaching pedagogies. 

[![DOI](http://joss.theoj.org/papers/10.21105/joss.01044/status.svg)](https://doi.org/10.21105/joss.01044)

## Embedding Reasons

Download the library and add a reference to it and any initial data just before the `</body>` tag of a HTML page.


```html
<html>
<body>
  <div id="element"></div>

  ...

  <script src="reasons.js"></script>
  <script>
    let graph = [
        {id: 'p1', text: "Circular arguments work"},
        {id: 'c1', text: "Circular arguments work"},
        {from: 'p1', to: 'c1', type: "because"},
        {from: 'c1', to: 'p1', type: "because"}
      ]
    Reasons.mapper('#element').render(graph)
  </script>
</body>
</html>
```


`Reasons` needs to know the target `#element` of the DOM in which to render the argument map. You could use `body` to append the map to the HTML body tag or `#id` to append it to a specific element id.  The optional `graph` is just an array of nodes and edges representing the logical structure of an argument.  `Nodes` and `edges` are plain javascript objects representing propositional claims and inferential support.

Saving an argument map is left as an implementation detail.  `Mapper.export()` will return a `Graph` array from the map's current state.


## Using Reasons

Reasons relies on a few simple commands to edit an argument map:

  - Double clicking on an empty canvas will create a new reason node.  

  - Dragging one reason onto another creates an inferential connection.  Dragging reasons that share an inferential connection onto one another will create a conjoined reason.

  - Double clicking on an element will open the edit dialog.  `Return` or `Esc` will close the 
dialog.

  - A single click or `Tab` will select an element.  `Delete` or `Backspace` will remove that element.

  - `Ctrl z` or `⌘ z` will undo an action.  `Ctrl y` or `⌘ y` will redo it.

  - `Ctrl +` or `⌘ +` will zoom in. `Ctrl -` or `⌘ -` will zoom out. 


[Click for a demonstration](http://reasons.io/) 


## Development & Testing


Clone the repo and install the dependencies.


    $ git clone https://github.com/davekinkead/reasons.git
    $ npm install


Running the tests requires additional dev dependencies listed in the [package.json](/package.json) file under dev-dependencies including [JSDOM](https://github.com/jsdom/jsdom) and [Canvas](https://github.com/node-gfx/node-canvas-prebuilt).
.  You will need to install all these using the command:

  
    $ npm install mocha --save-dev
    $ npm install jsdom --save-dev
      ...

Then:

    $ npm test


## Browser Compatibility

`Reasons` relies on the HTML5 Canvas library - as such, it will not work on legacy browsers.  Touch events will be added in future releases.  It has been tested and works on the following browsers:


  - [X] Chrome on OSX (60+)
  - [X] Firefox on OSX (54+)
  - [X] Safari on OSX (11+)
  - [X] Chrome on Windows 
  - [X] Firefox on Windows 
  - [X] Safari iOS (View only)
  - [ ] Safari iOS (Touch)
  - [ ] Internet Explorer on Windows  
  - [ ] Chrome on Android


## Contributing & Support

We gladly accept feature requests and bug fixes.  If you have questions or problems, please [open an issue](https://github.com/davekinkead/reasons/issues).

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests to us.

## How to Cite

If you are using this software in an academic capacity, please cite as:

> Kinkead et al., (2019). Reasons: A digital argument mapping library for modern browsers. Journal of Open Source Software, 4(37), 1044, https://doi.org/10.21105/joss.01044
