/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/tableSetters/LanguageDependentTextInProductsTableSetter.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

assertNamespace('shop.Context');

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var DEFAULT_TAB_SELECTOR = 'defaultTabSelector';
var DEFAULT_TAB2_SELECTOR = 'defaultTab2Selector';
var DEFAULT_TEXT_KEY_PREFIX = 'productsTable';

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

var givenDefaultLanguageDependentTextInProductsTableSetter = function givenDefaultLanguageDependentTextInProductsTableSetter() {
   instance = new shop.ui.tablesetters.LanguageDependentTextInProductsTableSetter(DEFAULT_TEXT_KEY_PREFIX, mockedUiComponentProvider, mockedBus);
   mockedTab.onTabContentChanged(instance.onTabContentChangedCallback);
};

var givenLanguageDependentTextInProductsTableSetterWithTextKeyPrefix = function givenLanguageDependentTextInProductsTableSetterWithTextKeyPrefix(textKeyPrefix) {
   instance = new shop.ui.tablesetters.LanguageDependentTextInProductsTableSetter(textKeyPrefix, mockedUiComponentProvider, mockedBus);
   mockedTab.onTabContentChanged(instance.onTabContentChangedCallback);
};

var givenLanguageDependentTextIs = function givenLanguageDependentTextIs(textId, text, optionalPrefix) {
   var prefix = (optionalPrefix === undefined) ? 'productsTable' : optionalPrefix;
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + prefix + '.' + textId, text);
};

var givenAddToShoppingCartButtonTextIs = function givenAddToShoppingCartButtonTextIs(text, optionalPrefix) {
   givenLanguageDependentTextIs('addToShoppingCartButton', text, optionalPrefix);
};

var givenOnTheInternetAnchorTextIs = function givenOnTheInternetAnchorTextIs(text, optionalPrefix) {
   givenLanguageDependentTextIs('onTheInternetAnchor', text, optionalPrefix);
};

var givenBigPictureAnchorTextIs = function givenBigPictureAnchorTextIs(text, optionalPrefix) {
   givenLanguageDependentTextIs('bigPictureAnchor', text, optionalPrefix);
};

var givenFotoHeaderTextIs = function givenFotoHeaderTextIs(text, optionalPrefix) {
   givenLanguageDependentTextIs('fotoHeader', text, optionalPrefix);
};

var givenNameHeaderTextIs = function givenNameHeaderTextIs(text, optionalPrefix) {
   givenLanguageDependentTextIs('nameHeader', text, optionalPrefix);
};

var givenDescriptionHeaderTextIs = function givenDescriptionHeaderTextIs(text, optionalPrefix) {
   givenLanguageDependentTextIs('descriptionHeader', text, optionalPrefix);
};

var givenPriceHeaderTextIs = function givenPriceHeaderTextIs(text, optionalPrefix) {
   givenLanguageDependentTextIs('priceHeader', text, optionalPrefix);
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

describe('LanguageDependentTextInProductsTableSetter', function() {
	
   beforeEach(setup);
   
   it('creating an instance is an instance/object', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('when the tab content changes the Setter searches for all components that should get changed', function() {
      
      givenAddToShoppingCartButtonTextIs('in den Warenkorb');
      givenOnTheInternetAnchorTextIs('im www');
      givenBigPictureAnchorTextIs('groaßes buedl');
      givenDefaultLanguageDependentTextInProductsTableSetter();
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
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedButtonTextIs('in den Warenkorb')).to.be.eql(true);
   });
   
   it('when the tab content changes the "onTheInternetAnchor"s get updated', function() {
      
      givenOnTheInternetAnchorTextIs('im www');
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedOnTheInternetAnchorTextIs('im www')).to.be.eql(true);
   });
   
   it('when the tab content changes the "bigPictureAnchor"s get updated', function() {
      
      givenBigPictureAnchorTextIs('groaßes buedl');
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedBigPictureAnchorTextIs('groaßes buedl')).to.be.eql(true);
   });
   
   it('when the tab content changes the "fotoHeader" get updated', function() {
      
      givenFotoHeaderTextIs('foto_header');
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedFotoHeaderTextIs('foto_header')).to.be.eql(true);
   });
   
   it('when the tab content changes the "nameHeader" get updated', function() {
      
      givenNameHeaderTextIs('name_header');
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedNameHeaderTextIs('name_header')).to.be.eql(true);
   });
   
   it('when the tab content changes the "descriptionHeader" get updated', function() {
      
      givenDescriptionHeaderTextIs('description_header');
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedDescriptionHeaderTextIs('description_header')).to.be.eql(true);
   });
   
   it('when the tab content changes the "priceHeader" get updated', function() {
      
      givenPriceHeaderTextIs('price_header');
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedPriceHeaderTextIs('price_header')).to.be.eql(true);
   });
   
   it('when the tab content changes and the button text is undefined, then the buttons get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedButtonTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the anchor text is undefined, then the "onTheInternetAnchor"s get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedOnTheInternetAnchorTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the anchor text is undefined, then the "bigPictureAnchor"s get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedBigPictureAnchorTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the fotoHeader text is undefined, then the header get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedFotoHeaderTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the nameHeader text is undefined, then the header get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedNameHeaderTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the descriptionHeader text is undefined, then the header get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedDescriptionHeaderTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the priceHeader text is undefined, then the header get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedPriceHeaderTextIs('')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the buttons get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenTabContentChanges();
      whenAddToShoppingCartButtonTextIs('new button text');
      expect(lastCapturedButtonTextIs('new button text')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "onTheInternetAnchor"s get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenTabContentChanges();
      whenOnTheInternetAnchorTextIs('new anchor text');
      expect(lastCapturedOnTheInternetAnchorTextIs('new anchor text')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "bigPictureAnchor"s get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenTabContentChanges();
      whenBigPictureAnchorTextIs('biggest picture text');
      expect(lastCapturedBigPictureAnchorTextIs('biggest picture text')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the fotoHeader get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenTabContentChanges();
      whenFotoHeaderTextIs('new photo header');
      expect(lastCapturedFotoHeaderTextIs('new photo header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the nameHeader get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenTabContentChanges();
      whenNameHeaderTextIs('new name header');
      expect(lastCapturedNameHeaderTextIs('new name header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the descriptionHeader get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenTabContentChanges();
      whenDescriptionHeaderTextIs('new description header');
      expect(lastCapturedDescriptionHeaderTextIs('new description header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the priceHeader get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenTabContentChanges();
      whenPriceHeaderTextIs('new price header');
      expect(lastCapturedPriceHeaderTextIs('new price header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the buttons of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenAddToShoppingCartButtonTextIs('some text');
      expect(lastCapturedButtonTextIs('some text', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedButtonTextIs('some text', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "onTheInternetAnchor"s of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenOnTheInternetAnchorTextIs('some secret info');
      expect(lastCapturedOnTheInternetAnchorTextIs('some secret info', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedOnTheInternetAnchorTextIs('some secret info', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "bigPictureAnchor"s of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenBigPictureAnchorTextIs('some secret pic');
      expect(lastCapturedBigPictureAnchorTextIs('some secret pic', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedBigPictureAnchorTextIs('some secret pic', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the fotoHeader of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenFotoHeaderTextIs('brand new foto header');
      expect(lastCapturedFotoHeaderTextIs('brand new foto header', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedFotoHeaderTextIs('brand new foto header', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the nameHeader of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenNameHeaderTextIs('brand new name header');
      expect(lastCapturedNameHeaderTextIs('brand new name header', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedNameHeaderTextIs('brand new name header', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the descriptionHeader of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenDescriptionHeaderTextIs('brand new description header');
      expect(lastCapturedDescriptionHeaderTextIs('brand new description header', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedDescriptionHeaderTextIs('brand new description header', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the priceHeader of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductsTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenPriceHeaderTextIs('brand new price header');
      expect(lastCapturedPriceHeaderTextIs('brand new price header', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedPriceHeaderTextIs('brand new price header', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   }); 
   
   it('the setter uses the provided text key prefix', function() {
      var prefix = 'specialKeyPrefix';
      givenLanguageDependentTextInProductsTableSetterWithTextKeyPrefix(prefix);
      givenAddToShoppingCartButtonTextIs('AddToShoppingCartButtonText', prefix);
      givenOnTheInternetAnchorTextIs('OnTheInternetAnchorText', prefix);
      givenBigPictureAnchorTextIs('BigPictureAnchorText', prefix);
      givenFotoHeaderTextIs('FotoHeaderText', prefix);
      givenNameHeaderTextIs('NameHeaderText', prefix);
      givenDescriptionHeaderTextIs('DescriptionHeaderText', prefix);
      givenPriceHeaderTextIs('PriceHeaderText', prefix);
      givenAddToShoppingCartButtonTextIs('a');
      givenOnTheInternetAnchorTextIs('b');
      givenBigPictureAnchorTextIs('c');
      givenFotoHeaderTextIs('d');
      givenNameHeaderTextIs('e');
      givenDescriptionHeaderTextIs('f');
      givenPriceHeaderTextIs('g');
      whenTabContentChanges();
      expect(lastCapturedButtonTextIs('AddToShoppingCartButtonText')).to.be.eql(true);
      expect(lastCapturedOnTheInternetAnchorTextIs('OnTheInternetAnchorText')).to.be.eql(true);
      expect(lastCapturedBigPictureAnchorTextIs('BigPictureAnchorText')).to.be.eql(true);
      expect(lastCapturedFotoHeaderTextIs('FotoHeaderText')).to.be.eql(true);
      expect(lastCapturedNameHeaderTextIs('NameHeaderText')).to.be.eql(true);
      expect(lastCapturedDescriptionHeaderTextIs('DescriptionHeaderText')).to.be.eql(true);
      expect(lastCapturedPriceHeaderTextIs('PriceHeaderText')).to.be.eql(true);
   });
});  