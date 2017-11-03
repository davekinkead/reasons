'use strict'

const should = require('should')
const Mapper = require('./../lib/mapper')
const View = require('./../lib/view')

//  Mock out the DOM and CANVAS
const JSDOM = require('jsdom').JSDOM
global.window = (new JSDOM('<!DOCTYPE html><div id="target"></div>')).window
global.document = window.document

const M = new Mapper('#target')
const G = [
  {id: 'a', text: "Blah blah A"},
  {id: 'b', text: "Blah blah B", x: 200},
  {id: 'c', text: "Blah blah C", x: 100, y: 400},
  {from: ['a', 'b'], to: 'c'}
]
M.render(G)

describe('View', () => {
  describe('#init', () => {
    it('shoud add a canvas element to #target', () => {
      M.DOM.should.be.class('HTMLDivElement')
      M.DOM.id.should.equal('target')
      M.DOM.childNodes[0].should.be.class('HTMLCanvasElement')
    })    

    it('shoud create a 2D context from the canvas', () => {
      M.context.should.be.class('CanvasRenderingContext2D')
    })
  })

  describe('#draw', () => {
    it('shoud set x & y variables for nodes', () => {
      M.graph.nodes()[0].x1.should.be.greaterThanOrEqual(0)
      M.graph.nodes()[0].y2.should.be.greaterThanOrEqual(0)
    })

    it('shoud set x & y variables for edge center', () => {
      M.graph.edges()[0].center.x.should.be.greaterThanOrEqual(0)
      M.graph.edges()[0].center.y.should.be.greaterThanOrEqual(0)
    })

    it('shoud set x & y variables for edge paths', () => {
      M.graph.edges()[0].paths[0].x1.should.be.greaterThanOrEqual(0)
      M.graph.edges()[0].paths[0].y2.should.be.greaterThanOrEqual(0)
    })

    it('should set three paths for a conjoined graph', () => {
      M.graph.edges()[0].paths.length.should.equal(3)
      M.graph.edges()[0].paths[2].y2.should.be.greaterThanOrEqual(0)
    })
  })
})
