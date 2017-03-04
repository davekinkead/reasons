//  Reasons.js
//  Copyright (c) 2017 Dave Kinkead
//  Available under the MIT license

//  Reasons.js API

const ArgumentMap = require('./map')
const Highlighter = require('./highlighter')

module.exports = {
  map: function (dom) {
    return new ArgumentMap(dom)
  },

  highlight: function(dom) {
    return new Highlighter(dom)
  }
}