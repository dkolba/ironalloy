"use strict";

var fs = require("fs")
  , plates = require("plates")
  , app = require("./app")
  , crypto = require("crypto")
  , dishwasher = require("dishwasher")
  , mappings = require("./mappings.js");

// Load templates
dishwasher.setFolder('../templates/');

// Read all partials from disk 
var partials = {};
var filenames = fs.readdirSync(__dirname + '/../templates/');
for (var i = 0; i < filenames.length; i++) {
  partials[filenames[i].slice(0, -5)] = fs.readFileSync(__dirname + '/../templates/' + filenames[i], 'utf8');
}
// This inserts a partial at a certain position
function preRenderView (ruffian, partial, attribute, destination) {
  var mapping = plates.Map();
  mapping.where(attribute).is(destination).append(partials[partial]);
  return plates.bind(ruffian, null, mapping);
}

// This renders the final template
function renderView (req, res, blueprint, redisdata) {
  var ruffian = partials[blueprint[0]]; //The starting point template
  for (var i = 1; i < blueprint.length; i++) { // Iterate over all blueprint objects
    ruffian = preRenderView(ruffian, blueprint[i].partial, blueprint[i].attribute, blueprint[i].destination); // Modify ruffian via preRenderView
  }
  if (redisdata) {
    if(redisdata instanceof Array) {
      ruffian = renderCollection(ruffian, "adminupdate", redisdata);
    } else {
      ruffian = renderRedisData(ruffian, redisdata);
    }
  }
  app.etags[req.url] = (crypto.createHash('md5').update(ruffian, 'utf8').digest("hex")).toString();
  if (res.statusCode === 404) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('etag', app.etags[req.url]);
    res.end(ruffian);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html',
                         'ETag': app.etags[req.url],
                         'Cache-Control': "max-age=1000000"
                       });
    res.end(ruffian);
  }
}

function renderRedisData (ruffian, redisdata) {
  //Use simple plates case to render Redis data
  ruffian = plates.bind(ruffian, redisdata);
  //Use explicit plates case to render html head variables
  var map = plates.Map();
  map.tag('title').use("pagetitle");
  var output = plates.bind(ruffian, redisdata, map);
  return output;
}

function renderCollection (ruffian, collectionpartial, redisdata) {
  var output = plates.bind(partials[collectionpartial], redisdata);
  var mapping = plates.Map();
  mapping.where("id").is("admincontent").append(output);
  return plates.bind(ruffian, null, mapping);
}


function renderView2(req, res, pageobj, finalarray) {
  var hypertext = dishwasher.rinse(pageobj,
                                   finalarray,
                                   mappings.pagemap,
                                   mappings.singlemap,
                                   mappings.multimap);

  app.etags[req.url] = (crypto
                         .createHash('md5')
                         .update(hypertext, 'utf8')
                         .digest("hex"))
                         .toString();

  res.writeHead(200, {'Content-Type': 'text/html',
                      'ETag': app.etags[req.url],
                      'Cache-Control': "max-age=1000000"
                     });

  res.end(hypertext);
}

module.exports.renderView = renderView;
module.exports.renderView2 = renderView2;
