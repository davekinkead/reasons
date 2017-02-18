# Reasons

*Reasons* is a web-based argument mapping tool designed to work in all modern (HTML5) browsers.  Once you add *Reasons* to any web page, you will be able to generate a HTML5 argument map from premises and conclusions highlighted in the page text.

See the [example](example) *Reasons* in action


## Mapper UX

*Reasons* is currently in early prototyping and not yet ready for prime time :(

The basic functionality can be broken down into three key parts

### Highlighter

TODO 

  - [x] embed as a library in any web page
  - [x] highlight text on the page
  - [x] create tool tip menu on highlight
  - [] decide which icon-actions should be available
  - [x] add text to session storage on icon click 
  - [x] remove tool tip from highligher once clicked
  - [x] option to generate argument map then appears

### Mapper

An argument map consists of an abstract graph and a rendering engine.  The graph is made up of a hash table for nodes and an array for edges.

The rendering enging has options for static maps (for embeds) and dynamic ones (for creating argument maps)

    Reasons.create(graph).render('#dom')

    Reasons.add(Object)

    Reasons.remove("id"|Object)

TODO

  - [x] create reasons from session data
  - [x] provide map & session reset button
  - [x] dynamically size reason based on text length
  - [x] allocate reasons to default position
  - [x] double click canvas to create a reason
  - [] right click to create a reason
  - [] right click a reason edit it
  - [x] click a reason to edit it
  - [] delete reason
  - [x] reason:hover indication
  - [x] drag reason to create relation
  - [] decide on what types of relations should be included
  - [] click a relation to edit it
  - [x] relation:hover indication
  - [x] automatically reposition reasons after event
  - [] scroll to zoom


### Scaffolder

TODO

  - [] add navigation to generate essay outline 
  - [] generate essay outline based on reasons

### Other

TODO

  - [] extract styles into separate CSS
  - [] add tests once concept is stable
  - [] add touch/iOS controls
  - [] save maps
  - [] slide menu
