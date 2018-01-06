/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/shoppingCart/ShoppingCartTexts.js');
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
   instance = new shop.shoppingCart.ShoppingCartTexts(mockedBus);
};

var givenRegisteredCallback = function givenRegisteredCallback() {
   instance.onLanguageDependentTextChanged(callback);
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

describe('ShoppingCartTexts', function() {
	
   beforeEach(setup);
   
   it('a created instance is an instance/object', function() {
      givenInstance();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('allTextsAreAvailable returns true when all texts are available', function() {
      givenInstance();
      givenLanguageDependentTextIs('shippingCosts', 'shipping costs text');
      givenLanguageDependentTextIs('totalCosts', 'total costs text');
      givenLanguageDependentTextIs('emptyCart', 'empty cart text');
      expect(instance.allTextsAreAvailable()).to.be.eql(true);
   });
   
   it('allTextsAreAvailable returns false when a text is missing A', function() {
      givenInstance();
      givenLanguageDependentTextIs('totalCosts', 'total costs text');
      givenLanguageDependentTextIs('emptyCart', 'empty cart text');
      expect(instance.allTextsAreAvailable()).to.be.eql(false);
   });
   
   it('allTextsAreAvailable returns false when a text is missing B', function() {
      givenInstance();
      givenLanguageDependentTextIs('shippingCosts', 'shipping costs text');
      givenLanguageDependentTextIs('emptyCart', 'empty cart text');
      expect(instance.allTextsAreAvailable()).to.be.eql(false);
   });
   
   it('allTextsAreAvailable returns false when a text is missing C', function() {
      givenInstance();
      givenLanguageDependentTextIs('shippingCosts', 'shipping costs text');
      givenLanguageDependentTextIs('totalCosts', 'total costs text');
      expect(instance.allTextsAreAvailable()).to.be.eql(false);
   });
   
   it('getShippingCostsText returns the last published text', function() {
      givenInstance();
      givenLanguageDependentTextIs('shippingCosts', 'a shipping costs text');
      expect(instance.getShippingCostsText()).to.be.eql('a shipping costs text');
   });
      
   it('getTotalCostsText returns the last published text', function() {
      givenInstance();
      givenLanguageDependentTextIs('totalCosts', 'a total costs text');
      expect(instance.getTotalCostsText()).to.be.eql('a total costs text');
   });
      
   it('getEmptyCartText returns the last published text', function() {
      givenInstance();
      givenLanguageDependentTextIs('emptyCart', 'a empty cart text');
      expect(instance.getEmptyCartText()).to.be.eql('a empty cart text');
   });
      
   it('listener gets notified when shipping costs text changes', function() {
      givenInstance();
      givenLanguageDependentTextIs('shippingCosts', 'shipping costs text');
      givenLanguageDependentTextIs('totalCosts', 'total costs text');
      givenLanguageDependentTextIs('emptyCart', 'empty cart text');
      givenLanguageDependentTextIs('weightBeyondLimit', 'weight beyond limit text');
      givenRegisteredCallback();
      whenLanguageDependentTextIs('shippingCosts', 'another text');
      expect(callbackInvocations).to.be.eql(1);
   });
      
   it('listener gets notified when total costs text changes', function() {
      givenInstance();
      givenLanguageDependentTextIs('shippingCosts', 'shipping costs text');
      givenLanguageDependentTextIs('totalCosts', 'total costs text');
      givenLanguageDependentTextIs('emptyCart', 'empty cart text');
      givenLanguageDependentTextIs('weightBeyondLimit', 'weight beyond limit text');
      givenRegisteredCallback();
      whenLanguageDependentTextIs('totalCosts', 'another text');
      expect(callbackInvocations).to.be.eql(1);
   });
      
   it('listener gets notified when empty cart text changes', function() {
      givenInstance();
      givenLanguageDependentTextIs('shippingCosts', 'shipping costs text');
      givenLanguageDependentTextIs('totalCosts', 'total costs text');
      givenLanguageDependentTextIs('emptyCart', 'empty cart text');
      givenLanguageDependentTextIs('weightBeyondLimit', 'weight beyond limit text');
      givenRegisteredCallback();
      whenLanguageDependentTextIs('emptyCart', 'another text');
      expect(callbackInvocations).to.be.eql(1);
   });
});  