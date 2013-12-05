var blueprints = {

  adminIndex: {
    pageobject: {
      title: 'Admin Page',
      description: 'I am the main admin page',
      mastertemplate: 'adminbasis',
      pagesingleset: ['adminWelcome'],
      pagemultiset: []
    },
    adminWelcome: {
      partial: 'adminwelcome',
      destination: 'admincontent',
      greeting: 'ahoi',
      collection:'none'
    }
  },

  adminLogin: {
    pageobject: {
      title: 'Admin Login',
      description: 'I am the admin login page',
      mastertemplate: 'adminbasis',
      pagesingleset: ['adminLoginForm'],
      pagemultiset: []
    },
    adminLoginForm : {
      partial:'adminlogin',
      destination:'admincontent',
      greeting:'ahoi',
      collection:'none'
    }
  },

  adminPasswd: {
    pageobject: {
      title: 'Change admin password',
      description: 'Change me, I am weak',
      mastertemplate: 'adminbasis',
      pagesingleset: ['adminPasswdForm'],
      pagemultiset: []
    },
    adminPasswdForm: {
      partial:'adminpasswd',
      destination:'admincontent',
      greeting:'ahoi',
      collection:'none'
    }
  },

  adminCreate: {
    pageobject: {
      title: 'Create new page',
      description: 'Create new page',
      mastertemplate: 'adminbasis',
      pagesingleset: ['adminCreateForm'],
      pagemultiset: []
    },
    adminCreateForm: {
      partial:'admincreate',
      destination:'admincontent',
      greeting:'ahoi',
      collection:'none'
    }
  }
};

blueprints.adminIndex.finalarray = [blueprints.adminIndex.adminWelcome];
blueprints.adminLogin.finalarray = [blueprints.adminLogin.adminLoginForm];
blueprints.adminPasswd.finalarray = [blueprints.adminPasswd.adminPasswdForm];
blueprints.adminCreate.finalarray = [blueprints.adminCreate.adminCreateForm];

module.exports = blueprints;
