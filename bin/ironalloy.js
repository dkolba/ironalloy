#!/usr/bin/env node
'use strict';

var http = require('http')
  , flatiron = require('flatiron')
  , ironalloy = flatiron.app
  , routes = require('./routes')
  , controller = require('./controller')
  , services = require('./services');

// Load nconf configuration file
ironalloy.config.use('file', {file: __dirname + "/../config.json"});

// Conditionally load st configuration depending on environment variable
if(process.env.NODE_ENV === 'production') {
  var staticdir = ironalloy.config.get('static_production_dir');
}
else {
  var staticdir = ironalloy.config.get('static_development_dir');
}

// Connect to redis db
services.redisClient.auth(process.env.redissecret);

// Use flatiron http server combo (director/union)
ironalloy.use(flatiron.plugins.http, {
  onError: controller.show404,
  before: [services.removePoweredBy, services.redSession, services.checkETag,
    services.getCache]
});

// Use st as file server
ironalloy.use(flatiron.plugins.static, {
  dir: __dirname + staticdir,
  url: ironalloy.config.get('static_url')
});

// Inject routing table
ironalloy.router.mount(routes);
ironalloy.start(process.env.port || 8080, function(err) {
  ironalloy.log.info('union with director running on 8080');
});

//Last resort
process.on('uncaughtException', function (err) {
  console.error(err.stack);
  ironalloy.log.info('union crashed, BAD!');
  process.exit(1);
});

module.exports.app = ironalloy;

