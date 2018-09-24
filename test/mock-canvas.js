/* Due to changes in the JSDOM library, the following patch is necessary
 *  to mock the HTML Canvas for testing
 */

module.exports = function() {
  return {
    fillRect: function() {},
    clearRect: function(){},
    getImageData: function(x, y, w, h) {
      return  {
        data: new Array(w*h*4)
      };
    },
    putImageData: function() {},
    createImageData: function(){ return []},
    setTransform: function(){},
    drawImage: function(){},
    save: function(){},
    fillText: function(){},
    restore: function(){},
    beginPath: function(){},
    moveTo: function(){},
    lineTo: function(){},
    closePath: function(){},
    stroke: function(){},
    translate: function(){},
    scale: function(){},
    rotate: function(){},
    arc: function(){},
    fill: function(){},
    measureText: function (){ return {width: 5} },
    strokeRect: function () {},
    class: 'HTMLDivElement'
  }
}