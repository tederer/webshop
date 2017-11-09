/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('../../Context.js');
require('../../Topics.js');
require('./ProductConfig.js');
require('./TableHeaders.js');

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.CartController = function CartController(products, optionalUiComponentProvider, optionalTableGenerator, optionalBus) {
   
   var TEXT_KEY_PREFIX = 'shoppingCartContentTable.';
   var SHIPPING_COSTS_AUSTRIA = 4.6;
   var SHIPPING_COSTS_NON_AUSTRIA = 11.25;
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var uiComponentProvider = (optionalUiComponentProvider === undefined) ? defaultUiComponentProvider : optionalUiComponentProvider;
   var tableGenerator = (optionalTableGenerator === undefined) ? new shop.ui.shoppingCart.TableGenerator() : optionalTableGenerator;
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var cartContent;
   var tabSelector;
   var currentLanguage;
   var countryOfDestination;
   var shippingCostsText;
   var totalCostsText;
   var emptyCartText;
   var firstname;
   var lastname;
   var email;
   var productConfigs = new shop.ui.shoppingCart.ProductConfig(products);
   var tableHeaders = new shop.ui.shoppingCart.TableHeaders();
   
   var productConfigForCartContentAvailable = function productConfigForCartContentAvailable() {
      var configAvailable = true;
      
      for (var index = 0; configAvailable && index < cartContent.length; index++ ) {
         var productId = cartContent[index].productId;
         configAvailable = productConfigs.get(productId) !== undefined;
      }
      
      return configAvailable;
   };
   
   var allDataAvailable = function allDataAvailable() {
      return tableHeaders.allHeadersAreAvailable() && 
         productConfigForCartContentAvailable() &&
         currentLanguage !== undefined &&
         cartContent !== undefined && 
         tabSelector !== undefined &&
         shippingCostsText !== undefined &&
         totalCostsText !== undefined &&
         emptyCartText !== undefined;
   };
      
   var getHtmlTable = function getHtmlTable(shippingCosts, totalCosts) {
      var data = {
         productsInShoppingCart: [],
         shippingCosts: shippingCosts,
         totalCosts: totalCosts,
         shippingCostsText: shippingCostsText,
         totalCostsText: totalCostsText,
         tableHeaders: tableHeaders
      };
      
      for(var index = 0; index < cartContent.length; index++) {
         var productConfig = productConfigs.get(cartContent[index].productId);
         data.productsInShoppingCart[data.productsInShoppingCart.length] = {
            productId: productConfig.id,
            name: productConfig.name,
            quantity: cartContent[index].quantity,
            price: productConfig.price
         };
      }
      return tableGenerator.generateTable(data);
   };
   
   var getTotalProductCosts = function getTotalProductCosts() {
      var costs = 0;
      for(var index = 0; index < cartContent.length; index++) {
         var productConfig = productConfigs.get(cartContent[index].productId);
         costs += productConfig.price * cartContent[index].quantity;
      }
      return costs;
   };
   
   var updateTab = function updateTab() {
      if (allDataAvailable()) {
         var htmlCode;
         if (cartContent.length < 1) {
            htmlCode = '<p>' + emptyCartText + '</p>';
         } else {
            var totalProductCosts = getTotalProductCosts();
            var shippingCosts;
            
            if (countryOfDestination !== undefined) {
               if (countryOfDestination === 'AT') {
                  shippingCosts = (totalProductCosts >= 50) ? 0 : SHIPPING_COSTS_AUSTRIA;
               } else {
                  shippingCosts = (totalProductCosts >= 100) ? 0 : SHIPPING_COSTS_NON_AUSTRIA;
               }
            }
            var totalCosts = (shippingCosts !== undefined) ? totalProductCosts + shippingCosts : undefined;
            htmlCode = getHtmlTable(shippingCosts, totalCosts);
         }
         uiComponentProvider(tabSelector + ' > #shoppingCartContent').html(htmlCode);
      }
   };

   var updateSubmitButton = function updateSubmitButton() {
         
      var submitButtonEnabled = countryOfDestination !== undefined && 
            firstname !== undefined && 
            lastname !== undefined && 
            email !== undefined &&
            cartContent.length > 0;
            
      if (tabSelector !== undefined) {
         $(tabSelector + ' #submitButton').attr('disabled', !submitButtonEnabled);
      }
   };

   var onShoppingCartContent = function onShoppingCartContent(content) {
      cartContent = content;
      updateTab();
      updateSubmitButton();
   };
   
   var onCountryOfDestination = function onCountryOfDestination(country) {
      countryOfDestination = country;
      updateTab();
      updateSubmitButton();
   };
   
   var onCurrentLanguage = function onCurrentLanguage(language) {
      currentLanguage = language;
      updateTab();
   };
   
   var onShippingCostsText = function onShippingCostsText(text) {
      shippingCostsText = text;
      updateTab();
   };
   
   var onTotalCostsText = function onTotalCostsText(text) {
      totalCostsText = text;
      updateTab();
   };
   
   var onEmptyCartText = function onEmptyCartText(text) {
      emptyCartText = text;
      updateTab();
   };
   
   var isValidName = function isValidName(value) {
      return value.length >= 3;
   };
   
   var isValidEmail = function isValidEmail(value) {
      return value.match(/.+@.+\.[^.]+/) !== null;
   };
   
   var onOrderFormElementChanged = function onOrderFormElementChanged(uiComponentId) {
      var value = $(tabSelector + ' #' + uiComponentId).val();
      switch(uiComponentId) {
         case 'firstname': firstname = isValidName(value) ? value : undefined;
                           break;
                           
         case 'lastname':  lastname = isValidName(value) ? value : undefined;
                           break;
                           
         case 'email':     email = isValidEmail(value) ? value : undefined;
                           break;
      }
      
      updateSubmitButton();
   };
   
   var onTableHeaderChanged = function onTableHeaderChanged() {
      updateTab();
   };
   
   var setValuesEnteredByUser = function setValuesEnteredByUser() {
      $(tabSelector + ' #countryOfDestination').val((countryOfDestination === undefined) ? 'nothing' : countryOfDestination);
      $(tabSelector + ' #firstname').val(firstname);
      $(tabSelector + ' #lastname').val(lastname);
      $(tabSelector + ' #email').val(email);
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      tabSelector = selector;
      updateTab();
      setValuesEnteredByUser();
      updateSubmitButton();
   };
   
   tableHeaders.onTableHeaderChanged(onTableHeaderChanged);
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + 'shippingCosts', onShippingCostsText);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + 'totalCosts', onTotalCostsText);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + 'emptyCart', onEmptyCartText);
   bus.subscribeToPublication(shop.topics.COUNTRY_OF_DESTINATION, onCountryOfDestination);
   bus.subscribeToPublication(shop.topics.SHOPPING_CART_CONTENT, onShoppingCartContent);
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguage);
   
   bus.subscribeToCommand(shop.topics.ORDER_FORM_ELEMENT_CHANGED, onOrderFormElementChanged);
};

