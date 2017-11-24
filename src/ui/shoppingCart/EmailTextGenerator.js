/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.EmailTextGenerator = function EmailTextGenerator() {
   
   
   //var data = {
   //      productsInShoppingCart: [],
   //      shippingCosts: (costs !== undefined) ? costs.shippingCosts : undefined,
   //      totalCosts: (costs !== undefined) ? costs.totalCosts : undefined,
   //      shippingCostsText: texts.getShippingCostsText(),
   //      totalCostsText: texts.getTotalCostsText(),
   //      tableHeaders: tableHeaders
   //   };
      
   //data.productsInShoppingCart[data.productsInShoppingCart.length] = {
   //      productId: productConfig.id,
   //      name: productConfig.name,
   //      quantity: cartContent[index].quantity,
   //      price: productConfig.price
   //   };
   this.generateCartContentAsText = function generateCartContentAsText(cartData) {
      var emailText = '';
      
      // TODO
      
      return emailText;
   };
   
   this.generateCustomerDataAsText = function generateCustomerDataAsText(customerData) {
      
      // TODO
      return '';
   };
};
