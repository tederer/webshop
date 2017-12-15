/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('./AbstractHideableLanguageDependentComponent.js');

assertNamespace('shop.ui');

/**
 * An overlay shows its content on top of the whole shop.
 *
 * configuration object description:
 *
 * {
 *    selector:            the selector identifies the <div> that is the overlay
 *    contentTemplateName: the name of the HTML template to use.
 *    languages:           an array of supported languages defined in shop.Language
 * }
 */
shop.ui.Overlay = function Overlay(config, optionalSetHtmlContent, optionalBus) {
   
   var thisInstance = this;
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var defaultSetHtmlContent = function defaultSetHtmlContent(content) {
      $(config.selector).html(content);
   };
   
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultSetHtmlContent : optionalSetHtmlContent.bind(this, config.selector);
   var templateContents = {};
   var activeLanguage;
   
   var updateHtmlContent = function updateHtmlContent() {
      if (activeLanguage !== undefined && templateContents[activeLanguage] !== undefined) {
         setHtmlContent(templateContents[activeLanguage]);
      }
   };
   
   var setTemplateContent = function setTemplateContent(language, data) {
      templateContents[language] = data;
      updateHtmlContent();
   };
   
   this.getSelector = function getSelector() {
      return config.selector;
   };
   
   this.onLanguageChanged = function onLanguageChanged(newLanguage) {
      activeLanguage = newLanguage;
      updateHtmlContent();
   };
   
   if (config.contentTemplateName !== undefined) {
      for (var index = 0; index < config.languages.length; index++) {
         var language = config.languages[index];
         bus.subscribeToPublication('/htmlContent/' + language + '/' + config.contentTemplateName, setTemplateContent.bind(this, language));
      }
   }
   
   this.initialize();
};

shop.ui.Overlay.prototype = new shop.ui.AbstractHideableLanguageDependentComponent();