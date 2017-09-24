/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./Promise.js');

assertNamespace('shop.configuration');

/**
 * constructor for the ResourceProvider.
 */
shop.configuration.ResourceProvider = function ResourceProvider(configBaseUrl, fileExtension) {
   
   this.get = function get(name) {
      var url = configBaseUrl + '/' + name + '.' + fileExtension;
      
      var executor = function executor(fulfill, reject) {
         $.ajax(url, {
            dataType: 'text',
            success: function(data) {
               fulfill(data);
               },
            error: function(jqXHR) {
               var errorMessage = 'failed to download ' + url + ': ' + jqXHR.status + ' ' + jqXHR.statusText;
               reject(errorMessage);
               }
            });
      };
      
      return new common.Promise(executor);
   };
};
