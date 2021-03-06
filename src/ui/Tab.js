/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('./TabContent.js');
require('./AbstractHideableLanguageDependentComponent.js');

assertNamespace('shop.ui');

/**
 * A Tab is responsible to insert HTML code into a <div> that can be selected by config.selector.
 * 
 * configuration object description:
 *
 * {
 *    selector:                     the selector identifies the <div> that is the tab
 *    contentSelector (optional):   the selector identifies the <div> that should receive the content. If it is undefined the value in "selector" will be used.
 *    configName:                   the name of the configuration to use to genenerate the product table. No table gets added when it's undefined.
 *    contentTemplateName:          the name of the HTML template to use. If a product table is configured, the template also requires the PLACEHOLDER in its content.
 *    languages:                    an array of supported languages defined in shop.Language
 *    tableGenerator (optional):    the name of the generator to use, default = ProductTableGenerator
 * }
 *
 * addTabContentChangedListener(callback) adds a callback to the tab that gets called every time when the tab content gets updated.
 * The callback does not get anything from the caller (argument count = 0).
 */
shop.ui.Tab = function Tab(config, optionalTabContentFactory, optionalSetHtmlContent) {
   var PLACEHOLDER = '<!--DYNAMIC_CONTENT-->';
   var revision = 1;
   
   var createTabContentConfig = function createTabContentConfig(config) {
      return {
         configName:          config.configName,
         contentTemplateName: config.contentTemplateName,
         languages:           config.languages,
         tableGenerator:      config.tableGenerator
      };
   };
   
   var tabContentConfig = createTabContentConfig(config);
   var tabContent = optionalTabContentFactory === undefined ? new shop.ui.TabContent(tabContentConfig) : optionalTabContentFactory(tabContentConfig);
   
   var tabContentChangedCallbacks = [];
   
   var defaultHtmlContentSetter = function defaultHtmlContentSetter(selector, htmlContent) {
      $(selector).html(htmlContent);
   };
   
   var contentSelector = config.contentSelector || config.selector;
   var setHtmlContentOfTab = (optionalSetHtmlContent === undefined) ? defaultHtmlContentSetter.bind(this, contentSelector) : optionalSetHtmlContent.bind(this, contentSelector);
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultHtmlContentSetter : optionalSetHtmlContent;
   
   var notifyTableChangeListeners = function notifyTableChangeListeners() {
      var revisionToUse = revision++;
      tabContentChangedCallbacks.forEach(function(callback) { callback(config.selector, revisionToUse);});
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
   };
   
   this.addTabContentChangedListener = function addTabContentChangedListener(callback) {
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