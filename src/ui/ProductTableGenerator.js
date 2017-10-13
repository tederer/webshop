/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Topics.js');
require('../bus/Bus.js');

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
   var linkText = { de: 'im Internet', en: 'on the internet' };
   var currentLanguage;
   
   var append = function(text) {
      var line = '';
      for (var i = 0; i < intentations; i++) {
         line += intentationAsString;
      }
      content += line + text + CRLF;
   };
   
   var addText = function addText(text) {
      intentations++;
      append('<td>' + ((text === undefined) ? '&nbsp;' : text) + '</td>');
      intentations--;
   };
   
   var addPrice = function addPrice(price) {
      intentations++;
      append('<td>' + price.toFixed(2) + ' EUR</td>');
      intentations--;
   };
   
   var addImage = function addImage(imageSmall, imageBig, url) { // TODO insert link to big image if available
      intentations++;
      var content = '';
      if (imageSmall !== undefined) {
         content = '<img src="' + imageSmall + '">';
         if (imageBig !== undefined) {
            content = '<a href="javascript:shop.ui.BigPicture.show(\'' + imageBig + '\');">' + content + '</a>';
         }
      } else {
         if (url !== undefined) {
            content = '<a href="' + url + '">' + linkText[currentLanguage]+ '</a>';
         }
      }
      append('<td>' + content + '</td>');
      intentations--;
   };
   
   var addRow = function addRow(plant) {
      intentations++;
      append('<tr>');
      addImage(plant.imageSmall, plant.imageBig, plant.url);
      addText(plant.name);
      addText(plant.description);
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
      return content;
   };
   
   shop.Context.bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, function(language) { currentLanguage = language; });
};

