/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./Context.js');
require('./Promise.js');
require('./ResourceProvider.js');

assertNamespace('shop.configuration');

/**
 * constructor for the AbstractContentLoader.
 *
 * Derived Object have to override:
 *    1) onContentLoaded
 *    2) onContentLoadingFailed
 *
 * To start the process of downloading content, call the load function.
 */
shop.configuration.AbstractContentLoader = function AbstractContentLoader(optionalresourceProviderFactoryFunction) {
   
   var defaultresourceProviderFactoryFunction = function defaultresourceProviderFactoryFunction(configBaseUrl) {
      return new shop.configuration.ResourceProvider(configBaseUrl);
   };
   
   var resourceProviderFactoryFunction = (optionalresourceProviderFactoryFunction === undefined) ? 
                                             defaultresourceProviderFactoryFunction : optionalresourceProviderFactoryFunction;
   
   this.onContentLoaded = function onContentLoaded(name, content) {
      shop.Context.log('Derived object does not override onContentLoaded() of AbstractContentLoader!');
   };
   
   this.onContentLoadingFailed = function onContentLoadingFailed(name, error) {
      shop.Context.log('Derived object does not override onContentLoaded() of AbstractContentLoader!');
   };
   
   /**
    * Starts the download process.
    *
    * contentBaseUrl    the base URL from which the content shall get downloaded (e.g. http://192.168.1.1/content)
    * names             an array of strings that define the names of the files whose content shall be downloaded (e.g. [ 'plants_template.html', 'plants_config.json' ])
    */
   this.load = function load(contentBaseUrl, names) {
      var resourceProvider = resourceProviderFactoryFunction(contentBaseUrl);
      
      for (var index = 0; index < names.length; index++) {
         var name = names[index];
         resourceProvider.get(name)
            .then(this.onContentLoaded.bind(this, name), this.onContentLoadingFailed.bind(this, name));
      }
   };
};
