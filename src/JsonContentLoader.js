/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./ResourceProvider.js');

assertNamespace('shop.configuration');

/**
 * A JsonContentLoader loads JSON content and publishes the content on the bus.
 * 
 * To start loading, call load() and provide the names of the files (without file extension) that should get loaded.
 * 
 * Content topic: /jsonContent/<language>/<contentName>
 *
 * example: The german content of "food" will get published on the topic "/jsonContent/de/food".
 */
shop.configuration.JsonContentLoader = function JsonContentLoader(downloadBaseUrl, languages, optionalBus) {
   
   var FILE_EXTENSION = '.json';
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var getTopicForName = function getTopicForName(name) {
      return '/jsonContent/' + name.substring(0, name.length - FILE_EXTENSION.length);
   };
   
   this.onContentLoaded = function onContentLoaded(name, content) {
      var data;
      
      try {
         data = JSON.parse(content);
      } catch (error) {
         data = new Error(error);
      }
      bus.publish(getTopicForName(name), data);
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
      shop.configuration.JsonContentLoader.prototype.load.call(this, downloadBaseUrl, namesWithLanguageAndFileExtension);
   };
};

shop.configuration.JsonContentLoader.prototype = new shop.configuration.AbstractContentLoader();
