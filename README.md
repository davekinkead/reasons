s# Reasons

*Reasons* is a digital argument mapping suite designed for modern web browsers. 

Argument mapping is the process of visually representating the logical structure of arguments.  Argument maps are an important pedagogical tool in the analysis of argumentation and have been associated with substantial increases in student cognative gains.


## Usage

*Reasons* is designed to seemlessly integrate digital argument mapping into existing teaching pedagogies.  It's a loosely-coupled front-end library that can be used is a wide variety of web-based environments and Learning Management Systems (LMS) and integrates three stages of informal logical analysis -- identification of truth claims within arguments, the analysis of logical structure, and synthesis of logcial structure into writen form.


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
    

[Demonstration](http://dave.kinkead.com.au/reasons/)


### Compatibility

Reasons has been tested in the following browsers:

  - [X] Chrome on OSX (60+)
  - [X] Firefox on OSX (54+)
  - [X] Safari on OSX (11+)
  - [x] Chrome on Windows 
  - [x] Firefox on Windows 
  - [ ] Internet Explorer on Windows  
  - [ ] Safari iOS
  - [ ] Chrome on Android

