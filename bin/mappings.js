var plates = require('plates')
  , mappings = {}
  , setFolder = require('dishwasher').setFolder
  , templates = setFolder('../templates/', __dirname);

mappings.admin= {};
mappings.index = {};

/*
 * PAGE MAPPINGS
 */

mappings.admin.pagemap = function pagemap () {
  var map = plates.Map();
  map.where('name').is('description').use('desc').as('content');
  map.tag('title').use('title');

  return map;
};

mappings.index.pagemap = function pagemap () {
  var map = plates.Map();
  map.where('name').is('description').use('desc').as('content');
  map.tag('title').use('title');
  map.where('id').is('comic').use('image').as('src');

  return map;
};


/*
 * SINGLE MAPPINGS
 */

mappings.admin.singlemap = function singlemap (singledest) {
  var map = plates.Map();
  map.where('id').is(singledest).use('fragment');

  return map;
};

mappings.index.singlemap = function singlemap (singledest) {
  var map = plates.Map();
  map.where('id').is(singledest).use('fragment');

  return map;
};


/*
 * MULTI MAPPINGS
 */

mappings.admin.multimap = function multimap (collection) {
  var map = plates.Map();
  map.where('id').is(collection).use('fragment');

  return map;
};

mappings.index.multimap = function multimap (collection) {
  var map = plates.Map();
  map.where('id').is(collection).use('fragment');

  return map;
};


/*
 * FRAGMENTS MAPPINGS
 */

mappings.admin.fragments = function fragments() {
  var map = plates.Map();
  map.where('name').is('pagename').use('pagename');
  map.where('name').is('pagetitle').use('pagetitle');
  map.where('name').is('desc').use('desc');
  map.where('name').is('pagecontent').use('pagecontent');
  map.where('name').is('title').use('title');
  map.where('name').is('template').use('mastertemplate');
  map.where('name').is('pagefragments').use('pagefragments');
  map.where('name').is('partialtemplate').use('partialtemplate');
  map.where('name').is('receiver').use('receiver');
  map.where('name').is('image').use('image');
  map.where('action').is('/admin/update/pagename/fragments/').insert('posturl');
  map.where('href').is('fragmentslink').insert('fragmentsurl');
  map.where('href').is('collectionslink').insert('collectionsurl');

  return map;
};

mappings.index.fragments = function fragments() {
  var map = plates.Map();

  return map;
};



/*
 * COLLECTIONS MAPPINGS
 */

mappings.admin.collections = function fragments() {
  var map = plates.Map();
  map.where('class').is('pagename').use('pagename');
  map.where('href').is('pagename').insert('adminurl');
  map.where('class').is('nu').use('pagecontent');

  return map;
};

mappings.index.collections = function collections() {
  var map = plates.Map();
  map.class('news').to('pagecontent');
  map.where('href').is('linktosite').insert('sitelink');

  return map;
};

module.exports = mappings;

