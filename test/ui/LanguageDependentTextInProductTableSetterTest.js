/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/LanguageDependentTextInProductTableSetter.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

assertNamespace('shop.Context');

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var DEFAULT_TAB_SELECTOR = 'defaultTabSelector';
var DEFAULT_TAB2_SELECTOR = 'defaultTab2Selector';

var instance;
var capturedSelectors;
var capturedTexts;
var uiComponents;
var mockedBus;

var mockedUiComponentProvider = function mockedUiComponentProvider(selector) {
   capturedSelectors[capturedSelectors.length] = selector;
   return {
      text: function text(content) {
         capturedTexts[capturedTexts.length] = {selector: selector, text: content};
      }
   };
};

var MockedTab = function MockedTab(optionalSelector) {
   var selector = (optionalSelector === undefined) ? DEFAULT_TAB_SELECTOR : optionalSelector;
   var capturedTabContentChangedCallbacks = [];
   
   this.onTabContentChanged = function onTabContentChanged(callback) {
      capturedTabContentChangedCallbacks[capturedTabContentChangedCallbacks.length] = callback;
   };
   
   this.simulateChangeOfTabContent = function simulateChangeOfTabContent() {
      capturedTabContentChangedCallbacks.forEach(function(callback) { callback(selector); });
   };
};

var mockedTab;
var mockedTab2;

var givenDefaultLanguageDependentTextInProductTableSetter = function givenDefaultLanguageDependentTextInProductTableSetter() {
   instance = new shop.ui.LanguageDependentTextInProductTableSetter(mockedUiComponentProvider, mockedBus);
   mockedTab.onTabContentChanged(instance.onTabContentChangedCallback);
};

var givenAddToShoppingCartButtonTextIs = function givenAddToShoppingCartButtonTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productTable.addToShoppingCartButton', text);
};

var givenOnTheInternetAnchorTextIs = function givenOnTheInternetAnchorTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productTable.onTheInternetAnchor', text);
};

var givenBigPictureAnchorTextIs = function givenBigPictureAnchorTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productTable.bigPictureAnchor', text);
};

var givenFotoHeaderTextIs = function givenFotoHeaderTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productTable.fotoHeader', text);
};

var givenNameHeaderTextIs = function givenNameHeaderTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productTable.nameHeader', text);
};

var givenDescriptionHeaderTextIs = function givenDescriptionHeaderTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productTable.descriptionHeader', text);
};

var givenPriceHeaderTextIs = function givenPriceHeaderTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productTable.priceHeader', text);
};

var givenTabContentChanges = function givenTabContentChanges() {
   mockedTab.simulateChangeOfTabContent();
};

var givenContentOfBothTabsChanges = function givenContentOfBothTabsChanges() {
   givenTabContentChanges();
   mockedTab2.simulateChangeOfTabContent();
};

var givenAnotherTabGetsObservedByTheSetter = function givenAnotherTabGetsObservedByTheSetter() {
   mockedTab2.onTabContentChanged(instance.onTabContentChangedCallback);
};

var whenAddToShoppingCartButtonTextIs = function whenAddToShoppingCartButtonTextIs(text) {
   givenAddToShoppingCartButtonTextIs(text);
};

var whenOnTheInternetAnchorTextIs = function whenOnTheInternetAnchorTextIs(text) {
   givenOnTheInternetAnchorTextIs(text);
};

var whenBigPictureAnchorTextIs = function whenBigPictureAnchorTextIs(text) {
   givenBigPictureAnchorTextIs(text);
};

var whenFotoHeaderTextIs = function whenFotoHeaderTextIs(text) {
   givenFotoHeaderTextIs(text);
};

var whenNameHeaderTextIs = function whenNameHeaderTextIs(text) {
   givenNameHeaderTextIs(text);
};

var whenDescriptionHeaderTextIs = function whenDescriptionHeaderTextIs(text) {
   givenDescriptionHeaderTextIs(text);
};

var whenPriceHeaderTextIs = function whenPriceHeaderTextIs(text) {
   givenPriceHeaderTextIs(text);
};

var whenTabContentChanges = function whenTabContentChanges() {
   givenTabContentChanges();
};

var lastCapturedTextIs = function lastCapturedTextIs(expectedText, selector, componentType) {
   var found = false;
   var expectedSelector = (selector === undefined) ? DEFAULT_TAB_SELECTOR : selector;
   
   for (var index = 0; index < capturedTexts.length; index++) {
      if (capturedTexts[index].selector === (expectedSelector + ' ' + componentType)) {
         found = capturedTexts[index].text === expectedText;
      }
   }
   
   return found;
};

var lastCapturedButtonTextIs = function lastCapturedButtonTextIs(expectedText, selector) {
   return lastCapturedTextIs(expectedText, selector, 'button');
};

var lastCapturedOnTheInternetAnchorTextIs = function lastCapturedOnTheInternetAnchorTextIs(expectedText, selector) {
   return lastCapturedTextIs(expectedText, selector, '.onTheInternetAnchor');
};

var lastCapturedBigPictureAnchorTextIs = function lastCapturedBigPictureAnchorTextIs(expectedText, selector) {
   return lastCapturedTextIs(expectedText, selector, '.bigPictureAnchor');
};

var lastCapturedFotoHeaderTextIs = function lastCapturedFotoHeaderTextIs(expectedText, selector) {
   return lastCapturedTextIs(expectedText, selector, '.fotoHeader');
};

var lastCapturedNameHeaderTextIs = function lastCapturedNameHeaderTextIs(expectedText, selector) {
   return lastCapturedTextIs(expectedText, selector, '.nameHeader');
};

var lastCapturedDescriptionHeaderTextIs = function lastCapturedDescriptionHeaderTextIs(expectedText, selector) {
   return lastCapturedTextIs(expectedText, selector, '.descriptionHeader');
};

var lastCapturedPriceHeaderTextIs = function lastCapturedPriceHeaderTextIs(expectedText, selector) {
   return lastCapturedTextIs(expectedText, selector, '.priceHeader');
};

var capturedSelectorsContains = function capturedSelectorsContains(expectedSelector) {
   return capturedSelectors.indexOf(expectedSelector) > -1;
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedSelectors = [];
   capturedTexts = [];
   uiComponents = undefined;
   mockedTab = new MockedTab();
   mockedTab2 = new MockedTab(DEFAULT_TAB2_SELECTOR);
};

describe('LanguageDependentTextInProductTableSetter', function() {
	
   beforeEach(setup);
   
   it('creating an instance is an instance/object', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('when the tab content changes the Setter searches for all components that should get changed', function() {
      
      givenAddToShoppingCartButtonTextIs('in den Warenkorb');
      givenOnTheInternetAnchorTextIs('im www');
      givenBigPictureAnchorTextIs('groaßes buedl');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(capturedSelectors.length).to.be.eql(7);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' button')).to.be.eql(true);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .onTheInternetAnchor')).to.be.eql(true);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .bigPictureAnchor')).to.be.eql(true);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .fotoHeader')).to.be.eql(true);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .nameHeader')).to.be.eql(true);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .descriptionHeader')).to.be.eql(true);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .priceHeader')).to.be.eql(true);
   });
   
   it('when the tab content changes the buttons get updated', function() {
      
      givenAddToShoppingCartButtonTextIs('in den Warenkorb');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedButtonTextIs('in den Warenkorb')).to.be.eql(true);
   });
   
   it('when the tab content changes the "onTheInternetAnchor"s get updated', function() {
      
      givenOnTheInternetAnchorTextIs('im www');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedOnTheInternetAnchorTextIs('im www')).to.be.eql(true);
   });
   
   it('when the tab content changes the "bigPictureAnchor"s get updated', function() {
      
      givenBigPictureAnchorTextIs('groaßes buedl');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedBigPictureAnchorTextIs('groaßes buedl')).to.be.eql(true);
   });
   
   it('when the tab content changes the "fotoHeader" get updated', function() {
      
      givenFotoHeaderTextIs('foto_header');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedFotoHeaderTextIs('foto_header')).to.be.eql(true);
   });
   
   it('when the tab content changes the "nameHeader" get updated', function() {
      
      givenNameHeaderTextIs('name_header');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedNameHeaderTextIs('name_header')).to.be.eql(true);
   });
   
   it('when the tab content changes the "descriptionHeader" get updated', function() {
      
      givenDescriptionHeaderTextIs('description_header');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedDescriptionHeaderTextIs('description_header')).to.be.eql(true);
   });
   
   it('when the tab content changes the "priceHeader" get updated', function() {
      
      givenPriceHeaderTextIs('price_header');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedPriceHeaderTextIs('price_header')).to.be.eql(true);
   });
   
   it('when the tab content changes and the button text is undefined, then the buttons get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedButtonTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the anchor text is undefined, then the "onTheInternetAnchor"s get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedOnTheInternetAnchorTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the anchor text is undefined, then the "bigPictureAnchor"s get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedBigPictureAnchorTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the fotoHeader text is undefined, then the header get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedFotoHeaderTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the nameHeader text is undefined, then the header get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedNameHeaderTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the descriptionHeader text is undefined, then the header get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedDescriptionHeaderTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the priceHeader text is undefined, then the header get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedPriceHeaderTextIs('')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the buttons get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenTabContentChanges();
      whenAddToShoppingCartButtonTextIs('new button text');
      expect(lastCapturedButtonTextIs('new button text')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "onTheInternetAnchor"s get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenTabContentChanges();
      whenOnTheInternetAnchorTextIs('new anchor text');
      expect(lastCapturedOnTheInternetAnchorTextIs('new anchor text')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "bigPictureAnchor"s get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenTabContentChanges();
      whenBigPictureAnchorTextIs('biggest picture text');
      expect(lastCapturedBigPictureAnchorTextIs('biggest picture text')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the fotoHeader get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenTabContentChanges();
      whenFotoHeaderTextIs('new photo header');
      expect(lastCapturedFotoHeaderTextIs('new photo header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the nameHeader get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenTabContentChanges();
      whenNameHeaderTextIs('new name header');
      expect(lastCapturedNameHeaderTextIs('new name header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the descriptionHeader get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenTabContentChanges();
      whenDescriptionHeaderTextIs('new description header');
      expect(lastCapturedDescriptionHeaderTextIs('new description header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the priceHeader get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenTabContentChanges();
      whenPriceHeaderTextIs('new price header');
      expect(lastCapturedPriceHeaderTextIs('new price header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the buttons of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenAddToShoppingCartButtonTextIs('some text');
      expect(lastCapturedButtonTextIs('some text', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedButtonTextIs('some text', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "onTheInternetAnchor"s of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenOnTheInternetAnchorTextIs('some secret info');
      expect(lastCapturedOnTheInternetAnchorTextIs('some secret info', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedOnTheInternetAnchorTextIs('some secret info', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "bigPictureAnchor"s of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenBigPictureAnchorTextIs('some secret pic');
      expect(lastCapturedBigPictureAnchorTextIs('some secret pic', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedBigPictureAnchorTextIs('some secret pic', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the fotoHeader of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenFotoHeaderTextIs('brand new foto header');
      expect(lastCapturedFotoHeaderTextIs('brand new foto header', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedFotoHeaderTextIs('brand new foto header', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the nameHeader of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenNameHeaderTextIs('brand new name header');
      expect(lastCapturedNameHeaderTextIs('brand new name header', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedNameHeaderTextIs('brand new name header', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the descriptionHeader of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenDescriptionHeaderTextIs('brand new description header');
      expect(lastCapturedDescriptionHeaderTextIs('brand new description header', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedDescriptionHeaderTextIs('brand new description header', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the priceHeader of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenPriceHeaderTextIs('brand new price header');
      expect(lastCapturedPriceHeaderTextIs('brand new price header', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedPriceHeaderTextIs('brand new price header', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
});  