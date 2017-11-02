/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Topics.js');
require('../bus/Bus.js');
require('../ui/Actions.js');

assertNamespace('shop.ui');

shop.ui.shoppingCart.TableGenerator = function TableGenerator() {

   var CRLF = '\r\n';
   var intentationAsString = '   ';
   var intentations;
   var htmlContent;
   var tableHeaders;
   
   var append = function(text) {
      var line = '';
      for (var i = 0; i < intentations; i++) {
         line += intentationAsString;
      }
      htmlContent += line + text + CRLF;
   };
   
   var addHeader = function addHeader(id) {
      intentations++;
      append('<th>' + tableHeaders[id] + '</th>');
      intentations--;
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
   
   var addCaptions = function addCaptions() {
      intentations++;
      append('<tr>');
      addHeader('quantityHeader');
      addHeader('nameHeader');
      addHeader('priceHeader');
      append('</tr>');
      intentations--;
   };
   
   var addRow = function addRow(product) {
      intentations++;
      append('<tr>');
      addText(product.quantity);
      addText(product.name);
      addPrice(product.price * product.quantity);
      append('</tr>');
      intentations--;
   };
   
   var addShippingCosts = function addShippingCosts(shippingCosts, shippingCostsText) {
      intentations++;
      append('<tr>');
      addText(1);
      addText(shippingCostsText);
      addPrice(shippingCosts);
      append('</tr>');
      intentations--;
   };

   this.generateTable = function generateTable(data, shippingCostsText, headers) {
      intentations = 1;
      htmlContent = '';
      tableHeaders = headers;
      
      append('<table class="alternierendeZeilenFarbe ersteSpalteZentriert dritteSpalteZentriert">');
      addCaptions();
      data.productsInShoppingCart.forEach(function(product) { 
         addRow(product);
      });
      if (data.shippingCosts !== undefined) {
         addShippingCosts(data.shippingCosts, shippingCostsText);
      }
      append('</table>');
      
      return htmlContent;
   };
};
