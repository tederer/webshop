/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Topics.js');
require('../Context.js');

assertNamespace('shop.shoppingCart');

shop.shoppingCart.ProductConfig = function ProductConfig(products, optionalBus) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var productConfigurations = {};
   var languages = [];
   var currentLanguage;
   
   var onProductConfiguration = function onProductConfiguration(productName, language, config) {
      if (productConfigurations[language] === undefined) {
         productConfigurations[language] = {};
      }
      productConfigurations[language][productName] = config;
   };

   var subscribeTo = function subscribeTo(language) {
      for (var index = 0; index < products.length; index++) {
         var product = products[index];
         var topic = '/jsonContent/' + language + '/' + product;
         bus.subscribeToPublication(topic, onProductConfiguration.bind(this, product, language));
      }
   };
   
   var onCurrentLanguage = function onCurrentLanguage(language) {
      currentLanguage = language;
      var index = languages.indexOf(language);
      if (index === -1) {
         languages[languages.length] = language;
         subscribeTo(language);
      }
   };
      
   this.get = function get(productId) {
      var config;
      if (currentLanguage !== undefined) {
         var languageRelatedConfigs = productConfigurations[currentLanguage];
         var productCategories = Object.keys(languageRelatedConfigs);
         for (var index = 0; config === undefined && index < productCategories.length; index++) {
            var configuredProducts = languageRelatedConfigs[productCategories[index]].products;
            for (var productIndex = 0; config === undefined && productIndex < configuredProducts.length; productIndex++) {
               var productConfig = configuredProducts[productIndex];
               if (productConfig.id === productId) {
                  config = productConfig;
               }
            }
         }
      }
      return config;
   };
      
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguage.bind(this));
};
