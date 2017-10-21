/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../Topics.js');

assertNamespace('shop.ui');

/**
 */
shop.ui.LanguageDependentTextInProductTableSetter = function LanguageDependentTextInProductTableSetter(optionalUiComponentProvider, optionalBus) {
   
   var addToShoppingCartButtonText;
   var selectors = [];
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var uiComponentProvider = (optionalUiComponentProvider === undefined) ? defaultUiComponentProvider : optionalUiComponentProvider;
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var updateButtons = function updateButtons() {
      if (addToShoppingCartButtonText !== undefined) {
         selectors.forEach(function(selector) {
            uiComponentProvider(selector + ' button').text(addToShoppingCartButtonText);
         });
      }
   };
   
   var onAddToShoppingCartButtonText = function onAddToShoppingCartButtonText(text) {
      addToShoppingCartButtonText = (text !== undefined) ? text : '';
      updateButtons();
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      if (selectors.indexOf(selector) === -1) {
         selectors[selectors.length] = selector;
      }
      updateButtons();
   };
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'addToShoppingCartButton', onAddToShoppingCartButtonText);
};

