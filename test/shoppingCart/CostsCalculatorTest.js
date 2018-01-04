/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/shoppingCart/CostsCalculator.js');
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
   instance = new shop.shoppingCart.CostsCalculator(mockedProductConfigs);
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
   
   // Austria
   
   it('calculateCosts returns the total costs with shipping costs 4.0 for Austria, 1.999kg and product costs < 50', function() {
      givenInstance();
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 500},
         {id: 'prodB', name: 'pflanze_B', price: 7, weightInGrams: 499.5}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodB', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(28.0);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(4.0);
   });
   
   it('calculateCosts returns the total costs with shipping costs 5.82 for Austria, 2kg and product costs < 50', function() {
      givenInstance();
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 600},
         {id: 'prodB', name: 'pflanze_B', price: 7, weightInGrams: 400}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodB', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(29.82);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(5.82);
   });
   
   it('calculateCosts returns the total costs with shipping costs 5.82 for Austria, 4.999kg and product costs < 50', function() {
      givenInstance();
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 2000},
         {id: 'prodB', name: 'pflanze_B', price: 7, weightInGrams: 499.5}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodB', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(29.82);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(5.82);
   });
   
   it('calculateCosts returns the total costs with shipping costs 8.57 for Austria, 5kg and product costs < 50', function() {
      givenInstance();
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 2000},
         {id: 'prodB', name: 'pflanze_B', price: 7, weightInGrams: 500}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodB', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(32.57);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(8.57);
   });
   
   it('calculateCosts returns the total costs with shipping costs 0 for Austria and product costs = 50', function() {
      givenInstance();
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 2000},
         {id: 'prodB', name: 'pflanze_B', price: 2, weightInGrams: 499.5}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 8 }, { productId: 'prodB', quantity: 5 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(50);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(0);
   });
   
   it('calculateCosts returns the total costs with shipping costs 0 for Austria and product costs > 50', function() {
      givenInstance();
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 2000},
         {id: 'prodB', name: 'pflanze_B', price: 2, weightInGrams: 499.5}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 10 }, { productId: 'prodB', quantity: 5 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(60);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(0);
   });

   // rest of EU
   
   it('calculateCosts returns the total costs with shipping costs 13.92 for countries that are not Austria, 1.999kg and product costs < 100', function() {
      givenInstance();
      givenCountryOfDestinationIs('DE');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 500},
         {id: 'prodB', name: 'pflanze_B', price: 7, weightInGrams: 499.5}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodB', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(37.92);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(13.92);
   });
   
   it('calculateCosts returns the total costs with shipping costs 15.27 for countries that are not Austria, 2kg and product costs < 100', function() {
      givenInstance();
      givenCountryOfDestinationIs('DE');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 500},
         {id: 'prodB', name: 'pflanze_B', price: 7, weightInGrams: 500}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodB', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(39.27);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(15.27);
   });
   
   it('calculateCosts returns the total costs with shipping costs 15.27 for countries that are not Austria, 3.999kg and product costs < 100', function() {
      givenInstance();
      givenCountryOfDestinationIs('DE');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 1500},
         {id: 'prodB', name: 'pflanze_B', price: 7, weightInGrams: 499.5}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodB', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(39.27);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(15.27);
   });
   
   it('calculateCosts returns the total costs with shipping costs 19.27 for countries that are not Austria, 4kg and product costs < 100', function() {
      givenInstance();
      givenCountryOfDestinationIs('DE');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 1500},
         {id: 'prodB', name: 'pflanze_B', price: 7, weightInGrams: 500}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 2 }, { productId: 'prodB', quantity: 2 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(43.27);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(19.27);
   });
   
   it('calculateCosts returns the total costs with shipping costs 0 for countries that are not Austria and product costs = 100', function() {
      givenInstance();
      givenCountryOfDestinationIs('DE');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 1500},
         {id: 'prodB', name: 'pflanze_B', price: 2, weightInGrams: 500}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 18 }, { productId: 'prodB', quantity: 5 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(100);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(0);
   });
   
   it('calculateCosts returns the total costs with shipping costs 0 for countries that are not Austria and product costs > 100', function() {
      givenInstance();
      givenCountryOfDestinationIs('DE');
      givenConfiguredProducts([
         {id: 'prodA', name: 'pflanze_A', price: 5, weightInGrams: 1500},
         {id: 'prodB', name: 'pflanze_B', price: 2, weightInGrams: 500}]);
      givenTheShoppingCartContains([{ productId: 'prodA', quantity: 20 }, { productId: 'prodB', quantity: 5 }]);
      whenCostsGetCalculated();
      expect(costs.totalCosts.toFixed(2)).to.be.eql(110);
      expect(costs.shippingCosts.toFixed(2)).to.be.eql(0);
   });
}); 
      