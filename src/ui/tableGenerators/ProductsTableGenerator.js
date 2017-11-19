/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('./AbstractTableGenerator.js');

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
shop.ui.tablegenerators.ProductTableGenerator = function ProductTableGenerator() {

   var thisInstance = this;
   var configKey;
   
   var addPrice = function addPrice(price) {
      thisInstance.addText(price.toFixed(2) + ' EUR');
   };
   
   var addShoppingCartAdder = function addShoppingCartAdder(product) {
      var commonId = configKey + '_' + product.id;
      var buttonId = commonId + '_button';
      var textfieldId = commonId + '_textfield';
      var button = '<button type="button" id="' + buttonId + '" onClick="shop.ui.Actions.addProductToShoppingCart(\'' + product.id + '\', \'' + textfieldId + '\');"></button>';
      var input = '<input type="text" id="' + textfieldId + '" value="1" size="2" onKeyUp="shop.ui.Actions.checkInputValidity(\'' + commonId + '\');">';
      thisInstance.addText(input + '&nbsp;' + button);
   };
   
   var addImage = function addImage(imageSmall, imageBig, url) {
      var htmlContent = '';
      if (imageSmall !== undefined) {
         htmlContent = '<img src="' + imageSmall + '">';
         if (imageBig !== undefined) {
            htmlContent = htmlContent + '<br><a class="bigPictureAnchor" href="javascript:shop.ui.Actions.showPicture(\'' + imageBig + '\');"></a>';
         }
      } else {
         if (url !== undefined) {
            htmlContent = '<a class="onTheInternetAnchor" href="' + url + '"></a>';
         }
      }
      thisInstance.addText(htmlContent);
   };
   
   var addRow = function addRow(product) {
      thisInstance.startRow();
      addImage(product.imageSmall, product.imageBig, product.url);
      thisInstance.addText(product.name);
      thisInstance.addText(product.description);
      addPrice(product.price);
      addShoppingCartAdder(product);
      thisInstance.endRow();
   };
   
   var addCaptions = function addCaptions() {
      thisInstance.startRow();
      thisInstance.addHeader('fotoHeader');
      thisInstance.addHeader('nameHeader');
      thisInstance.addHeader('descriptionHeader');
      thisInstance.addHeader('priceHeader');
      thisInstance.addHeader('&nbsp;');
      thisInstance.endRow();
   };
   
   this.generateTable = function generateTable(configurationId, config) {
      configKey = configurationId;
      
      thisInstance.reset();
      thisInstance.append('<table class="alternierendeZeilenFarbe ersteSpalteZentriert dritteSpalteZentriert">');
      addCaptions();
      config.products.forEach(function(product) { 
         addRow(product);
      });  
      thisInstance.append('</table>');
      return thisInstance.getContent();
   };
};

shop.ui.tablegenerators.ProductTableGenerator.prototype = new shop.ui.tablegenerators.AbstractTableGenerator();
