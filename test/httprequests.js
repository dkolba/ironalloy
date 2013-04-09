var mocha = require('mocha')
  , chai = require('chai')
  , should = chai.should()
  , app = require(__dirname + "/../app")
  , request = require('request');


describe('Get base URL', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(200);
        should.exist(body);
        done();
      }
    });
  });
});

describe('Get /adsf page', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/adsf',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(200);
        should.exist(body);
        done();
      }
    });
  });
});

describe('Get /create page', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/create',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(200);
        should.exist(body);
        done();
      }
    });
  });
});

describe('Get delete page', function() {
  it('should return http status code 404 and have a body', function(done) {
    request.get('http://localhost:8080' + '/delete',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(404);
        should.exist(body);
        done();
      }
    });
  });
});

describe('Get /update/testpage', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/update/testpage',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(200);
        should.exist(body);
        done();
      }
    });
  });
});

describe('Get /update page', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/update',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(200);
        should.exist(body);
        done();
      }
    });
  });
});

describe('Get /delete/testpage', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/delete/testpage',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(200);
        should.exist(body);
        done();
      }
    });
  });
});
