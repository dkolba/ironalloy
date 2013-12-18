#!/usr/bin/env node
// TODO: Replace all config strings in /bin and put them in /bin/config.js
'use strict';

var http = require('http')
  , flatiron = require('flatiron')
  , app = flatiron.app
  , routes = require('./routes')
  , controller = require('./controller')
  , services = require('./services');

// Load nconf configuration file
app.config.use('file', {file: __dirname + "/../config.json"});

// Connect to redis db
services.redisClient.auth(process.env.redissecret);

// Use flatiron http server combo (director/union)
app.use(flatiron.plugins.http, {
  onError: controller.show404,
  before: [services.removePoweredBy, services.redSession, services.checkETag]
});

// Use st as file server
app.use(flatiron.plugins.static, {
  dir : __dirname + "/../public",
  url : "public/"
});

// Inject routing table
app.router.mount(routes);
app.start(8080, function(err) {
  app.log.info('union with director running on 8080');
});

// module.exports.redisClient = redisClient;
module.exports.app = app;
// module.exports.etags = etags;

