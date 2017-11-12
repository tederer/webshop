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

var mockedUiComponentProvider = function mockedUiComponentProvider(selector) {
   return {
      html: function html(htmlCode) {
         capturedHtmlContent[selector] = htmlCode;
      }
   };
};

var mockedTableGenerator = {
   generateTable: function generateTable(data) {
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
            result = configuredProducts[index].id;
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

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedHtmlContent = {};
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
      expect(capturedHtmlContent[ 'tab_selector' + ' > #shoppingCartContent']).to.be.eql('some html code');
   });
});  

      