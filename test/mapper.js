'use strict'

const should = require('should')
const Mapper = require('./../lib/mapper')

//  Mock out the DOM and CANVAS
const JSDOM = require('jsdom').JSDOM
global.window = (new JSDOM('<!DOCTYPE html><div id="target"></div>')).window
global.document = window.document

describe('Mapper', () => {

  describe('#new', () => {
    it('creates a map with a valid DOM reference', () => {
      (new Mapper('#target')).should.be.instanceOf(Mapper)
    })

    it('returns null for invalid DOM references', () => {
      (new Mapper('#nosuchref')).should.be.null
    })
  })

  describe('#render', () => {
    it('renders an array of elements on the canvas', () => {

    })
  })

  describe('#save', () => {})
})