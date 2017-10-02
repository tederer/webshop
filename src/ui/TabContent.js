/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('./AbstractTabContent.js');
require('../Promise.js');

assertNamespace('shop.ui');

/**
 * If no template is required, then contentTemplateName should be set to undefined.
 */
shop.ui.TabContent = function TabContent(selector, configName, contentTemplateName, languages, optionalSetHtmlContent, optionalBus, optionalLog) {
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var log = (optionalLog === undefined) ? console.log : optionalLog;
   
   var PLACEHOLDER = '<!--DYNAMIC_CONTENT-->';
   
   var configs = {};
   var templateContents = {};
   var activeLanguage;
   
   var defaultSetHtmlContent = function defaultSetHtmlContent(content) {
      $(selector).html(content);
   };
   
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultSetHtmlContent : optionalSetHtmlContent.bind(this, selector);
   
   var formatErrorMessage = function formatErrorMessage(message) {
      return '<p class="errorMessage">' + message + '</p>';
   };
   
   var createDynamicHtmlContent = function createDynamicHtmlContent() {
      var executor = function executor(fulfill, reject) {

         if (configName === undefined) {
            fulfill('');
         } else {
            if (activeLanguage === undefined) {
               reject('can not create dynamic HTML content for ' + configName + ' because no language is active!');
            } else {
               var data = configs[configName + '_' + activeLanguage];
               if (data instanceof Error) {
                  fulfill(formatErrorMessage(data.message));
               } else {
                  if (data === undefined) {
                     fulfill(formatErrorMessage('configuration ' + configName + ' is not available!'));
                  } else {
                     // TODO extract config compiler
                     var content = '<table>';
                     data.products.forEach(function(plant) { content = content + '<tr><td>' + plant.name + '</td><td>' + plant.price + ' EUR</td></tr>'; });  
                     content = content + '</table>';
                     fulfill(content);
                  }
               }
            }
         }
      };
      
      return new common.Promise(executor);
   };
   
   var insertContentIntoTemplate = function insertContentIntoTemplate(dynamicContent) {
      var content = '';
      
      if (activeLanguage === undefined) {
         throw 'can not insert dynamic HTML content into template because no language is active!';
      } else {
         var templateContent = (contentTemplateName === undefined) ? PLACEHOLDER : templateContents[contentTemplateName + '_' + activeLanguage];
         if (templateContent === undefined) {
            content = formatErrorMessage('template content ' + contentTemplateName + ' is not available!');
         } else {
            if (templateContent instanceof Error) {
               content = formatErrorMessage(templateContent.message);
            } else {
               if (dynamicContent.length === 0) {
                  content = templateContent;
               } else {
                  var placeholderStartPosition = templateContent.indexOf(PLACEHOLDER);
                  var placeholderEndPosition = Math.min(templateContent.length - 1, placeholderStartPosition + PLACEHOLDER.length - 1);
                  
                  if (placeholderStartPosition > -1) {
                     var prefix = templateContent.substring(0, placeholderStartPosition);
                     var suffix = templateContent.substring(placeholderEndPosition + 1);
                     content = prefix + dynamicContent + suffix;
                  } else {
                     content = formatErrorMessage('Template does not contain placeholder');
                  }
               }
            }
         }
      }
      return content;
   };
   
   var updateHtmlContent = function updateHtmlContent() {
      createDynamicHtmlContent()
         .then(insertContentIntoTemplate)
         .then(setHtmlContent, log);
   };
   
   this.getSelector = function getSelector() {
      return selector;
   };
   
   this.onLanguageChanged = function onLanguageChanged(newLanguage) {
   
      activeLanguage = newLanguage;
      updateHtmlContent();
    };
   
   var setMapContent = function setMapContent(map, key, value) {
      map[key] = value;
      updateHtmlContent();
   };
   
   for (var index = 0; index < languages.length; index++) {
      var language = languages[index];
      
      if (configName !== undefined) {
         bus.subscribeToPublication('/jsonContent/' + language + '/' + configName, setMapContent.bind(this, configs, configName + '_' + language));
      }
      
      if (contentTemplateName !== undefined) {
         bus.subscribeToPublication('/htmlContent/' + language + '/' + contentTemplateName, setMapContent.bind(this, templateContents, contentTemplateName + '_' + language));
      }
   }
   
   this.initialize();
};

shop.ui.TabContent.prototype = new shop.ui.AbstractTabContent();