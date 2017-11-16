/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.CostsCalculator = function CostsCalculator(productConfigs) {

   var SHIPPING_COSTS_AUSTRIA = 4.6;
   var SHIPPING_COSTS_NON_AUSTRIA = 11.25;
   
   var cartContent;
   var countryOfDestination;
   
   this.setCartContent = function setCartContent(content) {
      cartContent = content;
   };
   
   this.setCountryOfDestination = function setCountryOfDestination(countryCode) {
      countryOfDestination = countryCode;
   };
   
   this.calculateCosts = function calculateCosts() {
      var totalProductCosts = 0;
      var shippingCosts;
      
      for(var index = 0; cartContent !== undefined && index < cartContent.length; index++) {
         var productConfig = productConfigs.get(cartContent[index].productId);
         totalProductCosts += productConfig.price * cartContent[index].quantity;
      }

      if (countryOfDestination !== undefined) {
         if (countryOfDestination === 'AT') {
            shippingCosts = (totalProductCosts >= 50) ? 0 : SHIPPING_COSTS_AUSTRIA;
         } else {
            shippingCosts = (totalProductCosts >= 100) ? 0 : SHIPPING_COSTS_NON_AUSTRIA;
         }
      }
      var totalCosts = (shippingCosts !== undefined) ? totalProductCosts + shippingCosts : undefined;
      return {totalCosts: totalCosts, shippingCosts: shippingCosts};
   };
};
