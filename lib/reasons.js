//  Reasons.js
//  Copyright (c) 2017 Dave Kinkead
//  Available under the MIT license

//  Reasons.js API

const ArgumentMap = require('./map')

module.exports = {
  create: function (dom) {
    return new ArgumentMap(dom)
  }
}