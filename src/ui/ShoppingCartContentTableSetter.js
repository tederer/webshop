/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../Topics.js');

assertNamespace('shop.ui');

/**
 */
shop.ui.ShoppingCartContentTableSetter = function ShoppingCartContentTableSetter(optionalUiComponentProvider, optionalBus) {
   
   var TEXT_KEY_PREFIX = 'shoppingCartContentTable.';
   var CRLF = '\r\n';
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var uiComponentProvider = (optionalUiComponentProvider === undefined) ? defaultUiComponentProvider : optionalUiComponentProvider;
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var tableHeaders = {};
   var cartContent;
   var currentLanguage;
   var tabSelector;
   var intentationAsString = '   ';
   var intentations;
   var content;
   
   var allTableHeadersAreAvailable = function allTableHeadersAreAvailable() {
      var result = true;
      var ids = Object.keys(tableHeaders);
      for(var index = 0; result && index < ids.length; index++) {
         console.log('checking ' + ids[index]);
         if (tableHeaders[ids[index]] === undefined) {
            result = false;
         }
      }
      return result;
   };
   
   var allDataAvailable = function allDataAvailable() {
      return allTableHeadersAreAvailable() && 
         cartContent !== undefined && 
         currentLanguage !== undefined &&
         tabSelector !== undefined;
   };
      
   var append = function(text) {
      var line = '';
      for (var i = 0; i < intentations; i++) {
         line += intentationAsString;
      }
      content += line + text + CRLF;
   };
   
   var addHeader = function addHeader(id) {
      intentations++;
      append('<th>' + tableHeaders[id] + '</th>');
      intentations--;
   };
   
   var addText = function addText(text) {
      intentations++;
      append('<td>' + ((text === undefined) ? '&nbsp;' : text) + '</td>');
      intentations--;
   };
   
   var addPrice = function addPrice(price) {
      intentations++;
      append('<td>' + price.toFixed(2) + ' EUR</td>');
      intentations--;
   };
   
   var addCaptions = function addCaptions() {
      intentations++;
      append('<tr>');
      addHeader('quantityHeader');
      addHeader('nameHeader');
      addHeader('priceHeader');
      append('</tr>');
      intentations--;
   };
   
   // { productId: <String>, amount: <Integer> }
   var addRow = function addRow(product) {
      intentations++;
      append('<tr>');
      addText(product.amount);
      addText(product.productId);
      addPrice(12);
      append('</tr>');
      intentations--;
   };

   var updateTable = function updateTable() {
      if (allDataAvailable()) {
         console.log('update');
         intentations = 1;
         content = '';
         append('<table class="alternierendeZeilenFarbe ersteSpalteZentriert dritteSpalteZentriert">');
         addCaptions();
         cartContent.forEach(function(product) { 
            addRow(product);
         });
         append('</table>');
      
         uiComponentProvider(tabSelector + ' > #shoppingCartContent').html(content);
      }
   };

   var onLanguageDependentTextChanged = function onLanguageDependentTextChanged(id, text) {
      tableHeaders[id] = text;
      updateTable();
   };
   
   var subscribeToLanguageDependentTextPublication = function subscribeToLanguageDependentTextPublication(id) {
      tableHeaders[id] = undefined;
      var topic = shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + id;
      bus.subscribeToPublication(topic, onLanguageDependentTextChanged.bind(this, id));
   };
   
   var onShoppingCartContent = function onShoppingCartContent(content) {
      console.log('onShoppingCartContent('+content+')');
      cartContent = content;
      updateTable();
   };
   
   var onCurrentLanguage = function onCurrentLanguage(language) {
      console.log('onCurrentLanguage('+language+')');
      currentLanguage = language;
      updateTable();
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      tabSelector = selector;
      updateTable();
   };
   
   subscribeToLanguageDependentTextPublication('quantityHeader');
   subscribeToLanguageDependentTextPublication('nameHeader');
   subscribeToLanguageDependentTextPublication('priceHeader');
   
   bus.subscribeToPublication(shop.topics.SHOPPING_CART_CONTENT, onShoppingCartContent);
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguage);
};

