/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../bus/Bus.js');
require('../Promise.js');
require('./AbstractHideableLanguageDependentComponent.js');
require('./tablegenerators/ProductTableGenerator.js');

assertNamespace('shop.ui');

/**
 * A Tab is responsible to insert HTML code into a <div> that can be selected by config.selector.
 * 
 * configuration object description:
 *
 * {
 *    tabId:                  this ID is required to show/hide the tab based on the shop.topics.VISIBLE_TAB publication
 *    selector:               the selector identifies the <div> that should receive the content.
 *    configName:             the name of the configuration to use to genenerate the product table. No table gets added when it's undefined.
 *    contentTemplateName:    the name of the HTML template to use. If a product table is configured, the template also requires the PLACEHOLDER in its content.
 *    languages:              an array of supported languages defined in shop.Language
 * }
 *
 * onTabContentChanged(callback) adds a callback to the tab that gets called every time when the tab content gets updated.
 * The callback does not get anything from the caller (argument count = 0).
 */
shop.ui.Tab = function Tab(config, optionalSetHtmlContent, optionalProductTableGenerator, optionalBus) {
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var productTableGenerator = (optionalProductTableGenerator === undefined) ? new shop.ui.ProductTableGenerator() : optionalProductTableGenerator;
   
   var PLACEHOLDER = '<!--DYNAMIC_CONTENT-->';
   
   var configs = {};
   var templateContents = {};
   var tabContentChangedCallbacks = [];
   var activeLanguage;
   var visible = false;
   
   var defaultSetHtmlContent = function defaultSetHtmlContent(content) {
      $(config.selector).html(content);
   };
   
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultSetHtmlContent : optionalSetHtmlContent.bind(this, config.selector);
   
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
                     fulfill(productTableGenerator.generateTable(configKey, data));
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
   
   var notifyTableChangeListeners = function notifyTableChangeListeners() {
      tabContentChangedCallbacks.forEach(function(callback) { callback(config.selector);});
   };
   
   var updateHtmlContent = function updateHtmlContent() {
      createDynamicHtmlContent()
         .then(insertContentIntoTemplate)
         .then(setHtmlContent)
         .then(notifyTableChangeListeners, shop.Context.log);
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
   
   var onVisibleTabPublication = function onVisibleTabPublication(publishedTabId) {
      var newVisible = config.tabId === publishedTabId;
      
      if (newVisible !== visible) {
         if (newVisible) {
            shop.ui.Tab.prototype.show.call(this);
         } else {
            shop.ui.Tab.prototype.hide.call(this);
         }
         visible = newVisible;
      }
   };
   
   var setMapContent = function setMapContent(map, key, value) {
      map[key] = value;
      updateHtmlContent();
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
   
   bus.subscribeToPublication(shop.topics.VISIBLE_TAB, onVisibleTabPublication.bind(this));
   
   this.initialize();
};

shop.ui.Tab.prototype = new shop.ui.AbstractHideableLanguageDependentComponent();