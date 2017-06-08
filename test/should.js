const should = require('should')

global.testing = true

module.exports = should

should.Assertion.add('haveTheSameItemsAs', function(other) {
  this.params = { operator: 'to be have same items' };
  this.obj.forEach(item => {
    other.should.containEql(item);
  })
  this.obj.length.should.be.equal(other.length);
})