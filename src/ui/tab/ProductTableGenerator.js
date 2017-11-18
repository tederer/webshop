/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');

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
   var configKey;
   
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
   
   var addHeader = function addHeader(classId) {
      intentations++;
      append('<th class="' + classId + '"></th>');
      intentations--;
   };
   
   var addShoppingCartAdder = function addShoppingCartAdder(product) {
      intentations++;
      var commonId = configKey + '_' + product.id;
      var buttonId = commonId + '_button';
      var textfieldId = commonId + '_textfield';
      var button = '<button type="button" id="' + buttonId + '" onClick="shop.ui.Actions.addProductToShoppingCart(\'' + product.id + '\', \'' + textfieldId + '\');"></button>';
      var input = '<input type="text" id="' + textfieldId + '" value="1" size="2" onKeyUp="shop.ui.Actions.checkInputValidity(\'' + commonId + '\');">';
      append('<td>' + input + '&nbsp;' + button + '</td>');
      intentations--;
   };
   
   var addImage = function addImage(imageSmall, imageBig, url) {
      intentations++;
      var content = '';
      if (imageSmall !== undefined) {
         content = '<img src="' + imageSmall + '">';
         if (imageBig !== undefined) {
            content = content + '<br><a class="bigPictureAnchor" href="javascript:shop.ui.Actions.showPicture(\'' + imageBig + '\');"></a>';
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
   
   var addCaptions = function addCaptions() {
      intentations++;
      append('<tr>');
      addHeader('fotoHeader');
      addHeader('nameHeader');
      addHeader('descriptionHeader');
      addHeader('priceHeader');
      addHeader('&nbsp;');
      append('</tr>');
      intentations--;
   };
   
   this.generateTable = function generateTable(configurationId, config) {
      intentations = 1;
      content = '';
      configKey = configurationId;
      
      append('<table class="alternierendeZeilenFarbe ersteSpalteZentriert dritteSpalteZentriert">');
      addCaptions();
      config.products.forEach(function(product) { 
         addRow(product);
      });  
      append('</table>');
      return content;
   };
};
