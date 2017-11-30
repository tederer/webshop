/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

shop.ui.VisibleTabController = function VisibleTabController(tabs, containerSelector) {
   
   var visibleTabId;
   
   var uiComponentProvider = function uiComponentProvider(selector) {
      return $(selector);
   };
   
   var updateVisibleTab = function updateVisibleTab() {
      tabs.forEach(function(currentTab) {
         var currentTabId = currentTab.getId();
         var visible = visibleTabId === currentTabId;
         var tabUiComponent = $(containerSelector + ' #' + currentTabId);
         if (visible) {
            var tabHeight = uiComponentProvider(containerSelector + ' #' + currentTabId).outerHeight();
            tabUiComponent.css('top', '0em');
            $(containerSelector).height(tabHeight);
         } else {
            tabUiComponent.css('top', '-9999em');
         }
         tabUiComponent.css('visibility', visible ? 'visible' : 'hidden');
      });
   };
   
   var onVisibleTab = function onVisibleTab(tabId) {
      visibleTabId = tabId;
      updateVisibleTab();
   };
   
   var onTabContentChanged = function onTabContentChanged(selector) {
      updateVisibleTab();
   };
   
   tabs.forEach(function(tab) {
      tab.addTabContentChangedListener(onTabContentChanged);
   });
   
   shop.Context.bus.subscribeToPublication(shop.topics.VISIBLE_TAB, onVisibleTab);
};
