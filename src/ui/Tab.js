/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../Promise.js');
require('./TabContent.js');
require('./AbstractHideableLanguageDependentComponent.js');
require('./tablegenerators/ProductsTableGenerator.js');

assertNamespace('shop.ui');

/**
 * A Tab is responsible to insert HTML code into a <div> that can be selected by config.selector.
 * 
 * configuration object description:
 *
 * {
 *    selector:                  the selector identifies the <div> that should receive the content.
 *    configName:                the name of the configuration to use to genenerate the product table. No table gets added when it's undefined.
 *    contentTemplateName:       the name of the HTML template to use. If a product table is configured, the template also requires the PLACEHOLDER in its content.
 *    languages:                 an array of supported languages defined in shop.Language
 *    tableGenerator (optional): the name of the generator to use, default = ProductTableGenerator
 * }
 *
 * onTabContentChanged(callback) adds a callback to the tab that gets called every time when the tab content gets updated.
 * The callback does not get anything from the caller (argument count = 0).
 */
shop.ui.Tab = function Tab(config, optionalSetHtmlContent, optionalProductTableGenerator, optionalBus) {
   var PLACEHOLDER = '<!--DYNAMIC_CONTENT-->';
   
   var tabContent = new shop.ui.TabContent(config, optionalProductTableGenerator, optionalBus);
   
   var tabContentChangedCallbacks = [];
   var activeLanguage;
   
   var defaultHtmlContentSetter = function defaultHtmlContentSetter(selector, htmlContent) {
      $(selector).html(htmlContent);
   };
   
   var setHtmlContentOfTab = (optionalSetHtmlContent === undefined) ? defaultHtmlContentSetter.bind(this, config.selector) : optionalSetHtmlContent.bind(this, config.selector);
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultHtmlContentSetter : optionalSetHtmlContent;
   
   var notifyTableChangeListeners = function notifyTableChangeListeners() {
      tabContentChangedCallbacks.forEach(function(callback) { callback(config.selector);});
   };
   
   var updateHtmlContent = function updateHtmlContent() {
      tabContent.getHtmlContent()
         .then(setHtmlContentOfTab)
         .then(notifyTableChangeListeners, shop.Context.log);
   };
   
   this.getId = function getId() {
      return config.id;
   }; 
   
   this.getSelector = function getSelector() {
      return config.selector;
   };
   
   this.onLanguageChanged = function onLanguageChanged(newLanguage) {
      activeLanguage = newLanguage;
      updateHtmlContent();
   };
   
   this.onTabContentChanged = function onTabContentChanged(callback) {
      tabContentChangedCallbacks[tabContentChangedCallbacks.length] = callback;
   };
   
   this.setHtmlContentOfChildElement = function setHtmlContentOfChildElement(childElementId, htmlContent) {
      setHtmlContent(config.selector + ' #' + childElementId, htmlContent);
      notifyTableChangeListeners();
   };
   
   tabContent.addContentChangedListener(function() {updateHtmlContent();});
   
   this.initialize();
};

shop.ui.Tab.prototype = new shop.ui.AbstractHideableLanguageDependentComponent();