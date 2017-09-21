/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./AbstractTabContent.js');

assertNamespace('shop.ui');

shop.ui.TabContent = function TabContent(selector, configName, contentTemplateName, configProvider, templateProvider, optionalSetHtmlContent) {
   
   var PLACEHOLDER = '<!--DYNAMIC_CONTENT-->';
   
   var configContent;
   var templateContent;
   
   var defaultSetHtmlContent = function defaultSetHtmlContent(content) {
      $(selector).html(content);
   };
   
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultSetHtmlContent : optionalSetHtmlContent.bind(this, selector);
   
   var setConfigContent = function setConfigContent(content) {
      configContent = content;
   };
   
   var setTemplateContent = function setTemplateContent(content) {
      templateContent = content;
   };
   
   var formatErrorMessage = function formatErrorMessage(message) {
      return '<p class="errorMessage">' + message + '</p>';
   };
   
   var setErrorHtmlContent = function setErrorHtmlContent(description, error) {
      setHtmlContent(formatErrorMessage(description + ': ' + error));
   };
   
   var createDynamicHtmlContent = function createDynamicHtmlContent() {
      
      var executor = function executor(fulfill, reject) {

         var content = '<table>';
         
         try {
            var config = JSON.parse(configContent);
            config.plants.forEach(function(plant) { content = content + '<tr><td>' + plant.name + '</td><td>' + plant.price + ' EUR</td></tr>'; });  
            content = content + '</table>';
         } catch(e) {
            content = formatErrorMessage('Failed to parse config: ' + e);
         }
         
         fulfill(content);
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
   
   var updateHtmlContent = function updateHtmlContent() {
      
      if (configContent !== undefined && templateContent !== undefined) {
         createDynamicHtmlContent().then(insertContentIntoTemplate).then(setHtmlContent, setErrorHtmlContent.bind(this, 'Failed to update HTML content'));
      }
   };
   
   this.getSelector = function getSelector() {
      return selector;
   };
   
   configProvider.get(configName)
      .then(setConfigContent)
      .then(updateHtmlContent, setErrorHtmlContent.bind(this, 'Failed to download config file'));
      
   templateProvider.get(contentTemplateName)
      .then(setTemplateContent)
      .then(updateHtmlContent, setErrorHtmlContent.bind(this, 'Failed to download template file'));
};

shop.ui.TabContent.prototype = new shop.ui.AbstractTabContent();