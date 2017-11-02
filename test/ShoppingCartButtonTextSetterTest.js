/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/ShoppingCartButtonTextSetter.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

assertNamespace('shop.Context');

var DEFAULT_SELECTOR = '#shop > #myComp';
var DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY = 'myText';

var instance;
var capturedSetTexts;
var mockedBus;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var mockedComponentTextSetter = function mockedComponentTextSetter(selector, text) {
   capturedSetTexts[capturedSetTexts.length] = {selector: selector, text: text};
};

var givenDefaultShoppingCartButtonTextSetter = function givenDefaultShoppingCartButtonTextSetter() {
   instance = new shop.ui.ShoppingCartButtonTextSetter(DEFAULT_SELECTOR, DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY, mockedComponentTextSetter, mockedBus);
};

var givenShoppingCartButtonTextSetter = function givenShoppingCartButtonTextSetter(selector, textKey) {
   instance = new shop.ui.ShoppingCartButtonTextSetter(selector, textKey, mockedComponentTextSetter, mockedBus);
};

var givenShoppingCartContains = function givenShoppingCartContains(cartContent) {
   mockedBus.publish(shop.topics.SHOPPING_CART_CONTENT, cartContent);   
};

var givenTheLanguageDependentTextGetsPublished =  function givenTheLanguageDependentTextGetsPublished(textKey, text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKey, text);
};

var whenShoppingCartContains = function whenShoppingCartContains(cartContent) {
   givenShoppingCartContains(cartContent);   
};

var whenTheLanguageDependentTextGetsPublished =  function whenTheLanguageDependentTextGetsPublished(textKey, text) {
   givenTheLanguageDependentTextGetsPublished(textKey, text);
};

var lastCapturedSetText = function lastCapturedSetText() {
   var result;
   if (capturedSetTexts.length > 0) {
      result = capturedSetTexts[capturedSetTexts.length - 1];
   }
   return result;
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedSetTexts = [];
   shop.Context.log = function log(message) {};
};

describe('ShoppingCartButtonTextSetter', function() {
	
   beforeEach(setup);
   
   it('creating an instance is an instance/object', function() {
      givenDefaultShoppingCartButtonTextSetter();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('the changed language dependent text gets set on the component A when the cart is empty', function() {
      givenShoppingCartContains([]);
      givenDefaultShoppingCartButtonTextSetter();
      whenTheLanguageDependentTextGetsPublished(DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY, 'some text');
      expect(lastCapturedSetText().selector).to.be.eql(DEFAULT_SELECTOR);
      expect(lastCapturedSetText().text).to.be.eql('some text');
   });
   
   it('the changed language dependent text gets set on the component B when the cart is empty', function() {
      givenShoppingCartContains([]);
      givenShoppingCartButtonTextSetter('#spa > #anotherComp', 'anotherCompTextKey');
      whenTheLanguageDependentTextGetsPublished('anotherCompTextKey', 'another special text');
      expect(lastCapturedSetText().selector).to.be.eql('#spa > #anotherComp');
      expect(lastCapturedSetText().text).to.be.eql('another special text');
   });
   
   it('a change in the language dependent text changes the component text A', function() {
      givenShoppingCartContains([{ productId: 'productA', quantity: 3 }]);
      givenDefaultShoppingCartButtonTextSetter();
      whenTheLanguageDependentTextGetsPublished(DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY, 'button text');
      expect(lastCapturedSetText().text).to.be.eql('button text (3)');
   });
   
   it('a change in the language dependent text changes the component text B', function() {
      givenShoppingCartContains([{ productId: 'productA', quantity: 1 }, { productId: 'productA', quantity: 1 }]);
      givenDefaultShoppingCartButtonTextSetter();
      whenTheLanguageDependentTextGetsPublished(DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY, 'button text');
      expect(lastCapturedSetText().text).to.be.eql('button text (2)');
   });
   
   it('a change of the shopping cart content changes the component text A', function() {
      givenShoppingCartContains([]);
      givenTheLanguageDependentTextGetsPublished(DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY, 'buttonA');
      givenDefaultShoppingCartButtonTextSetter();
      whenShoppingCartContains([{ productId: 'productA', quantity: 3 }]);
      expect(lastCapturedSetText().text).to.be.eql('buttonA (3)');
   });
   
   it('a change of the shopping cart content changes the component text B', function() {
      givenShoppingCartContains([{ productId: 'productA', quantity: 3 }]);
      givenTheLanguageDependentTextGetsPublished(DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY, 'buttonA');
      givenDefaultShoppingCartButtonTextSetter();
      whenShoppingCartContains([]);
      expect(lastCapturedSetText().text).to.be.eql('buttonA');
   });
   
   it('a change of the shopping cart content changes the component text C', function() {
      givenTheLanguageDependentTextGetsPublished(DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY, 'buttonA');
      givenDefaultShoppingCartButtonTextSetter();
      givenShoppingCartContains([{ productId: 'productA', quantity: 3 }]);
      whenShoppingCartContains([{ productId: 'productA', quantity: 3 }, { productId: 'productB', quantity: 2 }]);
      expect(lastCapturedSetText().text).to.be.eql('buttonA (5)');
   });
});  