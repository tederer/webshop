/* global shop, assertNamespace */

require('./NamespaceUtils.js');

assertNamespace('shop.configuration');

/**
 * constructor for the Configuration.
 */
shop.configuration.Configuration = function Configuration(url, selector) {

      var setHtml = function setHtml(htmlCode) {
         $(selector).html(htmlCode);
      };
      
      this.initialize = function initialize() {
         console.log('loading ' + url);
         $.ajax(url, {
            dataType: 'text',
            success: function(data) {
               setHtml('success: ' + data);
               },
            error: function(jqXHR) {
               setHtml('error: ' + jqXHR.status + ' ' + jqXHR.statusText);
               }
            });
      };
};