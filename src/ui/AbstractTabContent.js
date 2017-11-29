/* global shop, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../bus/Bus.js');
require('../Promise.js');

assertNamespace('shop.ui');

shop.ui.AbstractTabContent = function AbstractTabContent() {
   
   /**
    * returns a common.Promise
    */
   this.getHtmlContent = function getHtmlContent() {
      shop.Context.log('Derived object does not override getHtmlContent() in AbstractTabContent!');
   };
   
   this.onContentChanged = function onContentChanged(callback) {
      shop.Context.log('Derived object does not override onContentChanged() in AbstractTabContent!');
   };
   
   
};
