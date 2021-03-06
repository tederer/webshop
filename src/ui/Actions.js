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
   
   addProductToShoppingCart: function addProductToShoppingCart(productId, textfieldId) {
      var textFieldSelector = '#' + textfieldId;
      var textFieldContent = $(textFieldSelector).val();
      var quantity = parseInt(textFieldContent);
      
      if (isNaN(quantity)) {
         shop.Context.log('Failed to convert "' + textFieldContent + '" to integer!');
      } else {
         var data = { productId: productId, quantity: quantity };
         shop.Context.bus.sendCommand(shop.topics.ADD_PRODUCT_TO_SHOPPING_CART, data);
      }
   },
   
   removeProductFromShoppingCart: function removeProductFromShoppingCart(productId) {
      shop.Context.bus.sendCommand(shop.topics.REMOVE_PRODUCT_FROM_SHOPPING_CART, productId);
   },
   
   changeCountryOfDestination: function changeCountryOfDestination() {
      var selectedValue = $('#shop > #content > #shoppingCart #countryOfDestination').val();
      var valueToPublish = (selectedValue === 'nothing') ? undefined : selectedValue;
      shop.Context.bus.publish(shop.topics.COUNTRY_OF_DESTINATION, valueToPublish);
   },
   
   orderFormElementChanged: function orderFormElementChanged(uiComponentId) {
      shop.Context.bus.sendCommand(shop.topics.ORDER_FORM_ELEMENT_CHANGED, uiComponentId);
   },
   
   submitOrder: function submitOrder() {
      shop.Context.bus.sendCommand(shop.topics.USER_CLICKED_SUBMIT_ORDER_BUTTON);
   },
   
   showOverlay: function showOverlay(selector) {
      shop.Context.bus.sendCommand(shop.topics.SHOW_OVERLAY, selector);
   },
   
   hideOverlay: function hideOverlay(selector) {
      shop.Context.bus.sendCommand(shop.topics.HIDE_OVERLAY, selector);
   }
};

