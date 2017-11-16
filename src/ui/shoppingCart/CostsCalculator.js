/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.CostsCalculator = function CostsCalculator(productConfigs) {

   var SHIPPING_COSTS_AUSTRIA = 4.6;
   var SHIPPING_COSTS_NON_AUSTRIA = 11.25;
   
   var cartContent;
   var countryOfDestination;
   
   var cartContainsProducts = function cartContainsProducts() {
      return cartContent !== undefined && cartContent.length > 0;
   };
   
   this.setCartContent = function setCartContent(content) {
      cartContent = content;
   };
   
   this.setCountryOfDestination = function setCountryOfDestination(countryCode) {
      countryOfDestination = countryCode;
   };
   
   this.calculateCosts = function calculateCosts() {
      var result;
      
      if (cartContainsProducts() && countryOfDestination !== undefined) {
         var totalProductCosts = 0;
         var shippingCosts;
      
         for(var index = 0; index < cartContent.length; index++) {
            var productConfig = productConfigs.get(cartContent[index].productId);
            totalProductCosts += productConfig.price * cartContent[index].quantity;
         }

         if (countryOfDestination === 'AT') {
            shippingCosts = (totalProductCosts >= 50) ? 0 : SHIPPING_COSTS_AUSTRIA;
         } else {
            shippingCosts = (totalProductCosts >= 100) ? 0 : SHIPPING_COSTS_NON_AUSTRIA;
         }
         result = {totalCosts: totalProductCosts + shippingCosts, shippingCosts: shippingCosts};
      }
      return result;
   };
};
