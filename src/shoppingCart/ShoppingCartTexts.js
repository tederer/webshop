/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Topics.js');
require('../Context.js');

assertNamespace('shop.shoppingCart');

shop.shoppingCart.ShoppingCartTexts = function ShoppingCartTexts(optionalBus) {

   var TEXT_KEY_PREFIX = 'shoppingCartContentTable.';
   var SHIPPING_COSTS_ID = 'shippingCosts';
   var TOTAL_COSTS_ID = 'totalCosts';
   var EMPTY_CART_ID = 'emptyCart';
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var shippingCostsText;
   var totalCostsText;
   var emptyCartText;
   var callbacks = [];
   var texts = {};
   
   var notifycallbacks = function notifycallbacks() {
      for (var index = 0; index < callbacks.length; index++) {
         callbacks[index]();
      }
   };
   
   var onTextChanged = function onTextChanged(textId, text) {
      texts[textId] = text;
      notifycallbacks();
   };
   
   var subscribeToPublication = function subscribeToPublication(textId) {
      bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + textId, onTextChanged.bind(this, textId));
   };
   
   this.onLanguageDependentTextChanged = function onLanguageDependentTextChanged(callback) {
      callbacks[callbacks.length] = callback;
   };
   
   this.getShippingCostsText = function getShippingCostsText() {
      return texts[SHIPPING_COSTS_ID];
   };
   
   this.getTotalCostsText = function getTotalCostsText() {
      return texts[TOTAL_COSTS_ID];
   };
   
   this.getEmptyCartText = function getEmptyCartText() {
      return texts[EMPTY_CART_ID];
   };
   
   this.allTextsAreAvailable = function allTextsAreAvailable() {
      var allAvailable = true;
      var textIds = [SHIPPING_COSTS_ID, TOTAL_COSTS_ID, EMPTY_CART_ID];
      for (var index=0; allAvailable && index < textIds.length; index++) {
         allAvailable = texts[textIds[index]] !== undefined;
      }
      return allAvailable;
   };
   
   subscribeToPublication(SHIPPING_COSTS_ID);
   subscribeToPublication(TOTAL_COSTS_ID);
   subscribeToPublication(EMPTY_CART_ID);
};