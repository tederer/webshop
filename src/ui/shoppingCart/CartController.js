/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('../../Context.js');
require('../../Topics.js');
require('./ProductConfig.js');
require('./TableHeaders.js');

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.CartController = function CartController(products, optionalUiComponentProvider, optionalTableGenerator, optionalBus) {
   
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
   var productConfigs = new shop.ui.shoppingCart.ProductConfig(products);
   var tableHeaders = new shop.ui.shoppingCart.TableHeaders();
   var inputForm = new shop.ui.shoppingCart.InputForm('#shop > #content > #shoppingCart');
   var texts = new shop.ui.shoppingCart.ShoppingCartTexts();
   
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
         texts.allTextsAreAvailable();
   };
      
   var getHtmlTable = function getHtmlTable(shippingCosts, totalCosts) {
      var data = {
         productsInShoppingCart: [],
         shippingCosts: shippingCosts,
         totalCosts: totalCosts,
         shippingCostsText: texts.getShippingCostsText(),
         totalCostsText: texts.getTotalCostsText(),
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
   
   var updateTable = function updateTable() {
      if (allDataAvailable()) {
         var htmlCode;
         if (cartContent.length < 1) {
            htmlCode = '<p>' + texts.getEmptyCartText() + '</p>';
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

   var onShoppingCartContent = function onShoppingCartContent(content) {
      cartContent = content;
      updateTable();
   };
   
   var onCountryOfDestination = function onCountryOfDestination(country) {
      countryOfDestination = country;
      updateTable();
   };
   
   var onCurrentLanguage = function onCurrentLanguage(language) {
      currentLanguage = language;
      updateTable();
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      tabSelector = selector;
      updateTable();
      inputForm.setValuesEnteredByUser();
   };
   
   tableHeaders.onTableHeaderChanged(updateTable);
   texts.onLanguageDependentTextChanged(updateTable);
   
   bus.subscribeToPublication(shop.topics.COUNTRY_OF_DESTINATION, onCountryOfDestination);
   bus.subscribeToPublication(shop.topics.SHOPPING_CART_CONTENT, onShoppingCartContent);
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguage);
};

