// TODO: Refactor test for collections/collection/fragments path into function
// TODO: Replace all Redis sets with sorted sets
// TODO: Redis error handling
// TODO: Delete from pageObj if Redis answers with null
'use strict';
var services = require('./services')
  , controller = require('./controller')
  , blueprints = require('./blueprints')
  , ironalloy = require('./ironalloy');

// This fetches data from redis and builds an object and array which can be used
// by dishwasher.
function getPageObj (req, res, pagename, mappings, callback) {
  var pageobj, multiarray;
  var finalarray = [];

  // Fetch pagename from redis
  services.redisClient.hgetall('page:' + pagename, getPageSingleArray);

  // Fetch the singleset which belongs to pagename key from redis
  function getPageSingleArray(err, hash) {
    if (hash) {
      pageobj = hash;
      pageobj.pagesingleset = [];
      pageobj.pagemultiset = [];
      services.redisClient.smembers('page:' + pagename + ':singleset',
        resolveSingleArray);
    }
    else {
      controller.show404(null, req, res);
    }
  }
  // Fetch each object from singleset from redis
  function resolveSingleArray (err, redisset) {
    if(redisset.length){
      var multi = services.redisClient.multi();
      pageobj.pagesingleset = redisset;

      for (var i = 0; i < redisset.length; i++) {
        multi.hgetall('page:' + redisset[i]);
      }
      multi.exec(function (err, array) {
        var tempobj = {collname:'none'};

        // Add 'collection' key and push object into finalarray
        array.map(injectObjectCollection, tempobj);
      });
    }

    // Fetch the multiset which belongs to pagename key from redis
    services.redisClient.smembers('page:' + pagename + ':multiset',
      getPageMultiArray);
  }

  // Fetch each
  function getPageMultiArray (err, redisset) {
    if(redisset.length) {
      var multi = services.redisClient.multi();

      pageobj.pagemultiset = redisset;

      // Fetch each collection referenced in pagemultiset
      for (var i = 0; i < redisset.length; i++) {
        multi.zrange('collection:' + redisset[i], 0, -1);
      }

      // Now we have an array of arrays, each one represents a collection
      multi.exec(function (err, multiarray) {
        multiarray.forEach(function (key, index) {
          resolveMultiArray(key, index, multiarray);
        });
      });
    }
    else {
      callback(req, res, pageobj, finalarray, mappings);
    }
  }

  // Fetches the pageobjects referenced in each array and pushes to finalarray
  function resolveMultiArray (redisset, index, multiarray) {
    var arrayname = pageobj.pagemultiset[index]
      ,  multi = services.redisClient.multi();

    for (var i = 0; i < redisset.length; i++) {
      multi.hgetall('page:' + redisset[i]);
    }
    multi.exec(function (err, array) {
      var tempobj = {collname:arrayname};

      // Add "collection" key and push object into finalarray
      array.map(injectObjectCollection, tempobj);

      // If the current element is the last one in multiarray fire the callback
      if (index + 1  === multiarray.length) {
        callback(req, res, pageobj, finalarray, mappings);
      }
    });
  }

  // Adds collection key and pushes to finalarray
  function injectObjectCollection(element) {
    element.collection = this.collname;
    finalarray.push(element);
  }
}

function getAdminObj(req, res, blueprint, pagename, mappings, callback) {
  var bp = blueprints[blueprint];

  // Remove blueprint configuration object from finalarray, retcon config data
  // and pageobject from redis and inject into finalarray.
  function modifyFinalarray(err, hash) {
    var retconned = {}
      , finalarray = []
      , hash = hash || '';

    // Delete keys of which we know we want to replace them (just in case...).
    delete hash.destination;
    delete hash.partial;
    delete hash.collection;

    // Clone finalarray blueprint object and pageobject into a new object. 
    for (var key1 in hash) {
      retconned[key1] = hash[key1];
    }
    for (var key2 in bp.finalarray[0]) {
      retconned[key2] = bp.finalarray[0][key2];
    }

    retconned.pagename = pagename;

    finalarray.push(retconned);

    callback(req, res, bp.pageobject, finalarray, mappings);
  }

  // Check if we are dealing with existing data and act accordingly.
  if (pagename) {
    services.redisClient.hgetall('page:' + pagename, modifyFinalarray);
  }
  else {
    callback(req, res, bp.pageobject, bp.finalarray, mappings);
  }
}

function getAdminComponents (req, res, blueprint, pagename, mappings,
  callback) {
    var bp = blueprints[blueprint]
    , pagepath = req.url.split('/')
    , adminurl;

    //Check if we need pages or collections and set variable
    if(pagepath.indexOf('collections') > -1) {
      adminurl = '/admin/update/' + pagename + '/collections/';
      services.redisClient.smembers('page:' + pagename + ':multiset',
        insertComponents);
    }
    else if(pagepath.indexOf('fragments') > -1) {
      adminurl = '/admin/update/' + pagename + '/fragments/';
      services.redisClient.smembers('page:' + pagename + ':singleset',
        insertComponents);
    }
    else {
      ironalloy.app.log.info('This should never happen');
    }

    function insertComponents(err, redisset) {
      if(err) throw err;

      var retconned = {}
      , finalarray = [];

      // Copy keys/values from blueprint configuration object
      for (var key in bp.finalarray[0]) {
        retconned[key] = bp.finalarray[0][key];
      }

      retconned.pagename = pagename;
      retconned.pagefragments = redisset.toString();
      retconned.posturl = adminurl;

      finalarray.push(retconned);

      callback(req, res, bp.pageobject, finalarray, mappings);
    }
}

function getAdminCollection (req, res, blueprint, pagename, mappings,
  callback) {
    var bp = blueprints[blueprint]
    , pagepath = req.url.split('/');

    //Check if we need pages or collections and set variable
    services.redisClient.zrange('collection:' + pagename, 0, -1,
      insertComponents);

    function insertComponents(err, redisset) {
      if(err) throw err;

      var retconned = {}
      , finalarray = [];

      // Copy keys/values from blueprint configuration object
      for (var key in bp.finalarray[0]) {
        retconned[key] = bp.finalarray[0][key];
      }

      retconned.pagename = pagename;
      retconned.pagefragments = redisset.toString();
      retconned.posturl = '/admin/update/collection/';

      finalarray.push(retconned);

      callback(req, res, bp.pageobject, finalarray, mappings);
    }
}

function getAdminArray(req, res, blueprint, pagename, mappings, callback) {
  var bp = blueprints[blueprint]
    , finalarray  = []
    , pagepath = req.url.split('/')
    , sortedset = '';

  //Check if we need pages or collections and set variable
  if(pagepath.indexOf('collection') > -1) {
    sortedset = 'allcollections';
  }
  else {
    sortedset = 'allpages';
  }

  // Deep copy of array of objects bp.finalarray
  for (var i = 0; i < bp.finalarray.length; i++) {
    finalarray.push({});
    for(var key in bp.finalarray[i]) {
      finalarray[i][key] = bp.finalarray[i][key];
    }
  }

  // Get sorted set of all existing pages
  services.redisClient.zrange(sortedset, 0, -1,
    function(err, allpagesarray) {
      if(err) throw err;

      // Insert object for each page in allpagesarray
      allpagesarray.forEach(function(element)  {
        var tmp = {};
        if(sortedset === 'allpages') {
          tmp.adminurl = '/admin/update/' + element;
        }
        else {
          tmp.adminurl = '/admin/update/collection/' + element;
        }
        tmp.pagename = element;
        for (var key in bp.adminListTable) {tmp[key] = bp.adminListTable[key];}
        finalarray.push(tmp);
      });

      callback(req, res, bp.pageobject, finalarray, mappings);
  });
}

function setPassword (req, res, hash) {
  services.redisClient.set('root', hash, function(err) {
    res.redirect('/admin', 301);
  });
}

function removePageItems(req, res, pagename) {
  var multi = services.redisClient.multi();

  multi.del('page:' + pagename);
  multi.del('page:' + pagename + ':singleset');
  multi.del('page:' + pagename + ':multiset');
  multi.zrem(['allpages', pagename]);
  multi.exec(function (err) {
    res.redirect('/admin/update', 301);
  });
}

function updatePageItems (req, res) {
  var formdata = req.body
    , multi = services.redisClient.multi();

  multi.hmset('page:' + formdata.pagename, {
    "pagetitle": formdata.pagetitle,
    "pagecontent": formdata.pagecontent,
    "desc": formdata.desc,
    "title": formdata.title,
    "mastertemplate": formdata.template
  });
  multi.zadd(['allpages', 0, formdata.pagename]);
  multi.exec(function (err) {
    res.redirect('/admin/update', 301);
  });
}

function updateComponentItems (req, res) {
  var formdata = req.body
    , pagepath = req.url.split('/')
    , adminurl
    , pagename = formdata.pagename
    , multi = services.redisClient.multi()
    , affix
    , suffix
    , components = formdata.pagefragments.split(',');

  // Check if we need pages or collections and set variable
  if(pagepath.indexOf('collection') > -1) {
    adminurl = '/admin/update/collection/';
    affix = 'collection:';
    suffix = '';
    multi.zadd(['allcollections', 0, pagename]);
  }
  else if(pagepath.indexOf('collections') > -1) {
    adminurl = '/admin/update/' + pagename;
    affix = 'page:';
    suffix = ':multiset';
  }
  else if(pagepath.indexOf('fragments') > -1) {
    adminurl = '/admin/update/' + pagename;
    affix = 'page:';
    suffix = ':singleset';
  }
  else {
    ironalloy.app.log.info('This should never happen as well');
  }

  multi.del(affix + pagename + suffix);
  multi.sadd(affix + pagename + suffix, components);
  multi.exec(function (err) {
    res.redirect(adminurl, 301);
  });
}


function updateComponentCollection (req, res) {
  var formdata = req.body
    , pagename = formdata.pagename
    , multi = services.redisClient.multi()
    , components = formdata.pagefragments.split(',')
    , collection = [];

  //Add collection to 'allcollections' in redis, so they can be listed later on
  multi.zadd(['allcollections', 0, pagename]);

  //Prepare a sorted set for redis
  components.forEach(function(key, index) {
    collection.push(index, key);
  });
  collection.unshift('collection:' + pagename );

  multi.del('collection:' + pagename);
  multi.zadd(collection);
  multi.exec(function (err) {
    res.redirect('/admin/update/collection/', 301);
  });
}

module.exports.getPageObj = getPageObj;
module.exports.getAdminObj = getAdminObj;
module.exports.getAdminComponents = getAdminComponents;
module.exports.getAdminCollection = getAdminCollection;
module.exports.getAdminArray = getAdminArray;
module.exports.setPassword = setPassword;
module.exports.removePageItems = removePageItems;
module.exports.updatePageItems = updatePageItems;
module.exports.updateComponentItems = updateComponentItems;
module.exports.updateComponentCollection = updateComponentCollection;
