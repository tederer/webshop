/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../bus/Bus.js');
require('../Promise.js');
require('./tablegenerators/ProductsTableGenerator.js');
require('./AbstractTabContent.js');

assertNamespace('shop.ui');

shop.ui.TabContent = function TabContent(config, optionalProductTableGenerator, optionalBus) {
   var PLACEHOLDER = '<!--DYNAMIC_CONTENT-->';
   
   var bus = optionalBus || shop.Context.bus;
   var tableGenerator;

   if (optionalProductTableGenerator !== undefined) {
      tableGenerator = optionalProductTableGenerator;
   } else {
      if (config.tableGenerator === undefined) {
         tableGenerator = new shop.ui.tablegenerators.ProductTableGenerator();
      } else {
         tableGenerator = new shop.ui.tablegenerators[config.tableGenerator]();
      }
   }
   
   var configs = {};
   var templateContents = {};
   var activeLanguage;
   var contentChangedCallbacks = [];
   
   var formatErrorMessage = function formatErrorMessage(message) {
      return '<p class="errorMessage">' + message + '</p>';
   };
   
   var createDynamicHtmlContent = function createDynamicHtmlContent() {
      var executor = function executor(fulfill, reject) {

         if (config.configName === undefined) {
            fulfill('');
         } else {
            if (activeLanguage === undefined) {
               fulfill('');
            } else {
               var configKey = config.configName + '_' + activeLanguage;
               var data = configs[configKey];
               if (data instanceof Error) {
                  fulfill(formatErrorMessage(data.message));
               } else {
                  if (data === undefined) {
                     fulfill(formatErrorMessage('configuration ' + config.configName + ' is not available in language ' + activeLanguage + '!'));
                  } else {
                     fulfill(tableGenerator.generateTable(configKey, data));
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
         var templateContent = (config.contentTemplateName === undefined) ? PLACEHOLDER : templateContents[config.contentTemplateName + '_' + activeLanguage];
         if (templateContent === undefined) {
            content = formatErrorMessage('template content ' + config.contentTemplateName + ' is not available!');
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
   
   this.getHtmlContent = function getHtmlContent() {
      return createDynamicHtmlContent().then(insertContentIntoTemplate);
   };
   
   this.addContentChangedListener = function addContentChangedListener(callback) {
      contentChangedCallbacks.push(callback);
   };
   
   var onLanguageChanged = function onLanguageChanged(newLanguage) {
      activeLanguage = newLanguage;
   };
   
   var notifyTabContentChangedListeners = function notifyTabContentChangedListeners() {
      for(var index = 0; index < contentChangedCallbacks.length; index++) {
         contentChangedCallbacks[index]();
      }
   };
   
   var setMapContent = function setMapContent(map, key, value) {
      map[key] = value;
      notifyTabContentChangedListeners();
   };
   
   for (var index = 0; index < config.languages.length; index++) {
      var language = config.languages[index];
      
      if (config.configName !== undefined) {
         bus.subscribeToPublication('/jsonContent/' + language + '/' + config.configName, setMapContent.bind(this, configs, config.configName + '_' + language));
      }
      
      if (config.contentTemplateName !== undefined) {
         bus.subscribeToPublication('/htmlContent/' + language + '/' + config.contentTemplateName, setMapContent.bind(this, templateContents, config.contentTemplateName + '_' + language));
      }
   }
   
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onLanguageChanged);
};

shop.ui.TabContent.prototype = new shop.ui.AbstractTabContent();