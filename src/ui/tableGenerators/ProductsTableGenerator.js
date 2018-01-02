/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('../../Context.js');
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
 *            "price": 2.0,
 *            "description": "weiße Blüte, kleine Pflanze",
 *            "url": "http://some.webpage.com"
 *            "new": "true"
 *         },
 *         {
 *            "id": "CattleyaWalkerianaAlba",
 *            "name": "Cattleya walkeriana alba",
 *            "price": 2.5,
 *            "description": "Miniatur aus Brasilien",
 *            "imageSmall": "cattleya_small.jpg"
 *            "imageBig": "images/pflanzen/Bifrenaria inodora.jpg",
 *         }
 *      ]
 *   }
 */
shop.ui.tablegenerators.ProductsTableGenerator = function ProductsTableGenerator() {

   var NEW_TEXT_ID = 'productsTable.newProductLabelText';
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
            htmlContent = '<a class="onTheInternetAnchor" href="' + url + '" target="_blank"></a>';
         }
      }
      generator.addText(htmlContent);
   };
   
   var getProductText = function getProductText(product, newProductLabelText) {
      var productNameSuffix = product.new ? ' <span class="newProductLabel">(' + newProductLabelText + ')' : '';
      var text = '<p>' + product.name + productNameSuffix + '</p>';
      if (product.description !== undefined && product.description.length > 0) {
         text += product.description;
      }
      return text;
   };
   
   var addRow = function addRow(generator, product, newProductLabelText) {
      generator.startRow();
      addImage(generator, product.imageSmall, product.imageBig, product.url);
      generator.addText(getProductText(product, newProductLabelText));
      addPrice(generator, product.price);
      addShoppingCartAdder(generator, product);
      generator.endRow();
   };
   
   var addCaptions = function addCaptions(generator) {
      generator.startRow();
      generator.addHeader('fotoHeader');
      generator.addHeader('productHeader');
      generator.addHeader('priceHeader');
      generator.addHeader('&nbsp;');
      generator.endRow();
   };
   
   this.getQuantityInputHtmlCode = function getQuantityInputHtmlCode(quantitySelectorId, commonId) {
      return '<input type="text" id="' + quantitySelectorId + '" value="1" size="2" onKeyUp="shop.ui.Actions.checkInputValidity(\'' + commonId + '\');">';
   };
   
   this.generateTable = function generateTable(configurationId, config, newProductLabelText) {
      configKey = configurationId;
      this.reset();
      this.append('<table class="productTable">');
      addCaptions(this);
      var products = config.products;
      for (var index = 0; index < products.length; index++) {
         addRow(this, products[index], newProductLabelText);
      }
      this.append('</table>');
      return this.getContent();
   };
};

shop.ui.tablegenerators.ProductsTableGenerator.prototype = new shop.ui.tablegenerators.AbstractTableGenerator();
