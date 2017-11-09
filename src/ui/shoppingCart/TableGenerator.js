/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Topics.js');
require('../bus/Bus.js');
require('../ui/Actions.js');

assertNamespace('shop.ui.shoppingCart');

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
      append('<th>' + tableHeaders.get(id) + '</th>');
      intentations--;
   };
   
   var addEmptyHeader = function addEmptyHeader() {
      intentations++;
      append('<th class="rightMostColumn">&nbsp;</th>');
      intentations--;
   };
   
   var addText = function addText(text, cssClass) {
      intentations++;
      append('<td' + ((cssClass !== undefined) ? ' class="' + cssClass + '"' : '') + '>' + ((text === undefined) ? '&nbsp;' : text) + '</td>');
      intentations--;
   };
   
   var addPrice = function addPrice(price, isRightMostColumn) {
      intentations++;
      append('<td class="rechtsAusgerichteterText' + (isRightMostColumn ? ' rightMostColumn"' : '') + '">' + price.toFixed(2) + ' EUR</td>');
      intentations--;
   };
   
   var addDeleteButton = function addDeleteButton(productId) {
      intentations++;
      append('<td class="zentrierterText rightMostColumn"><button type="button" class="removeButton" onclick="shop.ui.Actions.removeProductFromShoppingCart(\'' + productId + '\');"><img src="/images/warenkorb/kreuz.svg"></button></td>');
      intentations--;
   };
   
   var addCaptions = function addCaptions() {
      intentations++;
      append('<tr class="headers">');
      addHeader('quantityHeader');
      addHeader('nameHeader');
      addHeader('priceHeader');
      addEmptyHeader();
      append('</tr>');
      intentations--;
   };
   
   var addRow = function addRow(product, isTotalCostRow) {
      intentations++;
      append('<tr>');
      addText(product.quantity, 'zentrierterText');
      addText(product.name);
      addPrice(product.price * product.quantity);
      addDeleteButton(product.productId);
      append('</tr>');
      intentations--;
   };
   
   var addShippingCosts = function addShippingCosts(shippingCosts, shippingCostsText) {
      intentations++;
      append('<tr>');
      addText('&nbsp;');
      addText(shippingCostsText);
      addPrice(shippingCosts, true);
      append('<td class="rightMostColumn">&nbsp;</td>');
      append('</tr>');
      intentations--;
   };
   
   var addTotalCosts = function addTotalCosts(totalCosts, totalCostsText) {
      intentations++;
      append('<tr class="totalCostRow">');
      intentations++;
      append('<td colspan="2">' + ((totalCostsText === undefined) ? '&nbsp;' : totalCostsText) + '</td>');
      intentations--;
      addPrice(totalCosts, true);
      append('<td class="rightMostColumn">&nbsp;</td>');
      append('</tr>');
      intentations--;
   };

   this.generateTable = function generateTable(data) {
      intentations = 1;
      htmlContent = '';
      tableHeaders = data.tableHeaders;
      
      append('<table>');
      addCaptions();
      for (var index = 0; index < data.productsInShoppingCart.length; index++) { 
         addRow(data.productsInShoppingCart[index]);
      }
      if (data.shippingCosts !== undefined) {
         addShippingCosts(data.shippingCosts, data.shippingCostsText);
      }
      if (data.totalCosts !== undefined) {
         addTotalCosts(data.totalCosts, data.totalCostsText);
      }
      append('</table>');
      
      return htmlContent;
   };
};
