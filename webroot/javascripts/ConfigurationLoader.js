/* global cash, assertNamespace */

assertNamespace('shop.configuration');

/**
 * constructor for a ConfigurationLoader.
 */
shop.configuration.ConfigurationLoader = function ConfigurationLoader(url, selector) {

      var setHtml = function setHtml(htmlCode) {
         $(selector).html(htmlCode);
      } 
      
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