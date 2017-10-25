/* global shop, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

shop.ui.Actions = {

   showPicture: function showPicture(filename) {
      shop.Context.bus.sendCommand(shop.topics.SHOW_PICTURE, filename);
   },
   
   checkInputValidity: function checkInputValidity(productId) {
      
      var inputValueIsValid = function inputValueIsValid(value) {
         return !isNaN(parseInt(value)) && value > 0;
      };
      
      var textFieldSelector = '#' + productId + '_textfield';
      var buttonSelector = '#' + productId + '_button';
      
      var inputValue = $(textFieldSelector).val();
      
      if(inputValueIsValid(inputValue)) {
         $(textFieldSelector).removeClass( 'invalidInput' ).addClass( 'validInput' );
         $(buttonSelector).prop( 'disabled', false );
      } else {
         $(textFieldSelector).removeClass( 'validInput' ).addClass( 'invalidInput' );
         $(buttonSelector).prop( 'disabled', true );
      }
   },
   
   addProductToShoppingCart: function addProductToShoppingCart(productId) {
      var textFieldSelector = '#' + productId + '_textfield';
      
      var data = { productId: productId, quantity: $(textFieldSelector).val() };
      console.log('sending command ' + shop.topics.ADD_PRODUCT_TO_SHOPPING_CART + ' with: ' + JSON.stringify(data));
      shop.Context.bus.sendCommand(shop.topics.ADD_PRODUCT_TO_SHOPPING_CART, data);
   }
};

