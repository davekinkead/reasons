'use strict'

const should = require('should')
const Mapper = require('./../lib/mapper')

//  Mock out the DOM and CANVAS
const JSDOM = require('jsdom').JSDOM
global.window = (new JSDOM('<!DOCTYPE html><div id="target"></div>')).window
global.document = window.document

const M = new Mapper('#target')
const G = [
          {id: 'p1', text: "Circular arguments work"},
          {id: 'c1', text: "Circular arguments work"},
          {from: 'p1', to: 'c1', type: "supports"},
          {from: 'c1', to: 'p1', type: "supports"}
        ]

describe('Mapper', () => {

  describe('#new', () => {
    it('creates a map with a valid DOM reference', () => {
      M.should.be.instanceOf(Mapper)
    })

    it('returns null for invalid DOM references', () => {
      (new Mapper('#nosuchref')).should.be.null
    })
  })

  describe('#render', () => {
    it('renders an array of elements on the canvas', () => {
      M.render(G)
      M.graph.length.should.equal(G.length)
    })
  })

  describe('#export', () => {
    it('exports the graph from a Mapper', () => {
      M.render(G)
      let g = M.export()
      g.should.be.instanceOf(Array)
      g.length.should.equal(G.length)
    })

  })
})