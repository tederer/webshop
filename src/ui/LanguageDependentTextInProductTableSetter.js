/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../Topics.js');

assertNamespace('shop.ui');

/**
 * Every call of onTabContentChangedCallback() or a change of the associated language dependent texts
 * updates the following sub elements of the <div> determined by the selector provided in onTabContentChangedCallback().
 * 
 * Sub elements that get updates:
 *
 *    <button>
 *    <a class="onTheInternetAnchor">
 *    <a class="bigPictureAnchor">
 *
 * Associated language dependent texts:
 *
 *    'productTable.addToShoppingCartButton'
 *    'productTable.onTheInternetAnchor'
 *    'productTable.bigPictureAnchor'
 */
shop.ui.LanguageDependentTextInProductTableSetter = function LanguageDependentTextInProductTableSetter(optionalUiComponentProvider, optionalBus) {
   
   var addToShoppingCartButtonText;
   var onTheInternetAnchorText;
   var bigPictureAnchorText;
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
      if (onTheInternetAnchorText !== undefined) {
         selectors.forEach(function(selector) {
            uiComponentProvider(selector + ' .onTheInternetAnchor').text(onTheInternetAnchorText);
         });
      }
      if (bigPictureAnchorText !== undefined) {
         selectors.forEach(function(selector) {
            uiComponentProvider(selector + ' .bigPictureAnchor').text(bigPictureAnchorText);
         });
      }
   };
   
   var onAddToShoppingCartButtonText = function onAddToShoppingCartButtonText(text) {
      addToShoppingCartButtonText = (text !== undefined) ? text : '';
      updateButtons();
   };
   
   var onOnTheInternetAnchorText = function onOnTheInternetAnchorText(text) {
      onTheInternetAnchorText = (text !== undefined) ? text : '';
      updateAnchors();
   };
   
   var onBigPictureAnchorText = function onBigPictureAnchorText(text) {
      bigPictureAnchorText = (text !== undefined) ? text : '';
      updateAnchors();
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      if (selectors.indexOf(selector) === -1) {
         selectors[selectors.length] = selector;
      }
      updateButtons();
      updateAnchors();
   };
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productTable.addToShoppingCartButton', onAddToShoppingCartButtonText);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productTable.onTheInternetAnchor', onOnTheInternetAnchorText);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productTable.bigPictureAnchor', onBigPictureAnchorText);
};

