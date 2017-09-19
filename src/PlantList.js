/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./AbstractTabContent.js');

assertNamespace('shop.ui');

shop.ui.PlantList = function PlantList(selector, configProvider, optionalSetHtmlContent) {
   
   var defaultSetHtmlContent = function defaultSetHtmlContent(content) {
      $(selector).html(content);
   };
   
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultSetHtmlContent : optionalSetHtmlContent.bind(this, selector);
   
   var createTable = function createTable(configContentAsString) {
      var content = '<table>';
      
      try {
         var config = JSON.parse(configContentAsString);
      
         config.plants.forEach(function(plant) {
            content = content + '<tr><td>' + plant.name + '</td><td>' + plant.price + ' EUR</td></tr>';
         });
         
         content = content + '</table>';
      } catch(error) {
         content = 'config contains an error';
      }
      
      setHtmlContent(content);
   };
   
   this.getSelector = function getSelector() {
      return selector;
   };
   
   configProvider.get('pflanzen').then(createTable);
};

shop.ui.PlantList.prototype = new shop.ui.AbstractTabContent();