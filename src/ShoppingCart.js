/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./Context.js');
require('./Topics.js');

assertNamespace('shop.configuration');

shop.ShoppingCart = function ShoppingCart(optionalBus) {
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var products = [];
   
   var getIndexOfProduct = function getIndexOfProduct(productId) {
      var result;
      for (var index = 0; result === undefined && index < products.length; index++) {
         if (products[index].productId === productId) {
            result = index;
         }
      }
      return result;
   };
   
   var removeProduct = function removeProduct(productId) {
      var indexToRemove = getIndexOfProduct(productId);
      products.splice(indexToRemove, 1);
   };
   
   var addProduct = function addProduct(productId, amount) {
      var productIndex = getIndexOfProduct(productId);
      if (productIndex === undefined) {
         productIndex = products.length;
         products[productIndex] = {productId: productId, amount: amount};
      } else {
         products[productIndex].amount += amount;
      }
      if (products[productIndex].amount === 0) {
         removeProduct(productId);
      }
   };
   
   var onAddProductToShoppingCart = function onAddProductToShoppingCart(data) {
      addProduct(data.productId, data.quantity);
      bus.publish(shop.topics.SHOPPING_CART_CONTENT, products);
   };
   
   bus.subscribeToCommand(shop.topics.ADD_PRODUCT_TO_SHOPPING_CART, onAddProductToShoppingCart);
};
