var blueprints = {adminIndex:{}};

blueprints.adminIndex.pageobject = {
  title:'Admin Page',
  description: 'I am the main admin page',
  mastertemplate:'adminbasis',
  pagesingleset: [ 'adminwelcome'],
  pagemultiset: []
};

blueprints.adminIndex.adminWelcome = {
  partial:'adminwelcome',
  destination:'admincontent',
  greeting:'ahoi',
  collection:'none'
};

blueprints.adminIndex.finalarray = [
  blueprints.adminIndex.adminWelcome
];

module.exports = blueprints;
