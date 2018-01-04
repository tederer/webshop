/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');

assertNamespace('shop.shoppingCart');

shop.shoppingCart.WeightLimitChecker = function WeightLimitChecker(productConfigs) {

   var MAX_WEIGHT_IN_GRAMS = 2000;
   
   var beyond = false;
   
   this.setCartContent = function setCartContent(content) {
      var totalWeightInGrams = 0;
      
      for(var index = 0; index < content.length; index++) {
         var productConfig = productConfigs.get(content[index].productId);
         if (productConfig) {
            totalWeightInGrams += productConfig.weightInGrams * content[index].quantity;
         }
      }

      beyond = totalWeightInGrams > MAX_WEIGHT_IN_GRAMS;
   };
   
   this.beyondWeightLimit = function beyondWeightLimit() {
      return beyond;
   };
};
