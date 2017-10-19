/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Topics.js');
require('../bus/Bus.js');
require('../ui/Actions.js');

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
   
   var addShoppingCartAdder = function addShoppingCartAdder(product) {
      intentations++;
      append('<td><input type="text" id="quantity" value="1" size="2">&nbsp;<button type="button"></button></td>'); // TODO
      intentations--;
   };
   
   var addImage = function addImage(imageSmall, imageBig, url) { // TODO insert link to big image if available
      intentations++;
      var content = '';
      if (imageSmall !== undefined) {
         content = '<img src="' + imageSmall + '">';
         if (imageBig !== undefined) {
            content = '<a href="javascript:shop.ui.Actions.showPicture(\'' + imageBig + '\');">' + content + '</a>';
         }
      } else {
         if (url !== undefined) {
            content = '<a href="' + url + '"></a>'; // TODO
         }
      }
      append('<td>' + content + '</td>');
      intentations--;
   };
   
   var addRow = function addRow(product) {
      intentations++;
      append('<tr>');
      addImage(product.imageSmall, product.imageBig, product.url);
      addText(product.name);
      addText(product.description);
      addPrice(product.price);
      addShoppingCartAdder(product);
      append('</tr>');
      intentations--;
   };
   
   this.generateTable = function generateTable(config) {
      intentations = 1;
      content = '';
      
      append('<table>');
      config.products.forEach(function(product) { 
         addRow(product);
      });  
      append('</table>');
      return content;
   };
};
