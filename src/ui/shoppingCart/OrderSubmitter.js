/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('../../Context.js');
require('../../Topics.js');

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.OrderSubmitter = function OrderSubmitter() {
   this.submit = function submit(orderText) {
      shop.Context.log('submit of OrderSubmitter not yet implemented');
   };
};
