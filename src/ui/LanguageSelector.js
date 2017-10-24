/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Topics.js');
require('../Language.js');
require('../Context.js');

assertNamespace('shop.ui');

shop.ui.LanguageSelector = function LanguageSelector(uiComponentProvider, optionalBus ) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var currentLanguage;
   
   var onClicked = function onClicked() {
      var language = (currentLanguage === shop.Language.EN) ? shop.Language.DE : shop.Language.EN;
      bus.sendCommand(shop.topics.SET_CURRENT_LANGUAGE, language);
   };
   
   var onCurrentLanguage = function onCurrentLanguage(newLanguage) {
      currentLanguage = newLanguage;
   };
   
   var onTextChanged = function onTextChanged(text) {
      uiComponentProvider().text(text);
   };
   
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguage);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'menu.languageSelectorButton', onTextChanged);
   
   uiComponentProvider().on('click', onClicked);
};

