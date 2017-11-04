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
   
   var addProduct = function addProduct(productId, quantity) {
      var productIndex = getIndexOfProduct(productId);
      if (productIndex === undefined) {
         productIndex = products.length;
         products[productIndex] = {productId: productId, quantity: quantity};
      } else {
         products[productIndex].quantity += quantity;
      }
      if (products[productIndex].quantity < 1) {
         removeProduct(productId);
      }
   };
   
   var publishCartContent = function publishCartContent() {
      bus.publish(shop.topics.SHOPPING_CART_CONTENT, products);
   };
   
   var onAddProductToShoppingCart = function onAddProductToShoppingCart(data) {
      addProduct(data.productId, data.quantity);
      publishCartContent();
   };
   
   var onRemoveProductFromShoppingCart = function onRemoveProductFromShoppingCart(productId) {
      removeProduct(productId);
      publishCartContent();
   };
   
   bus.publish(shop.topics.SHOPPING_CART_CONTENT, []);
   bus.subscribeToCommand(shop.topics.ADD_PRODUCT_TO_SHOPPING_CART, onAddProductToShoppingCart);
   bus.subscribeToCommand(shop.topics.REMOVE_PRODUCT_FROM_SHOPPING_CART, onRemoveProductFromShoppingCart);
};
