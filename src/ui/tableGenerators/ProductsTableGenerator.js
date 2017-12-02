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
shop.ui.tablegenerators.ProductsTableGenerator = function ProductsTableGenerator() {

   this.ProductsTableGenerator = '';
   var configKey;
   
   var addPrice = function addPrice(generator, price) {
      generator.addText(price.toFixed(2) + ' EUR');
   };
   
   var addShoppingCartAdder = function addShoppingCartAdder(generator, product) {
      var commonId = configKey + '_' + product.id;
      var buttonId = commonId + '_button';
      var quantitySelectorId = commonId + '_textfield';
      var input = generator.getQuantityInputHtmlCode(quantitySelectorId, commonId);
      var button = '<button type="button" id="' + buttonId + '" onClick="shop.ui.Actions.addProductToShoppingCart(\'' + product.id + '\', \'' + quantitySelectorId + '\');"></button>';
      generator.addText(input + '&nbsp;' + button);
   };
   
   var addImage = function addImage(generator, imageSmall, imageBig, url) {
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
      generator.addText(htmlContent);
   };
   
   var addRow = function addRow(generator, product) {
      generator.startRow();
      addImage(generator, product.imageSmall, product.imageBig, product.url);
      generator.addText(product.name);
      generator.addText(product.description);
      addPrice(generator, product.price);
      addShoppingCartAdder(generator, product);
      generator.endRow();
   };
   
   var addCaptions = function addCaptions(generator) {
      generator.startRow();
      generator.addHeader('fotoHeader');
      generator.addHeader('nameHeader');
      generator.addHeader('descriptionHeader');
      generator.addHeader('priceHeader');
      generator.addHeader('&nbsp;');
      generator.endRow();
   };
   
   this.getQuantityInputHtmlCode = function getQuantityInputHtmlCode(quantitySelectorId, commonId) {
      return '<input type="text" id="' + quantitySelectorId + '" value="1" size="2" onKeyUp="shop.ui.Actions.checkInputValidity(\'' + commonId + '\');">';
   };
   
   this.generateTable = function generateTable(configurationId, config) {
      configKey = configurationId;
      this.reset();
      this.append('<table class="alternierendeZeilenFarbe ersteSpalteZentriert dritteSpalteZentriert">');
      addCaptions(this);
      var products = config.products;
      for (var index = 0; index < products.length; index++) {
         addRow(this, products[index]);
      }
      this.append('</table>');
      return this.getContent();
   };
};

shop.ui.tablegenerators.ProductsTableGenerator.prototype = new shop.ui.tablegenerators.AbstractTableGenerator();
