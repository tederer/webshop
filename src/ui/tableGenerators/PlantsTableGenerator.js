/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('./AbstractTableGenerator.js');

assertNamespace('shop.ui');

shop.ui.tablegenerators.PlantsTableGenerator = function PlantsTableGenerator() {

   this.PlantsTableGenerator = '';
   this.getQuantityInputHtmlCode = function getQuantityInputHtmlCode(quantitySelectorId, commonId) {
      //return '<input type="text" id="' + quantitySelectorId + '" value="1" size="2" onKeyUp="shop.ui.Actions.checkInputValidity(\'' + commonId + '\');">';
      return '<p>hi</p>';
   };
};

shop.ui.tablegenerators.PlantsTableGenerator.prototype = new shop.ui.tablegenerators.ProductsTableGenerator();
