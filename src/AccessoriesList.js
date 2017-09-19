/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./AbstractTabContent.js');

assertNamespace('shop.ui');

shop.ui.AccessoriesList = function AccessoriesList(selector, configProvider, optionalSetHtmlContent) {
   
   var defaultSetHtmlContent = function defaultSetHtmlContent(content) {
      $(selector).html(content);
   };
   
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultSetHtmlContent : optionalSetHtmlContent.bind(this, selector);
   
   this.getSelector = function getSelector() {
      return selector;
   };
};

shop.ui.AccessoriesList.prototype = new shop.ui.AbstractTabContent();