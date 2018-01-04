/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/shoppingCart/WeightLimitChecker.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

var instance;
var configuredProducts;

var mockedProductConfigs = {
   get: function get(productId) {
      var result;
      for(var index = 0; result === undefined && index < configuredProducts.length; index++) {
         if (configuredProducts[index].id === productId) {
            result = configuredProducts[index];
         }
      }
      return result;
   }
};

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var givenInstance = function givenInstance() {
   instance = new shop.shoppingCart.WeightLimitChecker(mockedProductConfigs);
};

var givenConfiguredProducts = function givenConfiguredProducts(products) {
   configuredProducts = products;
};

var givenTheShoppingCartContains = function givenTheShoppingCartContains(content) {
   instance.setCartContent(content);
};
   
var thenWeightIsBeyondLimit = function thenWeightIsBeyondLimit() {
   expect(instance.beyondWeightLimit()).to.be.eql(true);
};

var thenWeightIsWithinLimit = function thenWeightIsWithinLimit() {
   expect(instance.beyondWeightLimit()).to.be.eql(false);
};

var setup = function setup() {
   configuredProducts = [];
   givenInstance();
   givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 1000},
         {id: 'prodB', name: 'pflanze_B', price: 7, weightInGrams: 500},
         {id: 'prodC', name: 'pflanze_C', price: 12, weightInGrams: 1}]);
};

describe('WeightLimitChecker', function() {
	
   beforeEach(setup);
   
   it('a created instance is an instance/object', function() {
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('weight is within limit when shopping cart is empty', function() {
      givenTheShoppingCartContains([]);
      thenWeightIsWithinLimit();
   });
   
   it('weight is within limit when shopping cart has 2000g', function() {
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }]);
      thenWeightIsWithinLimit();
   });
   
   it('weight is beyond limit when shopping cart has 2001g', function() {
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodC', quantity: 1 }]);
      thenWeightIsBeyondLimit();
   });
}); 
      