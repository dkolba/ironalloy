"use strict"

var http = require("http")
  , flatiron = require("flatiron")
  , director = require("director")
  , redis = require("redis")
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , app = flatiron.app;

  redisClient.auth(process.env.redissecret);
