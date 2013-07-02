"use strict";
var app = require("./app")
  , views = require("./views")
  , controller = require("./controller");

function getRedisData (req, res, blueprint, pagename) {
  app.redisClient.get("page:" + pagename,
    function(err, redisdata) {
      if(err) throw err;
      if (redisdata !== null) {
        console.log("redisdata=" + redisdata);
        views.renderView(req, res, blueprint, redisdata);
      } else {
        controller.show404(null, req, res);
      }
    });
}

module.exports.getRedisData = getRedisData;
