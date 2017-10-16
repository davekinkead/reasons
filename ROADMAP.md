Feature Roadmap

0.1.0

Map

  - Relations
    - [x] Add divergent reasons
    - [] Conjoining reasons should only join on dropped reasons
    - [] Add independent conjoined argument chains
    - [] Permit multiple relations between nodes
  - UX
    - [x] Automatically highlight reason text on node creation
    - [x] Hover over relation text should tigger edit
    - [] Automatically scale to view port
    - [] Add zoom in/out functionality map
    - [] Add params option for line, overlay, background colour etc
    - [] Add automatic padding when dropping node
    - [] Node line type selector (solid/dotted) 
    - [] Add multiple node selection for dragging  
    - [] Touch UI
  - Data
    - [x] Changes to canvas events should update graph object
    - [x] Render map from existing x,y coordinates
  - Hot Keys
    - [x] Add backspace and delete key codes for Windows
    - [] Tab to different elements
    - [] Return to edit selected element
    - [] Add undo / redo hot keys
    - [x] Escape to cancel overlay

  - [] Add build process to include Safari
  
Highlighter

  - [] replace premise/conclusion with 'save'
  - [] display already highlighted text
  - [] delete already highlight text

Tests

  - [x] graph.js
  - [] map.js
  - [] highlighter.js
  - [] reason.js
  - [] relation.js
  - [] utils.js