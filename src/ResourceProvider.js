/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./Promise.js');

assertNamespace('shop.configuration');

/**
 * constructor for the ResourceProvider.
 */
shop.configuration.ResourceProvider = function ResourceProvider(configBaseUrl) {
   
   this.get = function get(name) {
      var url = configBaseUrl + '/' + name + '.json';
      
      var executor = function executor(fulfill, reject) {
         
         $.ajax(url, {
            dataType: 'text',
            success: function(data) {
               fulfill(data);
               },
            error: function(jqXHR) {
               reject('failed to download ' + url + ': ' + jqXHR.status + ' ' + jqXHR.statusText);
               }
            });
      };
      
      return new common.Promise(executor);
   };
};
