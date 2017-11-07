# Reasons

*Reasons* is a digital argument mapping suite designed for modern web browsers. 

Argument mapping is the process of visually representating the logical structure of arguments.  Argument maps are an important pedagogical tool in the analysis of argumentation and have been associated with substantial increases in student cognative gains.


## Usage

*Reasons* is designed to seemlessly integrate digital argument mapping into existing teaching pedagogies.  It's a loosely-coupled front-end library that can be used is a wide variety of web-based environments and Learning Management Systems (LMS) and integrates three stages of informal logical analysis -- identification of truth claims within arguments, the analysis of logical structure, and synthesis of logcial structure into writen form.

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

When the text on the page is highlighted, you can indicate what part-of-argument it is and generate an argument map from these selections.

[Highlighter Demo](http://dave.kinkead.com.au/reasons/demo/highlighter)


### Argument Mapper

An argument map is just a directed graph representing the logical structure of an argument.  The `Mapper` module consists of a data structure (the graph) and a rendering engine (HTML Canvas).  The graph consists of an array of nodes containing propositional statements and edges linking them together.

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
    

[Argument Mapper Demo](http://dave.kinkead.com.au/reasons/)

### Scaffolder

Under development

### Compatibility

Reasons has been tested in the following browsers:

  - [X] Chrome on OSX (60+)
  - [X] Firefox on OSX (54+)
  - [X] Safari on OSX (11+)
  - [] Chrome on Windows 
  - [] Firefox on Windows 
  - [] Internet Explorer on Windows  
  - [] Safari iOS
  - [] Chrome on Android

