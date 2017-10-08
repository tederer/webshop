/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./Context.js');
require('./ResourceProvider.js');
require('./bus/Bus.js');

assertNamespace('shop');

/**
 * The load() function downloads the configuration file languageDependentTexts.json from configBaseUrl 
 * and publishes the texts of this file in the current language on the topics /languageDependentText/<key>.
 *
 * format of the configuration file:
 * {
 *   <key>: { <language>: <text>, <language>: <text>, ... } 
 *   ...
 * }
 * 
 * <key>       a unique key of a text
 * <language>  one of the languages in shop.Language (e.g. "en", "de")
 * <text>      the text in the language
 *
 * example:
 *
 * {
 *  "button1": { "de": "Anleitungen", "en": "tutorials" }, 
 *  "button2": { "de": "Kontakt", "en": "contact" } 
 * }
 */
shop.LanguageDependentTexts = function LanguageDependentTexts(configBaseUrl, optionalBus, optionalResourceProviderFactoryFunction) {

   var CONFIG_NAME = 'languageDependentTexts.json';
   var config;
   var configKeys;
   var currentLanguage;
   var lastPublishedLanguage;
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var defaultResourceProviderFactoryFunction = function defaultResourceProviderFactoryFunction(baseUrl) {
      return new shop.configuration.ResourceProvider(baseUrl);
   };
   
   var resourceProviderFactoryFunction = (optionalResourceProviderFactoryFunction === undefined) ? 
                                             defaultResourceProviderFactoryFunction : optionalResourceProviderFactoryFunction;
   
   var updatePublications = function updatePublications() {
      if (config !== undefined && currentLanguage !== undefined && lastPublishedLanguage !== currentLanguage) {
         for (var index = 0; index < configKeys.length; index++) {
            bus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + configKeys[index], config[configKeys[index]][currentLanguage]);
         }
         lastPublishedLanguage = currentLanguage;
      }
   };
   
   var onConfigLoaded = function onConfigLoaded(content) {
      try {
         config = JSON.parse(content);
         configKeys = Object.keys(config);
         updatePublications();
      } catch(e) {
         shop.Context.log(e);
      }
   };
   
   var onCurrentLanguageChanged = function onCurrentLanguageChanged(newCurrentLanguage) {
      currentLanguage = newCurrentLanguage;
      updatePublications();
   };
   
   this.load = function load() {
      bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguageChanged);
      var resourceProvider = resourceProviderFactoryFunction(configBaseUrl);
      resourceProvider.get(CONFIG_NAME).then(onConfigLoaded, shop.Context.log);
   };
};
