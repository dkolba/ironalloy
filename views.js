"use strict";

var fs = require("fs")
  , plates = require("plates");

// Read template from file, render via plates and send response
function gettemplate (req, res, template, pagename, redisdata) {
  fs.readFile('templates/' + template + '.html', "utf8", function (err, data) {
    if(err) throw err;
    var content = { "pagename": pagename,
                    "pagecontent": redisdata}
      , output = plates.bind(data, content);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(output);
  });
}

// - fs.read.basistemplate
// - fs.read.htmlfragment
var partials = {};
var filenames = fs.readdirSync('templates/');
for (var i = 0; i < filenames.length; i++) {
  partials[filenames[i].slice(0, -5)] = fs.readFileSync('templates/' + filenames[i], 'utf8');
}

// This inserts a partial at a certain position
function preRenderView (ruffian, partial, attribute, destination) {
  var mapping = plates.Map();
  mapping.where(attribute).is(destination).append(partials[partial]);
  // console.log(plates.bind(ruffian, null, mapping));
  return plates.bind(ruffian, null, mapping);
}

// This renders the final template
function renderView (req, res, blueprint, redisdata) {
  var ruffian = partials.basis; //The starting point template
  for (var i = 0; i < blueprint.length; i++) { // Iterate over all blueprint objects
    ruffian = preRenderView(ruffian, blueprint[i].partial, blueprint[i].attribute, blueprint[i].destination); // Modify ruffian via preRenderView
  console.log(ruffian);
  }
  if (redisdata) {
    renderRedisData(req, res, ruffian, redisdata);
  } else if (res.statusCode === 404) {
    res.setHeader('Content-Type', 'text/html');
    res.end(ruffian);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(ruffian);
  }
}

function renderRedisData (req, res, ruffian, redisdata) {
  var content = { "pagecontent": redisdata }
      , output = plates.bind(ruffian, content);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(output);
}

module.exports.gettemplate = gettemplate;
module.exports.renderView = renderView;
