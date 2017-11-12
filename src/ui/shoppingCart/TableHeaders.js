/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('../../Topics.js');
require('../../Context.js');

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.TableHeaders = function TableHeaders(optionalBus) {

   var TEXT_KEY_PREFIX = 'shoppingCartContentTable.';

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var tableHeaders = {};
   var callbacks = [];
   
   var notifyListeners = function notifyListeners() {
      for(var index = 0; index < callbacks.length; index++) {
         callbacks[index]();
      }
   };
   
   var onLanguageDependentTextChanged = function onLanguageDependentTextChanged(id, text) {
      tableHeaders[id] = text;
      notifyListeners();
   };
   
   var subscribeToLanguageDependentTextPublication = function subscribeToLanguageDependentTextPublication(id) {
      tableHeaders[id] = undefined;
      var topic = shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + id;
      bus.subscribeToPublication(topic, onLanguageDependentTextChanged.bind(this, id));
   };

   this.onTableHeaderChanged = function onTableHeaderChanged(callback) {
      callbacks[callbacks.length] = callback;
   };
   
   this.get = function get(key) {
      return tableHeaders[key];
   };
   
   this.allHeadersAreAvailable = function allHeadersAreAvailable() {
      var result = true;
      var ids = Object.keys(tableHeaders);
      for(var index = 0; result && index < ids.length; index++) {
         if (tableHeaders[ids[index]] === undefined) {
            result = false;
         }
      }
      return result;
   };
   
   subscribeToLanguageDependentTextPublication('quantityHeader');
   subscribeToLanguageDependentTextPublication('nameHeader');
   subscribeToLanguageDependentTextPublication('priceHeader');
};
