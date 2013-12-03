var plates = require('plates')
  , mappings = {};

mappings.singlemap = function singlemap (singledest) {
  var map = plates.Map();
  map.where('id').is(singledest).use('fragment');
  return map;
};

mappings.multimap = function multimap (collection) {
  var map = plates.Map();
  map.where('id').is(collection).use('fragment');
  return map;
};

mappings.pagemap = function pagemap () {
  var map = plates.Map();
  map.where('name').is('description').use('desc').as('content');
  map.tag('title').use('title');
  return map;
};

module.exports = mappings;
