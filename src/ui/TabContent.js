/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('./AbstractTabContent.js');

assertNamespace('shop.ui');

/**
 * If no template is required, then contentTemplateName should be set to undefined.
 */
shop.ui.TabContent = function TabContent(selector, configName, contentTemplateName, configProvider, templateProvider, optionalSetHtmlContent) {
   
   var State = {
      PENDING:       'pending',
      LOADED:        'loaded',
      ERROR:         'error',
      NOT_REQUIRED:  'not required'
   };
   
   var PLACEHOLDER = '<!--DYNAMIC_CONTENT-->';
   
   var configContent;
   var templateContent;
   var configDownloadState = State.PENDING;
   var templateDownloadState = State.PENDING;
   var errors = [];
   
   var defaultSetHtmlContent = function defaultSetHtmlContent(content) {
      $(selector).html(content);
   };
   
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultSetHtmlContent : optionalSetHtmlContent.bind(this, selector);
   
   var setConfigContent = function setConfigContent(content) {
      configContent = content;
      configDownloadState = State.LOADED;
   };
   
   var setTemplateContent = function setTemplateContent(content) {
      templateContent = content;
      templateDownloadState = State.LOADED;
   };
   
   var formatErrorMessage = function formatErrorMessage(message) {
      return '<p class="errorMessage">' + message + '</p>';
   };
   
   var setErrorHtmlContent = function setErrorHtmlContent(description, error) {
      setHtmlContent(formatErrorMessage(description + ': ' + error));
   };
   
   var getErrorsAsString = function getErrorsAsString() {
      return errors.join('<br>');
   };
   
   var createDynamicHtmlContent = function createDynamicHtmlContent() {
      
      var executor = function executor(fulfill, reject) {

         try {
            var content = '<table>';
            var config = JSON.parse(configContent);
            config.plants.forEach(function(plant) { content = content + '<tr><td>' + plant.name + '</td><td>' + plant.price + ' EUR</td></tr>'; });  
            content = content + '</table>';
            fulfill(content);
         } catch(e) {
            reject(e);
         }
      };
      
      return new common.Promise(executor);
   };
   
   var insertContentIntoTemplate = function insertContentIntoTemplate(dynamicContent) {
      
      var content = '';
      var placeholderStartPosition = templateContent.indexOf(PLACEHOLDER);
      var placeholderEndPosition = Math.min(templateContent.length - 1, placeholderStartPosition + PLACEHOLDER.length - 1);
      
      if (placeholderStartPosition > -1) {
         var prefix = templateContent.substring(0, placeholderStartPosition);
         var suffix = templateContent.substring(placeholderEndPosition + 1);
         content = prefix + dynamicContent + suffix;
      } else {
         throw 'Template does not contain placeholder';
      }
      
      return content;
   };
   
   var downloadTasksFished = function downloadTasksFished() {
      return configDownloadState !== State.PENDING && templateDownloadState !== State.PENDING;
   };
   
   var updateHtmlContent = function updateHtmlContent() {
      
      if (downloadTasksFished()) {
         
         if (configDownloadState === State.LOADED && (templateDownloadState === State.LOADED || templateDownloadState === State.NOT_REQUIRED)) {
            
            if (templateDownloadState === State.NOT_REQUIRED) {
               templateContent = PLACEHOLDER;
            }
            
            createDynamicHtmlContent()
               .then(insertContentIntoTemplate, function(error) { return insertContentIntoTemplate(formatErrorMessage('Failed to parse config: ' + error));})
               .then(setHtmlContent, setErrorHtmlContent.bind(this, 'Failed to update HTML content'));
         }

         if (configDownloadState === State.ERROR && (templateDownloadState === State.LOADED || templateDownloadState === State.NOT_REQUIRED)) {
            if (templateDownloadState === State.NOT_REQUIRED) {
               templateContent = PLACEHOLDER;
            }
            
            (new common.Promise(function(fulfill) { fulfill(formatErrorMessage(getErrorsAsString())); })).then(insertContentIntoTemplate).then(setHtmlContent);
         }
         
         if (configDownloadState === State.NOT_REQUIRED && templateDownloadState === State.LOADED) {
            setHtmlContent(templateContent);
         }
         
         if (templateDownloadState === State.ERROR) {
            setHtmlContent(formatErrorMessage(getErrorsAsString()));
         }
      } 
   };
   
   var setConfigErrorState = function setConfigErrorState(description, error){
      configDownloadState = State.ERROR;
      errors[errors.length] = description + ': ' + error;
   };
   
   var setTemplateErrorState = function setTemplateErrorState(description, error){
      templateDownloadState = State.ERROR;
      errors[errors.length] = description + ': ' + error;
   };
   
   this.getSelector = function getSelector() {
      return selector;
   };
   
   this.onLanguageChanged = function onLanguageChanged(newLanguage) {
   
      if (configName === undefined) {
         configDownloadState = State.NOT_REQUIRED;
         updateHtmlContent();
      } else {
         configProvider.get(configName)
            .then(setConfigContent, setConfigErrorState.bind(this, 'Failed to download config file'))
            .then(updateHtmlContent);
      }
      
      if (contentTemplateName === undefined) {
         templateDownloadState = State.NOT_REQUIRED;
         updateHtmlContent();
      } else {
         templateProvider.get(contentTemplateName)
            .then(setTemplateContent, setTemplateErrorState.bind(this, 'Failed to download template file'))
            .then(updateHtmlContent);
      }
   };
   
   this.initialize();
};

shop.ui.TabContent.prototype = new shop.ui.AbstractTabContent();