var controller = require("./controller");

// Define routing table
var routes = {
  '/' : {
    get: controller.showIndex
  },
  '/admin/?' : {
    get: controller.showAdmin,
    '/create' : {
      get: controller.showCreate
    },
    '/delete' : {
      get: controller.show404,
      '/:pagename' : {
        get: controller.deletePage
      }
    },
    '/update' : {
      get: controller.showUpdate,
      post: controller.postUpdate,
      '/:pagename': {
        get: controller.updateCreate
      }
    }
  },
  '/login' : {
    get: controller.showLogin,
    post: controller.postLogin
  },
  '/logout' : {
    get: controller.logout
  },
  '/:pagename/?' : {
    get: controller.showPage
  }
};
module.exports.routes = routes;
