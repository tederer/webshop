/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');

assertNamespace('shop.shoppingCart');

shop.shoppingCart.CostsCalculator = function CostsCalculator(productConfigs) {

   var cartContent;
   var countryOfDestination;
   
   var cartContainsProducts = function cartContainsProducts() {
      return cartContent !== undefined && cartContent.length > 0;
   };
   
   var getShippingCostsForAustria = function getShippingCostsForAustria(totalProductCosts, totalProductWeightInGrams) {
      var shippingCosts = 0;
      if (totalProductCosts < 50) {
         if (totalProductWeightInGrams < 2000) {
            shippingCosts = 4;
         } else if (totalProductWeightInGrams < 5000) {
            shippingCosts = 5.82;
         } else {
            shippingCosts = 8.57;
         }
      }
      return shippingCosts;
   };
   
   var getShippingCostsForAllOthers = function getShippingCostsForAllOthers(totalProductCosts, totalProductWeightInGrams) {
      var shippingCosts = 0;
      if (totalProductCosts < 100) {
         if (totalProductWeightInGrams < 2000) {
            shippingCosts = 13.92;
         } else if (totalProductWeightInGrams < 4000) {
            shippingCosts = 15.27;
         } else {
            shippingCosts = 19.27;
         }
      }
      return shippingCosts;
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
         var totalProductWeightInGrams = 0;
         var shippingCosts;
      
         for(var index = 0; index < cartContent.length; index++) {
            var productConfig = productConfigs.get(cartContent[index].productId);
            var quantity = cartContent[index].quantity;
            totalProductCosts += productConfig.price * quantity;
            totalProductWeightInGrams += productConfig.weightInGrams * quantity;
         }

         if (countryOfDestination === 'AT') {
            shippingCosts = getShippingCostsForAustria(totalProductCosts, totalProductWeightInGrams);
         } else {
            shippingCosts = getShippingCostsForAllOthers(totalProductCosts, totalProductWeightInGrams);
         }
         
         result = {totalCosts: totalProductCosts + shippingCosts, shippingCosts: shippingCosts};
      }
      return result;
   };
};
