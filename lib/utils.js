//  Reasons.js by Dave Kinkead
//  Copyright 2017-2019 University of Queensland
//  Available under the MIT license

module.exports = {

  //  build a DOM element
  buildNode: function (type, options, attributes) {
    const node = document.createElement(type)
    for (var key in options) {
      node[key] = options[key]
    }
    for (var key in attributes) {
      node.setAttribute(key, attributes[key])
    }
    return node
  },

  intersection: function (array1, array2) {
    return array1.filter(function(n) {
      return array2.indexOf(n) !== -1;
    })
  },

  unique: require('array-unique'),
  flatten: require('array-flatten'),
  diff: require('array-difference')
}