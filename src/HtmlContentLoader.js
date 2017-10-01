/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');

assertNamespace('shop.configuration');

/**
 * A HtmlContentLoader loads HTML content and publishes the content on the bus.
 * 
 * To start loading, call load() and provide the names of the files (without file extension) that should get loaded.
 * 
 * Content topic: /htmlContent/<language>/<contentName>
 *
 * example: The german content of "food" will get published on the topic "/htmlContent/de/food".
 */
shop.configuration.HtmlContentLoader = function HtmlContentLoader(downloadBaseUrl, languages, optionalBus) {
   
   var FILE_EXTENSION = '.html';
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var getTopicForName = function getTopicForName(name) {
      return '/htmlContent/' + name.substring(0, name.length - FILE_EXTENSION.length);
   };
   
   this.onContentLoaded = function onContentLoaded(name, content) {
      bus.publish(getTopicForName(name), content);
   };
   
   this.onContentLoadingFailed = function onContentLoadingFailed(name, error) {
      bus.publish(getTopicForName(name), new Error(error));
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
