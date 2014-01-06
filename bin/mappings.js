// TODO: mapping for allpages partial (insert pagename into href attribute)

var plates = require('plates')
  , mappings = {};

mappings.base = {};

mappings.base.singlemap = function singlemap (singledest) {
  var map = plates.Map();
  map.where('id').is(singledest).use('fragment');

  return map;
};

mappings.base.multimap = function multimap (collection) {
  var map = plates.Map();
  map.where('id').is(collection).use('fragment');

  return map;
};

mappings.base.pagemap = function pagemap () {
  var map = plates.Map();
  map.where('name').is('description').use('desc').as('content');
  map.tag('title').use('title');

  return map;
};

mappings.base.fragments = function fragments() {
  var map = plates.Map();
  map.where('name').is('pagename').use('pagename');
  map.where('name').is('pagetitle').use('pagetitle');
  map.where('name').is('desc').use('desc');
  map.where('name').is('pagecontent').use('pagecontent');
  map.where('name').is('title').use('title');
  map.where('name').is('template').use('mastertemplate');
  map.where('name').is('pagefragments').use('pagefragments');
  map.where('action').is('/admin/update/pagename/fragments/').insert('posturl');

  return map;
};

mappings.base.collections = function fragments() {
  var map = plates.Map();
  map.where('class').is('pagename').use('pagename');
  map.where('href').is('pagename').insert('adminurl');

  return map;
};

module.exports = mappings;

