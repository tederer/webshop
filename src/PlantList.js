/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./Promise.js');

assertNamespace('shop');

shop.PlantList = function PlantList(configProvider, htmlContent) {
   
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
      
      htmlContent.set(content);
   };
   
   configProvider.get('pflanzen').then(createTable);
};
