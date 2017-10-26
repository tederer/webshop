/* global global, shop, testing */

require(global.PROJECT_SOURCE_ROOT_PATH + '/Language.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ShoppingCart.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var instance;
var mockedBus;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var givenAShoppingCart = function givenAShoppingCart() {
   instance = new shop.ShoppingCart(mockedBus);
};

var givenTheProductGetsAddedToTheShoppingCart = function givenTheProductGetsAddedToTheShoppingCart(productId, amount) {
   var data = {productId: productId, quantity: amount};
   mockedBus.sendCommand(shop.topics.ADD_PRODUCT_TO_SHOPPING_CART, data);
};

var whenTheProductGetsAddedToTheShoppingCart = function whenTheProductGetsAddedToTheShoppingCart(productId, amount) {
   givenTheProductGetsAddedToTheShoppingCart(productId, amount);
};

var allProductsInShoppingCart = function allProductsInShoppingCart() {
   var lastPublication = mockedBus.getLastPublication(shop.topics.SHOPPING_CART_CONTENT);
   return (lastPublication !== undefined) ? lastPublication : undefined;
};

var productAmountInShoppingCart = function productAmountInShoppingCart(productId) {
   var amount;
   var lastPublication = mockedBus.getLastPublication(shop.topics.SHOPPING_CART_CONTENT);
   if (lastPublication !== undefined) {
      for(var index = 0; amount === undefined && index < lastPublication.length; index++) {
         if (lastPublication[index].productId === productId) {
            amount = lastPublication[index].amount;
         }
      }
   }
   return amount;
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   givenAShoppingCart();
};

describe('ShoppingCart', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a ShoppingCart is an instance/object', function() {
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('adding a product to an empty shopping cart increases the number of products in the cart', function() {
      whenTheProductGetsAddedToTheShoppingCart('productA', 3);
      expect(allProductsInShoppingCart().length).to.be.eql(1);
      expect(productAmountInShoppingCart('productA')).to.be.eql(3);
   });
   
   it('adding a product to a shopping cart that already contains the product increases the product amount in the cart', function() {
      givenTheProductGetsAddedToTheShoppingCart('productB', 1);
      whenTheProductGetsAddedToTheShoppingCart('productB', 3);
      expect(allProductsInShoppingCart().length).to.be.eql(1);
      expect(productAmountInShoppingCart('productB')).to.be.eql(4);
   });
   
   it('adding a product with negative amount to a shopping cart that already contains the product decreases the product amount in the cart', function() {
      givenTheProductGetsAddedToTheShoppingCart('productA', 1);
      givenTheProductGetsAddedToTheShoppingCart('productC', 5);
      whenTheProductGetsAddedToTheShoppingCart('productC', -2);
      expect(allProductsInShoppingCart().length).to.be.eql(2);
      expect(productAmountInShoppingCart('productC')).to.be.eql(3);
   });
   
   it('a product gets removed from the cart when the amount is 0', function() {
      givenTheProductGetsAddedToTheShoppingCart('productB', 1);
      givenTheProductGetsAddedToTheShoppingCart('productA', 4);
      whenTheProductGetsAddedToTheShoppingCart('productA', -4);
      expect(allProductsInShoppingCart().length).to.be.eql(1);
      expect(productAmountInShoppingCart('productB')).to.be.eql(1);
   });
});