/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../Topics.js');

assertNamespace('shop.ui');

/**
 * This instance is responsible to set the text of buttons that are in the <div> determined by
 * the selector provided in the onTabContentChangedCallback() function.
 */
shop.ui.LanguageDependentTextInProductTableSetter = function LanguageDependentTextInProductTableSetter(optionalUiComponentProvider, optionalBus) {
   
   var addToShoppingCartButtonText;
   var productDetailsLinkText;
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
   
   var updateAnchors = function updateAnchors() {
      if (productDetailsLinkText !== undefined) {
         selectors.forEach(function(selector) {
            uiComponentProvider(selector + ' a').text(productDetailsLinkText);
         });
      }
   };
   
   var onAddToShoppingCartButtonText = function onAddToShoppingCartButtonText(text) {
      addToShoppingCartButtonText = (text !== undefined) ? text : '';
      updateButtons();
   };
   
   var onProductDetailsLinkText = function onProductDetailsLinkText(text) {
      productDetailsLinkText = (text !== undefined) ? text : '';
      updateAnchors();
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      if (selectors.indexOf(selector) === -1) {
         selectors[selectors.length] = selector;
      }
      updateButtons();
      updateAnchors();
   };
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'addToShoppingCartButton', onAddToShoppingCartButtonText);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productDetailsLinkText', onProductDetailsLinkText);
};

