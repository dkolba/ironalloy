// TODO: Cache-Control needs to get removed for /admin routes
'use strict';

var fs = require('fs')
  , plates = require('plates')
  , app = require('./app')
  , crypto = require('crypto')
  , dishwasher = require('dishwasher')
  , mappings = require('./mappings.js');

// Load templates
dishwasher.setFolder('../templates/', __dirname);

function renderView(req, res, pageobj, finalarray, mappings) {
  var hypertext = dishwasher.rinse(pageobj, finalarray, mappings.pagemap,
    mappings.singlemap, mappings.multimap);

  app.etags[req.url] = (crypto.createHash('md5')
                              .update(hypertext, 'utf8')
                              .digest('hex'))
                              .toString();

  if (res.statusCode === 404) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('etag', app.etags[req.url]);
    res.end(hypertext);
  }
  else {
    res.writeHead(200, {
      "Content-Type": "text/html",
      "ETag": app.etags[req.url],
      "Cache-Control": "max-age=1000000"
    });
    res.end(hypertext);
  }
}

module.exports.renderView = renderView;

