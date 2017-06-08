//  Reasons.js by Dave Kinkead
//  Copyright (c) 2017 University of Queensland
//  Available under the MIT license

//  Reasons.js API

const Map = require('./map')
const Highlighter = require('./highlighter')

module.exports = {
  map: function (dom) {
    return new Map(dom)
  },

  highlight: function(dom) {
    return new Highlighter(dom)
  }
}