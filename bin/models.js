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
function getPageObj (req, res, pagename, mappings, callback) {
  var pageobj, multiarray;
  var finalarray = [];
  // Fetch pagename from redis
  app.redisClient.hgetall('page:' + pagename, getPageSingleArray);

  // Fetch the singleset which belongs to pagename key from redis
  function getPageSingleArray(err, hash) {
    if (hash) {
      pageobj = hash;
      pageobj.pagesingleset = [];
      pageobj.pagemultiset = [];
      app.redisClient.smembers('page:' + pagename + ':singleset', resolveSingleArray);
    } else {
      controller.show404(null, req, res);
    }
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
      callback(req, res, pageobj, finalarray, mappings);
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
        callback(req, res, pageobj, finalarray, mappings);
      }
    });
  }

  // Adds collection key and pushes to finalarray
  function injectObjectCollection(element) {
    element.collection = this.collname;
    finalarray.push(element);
  }
}

function getAdminObj(req, res, blueprint, pagename, mappings, callback) {
  var bp = blueprints[blueprint];

  // Remove blueprint configuration object from finalarray, retcon config data
  // and pageobject from redis and inject into finalarray.
  function modifyFinalarray(err, hash) {
    var retconned = {}
      , finalarray = [];

    // Delete keys of which we know we want to replace them (just in case...).
    delete hash.destination;
    delete hash.partial;
    delete hash.collection;

    // Clone finalarray blueprint object and pageobject into a new object. 
    for (var key1 in hash) {retconned[key1] = hash[key1];}
    for (var key2 in bp.finalarray[0]) {retconned[key2] = bp.finalarray[0][key2];}

    retconned.pagename = pagename;

    finalarray.push(retconned);
    callback(req, res, bp.pageobject, finalarray, mappings);
  }

  // Check if we are dealing with existing data and act accordingly.
  if (pagename) {
    app.redisClient.hgetall('page:' + pagename, modifyFinalarray);
  } else {
    callback(req, res, bp.pageobject, bp.finalarray, mappings);
  }
}

function getAdminArray(req, res, blueprint, pagename, mappings, callback) {
  var bp = blueprints[blueprint];
  var finalarray  = [];

  // Deep copy of array of objects bp.finalarray
  for (var i = 0; i < bp.finalarray.length; i++) {
    finalarray.push({});
    for(var key in bp.finalarray[i]) {
      finalarray[i][key] = bp.finalarray[i][key];
    }
  }

  // Get sorted set of all existing pages
  app.redisClient.zrange("allpages", 0 ,-1 ,
    function(err, allpagesarray) {
      if(err) throw err;

      // Insert object for each page in allpagesarray
      allpagesarray.forEach(function(element)  {
        var tmp = {};
        tmp.pagename = element;
        for (var key in bp.adminListTable) {tmp[key] = bp.adminListTable[key];}
        finalarray.push(tmp);
      });
      callback(req, res, bp.pageobject, finalarray, mappings);
  });
}

function setPassword (req, res, hash) {
  app.redisClient.set("root", hash, function(err) {
    res.redirect("/admin", 301);
  });
}

module.exports.getRedisHash = getRedisHash;
module.exports.getRedisSortedSet = getRedisSortedSet;
module.exports.getPageObj = getPageObj;
module.exports.getAdminObj = getAdminObj;
module.exports.getAdminArray = getAdminArray;
module.exports.setPassword = setPassword;
