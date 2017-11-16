/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/shoppingCart/CostsCalculator.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

var instance;
var configuredProducts;
var costs;

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
   instance = new shop.ui.shoppingCart.CostsCalculator(mockedProductConfigs);
};

var givenConfiguredProducts = function givenConfiguredProducts(products) {
   configuredProducts = products;
};

var givenTheShoppingCartContains = function givenTheShoppingCartContains(content) {
   instance.setCartContent(content);
};
   
var givenCountryOfDestinationIs = function givenCountryOfDestinationIs(countryCode) {
   instance.setCountryOfDestination(countryCode);
};

var whenCostsGetCalculated = function whenCostsGetCalculated() {
   costs = instance.calculateCosts();
};

var setup = function setup() {
   configuredProducts = [];
   costs = undefined;
};

describe('CostsCalculator', function() {
	
   beforeEach(setup);
   
   it('a created instance is an instance/object', function() {
      givenInstance();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('calculateCosts returns undefined when shopping cart is empty', function() {
      givenInstance();
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 7}]);
      givenTheShoppingCartContains([]);
      whenCostsGetCalculated();
      expect(costs).to.be.eql(undefined);
   });
   
   it('calculateCosts returns undefined when no country of destination is selected', function() {
      givenInstance();
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 7}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs).to.be.eql(undefined);
   });
   
   it('calculateCosts returns the total costs with shipping costs 4.6 for Austria and product costs < 50', function() {
      givenInstance();
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 7}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodB', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts).to.be.eql(28.6);
      expect(costs.shippingCosts).to.be.eql(4.6);
   });
   
   it('calculateCosts returns the total costs with shipping costs 0 for Austria and product costs = 50', function() {
      givenInstance();
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 2}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 8 }, { productId: 'prodB', quantity: 5 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts).to.be.eql(50);
      expect(costs.shippingCosts).to.be.eql(0);
   });
   
   it('calculateCosts returns the total costs with shipping costs 0 for Austria and product costs > 50', function() {
      givenInstance();
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 2}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 10 }, { productId: 'prodB', quantity: 5 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts).to.be.eql(60);
      expect(costs.shippingCosts).to.be.eql(0);
   });

   it('calculateCosts returns the total costs with shipping costs 11.25 for countries that are not Austria and product costs < 100', function() {
      givenInstance();
      givenCountryOfDestinationIs('DE');
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 7}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodB', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts).to.be.eql(35.25);
      expect(costs.shippingCosts).to.be.eql(11.25);
   });
   
   it('calculateCosts returns the total costs with shipping costs 0 for countries that are not Austria and product costs = 100', function() {
      givenInstance();
      givenCountryOfDestinationIs('DE');
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 2}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 18 }, { productId: 'prodB', quantity: 5 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts).to.be.eql(100);
      expect(costs.shippingCosts).to.be.eql(0);
   });
   
   it('calculateCosts returns the total costs with shipping costs 0 for countries that are not Austria and product costs > 100', function() {
      givenInstance();
      givenCountryOfDestinationIs('DE');
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 2}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 20 }, { productId: 'prodB', quantity: 5 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts).to.be.eql(110);
      expect(costs.shippingCosts).to.be.eql(0);
   });

   
   }); 
      