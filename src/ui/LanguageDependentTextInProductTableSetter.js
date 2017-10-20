/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../Topics.js');

assertNamespace('shop.ui');

/**
 */
shop.ui.LanguageDependentTextInProductTableSetter = function LanguageDependentTextInProductTableSetter(optionalUiComponentProvider, optionalBus) {
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var uiComponentProvider = (optionalUiComponentProvider === undefined) ? defaultUiComponentProvider : optionalUiComponentProvider;
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      var components = uiComponentProvider(selector + ' button');
   };
};

