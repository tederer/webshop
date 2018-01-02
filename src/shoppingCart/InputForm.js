/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../Topics.js');

assertNamespace('shop.shoppingCart');

shop.shoppingCart.InputForm = function InputForm(selector, optionalUiComponentProvider, optionalBus) {
   
   var COUNTRY_OF_DESTINATION = 'countryOfDestination';
   var FIRSTNAME = 'firstname';
   var LASTNAME = 'lastname';
   var EMAIL = 'email';
   var COMMENT = 'comment';
   var TERMS_AND_CONDITIONS = 'termsAndConditionsCheckbox';
   var CHECKED_PROPERTY_NAME = 'checked';
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var uiComponentProvider = (optionalUiComponentProvider === undefined) ? defaultUiComponentProvider : optionalUiComponentProvider;
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var countryOfDestination;
   var firstname;
   var lastname;
   var email;
   var termsAndConditionsChecked;
   var comment;
   var cartContent;
   
   var updateSubmitButton = function updateSubmitButton() {
      var submitButtonEnabled = 
            countryOfDestination !== undefined && 
            firstname !== undefined && 
            lastname !== undefined && 
            email !== undefined &&
            termsAndConditionsChecked &&
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
      var value;
      
      if (uiComponentId === TERMS_AND_CONDITIONS) {
         value = uiComponentProvider(selector + ' #' + uiComponentId).prop(CHECKED_PROPERTY_NAME);
      } else {
         value = uiComponentProvider(selector + ' #' + uiComponentId).val();
      }
      
      switch(uiComponentId) {
         case FIRSTNAME:            firstname = isValidName(value) ? value : undefined;
                                    break;
                                       
         case LASTNAME:             lastname = isValidName(value) ? value : undefined;
                                    break;
                                       
         case EMAIL:                email = isValidEmail(value) ? value : undefined;
                                    break;
                                       
         case COMMENT:              comment = value;
                                    break;
                    
         case TERMS_AND_CONDITIONS: termsAndConditionsChecked = value;
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

   this.setValuesEnteredByUser = function setValuesEnteredByUser() {
      uiComponentProvider(selector + ' #' + COUNTRY_OF_DESTINATION).val((countryOfDestination === undefined) ? 'nothing' : countryOfDestination);
      uiComponentProvider(selector + ' #' + FIRSTNAME).val(firstname);
      uiComponentProvider(selector + ' #' + LASTNAME).val(lastname);
      uiComponentProvider(selector + ' #' + EMAIL).val(email);
      uiComponentProvider(selector + ' #' + COMMENT).val(comment);
      uiComponentProvider(selector + ' #' + TERMS_AND_CONDITIONS).prop(CHECKED_PROPERTY_NAME, termsAndConditionsChecked ? true : false);
      updateSubmitButton();
   };
   
   bus.subscribeToPublication(shop.topics.SHOPPING_CART_CONTENT, onShoppingCartContent);
   bus.subscribeToPublication(shop.topics.COUNTRY_OF_DESTINATION, onCountryOfDestination);
   bus.subscribeToCommand(shop.topics.ORDER_FORM_ELEMENT_CHANGED, onOrderFormElementChanged);
   
   updateSubmitButton();
};
