/* global shop, assertNamespace */

require('../NamespaceUtils.js');

assertNamespace('shop.ui');

shop.ui.MenuItem = function MenuItem(selector) {
   
   this.setSelected = function setSelected() {
      console.log('setSelected not yet implemented');
   };
   
   this.setDeSelected = function setDeSelected() {
      console.log('setDeSelected not yet implemented');
   };
   
   this.getSelector = function getSelector() {
      return selector;
   };
   
   this.onUserSelection = function onUserSelection(callback) {
      $(selector).on('click', function() { callback(selector); });
   };
};
   
   