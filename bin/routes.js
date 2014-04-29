var controller = require('./controller');

// Define routing table
var routes = {
  "/" : {
    get: controller.showIndex
  },
  "/admin/?" : {
    get: controller.showAdmin,
    "/create/?" : {
      get: controller.show404,
      "/page/?" : {
        get: controller.showCreate
      },
      "/collection/?" : {
        get: controller.showCollection,
      },
      "/upload/?" : {
        get: controller.showUpload,
      }
    },
    "/delete/?" : {
      get: controller.show404,
      "/page/?" : {
        get: controller.show404,
        "/:pagename/?": {
          get: controller.deletePage
        },
      },
      "/collection/?" : {
        get: controller.show404,
        "/:collectionname/?": {
          get: controller.deleteCollection
        },
      },
      "/upload/?" : {
        get: controller.show404,
        "/:uploadname/?": {
          get: controller.deleteUpload
        },
      },
    },
    "/update/?" : {
      get: controller.show404,
      "/collection/?": {
        get: controller.showItem,
        post: controller.postCollection,
        "/:collectionname/?": {
          get: controller.updateCollection,
        }
      },
      "/page/?" : {
       get: controller.showItem,
       post: controller.postUpdate,
        "/:pagename/?": {
          get: controller.updateCreate,
          "/fragments/?": {
            get: controller.updateComponents,
            post: controller.postComponents
          },
          "/collections/?": {
            get: controller.updateComponents,
            post: controller.postComponents
          }
        }
      }
    },
    "/upload/?" : {
      get: controller.showItem,
      post: controller.postUpload,
      stream: true
    },
    "/passwd/?" : {
      get: controller.showPasswd,
      post: controller.postPasswd
    }
  },
  "/login/?" : {
    get: controller.showLogin,
    post: controller.postLogin,
    stream: true
  },
  "/logout/?" : {
    get: controller.logout
  },
  "/sitemap.xml?" : {
    get: controller.showSitemap
  },
  "/:pagename/?" : {
    get: controller.showPage
  }
};

module.exports.routes = routes;

