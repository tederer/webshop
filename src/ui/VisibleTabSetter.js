/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

/**
 * Publishes a SET_VISIBLE_TAB command when the component, identified by the selector, gets clicked.
 */
shop.ui.VisibleTabSetter = function VisibleTabSetter(selector, tabName) {
   var bus = shop.Context.bus;
   
   var onClicked = function onClicked() {
      bus.sendCommand(shop.topics.SET_VISIBLE_TAB, tabName);
   };
   
   $(selector).on('click', onClicked);
};
