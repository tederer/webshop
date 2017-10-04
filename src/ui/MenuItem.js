/* global shop, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

shop.ui.MenuItem = function MenuItem(selector) {
   
   this.setSelected = function setSelected() {
      shop.Context.log('setSelected not yet implemented');
   };
   
   this.setDeSelected = function setDeSelected() {
      shop.Context.log('setDeSelected not yet implemented');
   };
   
   this.getSelector = function getSelector() {
      return selector;
   };
   
   this.onUserSelection = function onUserSelection(callback) {
      $(selector).on('click', function() { callback(selector); });
   };
};
   
   