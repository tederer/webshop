/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/shoppingCart/ProductConfig.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Language.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var DEFAULT_PRODUCTS = ['plants', 'accessories'];

var instance;

var mockedBus;
var products;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var createInstance = function createInstance() {
   instance = new shop.shoppingCart.ProductConfig(products, mockedBus);
};

var givenDefaultInstance = function givenDefaultInstance() {
   products = DEFAULT_PRODUCTS;
   createInstance();
};

var givenAnInstanceWithProducts = function givenAnInstanceWithProducts(productsToUse) {
   products = productsToUse;
   createInstance();
};

var givenTheCurrentLanguageIs = function givenTheCurrentLanguageIs(language) {
   mockedBus.publish(shop.topics.CURRENT_LANGUAGE, language);
};

var givenConfiguredProduct = function givenConfiguredProduct(language, product, config) {
   mockedBus.publish('/jsonContent/' + language + '/' + product, config);
};

var whenTheCurrentLanguageIs = function whenTheCurrentLanguageIs(language) {
   givenTheCurrentLanguageIs(language);
};

var busGotPublicationSubscriptionFor = function busGotPublicationSubscriptionFor(expectedTopic) {
   var found = false;
   var topicsWithSubscriptions = mockedBus.getPublicationSubscriptions();
   for (var index = 0; !found && index < topicsWithSubscriptions.length; index++) {
      found = topicsWithSubscriptions[index] === expectedTopic;
   }
   return found;
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
};

describe('ProductConfig', function() {
	
   beforeEach(setup);
   
   it('a created instance is an instance/object', function() {
      
      givenDefaultInstance();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('a subscription for each product gets created when receiving a new language A', function() {
      
      givenDefaultInstance();
      whenTheCurrentLanguageIs(shop.Language.DE);
      products.forEach(function(product) {
         expect(busGotPublicationSubscriptionFor('/jsonContent/' + shop.Language.DE + '/' + product)).to.be.eql(true);
      });
   });
   
   it('a subscription for each product gets created when receiving a new language B', function() {
      
      givenAnInstanceWithProducts(['food', 'drinks', 'newspapers']);
      givenTheCurrentLanguageIs(shop.Language.EN);
      whenTheCurrentLanguageIs(shop.Language.DE);
      products.forEach(function(product) {
         expect(busGotPublicationSubscriptionFor('/jsonContent/' + shop.Language.DE + '/' + product)).to.be.eql(true);
         expect(busGotPublicationSubscriptionFor('/jsonContent/' + shop.Language.EN + '/' + product)).to.be.eql(true);
      });
   });
   
   it('no subscription for each product gets created when receiving a language that was received already', function() {
      
      givenAnInstanceWithProducts(['food', 'drinks', 'newspapers']);
      givenTheCurrentLanguageIs(shop.Language.EN);
      
      products.forEach(function(product) {
         mockedBus.removeCallbackFor('/jsonContent/' + shop.Language.EN + '/' + product);
      });

      whenTheCurrentLanguageIs(shop.Language.EN);
      
      products.forEach(function(product) {
         expect(busGotPublicationSubscriptionFor('/jsonContent/' + shop.Language.EN + '/' + product)).to.be.eql(false);
      });
   });
   
      
   it('get returns the config for the current language', function() {
      
      givenDefaultInstance();
      givenConfiguredProduct(shop.Language.DE, 'plants',       {products:[{id: 'plantA',        name: 'pflanze_A'}]});
      givenConfiguredProduct(shop.Language.DE, 'accessories',  {products:[{id: 'accessoriesA',  name: 'zubehoer_A'}]});
      givenConfiguredProduct(shop.Language.EN, 'plants',       {products:[{id: 'plantA',        name: 'plant_A'}]});
      givenConfiguredProduct(shop.Language.EN, 'accessories',  {products:[{id: 'accessoriesA',  name: 'accessories_A'}]});
      givenTheCurrentLanguageIs(shop.Language.DE);
      expect(instance.get('plantA').name).to.be.eql('pflanze_A');
      expect(instance.get('accessoriesA').name).to.be.eql('zubehoer_A');
      givenTheCurrentLanguageIs(shop.Language.EN);
      expect(instance.get('plantA').name).to.be.eql('plant_A');
      expect(instance.get('accessoriesA').name).to.be.eql('accessories_A');
   });
});  