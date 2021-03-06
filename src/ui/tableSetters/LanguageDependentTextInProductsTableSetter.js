/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('../../Context.js');
require('../../Topics.js');

assertNamespace('shop.ui.tablesetters');

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
shop.ui.tablesetters.LanguageDependentTextInProductsTableSetter = function LanguageDependentTextInProductsTableSetter(optionalTextKeyPrefix, optionalUiComponentProvider, optionalBus) {
   
   var addToShoppingCartButtonText;
   var onTheInternetAnchorText;
   var bigPictureAnchorText;
   var fotoHeader;
   var productHeader;
   var priceHeader;
   var selectors = [];
   
   var textKeyPrefix = (optionalTextKeyPrefix === undefined) ? 'productsTable' : optionalTextKeyPrefix;
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var uiComponentProvider = (optionalUiComponentProvider === undefined) ? defaultUiComponentProvider : optionalUiComponentProvider;
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var updateButtons = function updateButtons() {
      var textToSet = (addToShoppingCartButtonText !== undefined) ? addToShoppingCartButtonText : '';
      selectors.forEach(function(selector) {
         uiComponentProvider(selector + ' button').text(textToSet);
      });
   };
   
   var updateAnchors = function updateAnchors() {
      var updateTextToSet = (onTheInternetAnchorText !== undefined) ? onTheInternetAnchorText : '';
      selectors.forEach(function(selector) {
         uiComponentProvider(selector + ' .onTheInternetAnchor').text(updateTextToSet);
      });
      
      var bigPictureTextToSet = (bigPictureAnchorText !== undefined) ? bigPictureAnchorText : '';
      selectors.forEach(function(selector) {
         uiComponentProvider(selector + ' .bigPictureAnchor').text(bigPictureTextToSet);
      });
   };
   
   var getFormattedText = function getFormattedText(text) {
      return (text !== undefined) ? text : '';
   };
   
   var updateTableHeaders = function updateTableHeaders() {
      selectors.forEach(function(selector) {
         uiComponentProvider(selector + ' .fotoHeader').text(getFormattedText(fotoHeader));
         uiComponentProvider(selector + ' .productHeader').text(getFormattedText(productHeader));
         uiComponentProvider(selector + ' .priceHeader').text(getFormattedText(priceHeader));
      });
   };
   
   var onAddToShoppingCartButtonText = function onAddToShoppingCartButtonText(text) {
      addToShoppingCartButtonText = text;
      updateButtons();
   };
   
   var onOnTheInternetAnchorText = function onOnTheInternetAnchorText(text) {
      onTheInternetAnchorText = text;
      updateAnchors();
   };
   
   var onBigPictureAnchorText = function onBigPictureAnchorText(text) {
      bigPictureAnchorText = text;
      updateAnchors();
   };
   
   var onFotoHeader = function onFotoHeader(text) {
      fotoHeader = text;
      updateTableHeaders();
   };
   
   var onProductHeader = function onProductHeader(text) {
      productHeader = text;
      updateTableHeaders();
   };
   
   var onPriceHeader = function onPriceHeader(text) {
      priceHeader = text;
      updateTableHeaders();
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      if (selectors.indexOf(selector) === -1) {
         selectors[selectors.length] = selector;
      }
      updateButtons();
      updateAnchors();
      updateTableHeaders();
   };

   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.addToShoppingCartButton', onAddToShoppingCartButtonText);

   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.onTheInternetAnchor', onOnTheInternetAnchorText);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.bigPictureAnchor', onBigPictureAnchorText);

   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.fotoHeader', onFotoHeader);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.productHeader', onProductHeader);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.priceHeader', onPriceHeader);
};

