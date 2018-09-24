//  Reasons.js by Dave Kinkead
//  Copyright (c) 2017-2018 University of Queensland
//  Available under the MIT license

//  Reasons.js API
const Mapper = require('./mapper')

module.exports = {
  mapper: function (dom) {
    return new Mapper(dom)
  }
}