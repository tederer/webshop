/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Topics.js');
require('../bus/Bus.js');
require('../ui/Actions.js');

assertNamespace('shop.ui');

/**
 * The ProductTableGenerator takes an object containing the products configuration and transform it
 * into a HTML table. 
 *
 * example configuration:
 *
 *   {
 *      "products": [
 *         { 
 *            "id": "AerangisEllisii",
 *            "name": "Aerangis ellisii",
 *            "price": 10,
 *            "description": "weiße Blüte, kleine Pflanze",
 *            "url": "http://some.webpage.com"
 *         },
 *         {
 *            "id": "CattleyaWalkerianaAlba",
 *            "name": "Cattleya walkeriana alba",
 *            "price": 12,
 *            "description": "Miniatur aus Brasilien",
 *            "imageSmall": "cattleya_small.jpg"
 *         }
 *      ]
 *   }
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
      var button = (product.id !== undefined) ? '<button type="button" id="' + product.id + '"></button>' : '';
      append('<td><input type="text" id="quantity" value="1" size="2">&nbsp;' + button + '</td>');
      intentations--;
   };
   
   var addImage = function addImage(imageSmall, imageBig, url) {
      intentations++;
      var content = '';
      if (imageSmall !== undefined) {
         content = '<img src="' + imageSmall + '">';
         if (imageBig !== undefined) {
            content = content + '<a class="bigPictureAnchor" href="javascript:shop.ui.Actions.showPicture(\'' + imageBig + '\');"></a>';
         }
      } else {
         if (url !== undefined) {
            content = '<a class="onTheInternetAnchor" href="' + url + '"></a>';
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
