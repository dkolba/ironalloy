var mocha = require('mocha')
  , chai = require('chai')
  , should = chai.should()
  , app = require(__dirname + "/../app")
  , request = require('request');


describe('Get base URL', function() {
  it('should be bla bla bla', function(done) {
    request.get('http://localhost:8080' + '/',  function(err, res, body) {
    if(err) {done(err)}
    else {
      res.statusCode.should.be.equal(200)
      done()
    }
  });
});
});
