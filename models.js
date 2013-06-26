"use strict";
var app = require("./app")
  , views = require("./views");

function getRedisData (req, res, blueprint, pagename) {
  app.redisClient.get("page:" + pagename,
    function(err, redisdata) {
      if(err) throw err;
      console.log("redisdata=" + redisdata);
      views.renderView(req, res, blueprint, redisdata);
    });
}

module.exports.getRedisData = getRedisData;
