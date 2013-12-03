"use strict";
var app = require("./app")
  , views = require("./views")
  , controller = require("./controller")
  , blueprints = require("./blueprints");

function getRedisHash(req, res, blueprint, pagename) {
  app.redisClient.hgetall("page:" + pagename,
    function(err, redisdata) {
      if(err) throw err;
      if (redisdata !== null) {
        // console.log("redisdata=" + redisdata);
        views.renderView(req, res, blueprint, redisdata);
      } else {
        controller.show404(null, req, res);
      }
    });
}

function getRedisSortedSet(req, res, blueprint) {
  app.redisClient.zrange("allpages", 0 ,-1 ,
    function(err, redisdata) {
      if(err) throw err;
      var pagescollection = [];
      for (var i = 0; i < redisdata.length; i++) {
        pagescollection.push({"pagescollection": redisdata[i]});
      }
      // console.log(pagescollection);
      views.renderView(req, res, blueprint, pagescollection);
  });
}


// This fetches data from redis and builds an object and array which can be used
// by dishwasher.
function getPageObj (req, res, pagename, callback) {
  var pageobj, multiarray;
  var finalarray = [];
  // Fetch pagename from redis
  app.redisClient.hgetall('page:' + pagename, getPageSingleArray);

  // Fetch the singleset which belongs to pagename key from redis
  function getPageSingleArray(err, hash) {
    console.log("Error: ", err);
    pageobj = hash;
    pageobj.pagesingleset = [];
    pageobj.pagemultiset = [];
    app.redisClient.smembers('page:' + pagename + ':singleset', resolveSingleArray);
  }

  // Fetch each object from singleset from redis
  function resolveSingleArray (err, redisset) {
    if(redisset.length){
      pageobj.pagesingleset = redisset;
      var multi = app.redisClient.multi();
      for (var i = 0; i < redisset.length; i++) {
        multi.hgetall('page:' + redisset[i]);
      }
      multi.exec(function (err, array) {
        var tempobj = {collname:'none'};

        // Add "collection" key and push object into finalarray
        array.map(injectObjectCollection, tempobj);
      });
    }
    // Fetch the multiset which belongs to pagename key from redis
    app.redisClient.smembers('page:' + pagename + ':multiset', getPageMultiArray);
  }

  // Fetch each
  function getPageMultiArray (err, redisset) {
    if(redisset.length) {
      var multi = app.redisClient.multi();
      pageobj.pagemultiset = redisset;
      // Fetch each collection referenced in pagemultiset
      for (var i = 0; i < redisset.length; i++) {
        multi.smembers('collection:' + redisset[i]);
      }
      // Now we have an array of arrays, each one represents a collection
      multi.exec(function (err, multiarray) {
        multiarray.forEach(function (key, index) {
          resolveMultiArray(key, index, multiarray);
        });
      });
    }
    else {
      callback(req, res, pageobj, finalarray);
    }
  }

  // Fetches the pageobjects referenced in each array and pushes to finalarray
  function resolveMultiArray (redisset, index, multiarray) {
    var arrayname = pageobj.pagemultiset[index];
    var multi = app.redisClient.multi();
    for (var i = 0; i < redisset.length; i++) {
      multi.hgetall('page:' + redisset[i]);
    }
    multi.exec(function (err, array) {
      var tempobj = {collname:arrayname};

      // Add "collection" key and push object into finalarray
      array.map(injectObjectCollection, tempobj);

      // If the current element is the last one in multiarray fire the callback
      if (index + 1  === multiarray.length) {
        callback(req, res, pageobj, finalarray);
      }
    });
  }

  // Adds collection key and pushes to finalarray
  function injectObjectCollection(element) {
    element.collection = this.collname;
    finalarray.push(element);
  }
};

function getAdminObj(req, res, pagename, callback) {
  var bp = blueprints.adminIndex;
  callback(req, res, bp.pageobject, bp.finalarray);
}

module.exports.getRedisHash = getRedisHash;
module.exports.getRedisSortedSet = getRedisSortedSet;
module.exports.getPageObj = getPageObj;
module.exports.getAdminObj = getAdminObj;
