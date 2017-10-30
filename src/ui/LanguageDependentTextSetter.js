/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

/**
 * This setter updates the text of the HTML element identified by its selector when the corresponding
 * language dependent text changes.
 */
shop.ui.LanguageDependentTextSetter = function LanguageDependentTextSetter(selector, languageDependentTextKey, optionalComponentTextSetter, optionalBus) {
   
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
