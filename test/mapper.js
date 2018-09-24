// 'use strict'

// const should = require('should')
// const Mapper = require('./../lib/mapper')

// //  Mock out the DOM and CANVAS
// const JSDOM = require('jsdom').JSDOM
// global.window = (new JSDOM('<!DOCTYPE html><div id="target"></div>')).window
// global.document = window.document

// // window.getContext = function() {
// //     return {
// //       fillRect: function() {},
// //       clearRect: function(){},
// //       getImageData: function(x, y, w, h) {
// //         return  {
// //           data: new Array(w*h*4)
// //         };
// //       },
// //       putImageData: function() {},
// //       createImageData: function(){ return []},
// //       setTransform: function(){},
// //       drawImage: function(){},
// //       save: function(){},
// //       fillText: function(){},
// //       restore: function(){},
// //       beginPath: function(){},
// //       moveTo: function(){},
// //       lineTo: function(){},
// //       closePath: function(){},
// //       stroke: function(){},
// //       translate: function(){},
// //       scale: function(){},
// //       rotate: function(){},
// //       arc: function(){},
// //       fill: function(){},
// //     };
// // }

// const M = new Mapper('#target')
// const G = [
//   {id: 'p1', text: "Circular arguments work"},
//   {id: 'c1', text: "Circular arguments work"},
//   {from: 'p1', to: 'c1', type: "supports"},
//   {from: 'c1', to: 'p1', type: "supports"}
// ]

// describe('Mapper', () => {
//   describe('#new', () => {
//     it('should create a map with a valid DOM reference', () => {
//       M.should.be.instanceOf(Mapper)
//     })

//     it('return null for invalid DOM references', () => {
//       (new Mapper('#nosuchref')).should.be.null
//     })
//   })

//   describe('#render', () => {
//     it('should populate the graph in the argument map', () => {
//       M.render(G)
//       M.graph.length.should.equal(G.length)
//     })

//     it('should return a reference of the graph', () => {
//       const m = M.render(G)
//       m.should.be.instanceOf(Mapper)
//     })
//   })

//   describe('#export', () => {
//     it('should export the graph as an array from the argument map', () => {
//       M.render(G)
//       M.export().should.be.instanceOf(Array)
//       M.export().length.should.equal(G.length)
//     })
//   })
// })