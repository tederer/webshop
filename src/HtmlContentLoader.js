/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./Promise.js');
require('./ResourceProvider.js');

assertNamespace('shop.configuration');

/**
 * constructor for the HtmlContentLoader.
 */
shop.configuration.HtmlContentLoader = function HtmlContentLoader(config) {
   
   this.onContentLoaded = function onContentLoaded(name, content) {
      console.log('HtmlContentLoader.onContentLoaded()');
   };
   
   this.onContentLoadingFailed = function onContentLoadingFailed(name, error) {
      console.log('HtmlContentLoader.onContentLoaded()');
   };
   
   var names = config.contents.map(function(contentConfig) { return contentConfig.name; });
   console.log(names);
   this.load(config.contentBaseUrl, names);
};

shop.configuration.HtmlContentLoader.prototype = new shop.configuration.AbstractContentLoader();
