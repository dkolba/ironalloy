"use strict";
var app = require("./app")
  , views = require("./views")
  , controller = require("./controller");

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

module.exports.getRedisHash = getRedisHash;
module.exports.getRedisSortedSet = getRedisSortedSet;
