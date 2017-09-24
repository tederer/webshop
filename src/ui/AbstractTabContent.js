/* global shop, assertNamespace */

require('../NamespaceUtils.js');

assertNamespace('shop.ui');

shop.ui.AbstractTabContent = function AbstractTabContent() {
   
   this.getSelector = function getSelector() {
      console.log('Subclass does not override getSelector() in AbstractTabContent!');
   };
   
   this.show = function show() {
      $(this.getSelector()).css('visibility', 'visible');
   };
   
   this.hide = function hide() {
      $(this.getSelector()).css('visibility', 'hidden');
   };
};
   
   