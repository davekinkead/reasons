# Reasons

*Reasons* is a web-based argument mapping GUI designed to work in modern web browsers.  

Argument Mapping is the visual representation of an argument's logical structure.  Analysing logical structure..... 

It's a loosely-coupled front-end library designed to be used is a variety of web-based environments and Learning Management Systems.

Once you add *Reasons* to any web page, you will be able to generate a HTML5 argument map from premises and conclusions highlighted in the page text.

There are three key parts to *Reasons*:

  - Text Highlighter
  - Argument Mapper
  - Essay Scaffolder 


### Highlighter  

Include *Reasons* in any web page to enable highlighting of premises, conclusions, and objections.

    <script src="reasons.js"></script>
    <script>
      Reasons.highlight('#element')
    </script>

Now, when text on the page is highlighted, you can indicate what part-of-argument it is and generate an argument map from these selections.

[Highlighter Demo](http://dave.kinkead.com.au/reasons/demo/highlighter)


### Argument Mapper

An argument map is just a directed graph representing the logical structure of an argument.  The `Mapper` module consists of a data structure (the graph) and a rendering engine (HTML Canvas).  The graph consists of an array of nodes containing propositional statements and edges linking them together.

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
