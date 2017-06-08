'use strict'

const should = require('should')
const Map = require('./../lib/map')

describe('Map', () => {

  describe('#new', () => {
    it('should return an instance of Map for method chaining', () => {
      new Map('some_id').should.be.instanceof(Map)
    })
  })

  describe('#render', () => {})

  describe('#save', () => {})
})