/* global shop, assertNamespace */

require('../NamespaceUtils.js');

assertNamespace('shop.ui');

shop.ui.TabController = function TabController() {
   
   var config = [];
   
   var getTabContentFor = function getTabContentFor(menuItemSelector) {
      var tabContent;
      
      for (var index = 0; index < config.length && tabContent === undefined; index++) {
         if (config[index].menuItem.getSelector() === menuItemSelector) {
            tabContent = config[index].tabContent;
         }
      }
      
      return tabContent;
   };
   
   var onUserSelection = function onUserSelection(menuItemSelector) {
      var tabContent = getTabContentFor(menuItemSelector);
      var selectorOfActiveTab;
      
      if (tabContent !== undefined) {
         selectorOfActiveTab = tabContent.getSelector();
      }
      
      config.forEach(function(tab) {
         var content = tab.tabContent;
         if (content.getSelector() === selectorOfActiveTab) {
            content.show();
         } else {
            content.hide();
         }
      });
   };
   
   this.addTab = function addTab(menuItem, tabContent) {
      config[config.length] = { menuItem: menuItem, tabContent: tabContent };
      menuItem.onUserSelection(onUserSelection);
   };
};
   
   