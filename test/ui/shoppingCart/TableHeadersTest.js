/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/shoppingCart/TableHeaders.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var instance;

var mockedBus;
var callbackInvocations;

var callback = function callback() {
   callbackInvocations++;
};

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var givenInstance = function givenInstance() {
   instance = new shop.ui.shoppingCart.TableHeaders(mockedBus);
};

var givenRegisteredCallback = function givenRegisteredCallback() {
   instance.onTableHeaderChanged(callback);
};

var givenLanguageDependentTextIs = function givenLanguageDependentTextIs(textId, text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'shoppingCartContentTable.' + textId, text);   
};

var whenLanguageDependentTextIs = function whenLanguageDependentTextIs(textId, text) {
   givenLanguageDependentTextIs(textId, text);
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   callbackInvocations = 0;
};

describe('TableHeaders', function() {
	
   beforeEach(setup);
   
   it('a created instance is an instance/object', function() {
      givenInstance();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('allHeadersAreAvailable() returns true when all headers are available', function() {
      givenInstance();
      givenLanguageDependentTextIs('quantityHeader', 'quantity');
      givenLanguageDependentTextIs('nameHeader', 'name');
      givenLanguageDependentTextIs('priceHeader', 'price');
      expect(instance.allHeadersAreAvailable()).to.be.eql(true);
   });
   
   it('allHeadersAreAvailable() returns false when one header is missing A', function() {
      givenInstance();
      givenLanguageDependentTextIs('nameHeader', 'name');
      givenLanguageDependentTextIs('priceHeader', 'price');
      expect(instance.allHeadersAreAvailable()).to.be.eql(false);
   });
   
   it('allHeadersAreAvailable() returns false when one header is missing B', function() {
      givenInstance();
      givenLanguageDependentTextIs('quantityHeader', 'quantity');
      givenLanguageDependentTextIs('priceHeader', 'price');
      expect(instance.allHeadersAreAvailable()).to.be.eql(false);
   });
   
   it('allHeadersAreAvailable() returns false when one header is missing C', function() {
      givenInstance();
      givenLanguageDependentTextIs('quantityHeader', 'quantity');
      givenLanguageDependentTextIs('nameHeader', 'name');
      expect(instance.allHeadersAreAvailable()).to.be.eql(false);
   });
   
   it('get() returns the corresponding header A', function() {
      givenInstance();
      givenLanguageDependentTextIs('quantityHeader', 'quantity');
      expect(instance.get('quantityHeader')).to.be.eql('quantity');
   });
   
   it('get() returns the corresponding header B', function() {
      givenInstance();
      givenLanguageDependentTextIs('nameHeader', 'name');
      expect(instance.get('nameHeader')).to.be.eql('name');
   });
   
   it('get() returns the corresponding header C', function() {
      givenInstance();
      givenLanguageDependentTextIs('priceHeader', 'price');
      expect(instance.get('priceHeader')).to.be.eql('price');
   });
   
   it('subscribed callback gets called when a text changes A', function() {
      givenInstance();
      givenRegisteredCallback();
      givenLanguageDependentTextIs('quantityHeader', 'quantity');
      expect(callbackInvocations).to.be.eql(1);
   });
   
   it('subscribed callback gets called when a text changes B', function() {
      givenInstance();
      givenRegisteredCallback();
      givenLanguageDependentTextIs('nameHeader', 'name');
      expect(callbackInvocations).to.be.eql(1);
   });
   
   it('subscribed callback gets called when a text changes C', function() {
      givenInstance();
      givenRegisteredCallback();
      givenLanguageDependentTextIs('priceHeader', 'price');
      expect(callbackInvocations).to.be.eql(1);
   });
   
   it('all subscribed callbacks get called when a text changes', function() {
      givenInstance();
      givenRegisteredCallback();
      givenRegisteredCallback();
      givenLanguageDependentTextIs('priceHeader', 'price');
      expect(callbackInvocations).to.be.eql(2);
   });

});  