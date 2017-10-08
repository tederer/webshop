/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Topics.js');

assertNamespace('shop.ui');

shop.ui.LanguageSelector = function LanguageSelector(config, optionalBus ) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var currentLanguage;
   
   var publishLanguage = function publishLanguage(language) {
      bus.publish(shop.topics.CURRENT_LANGUAGE, language);
   };
   
   var onClicked = function onClicked() {
      var nextLanguage = (currentLanguage === config.defaultLanguage) ? config.alternativeLanguage : config.defaultLanguage;
      currentLanguage = nextLanguage;
      publishLanguage(nextLanguage);
   };
   
   var onLanguageDependentTextChanged = function onLanguageDependentTextChanged(newText) {
      config.uiComponentProvider().text(newText);
   };
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + config.languageDependentTextId, onLanguageDependentTextChanged);
   currentLanguage = config.defaultLanguage;
   publishLanguage(config.defaultLanguage);
   
   config.uiComponentProvider().on('click', onClicked);
};

