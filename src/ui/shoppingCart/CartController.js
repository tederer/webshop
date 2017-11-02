/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('../../Context.js');
require('../../Topics.js');
require('./ShoppingCartTableGenerator.js');

assertNamespace('shop.ui.shoppingCart');

/**
 */
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
   var tableHeaders = {};
   var cartContent;
   var tabSelector;
   var languages = [];
   var productConfigurations = {};
   var currentLanguage;
   var countryOfDestination;
   var shippingCostsText;
   
   var allTableHeadersAreAvailable = function allTableHeadersAreAvailable() {
      var result = true;
      var ids = Object.keys(tableHeaders);
      for(var index = 0; result && index < ids.length; index++) {
         if (tableHeaders[ids[index]] === undefined) {
            result = false;
         }
      }
      return result;
   };
   
   var getProductConfig = function getProductConfig(productId) {
      var config;
      var languageRelatedConfigs = productConfigurations[currentLanguage];
      var productCategories = Object.keys(languageRelatedConfigs);
      for (var index = 0; config === undefined && index < productCategories.length; index++) {
         var products = languageRelatedConfigs[productCategories[index]].products;
         for (var productIndex = 0; config === undefined && productIndex < products.length; productIndex++) {
            var productConfig = products[productIndex];
            if (productConfig.id === productId) {
               config = productConfig;
            }
         }
      }
      return config;
   };
   
   var productConfigForCartContentAvailable = function productConfigForCartContentAvailable() {
      var configAvailable = true;
      
      for (var index = 0; configAvailable && index < cartContent.length; index++ ) {
         var productId = cartContent[index].productId;
         configAvailable = getProductConfig(productId) !== undefined;
      }
      
      return configAvailable;
   };
   
   var allDataAvailable = function allDataAvailable() {
      return allTableHeadersAreAvailable() && 
         productConfigForCartContentAvailable() &&
         currentLanguage !== undefined &&
         cartContent !== undefined && 
         tabSelector !== undefined &&
         shippingCostsText !== undefined;
   };
      
   var getTableHtmlContent = function getTableHtmlContent(shippingCosts) {
      var data = {
         productsInShoppingCart: [],
         shippingCosts: shippingCosts
      };
      for(var index = 0; index < cartContent.length; index++) {
         var productConfig = getProductConfig(cartContent[index].productId);
         data.productsInShoppingCart[data.productsInShoppingCart.length] = {
            productId: productConfig.id,
            name: productConfig.name,
            quantity: cartContent[index].quantity,
            price: productConfig.price
         };
      }
      return tableGenerator.generateTable(data, shippingCostsText, tableHeaders);
   };
   
   var getTotalProductCosts = function getTotalProductCosts() {
      var costs = 0;
      for(var index = 0; index < cartContent.length; index++) {
         var productConfig = getProductConfig(cartContent[index].productId);
         costs += productConfig.price * cartContent[index].quantity;
      }
      return costs;
   };
   
   var updateTab = function updateTab() {
      if (allDataAvailable()) {
         var totalProductCosts = getTotalProductCosts();
         var shippingCosts;
         
         if (countryOfDestination !== undefined) {
            if (countryOfDestination === 'AT') {
               shippingCosts = (totalProductCosts >= 50) ? 0 : SHIPPING_COSTS_AUSTRIA;
            } else {
               shippingCosts = (totalProductCosts >= 100) ? 0 : SHIPPING_COSTS_NON_AUSTRIA;
            }
         }
         var htmlContent = getTableHtmlContent(shippingCosts);
         uiComponentProvider(tabSelector + ' > #shoppingCartContent').html(htmlContent);
      }
   };

   var onLanguageDependentTextChanged = function onLanguageDependentTextChanged(id, text) {
      tableHeaders[id] = text;
      updateTab();
   };
   
   var onProductConfiguration = function onProductConfiguration(productName, language, config) {
      if (productConfigurations[language] === undefined) {
         productConfigurations[language] = {};
      }
      productConfigurations[language][productName] = config;
   };
   
   var subscribeToLanguageDependentTextPublication = function subscribeToLanguageDependentTextPublication(id) {
      tableHeaders[id] = undefined;
      var topic = shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + id;
      bus.subscribeToPublication(topic, onLanguageDependentTextChanged.bind(this, id));
   };
   
   var subscribeToProductConfigurations = function subscribeToProductConfigurations(language) {
      for (var index = 0; index < products.length; index++) {
         var product = products[index];
         var topic = '/jsonContent/' + language + '/' + product;
         bus.subscribeToPublication(topic, onProductConfiguration.bind(this, product, language));
      }
   };
   
   var onShoppingCartContent = function onShoppingCartContent(content) {
      cartContent = content;
      updateTab();
   };
   
   var onCountryOfDestination = function onCountryOfDestination(country) {
      countryOfDestination = country;
      updateTab();
   };
   
   var onCurrentLanguage = function onCurrentLanguage(language) {
      currentLanguage = language;
      var index = languages.indexOf(language);
      if (index === -1) {
         languages[languages.length] = language;
         subscribeToProductConfigurations(language);
      }
      updateTab();
   };
   
   var onShippingCostsText = function onShippingCostsText(text) {
      shippingCostsText = text;
      updateTab();
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      tabSelector = selector;
      updateTab();
   };
   
   subscribeToLanguageDependentTextPublication('quantityHeader');
   subscribeToLanguageDependentTextPublication('nameHeader');
   subscribeToLanguageDependentTextPublication('priceHeader');
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + 'shippingCosts', onShippingCostsText);
   bus.subscribeToPublication(shop.topics.COUNTRY_OF_DESTINATION, onCountryOfDestination);
   bus.subscribeToPublication(shop.topics.SHOPPING_CART_CONTENT, onShoppingCartContent);
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguage);
};

