/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('./AbstractLanguageDependentComponent.js');

assertNamespace('shop.ui');

/**
 * This component changes it's text when the current language gets changed.
 */
shop.ui.LanguageDependentComponent = function LanguageDependentComponent(selector, languageDependentTextKey, optionalComponentTextSetter, optionalBus) {
   
   var defaultComponentTextSetter = function defaultComponentTextSetter(selector, text) {
      $(selector).text(text);
   };
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var componentTextSetter = (optionalComponentTextSetter === undefined) ? defaultComponentTextSetter : optionalComponentTextSetter;
   
   var onLanguageDependentText = function onLanguageDependentText(text) {
      componentTextSetter(selector, text);
   };
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + languageDependentTextKey, onLanguageDependentText);
};
