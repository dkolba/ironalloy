var controller = require("./controller");

// Define routing table
var routes = {
  '/' : {
    get: controller.showIndex
  },
  '/admin' : {
    get: controller.showAdmin
  },
  '/create' : {
    get: controller.showCreate
  },
  '/delete' : {
    '/:pagename' : {
      get: controller.deletePage
    },
    get: controller.show404
  },
  '/update' : {
    '/:pagename': {
      get: controller.updateCreate
    },
    get: controller.showUpdate,
    post: controller.postUpdate
  },
  '/login' : {
    get: controller.showLogin,
    post: controller.postLogin
  },

  '/:pagename' : {
    get: controller.showPage
  }
};
module.exports.routes = routes;
