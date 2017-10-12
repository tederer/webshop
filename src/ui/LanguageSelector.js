/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Topics.js');
require('../Language.js');
require('../Context.js');

assertNamespace('shop.ui');

shop.ui.LanguageSelector = function LanguageSelector(uiComponentProvider, optionalBus ) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var defaultLanguage = shop.Language.DE;
   var alternativeLanguage = shop.Language.EN;
   var currentLanguage = defaultLanguage;
   var text = {};
   text[shop.Language.DE] = 'Deutsch';
   text[shop.Language.EN] = 'English';
   
   var getInactiveLanguage = function getInactiveLanguage(language) {
      return (currentLanguage === defaultLanguage) ? alternativeLanguage : defaultLanguage;
   };
   
   var publishLanguage = function publishCurrentLanguage() {
      bus.publish(shop.topics.CURRENT_LANGUAGE, currentLanguage);
      uiComponentProvider().text(text[getInactiveLanguage()]);
   };
   
   var onClicked = function onClicked() {
      currentLanguage = getInactiveLanguage();
      publishLanguage();
   };
   
   publishLanguage(defaultLanguage);
   
   uiComponentProvider().on('click', onClicked);
};

