/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

/**
 * This setter updates the text of the HTML element identified by its selector when the corresponding
 * language dependent text changes.
 */
shop.ui.ShoppingCartButtonTextSetter = function ShoppingCartButtonTextSetter(selector, languageDependentTextKey, optionalComponentTextSetter, optionalBus) {
   
   var defaultComponentTextSetter = function defaultComponentTextSetter(selector, text) {
      $(selector).text(text);
   };
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var componentTextSetter = (optionalComponentTextSetter === undefined) ? defaultComponentTextSetter : optionalComponentTextSetter;
   var text;
   var quantity = 0;
   
   var updateText = function updateText() {
      var textToSet = text;
      if (quantity > 0) {
         textToSet += ' (' + quantity + ')';
      }
      componentTextSetter(selector, textToSet);
   };
   
   var onLanguageDependentText = function onLanguageDependentText(newText) {
      text = newText;
      updateText();
   };
   
   var onShoppingCartContent = function onShoppingCartContent(content) {
      
      var newAmount = 0;
      for (var index = 0; index < content.length; index++) {
         newAmount += content[index].quantity;
      }
      quantity = newAmount;
      updateText();
   };
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + languageDependentTextKey, onLanguageDependentText);
   bus.subscribeToPublication(shop.topics.SHOPPING_CART_CONTENT, onShoppingCartContent);
};
