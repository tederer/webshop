/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../Topics.js');

assertNamespace('shop.shoppingCart');

shop.shoppingCart.InputForm = function InputForm(selector, optionalUiComponentProvider, optionalBus) {
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var uiComponentProvider = (optionalUiComponentProvider === undefined) ? defaultUiComponentProvider : optionalUiComponentProvider;
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var countryOfDestination;
   var firstname;
   var lastname;
   var email;
   var comment;
   var cartContent;
   
   var updateSubmitButton = function updateSubmitButton() {
      var submitButtonEnabled = countryOfDestination !== undefined && 
            firstname !== undefined && 
            lastname !== undefined && 
            email !== undefined &&
            cartContent !== undefined && cartContent.length > 0;
            
      if (selector !== undefined) {
         uiComponentProvider(selector + ' #submitButton').attr('disabled', !submitButtonEnabled);
      }
   };

   var isValidName = function isValidName(value) {
      return value !== undefined && value.length >= 3;
   };
   
   var isValidEmail = function isValidEmail(value) {
      return value !== undefined && value.match(/.+@.+\.[^.]+/) !== null;
   };
   
   var onOrderFormElementChanged = function onOrderFormElementChanged(uiComponentId) {
      var value = uiComponentProvider(selector + ' #' + uiComponentId).val();
      switch(uiComponentId) {
         case 'firstname': firstname = isValidName(value) ? value : undefined;
                           break;
                           
         case 'lastname':  lastname = isValidName(value) ? value : undefined;
                           break;
                           
         case 'email':     email = isValidEmail(value) ? value : undefined;
                           break;
                           
         case 'comment':   comment = value;
                           break;
      }
      
      updateSubmitButton();
   };
   
   var onCountryOfDestination = function onCountryOfDestination(country) {
      countryOfDestination = country;
      updateSubmitButton();
   };
   
   var onShoppingCartContent = function onShoppingCartContent(content) {
      cartContent = content;
      updateSubmitButton();
   };

   this.allValuesAreAvailable = function allValuesAreAvailable() {
      return firstname !== undefined && 
            lastname !== undefined && 
            email !== undefined;
   };
   
   this.setValuesEnteredByUser = function setValuesEnteredByUser() {
      uiComponentProvider(selector + ' #countryOfDestination').val((countryOfDestination === undefined) ? 'nothing' : countryOfDestination);
      uiComponentProvider(selector + ' #firstname').val(firstname);
      uiComponentProvider(selector + ' #lastname').val(lastname);
      uiComponentProvider(selector + ' #email').val(email);
      uiComponentProvider(selector + ' #comment').val(comment);
      updateSubmitButton();
   };
   
   bus.subscribeToPublication(shop.topics.SHOPPING_CART_CONTENT, onShoppingCartContent);
   bus.subscribeToPublication(shop.topics.COUNTRY_OF_DESTINATION, onCountryOfDestination);
   bus.subscribeToCommand(shop.topics.ORDER_FORM_ELEMENT_CHANGED, onOrderFormElementChanged);
};
