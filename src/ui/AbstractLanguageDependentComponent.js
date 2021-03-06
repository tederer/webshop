/* global shop, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

/**
 * Derived objects have to call the initialize method!
 */
shop.ui.AbstractLanguageDependentComponent = function AbstractLanguageDependentComponent(optionalBus) {
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   this.onLanguageChanged = function onLanguageChanged(newLanguage) {
      shop.Context.log('Derived object does not override onLanguageChanged() in AbstractLanguageDependentComponent!');
   };
   
   this.initialize = function initialize() {
      bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, this.onLanguageChanged);
   };
};
   
   