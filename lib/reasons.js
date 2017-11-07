//  Reasons.js by Dave Kinkead
//  Copyright (c) 2017 University of Queensland
//  Available under the MIT license

//  Reasons.js API

const Mapper = require('./mapper')
const Highlighter = require('./highlighter')

module.exports = {
  mapper: function (dom) {
    return new Mapper(dom)
  },

  highlight: function(dom, args) {
    return new Highlighter(dom, args)
  }
}