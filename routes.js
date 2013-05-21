var ap = require("./controller");
// Define routing table
var routes = {
  '/' : {
    get: ap.showIndex
  },
  '/admin' : {
    get: ap.showAdmin
  },
  '/create' : {
    get: ap.showCreate
  },
  '/delete' : {
    '/:pagename' : {
      get: ap.deletePage
    },
    get: ap.show404
  },
  '/update' : {
    '/:pagename': {
      get: ap.updateCreate
    },
    get: ap.showUpdate,
    post: ap.postUpdate
  },
  '/login' : {
    get: ap.showLogin,
    post: ap.postLogin
  },

  '/:pagename' : {
    get: ap.showPage
  }
};
module.exports.routes = routes;
