/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('./AbstractTableGenerator.js');

assertNamespace('shop.ui');

shop.ui.tablegenerators.PlantsTableGenerator = function PlantsTableGenerator() {

   this.PlantsTableGenerator = '';
   this.getQuantityInputHtmlCode = function getQuantityInputHtmlCode(quantitySelectorId, commonId) {
      var htmlCode = '<select id="' + quantitySelectorId + '" size="1">';
      for (var quantity = 5; quantity <= 50; quantity += 5) {
         htmlCode += '<option>' + quantity + '</option>';
      }
      htmlCode += '</select>';
      return htmlCode;
   };
};

shop.ui.tablegenerators.PlantsTableGenerator.prototype = new shop.ui.tablegenerators.ProductsTableGenerator();
