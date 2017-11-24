/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/shoppingCart/CartController.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var DEFAULT_PRODUCTS = ['plants', 'accessories'];
var DEFAULT_TAB_SELECTOR = 'default_tab_selector';

var instance;

var mockedBus;
var products;
var capturedHtmlContent;
var tableHeadersAreAvailable;
var tableGeneratorResult;
var cartTextsAreAvailable;
var configuredProducts;
var capturedGeneratorData;
var tabSelector;
var shippingCostsText;
var totalCostsText;
var emptyCartText;
var capturedCartContentsInCalculator;
var capturedCountryCodeInCalculator;
var calculatedCosts;
var shippingCosts;
var totalCosts;
var capturedEmailTextGeneratorData;
var emailTextGeneratorDataResult;

var mockedUiComponentProvider = function mockedUiComponentProvider(selector) {
   return {
      html: function html(htmlCode) {
         if (capturedHtmlContent[selector] === undefined) {
            capturedHtmlContent[selector] = [];
         }
         capturedHtmlContent[selector].push(htmlCode);
      }
   };
};

var mockedTableGenerator = {
   generateTable: function generateTable(data) {
      capturedGeneratorData[capturedGeneratorData.length] = data;
      return tableGeneratorResult;
   }
};

var mockedEmailTextGenerator = {
   generatEmailText: function generatEmailText(data) {
      capturedEmailTextGeneratorData[capturedEmailTextGeneratorData.length] = data;
      return emailTextGeneratorDataResult;
   }
};

var mockedTableHeaders = {
   id: 'mockedTableHeaders',
   allHeadersAreAvailable: function allHeadersAreAvailable() {
      return tableHeadersAreAvailable;
   },
   
   onTableHeaderChanged: function onTableHeaderChanged(callback) {}
};

var mockedProductConfig = {
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

var mockedTexts = {
   onLanguageDependentTextChanged : function onLanguageDependentTextChanged(callback) {},
   getShippingCostsText : function getShippingCostsText() { return shippingCostsText; },
   getTotalCostsText : function getTotalCostsText() { return totalCostsText; },
   getEmptyCartText : function getEmptyCartText() { return emptyCartText; },
   allTextsAreAvailable : function allTextsAreAvailable() {
      return cartTextsAreAvailable;
   }
};

var mockedInputForm = {
   allValuesAreAvailable : function allValuesAreAvailable() {},
   setValuesEnteredByUser : function setValuesEnteredByUser() {}
};

var mockedCostCalculator = {
   setCartContent: function setCartContent(content) {
      capturedCartContentsInCalculator[capturedCartContentsInCalculator.length] = content;
   },
   setCountryOfDestination: function setCountryOfDestination(countryCode) {
      capturedCountryCodeInCalculator[capturedCountryCodeInCalculator.length] = countryCode;
   },
   calculateCosts: function calculateCosts() {
      return {totalCosts: totalCosts, shippingCosts: shippingCosts};
   }
};

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var givenInstance = function givenInstance() {
   products = DEFAULT_PRODUCTS;
   var testingComponents = {
      bus                  : mockedBus,
      uiComponentProvider  : mockedUiComponentProvider,
      tableGenerator       : mockedTableGenerator,
      tableHeaders         : mockedTableHeaders,
      productConfigs       : mockedProductConfig,
      texts                : mockedTexts,
      inputForm            : mockedInputForm,
      costCalculator       : mockedCostCalculator,
      emailTextGenerator   :mockedEmailTextGenerator
   };
   instance = new shop.ui.shoppingCart.CartController(products, testingComponents);
};

var givenAllTableHeadersAreAvailable = function givenAllTableHeadersAreAvailable() {
   tableHeadersAreAvailable = true;
};

var givenCartTextsAreAvailable = function givenCartTextsAreAvailable() {
   cartTextsAreAvailable = true;
};
      
var givenCountryOfDestinationIs = function givenCountryOfDestinationIs(countryCode) {
   mockedBus.publish(shop.topics.COUNTRY_OF_DESTINATION, countryCode);
};

var givenTheShoppingCartContentIs = function givenTheShoppingCartContentIs(content) {
   mockedBus.publish(shop.topics.SHOPPING_CART_CONTENT, content);
};

var givenConfiguredProducts = function givenConfiguredProducts(products) {
   configuredProducts = products;
};

var givenTableGeneratorReturns = function givenTableGeneratorReturns(contentToReturn) {
   tableGeneratorResult = contentToReturn;
};

var givenTheShippingCostsAre = function givenTheShippingCostsAre(costs) {
   shippingCosts = costs;
};

var givenTheTotalCostsAre = function givenTheTotalCostsAre(costs) {
   totalCosts = costs;
};

var givenShippingCostsTextIs = function givenShippingCostsTextIs(text) {
   shippingCostsText = text;
};

var givenTotalCostsTextIs = function givenTotalCostsTextIs(text) {
   totalCostsText = text;
};

var givenEmptyCartTextIs = function givenEmptyCartTextIs(text) {
   emptyCartText = text;
};

var givenContentOfTabChanges = function givenContentOfTabChanges(tabSelectorToUse) {
   tabSelector = (tabSelectorToUse === undefined) ? DEFAULT_TAB_SELECTOR : tabSelectorToUse;
   instance.onTabContentChangedCallback(tabSelector);  
};

var whenCountryOfDestinationIs = function whenCountryOfDestinationIs(countryCode) {
   givenCountryOfDestinationIs(countryCode);
};

var whenContentOfTabChanges = function whenContentOfTabChanges(tabSelector) {
   givenContentOfTabChanges(tabSelector);
};

var whenTheShoppingCartContentIs = function whenTheShoppingCartContentIs(content) {
   givenTheShoppingCartContentIs(content);
};

var getCapturedHtmlContents = function getCapturedHtmlContents() {
   return capturedHtmlContent[ tabSelector + ' > #shoppingCartContent'];
};

var lastPublishedHtmlContent = function lastPublishedHtmlContent() {
   var data = getCapturedHtmlContents();
   return data[data.length - 1];
};

var lastCartContentsInCalculator = function lastCartContentsInCalculator() {
   return capturedCartContentsInCalculator[capturedCartContentsInCalculator.length - 1];   
};

var lastTableGeneratorData = function lastTableGeneratorData() {
   return capturedGeneratorData[capturedGeneratorData.length - 1];
};

var lastEmailTextGeneratorData = function lastEmailTextGeneratorData() {
   return capturedEmailTextGeneratorData[capturedEmailTextGeneratorData.length - 1];
};

var shoppingCartContains = function shoppingCartContains(cartContent, expectedProduct) {
   var contains = false;
   for(var index = 0; !contains && index < cartContent.length; index++) {
      contains = cartContent[index].productId === expectedProduct.productId &&
                 cartContent[index].name === expectedProduct.name &&
                 cartContent[index].quantity === expectedProduct.quantity &&
                 cartContent[index].price === expectedProduct.price;
   }
   return contains;
};
   
var lastTableGeneratorDataContainsProductInCart = function lastTableGeneratorDataContainsProductInCart(productId, name, quantity, price) {
   var cartContent = lastTableGeneratorData().productsInShoppingCart;
   return shoppingCartContains(cartContent, {productId: productId, name: name, quantity: quantity, price: price});
};

var lastEmailTextGeneratorDataContainsProductInCart = function lastEmailTextGeneratorDataContainsProductInCart(productId, name, quantity, price) {
   var cartContent = lastEmailTextGeneratorData().productsInShoppingCart;
   return shoppingCartContains(cartContent, {productId: productId, name: name, quantity: quantity, price: price});
};

var lastCartContentsInCalculatorContains = function lastCartContentsInCalculatorContains(productId, quantity) {
   var cartContent = lastCartContentsInCalculator();
   var contains = false;
   for(var index = 0; !contains && index < cartContent.length; index++) {
      contains = cartContent[index].productId === productId &&
                 cartContent[index].quantity === quantity;
   }
   return contains;
};
   
var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedHtmlContent = {};
   capturedGeneratorData = [];
   tableHeadersAreAvailable = undefined;
   tableGeneratorResult = undefined;
   configuredProducts = {};
   tabSelector = undefined;
   shippingCostsText = undefined;
   totalCostsText = undefined;
   emptyCartText = undefined;
   capturedCartContentsInCalculator = [];
   capturedCountryCodeInCalculator = [];
   calculatedCosts = undefined;
   shippingCosts = undefined;
   totalCosts = undefined;
   capturedEmailTextGeneratorData = [];
   emailTextGeneratorDataResult = undefined;
};

describe('CartController', function() {
	
   beforeEach(setup);
   
   it('a created instance is an instance/object', function() {
      givenInstance();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('table content gets updated when all necessary data are available', function() {
      givenInstance();
      givenTableGeneratorReturns('some html code');
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A'}]);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenContentOfTabChanges('tab_selector');
      expect(lastPublishedHtmlContent()).to.be.eql('some html code');
   });
   
   it('table content gets updated when the cart content changes', function() {
      givenInstance();
      givenTableGeneratorReturns('some html code');
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A'}]);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      givenContentOfTabChanges();
      whenTheShoppingCartContentIs([]);
      expect(getCapturedHtmlContents().length).to.be.eql(2);
   });
      
   it('table generator data contains the current cart content A', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 7}]);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 1 },{ productId: 'prodB', quantity: 2 }]);
      whenContentOfTabChanges();
      expect(lastTableGeneratorData().productsInShoppingCart.length).to.be.eql(2);
      expect(lastTableGeneratorDataContainsProductInCart('prodA', 'pflanze_A', 1, 5)).to.be.eql(true);
      expect(lastTableGeneratorDataContainsProductInCart('prodB', 'pflanze_B', 2, 7)).to.be.eql(true);
   });
      
   it('table generator data contains the current cart content B', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 120},{id: 'potato', name: 'blue potato', price: 0.7}]);
      givenTheShoppingCartContentIs([{ productId: 'potato', quantity: 15 }]);
      whenContentOfTabChanges();
      expect(lastTableGeneratorData().productsInShoppingCart.length).to.be.eql(1);
      expect(lastTableGeneratorDataContainsProductInCart('potato', 'blue potato', 15, 0.7)).to.be.eql(true);
   });
      
   it('table generator data contains the costs provided by the CostCalculator A', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenTheShippingCostsAre(12.7);
      givenTheTotalCostsAre(undefined);
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 120}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 2 }]);
      whenContentOfTabChanges();
      expect(lastTableGeneratorData().shippingCosts).to.be.eql(12.7);
      expect(lastTableGeneratorData().totalCosts).to.be.eql(undefined);
   });
      
   it('table generator data contains the costs provided by the CostCalculator B', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenTheShippingCostsAre(undefined);
      givenTheTotalCostsAre(321.9);
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 120}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 2 }]);
      whenContentOfTabChanges();
      expect(lastTableGeneratorData().shippingCosts).to.be.eql(undefined);
      expect(lastTableGeneratorData().totalCosts).to.be.eql(321.9);
   });

   it('table generator data contains the shipping costs text provided by the ShoppingCartTexts A', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenShippingCostsTextIs('special shipping costs');
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 54}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 1 }]);
      whenContentOfTabChanges();
      expect(lastTableGeneratorData().shippingCostsText).to.be.eql('special shipping costs');
   });
      
   it('table generator data contains the shipping costs text provided by the ShoppingCartTexts B', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenShippingCostsTextIs('another shipping costs text');
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 54}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 1 }]);
      whenContentOfTabChanges();
      expect(lastTableGeneratorData().shippingCostsText).to.be.eql('another shipping costs text');
   });
         
   it('table generator data contains the total costs text provided by the ShoppingCartTexts A', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenTotalCostsTextIs('total costs');
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 54}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 1 }]);
      whenContentOfTabChanges();
      expect(lastTableGeneratorData().totalCostsText).to.be.eql('total costs');
   });
      
   it('table generator data contains the total costs text provided by the ShoppingCartTexts B', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenTotalCostsTextIs('another total costs');
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 54}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 1 }]);
      whenContentOfTabChanges();
      expect(lastTableGeneratorData().totalCostsText).to.be.eql('another total costs');
   });
      
   it('table generator data contains the TableHeaders object owned by the controller', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenTotalCostsTextIs('another total costs');
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 54}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 1 }]);
      whenContentOfTabChanges();
      expect(lastTableGeneratorData().tableHeaders.id).to.be.eql('mockedTableHeaders');
   });
   
   it('instead of the table content the empty cart text gets set when the cart is empty', function() {
      givenInstance();
      givenTableGeneratorReturns('some html code');
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenEmptyCartTextIs('your cart is empty');
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A'}]);
      givenTheShoppingCartContentIs([]);
      whenContentOfTabChanges('tab_selector');
      expect(lastPublishedHtmlContent()).to.be.eql('<p>your cart is empty</p>');
   });
        
   // EmailTextGeneratorTests
   /*
   it('email text generator data contains the current cart content A', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 7}]);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 1 },{ productId: 'prodB', quantity: 2 }]);
      whenContentOfTabChanges();
      expect(lastEmailTextGeneratorData().productsInShoppingCart.length).to.be.eql(2);
      expect(lastEmailTextGeneratorDataContainsProductInCart('prodA', 'pflanze_A', 1, 5)).to.be.eql(true);
      expect(lastEmailTextGeneratorDataContainsProductInCart('prodB', 'pflanze_B', 2, 7)).to.be.eql(true);
   });
      
   it('email text generator data contains the current cart content B', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 120},{id: 'potato', name: 'blue potato', price: 0.7}]);
      givenTheShoppingCartContentIs([{ productId: 'potato', quantity: 15 }]);
      whenContentOfTabChanges();
      expect(lastEmailTextGeneratorData().productsInShoppingCart.length).to.be.eql(1);
      expect(lastEmailTextGeneratorDataContainsProductInCart('potato', 'blue potato', 15, 0.7)).to.be.eql(true);
   });
      
   it('email text generator data contains the costs provided by the CostCalculator A', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenTheShippingCostsAre(12.7);
      givenTheTotalCostsAre(undefined);
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 120}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 2 }]);
      whenContentOfTabChanges();
      expect(lastEmailTextGeneratorData().shippingCosts).to.be.eql(12.7);
      expect(lastEmailTextGeneratorData().totalCosts).to.be.eql(undefined);
   });
      
   it('email text generator data contains the costs provided by the CostCalculator B', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenTheShippingCostsAre(undefined);
      givenTheTotalCostsAre(321.9);
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 120}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 2 }]);
      whenContentOfTabChanges();
      expect(lastEmailTextGeneratorData().shippingCosts).to.be.eql(undefined);
      expect(lastEmailTextGeneratorData().totalCosts).to.be.eql(321.9);
   });

   it('email text generator data contains the shipping costs text provided by the ShoppingCartTexts A', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenShippingCostsTextIs('special shipping costs');
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 54}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 1 }]);
      whenContentOfTabChanges();
      expect(lastEmailTextGeneratorData().shippingCostsText).to.be.eql('special shipping costs');
   });
      
   it('email text generator data contains the shipping costs text provided by the ShoppingCartTexts B', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenShippingCostsTextIs('another shipping costs text');
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 54}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 1 }]);
      whenContentOfTabChanges();
      expect(lastEmailTextGeneratorData().shippingCostsText).to.be.eql('another shipping costs text');
   });
         
   it('email text generator data contains the total costs text provided by the ShoppingCartTexts A', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenTotalCostsTextIs('total costs');
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 54}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 1 }]);
      whenContentOfTabChanges();
      expect(lastEmailTextGeneratorData().totalCostsText).to.be.eql('total costs');
   });
      
   it('email text generator data contains the total costs text provided by the ShoppingCartTexts B', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenTotalCostsTextIs('another total costs');
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 54}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 1 }]);
      whenContentOfTabChanges();
      expect(lastEmailTextGeneratorData().totalCostsText).to.be.eql('another total costs');
   });
      
   it('email text generator data contains the TableHeaders object owned by the controller', function() {
      givenInstance();
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenTotalCostsTextIs('another total costs');
      givenCountryOfDestinationIs('AT');
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 54}]);
      givenTheShoppingCartContentIs([{ productId: 'fish', quantity: 1 }]);
      whenContentOfTabChanges();
      expect(lastEmailTextGeneratorData().tableHeaders.id).to.be.eql('mockedTableHeaders');
   });
   */
   // END
   it('new cart content gets forwarded to the CostsCalculator A', function() {
      givenInstance();
      whenTheShoppingCartContentIs([{ productId: 'fish', quantity: 2 }]);
      expect(lastCartContentsInCalculator().length).to.be.eql(1);
      expect(lastCartContentsInCalculatorContains('fish', 2)).to.be.eql(true);
   });
      
   it('new cart content gets forwarded to the CostsCalculator B', function() {
      givenInstance();
      whenTheShoppingCartContentIs([]);
      expect(lastCartContentsInCalculator().length).to.be.eql(0);
   });
      
   it('new country of destination gets forwarded to the CostsCalculator A', function() {
      givenInstance();
      whenCountryOfDestinationIs('DE');
      expect(capturedCountryCodeInCalculator[capturedCountryCodeInCalculator.length - 1]).to.be.eql('DE');
   });
      
   it('new country of destination gets forwarded to the CostsCalculator B', function() {
      givenInstance();
      whenCountryOfDestinationIs('AT');
      expect(capturedCountryCodeInCalculator[capturedCountryCodeInCalculator.length - 1]).to.be.eql('AT');
   });
}); 
      