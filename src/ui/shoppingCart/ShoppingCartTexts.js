/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../../Context.js');

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.ShoppingCartTexts = function ShoppingCartTexts(optionalBus) {

   var TEXT_KEY_PREFIX = 'shoppingCartContentTable.';
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var shippingCostsText;
   var totalCostsText;
   var emptyCartText;
   var callbacks = [];
   
   var notifycallbacks = function notifycallbacks() {
      for (var index = 0; index < callbacks.length; index++) {
         callbacks[index]();
      }
   };
   
   var onShippingCostsText = function onShippingCostsText(text) {
      shippingCostsText = text;
      notifycallbacks();
   };
   
   var onTotalCostsText = function onTotalCostsText(text) {
      totalCostsText = text;
      notifycallbacks();
   };
   
   var onEmptyCartText = function onEmptyCartText(text) {
      emptyCartText = text;
      notifycallbacks();
   };
   
   this.onLanguageDependentTextChanged = function onLanguageDependentTextChanged(callback) {
      callbacks[callbacks.length] = callback;
   };
   
   this.getShippingCostsText = function getShippingCostsText() {
      return shippingCostsText;
   };
   
   this.getTotalCostsText = function getTotalCostsText() {
      return totalCostsText;
   };
   
   this.getEmptyCartText = function getEmptyCartText() {
      return emptyCartText;
   };
   
   this.allTextsAreAvailable = function allTextsAreAvailable() {
      return shippingCostsText !== undefined &&
         totalCostsText !== undefined &&
         emptyCartText !== undefined;
   };
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + 'shippingCosts', onShippingCostsText);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + 'totalCosts', onTotalCostsText);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + 'emptyCart', onEmptyCartText);
};
