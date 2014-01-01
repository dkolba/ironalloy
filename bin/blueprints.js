var blueprints = {

  adminIndex: {
    pageobject: {
      title: "Admin Page",
      desc: "I am the main admin page",
      mastertemplate: "adminbasis",
      pagesingleset: ["adminWelcome"],
      pagemultiset: []
    },
    adminWelcome: {
      partial: "adminwelcome",
      destination: "admincontent",
      greeting: "ahoi",
      collection:"none"
    }
  },

  adminLogin: {
    pageobject: {
      title: "Admin Login",
      desc: "I am the admin login page",
      mastertemplate: "adminbasis",
      pagesingleset: ["adminLoginForm"],
      pagemultiset: []
    },
    adminLoginForm : {
      partial:"adminlogin",
      destination:"admincontent",
      greeting:"ahoi",
      collection:"none"
    }
  },

  adminPasswd: {
    pageobject: {
      title: "Change admin password",
      desc: "Change me, I am weak",
      mastertemplate: "adminbasis",
      pagesingleset: ["adminPasswdForm"],
      pagemultiset: []
    },
    adminPasswdForm: {
      partial:"adminpasswd",
      destination:"admincontent",
      greeting:"ahoi",
      collection:"none"
    }
  },

  adminCreate: {
    pageobject: {
      title: "Create new page",
      desc: "Create new page",
      mastertemplate: "adminbasis",
      pagesingleset: ["adminCreateForm"],
      pagemultiset: []
    },
    adminCreateForm: {
      partial:"admincreate",
      destination:"admincontent",
      greeting:"ahoi",
      collection:"none"
    }
  },

  adminFragments: {
    pageobject: {
      title: "Show all Fragments of this page",
      desc: "Show all Fragments of this page",
      mastertemplate: "adminbasis",
      pagesingleset: ["adminFragmentsForm"],
      pagemultiset: []
    },
    adminFragmentsForm: {
      partial:"adminfragments",
      destination:"admincontent",
      greeting:"ahoi",
      collection:"none"
    }
  },

  adminList: {
    pageobject: {
      title: "List all available pages",
      desc: "Existing pages",
      mastertemplate: "adminbasis",
      pagesingleset: ["allpagesframe"],
      pagemultiset: ["allpages"]
    },
    adminListFrame: {
      partial:"adminlistframe",
      destination:"admincontent",
      collection:"none"
    },
    adminListTable: {
      collection:"allpages"
    }
  },

  404: {
    pageobject: {
      title: "404 Page",
      desc: "This is not the page you are looking for",
      mastertemplate: "frontpage",
      pagesingleset: ["404message"],
      pagemultiset: []
    },
    iamgone: {
      partial: "404",
      destination: "pagecontent",
      greeting: "ahoi",
      collection:"none"
    }
  }
};

blueprints.adminIndex.finalarray = [blueprints.adminIndex.adminWelcome];
blueprints.adminLogin.finalarray = [blueprints.adminLogin.adminLoginForm];
blueprints.adminPasswd.finalarray = [blueprints.adminPasswd.adminPasswdForm];
blueprints.adminCreate.finalarray = [blueprints.adminCreate.adminCreateForm];
blueprints.adminFragments.finalarray = [blueprints.adminFragments.adminFragmentsForm];
blueprints.adminList.finalarray = [blueprints.adminList.adminListFrame];
blueprints[404].finalarray = [blueprints[404].iamgone];

module.exports = blueprints;

