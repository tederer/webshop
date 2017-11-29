/* global shop, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../bus/Bus.js');
require('../Promise.js');

assertNamespace('shop.ui');

shop.ui.AbstractTabContent = function AbstractTabContent() {
   
   this.getHtmlContent = function getHtmlContent() {
      shop.Context.log('Derived object does not override getHtmlContent() in AbstractTabContent!');
   };
   
   this.addContentChangedListener = function addContentChangedListener(callback) {
      shop.Context.log('Derived object does not override addContentChangedListener() in AbstractTabContent!');
   };
};
