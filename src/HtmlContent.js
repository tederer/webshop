/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./Promise.js');

assertNamespace('shop');

shop.HtmlContent = function HtmlContent(selector) {
   
   this.set = function set(content) {
      $(selector).html(content);
   };
};
