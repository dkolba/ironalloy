var mocha = require('mocha')
  , chai = require('chai')
  , should = chai.should()
  , app = require(__dirname + "/../bin/app")
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

describe('Get /admin/create page', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/admin/create',  function(err, res, body) {
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
    request.get('http://localhost:8080' + '/admin/delete',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(404);
        should.exist(body);
        done();
      }
    });
  });
});

describe('Get /admin/update/testpage', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/admin/update/testpage',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(200);
        should.exist(body);
        done();
      }
    });
  });
});

describe('Get /admin/update page', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/admin/update',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(200);
        should.exist(body);
        done();
      }
    });
  });
});

describe('Get /admin/delete/testpage', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/admin/delete/testpage',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(200);
        should.exist(body);
        done();
      }
    });
  });
});

describe('Get /logout', function() {
  it('should return http status code 200 and have a body', function(done) {
    request.get('http://localhost:8080' + '/logout',  function(err, res, body) {
      if(err) {done(err);}
      else {
        res.statusCode.should.be.equal(200);
        done();
      }
    });
  });
});
