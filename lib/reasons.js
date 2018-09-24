//  Reasons.js by Dave Kinkead
//  Copyright (c) 2017-2018 University of Queensland
//  Available under the MIT license

/**
 * The Reasons.js API.  This module forms the top level wrapper
 */
const Mapper = require('./mapper')

module.exports = {
  mapper: function (dom) {
    return new Mapper(dom)
  }
}