/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./Promise.js');
require('./ResourceProvider.js');

assertNamespace('shop.configuration');

/**
 * constructor for the HtmlContentLoader.
 */
shop.configuration.HtmlContentLoader = function HtmlContentLoader(downloadBaseUrl, languages, optionalBus) {
   
   var FILE_EXTENSION = '.html';
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   this.onContentLoaded = function onContentLoaded(name, content) {
      var topic = '/htmlContent/' + name.substring(0, name.length - FILE_EXTENSION.length);
      bus.publish(topic, content);
   };
   
   this.onContentLoadingFailed = function onContentLoadingFailed(name, error) {
      console.log('HtmlContentLoader.onContentLoadingFailed()');
   };
   
   this.load = function load(names) {
      var namesWithLanguageAndFileExtension = [];
      
      for (var languageIndex = 0; languageIndex < languages.length; languageIndex++) {
         for (var nameIndex = 0; nameIndex < names.length; nameIndex++) {
            namesWithLanguageAndFileExtension[namesWithLanguageAndFileExtension.length] = languages[languageIndex] + '/' + names[nameIndex] + FILE_EXTENSION;
         }
      }
      shop.configuration.HtmlContentLoader.prototype.load.call(this, downloadBaseUrl, namesWithLanguageAndFileExtension);
   };
};

shop.configuration.HtmlContentLoader.prototype = new shop.configuration.AbstractContentLoader();
