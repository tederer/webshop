/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./AbstractTabContent.js');

assertNamespace('shop.ui');

shop.ui.TabContent = function TabContent(selector, configName, contentTemplateName, configProvider, templateProvider, optionalSetHtmlContent) {
   
   var State = {
      PENDING: 'pending',
      LOADED:  'loaded',
      ERROR:   'error'
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
         
         if (configDownloadState === State.LOADED && templateDownloadState === State.LOADED) {
            
            createDynamicHtmlContent()
               .then(insertContentIntoTemplate, function(error) { return insertContentIntoTemplate(formatErrorMessage('Failed to parse config: ' + error));})
               .then(setHtmlContent, setErrorHtmlContent.bind(this, 'Failed to update HTML content'));
         }

         if (templateDownloadState === State.LOADED && configDownloadState === State.ERROR) {
               (new common.Promise(function(fulfill) { fulfill(formatErrorMessage(getErrorsAsString())); })).then(insertContentIntoTemplate).then(setHtmlContent);
         }
         
         if (templateDownloadState === State.ERROR) {
            setHtmlContent(formatErrorMessage(getErrorsAsString()));
         }
      } 
   };
   
   this.getSelector = function getSelector() {
      return selector;
   };
   
   configProvider.get(configName)
      .then(setConfigContent, function(error) { configDownloadState = State.ERROR; errors[errors.length] = 'Failed to download config file: ' + error; })
      .then(updateHtmlContent);
      
   templateProvider.get(contentTemplateName)
      .then(setTemplateContent, function(error) { templateDownloadState = State.ERROR; errors[errors.length] = 'Failed to download template file: ' + error; })
      .then(updateHtmlContent);
};

shop.ui.TabContent.prototype = new shop.ui.AbstractTabContent();