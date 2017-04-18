# Reasons

*Reasons* is a web-based argument mapping tool designed to work in all modern (HTML5) browsers.  Once you add *Reasons* to any web page, you will be able to generate a HTML5 argument map from premises and conclusions highlighted in the page text.

There are three key parts to *Reasons*:

  - Highlighter
  - Argument Mapper
  - Scaffolder 


### Highlighter  

Include *Reasons* in any web page to enable highlighting of premises, conclusions, and objections.

    <script src="reasons.js"></script>
    <script>
      Reasons.highlight('#element')
    </script>

Now, when text on the page is highlighted, you can indicate what part-of-argument it is and generate an argument map from these selections.

[Highlighter Demo](http://dave.kinkead.com.au/reasons/demo/highlighter.html)


### Argument Mapper

An argument map consists of an abstract graph and a rendering engine.  The graph is made up of an array of nodes and edges.

    <script src="reasons.js"></script>
    <script>
      let graph = [
          {id: 'p1', text: "Circular arguments work"},
          {id: 'c1', text: "Circular arguments work"},
          {from: 'p1', to: 'c1', type: "supports"},
          {from: 'c1', to: 'p1', type: "supports"}
        ]
      Reasons.create('#element').render(graph)
    </script>
    

[Argument Mapper Demo](http://dave.kinkead.com.au/reasons/)

### Scaffolder

Under development
