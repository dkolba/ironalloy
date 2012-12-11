"use strict"

var http = require("http")
  , flatiron = require("flatiron")
  , director = require("director")
  , redis = require("redis")
  , redisClient = redis.createClient()
  , app = flatiron.app
