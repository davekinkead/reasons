// 'use strict'

// const should = require('should')
// const Mapper = require('./../lib/mapper')
// const View = require('./../lib/view')

// //  Mock out the DOM and CANVAS
// const JSDOM = require('jsdom').JSDOM
// global.window = (new JSDOM('<!DOCTYPE html><div id="target"></div>')).window
// global.document = window.document

// const M = new Mapper('#target')
// const G = [
//   {id: 'p1', text: "Circular arguments work"},
//   {id: 'c1', text: "Circular arguments work"},
//   {from: 'p1', to: 'c1', type: "supports"},
//   {from: 'c1', to: 'p1', type: "supports"}
// ]
// M.render(G)

// describe('View', () => {
//   describe('#init', () => {
//     it('shoud add a canvas element to #target', () => {
//       M.DOM.should.be.class('HTMLDivElement')
//       M.DOM.id.should.equal('target')
//       M.DOM.childNodes[0].should.be.class('HTMLCanvasElement')
//     })    

//     it('shoud create a 2D context from the canvas', () => {
//       M.context.should.be.class('CanvasRenderingContext2D')
//     })
//   })

//   describe('#draw', () => {
//     it('shoud set x & y variables for nodes', () => {
//       M.graph[3].x1.should.be.greaterThanOrEqual(0)
//       M.graph[3].y2.should.be.greaterThanOrEqual(0)
//     })

//     it('shoud set x & y variables for edge center', () => {
//       M.graph[0].center.x.should.be.greaterThanOrEqual(0)
//       M.graph[0].center.y.should.be.greaterThanOrEqual(0)
//     })

//     it('shoud set x & y variables for edge paths', () => {
//       M.graph[0].paths[0].x1.should.be.greaterThanOrEqual(0)
//       M.graph[0].paths[0].y2.should.be.greaterThanOrEqual(0)
//     })
//   })
// })
