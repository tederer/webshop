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
   
   it('when the tab content changes the Setter searches for buttons, "onTheInternetAnchor"s and "bigPictureAnchor"s', function() {
      
      givenAddToShoppingCartButtonTextIs('in den Warenkorb');
      givenOnTheInternetAnchorTextIs('im www');
      givenBigPictureAnchorTextIs('groaßes buedl');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(capturedSelectors.length).to.be.eql(3);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' button')).to.be.eql(true);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .onTheInternetAnchor')).to.be.eql(true);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .bigPictureAnchor')).to.be.eql(true);
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
});  