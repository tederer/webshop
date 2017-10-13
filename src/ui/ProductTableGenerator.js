/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');

assertNamespace('shop.ui');

/**
 * The ProductTableGenerator takes an object containing the products configuration and transform it
 * into a HTML table.
 */
shop.ui.ProductTableGenerator = function ProductTableGenerator() {

   var CRLF = '\r\n';
   var intentationAsString = '   ';
   var intentations;
   var content;
   
   var append = function(text) {
      var line = '';
      for (var i = 0; i < intentations; i++) {
         line += intentationAsString;
      }
      content += line + text + CRLF;
   };
   
   var addColumn = function addColumn(value) {
      intentations++;
      append('<td>' + ((value === undefined) ? '&nbsp;' : value) + '</td>');
      intentations--;
   };
   
   var addPrice = function addPrice(price) {
      intentations++;
      // TODO format price
      append('<td>' + price + ' EUR</td>');
      intentations--;
   };
   
   var addImage = function addImage(imageSmall, imageBig) { // TODO insert link to big image if available
      intentations++;
      var imageTag = (imageSmall !== undefined) ? '<img src="' + imageSmall + '"/>' : '&nbsp;';
      append('<td>' + imageTag + '</td>');
      intentations--;
   };
   
   var addRow = function addRow(plant) {
      intentations++;
      append('<tr>');
      addImage(plant.imageSmall, plant.imageBig);
      addColumn(plant.name);
      addColumn(plant.description);
      addPrice(plant.price);
      append('</tr>');
      intentations--;
   };
   
   this.generateTable = function generateTable(config) {
      intentations = 1;
      content = '';
      
      append('<table>');
      config.products.forEach(function(plant) { 
         addRow(plant);
      });  
      append('</table>');
      console.log(content);
      return content;
   };
};

