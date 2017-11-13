/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/shoppingCart/CartController.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var DEFAULT_PRODUCTS = ['plants', 'accessories'];

var instance;

var mockedBus;
var products;
var capturedHtmlContent;
var tableHeadersAreAvailable;
var tableGeneratorResult;
var cartTextsAreAvailable;
var configuredProducts;
var capturedGeneratorData;

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

var mockedTableHeaders = {
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
   getShippingCostsText : function getShippingCostsText() {},
   getTotalCostsText : function getTotalCostsText() {},
   getEmptyCartText : function getEmptyCartText() {},
   allTextsAreAvailable : function allTextsAreAvailable() {
      return cartTextsAreAvailable;
   }
};

var mockedInputForm = {
   allValuesAreAvailable : function allValuesAreAvailable() {},
   setValuesEnteredByUser : function setValuesEnteredByUser() {}
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
      inputForm            : mockedInputForm
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

var givenContentOfTabChanges = function givenContentOfTabChanges(tabSelector) {
   instance.onTabContentChangedCallback(tabSelector);  
};

var whenContentOfTabChanges = function whenContentOfTabChanges(tabSelector) {
   givenContentOfTabChanges(tabSelector);
};

var whenTheShoppingCartContentIs = function whenTheShoppingCartContentIs(content) {
   givenTheShoppingCartContentIs(content);
};

var getCapturedHtmlContents = function getCapturedHtmlContents() {
   return capturedHtmlContent[ 'tab_selector' + ' > #shoppingCartContent'];
};

var lastPublishedHtmlContent = function lastPublishedHtmlContent() {
   var data = getCapturedHtmlContents();
   return data[data.length - 1];
};

var lastGeneratorData = function lastGeneratorData() {
   return capturedGeneratorData[capturedGeneratorData.length - 1];
};

var lastGeneratorDataContainsProductInCart = function lastGeneratorDataContainsProductInCart(productId, name, quantity, price) {
   var cartContent = lastGeneratorData().productsInShoppingCart;
   var contains = false;
   for(var index = 0; !contains && index < cartContent.length; index++) {
      contains = cartContent[index].productId === productId &&
                 cartContent[index].name === name &&
                 cartContent[index].quantity === quantity &&
                 cartContent[index].price === price;
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
      givenContentOfTabChanges('tab_selector');
      whenTheShoppingCartContentIs([]);
      expect(getCapturedHtmlContents().length).to.be.eql(2);
   });
      
   it('table generator data contains the current cart content A', function() {
      givenInstance();
      givenTableGeneratorReturns('some html code');
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenConfiguredProducts([{id: 'prodA', name: 'pflanze_A', price: 5},{id: 'prodB', name: 'pflanze_B', price: 7}]);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 1 },{ productId: 'prodB', quantity: 2 }]);
      whenContentOfTabChanges('tab_selector');
      expect(lastGeneratorData().productsInShoppingCart.length).to.be.eql(2);
      expect(lastGeneratorDataContainsProductInCart('prodA', 'pflanze_A', 1, 5)).to.be.eql(true);
      expect(lastGeneratorDataContainsProductInCart('prodB', 'pflanze_B', 2, 7)).to.be.eql(true);
   });
      
   it('table generator data contains the current cart content B', function() {
      givenInstance();
      givenTableGeneratorReturns('another html code');
      givenAllTableHeadersAreAvailable();
      givenCartTextsAreAvailable();
      givenConfiguredProducts([{id: 'fish', name: 'shark', price: 120},{id: 'potato', name: 'blue potato', price: 0.7}]);
      givenTheShoppingCartContentIs([{ productId: 'potato', quantity: 15 }]);
      whenContentOfTabChanges('tab_selector_B');
      expect(lastGeneratorData().productsInShoppingCart.length).to.be.eql(1);
      expect(lastGeneratorDataContainsProductInCart('potato', 'blue potato', 15, 0.7)).to.be.eql(true);
   });
}); 
/* 
      var data = {
         productsInShoppingCart: [],
         shippingCosts: shippingCosts,
         totalCosts: totalCosts,
         shippingCostsText: texts.getShippingCostsText(),
         totalCostsText: texts.getTotalCostsText(),
         tableHeaders: tableHeaders
      };
*/
      