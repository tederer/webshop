/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('./AbstractHideableLanguageDependentComponent.js');

assertNamespace('shop.ui');

/**
 * A picture overlay shows a picture as an overlay of the whole shop.
 */
shop.ui.PictureOverlay = function PictureOverlay(config, optionalSetHtmlContent, optionalBus) {
   
   var thisInstance = this;
   var TEMPLATE_NAME = 'pictureOverlay';
   var PLACEHOLDER = '<!--image-->';
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var defaultSetHtmlContent = function defaultSetHtmlContent(content) {
      $(config.selector).html(content);
   };
   
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultSetHtmlContent : optionalSetHtmlContent.bind(this, config.selector);
   var templateContents = {};
   var activeLanguage;
   var relativePicturePath;
   var isVisible;
   
   var updateHtmlContent = function updateHtmlContent() {
      if (activeLanguage !== undefined && templateContents[activeLanguage] !== undefined) {
         if (relativePicturePath !== undefined) {
            var replacement = '<img src="' + relativePicturePath + '">';
            setHtmlContent(templateContents[activeLanguage].replace(PLACEHOLDER, replacement));
            thisInstance.show();
            isVisible = true;
         } else {
            if (isVisible) {
               thisInstance.hide();
               isVisible = false;
            }
         }
      }
   };
   
   var setTemplateContent = function setTemplateContent(language, data) {
      templateContents[language] = data;
      updateHtmlContent();
   };
   
   var onShownPicture = function onShownPicture(newRelativePicturePath) {
      relativePicturePath = newRelativePicturePath;
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
   
   bus.subscribeToPublication(shop.topics.SHOWN_PICTURE, onShownPicture.bind(this));
   this.initialize();
};

shop.ui.PictureOverlay.prototype = new shop.ui.AbstractHideableLanguageDependentComponent();