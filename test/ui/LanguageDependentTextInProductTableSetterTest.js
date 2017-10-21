/* global global, shop, common, Map, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/LanguageDependentTextInProductTableSetter.js');

assertNamespace('shop.Context');

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var DEFAULT_TAB_SELECTOR = 'defaultTabSelector';
var DEFAULT_TAB2_SELECTOR = 'defaultTab2Selector';

var instance;
var publications;
var capturedSubscriptionCallbacks;
var capturedSelectors;
var capturedButtonTexts;
var uiComponents;

var mockedUiComponentProvider = function mockedUiComponentProvider(selector) {
   capturedSelectors[capturedSelectors.length] = selector;
   return {
      text: function text(content) {
         capturedButtonTexts[capturedButtonTexts.length] = {selector: selector, text: content};
      }
   };
};

var mockedBus = {
   subscribeToPublication: function subscribeToPublication(topic, callback) {
      capturedSubscriptionCallbacks[topic] = callback;
      callback(publications[topic]);
   },
   
   publish: function publish(topic, data) {
      var callback =  capturedSubscriptionCallbacks[topic];
      if (callback !== undefined) {
         callback(data);
      }
      publications[topic] = data;
   }
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
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'addToShoppingCartButton', text);
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

var whenTabContentChanges = function whenTabContentChanges() {
   givenTabContentChanges();
};

var lastCapturedButtonTextIs = function lastCapturedButtonTextIs(expectedText, selector) {
   var found = false;
   
   for (var index = 0; index < capturedButtonTexts.length; index++) {
      if (selector === undefined || capturedButtonTexts[index].selector === (selector + ' button')) {
         found = capturedButtonTexts[index].text === expectedText;
      }
   }
   
   return found;
};

var setup = function setup() {
   publications = {};
   capturedSubscriptionCallbacks = {};
   capturedSelectors = [];
   capturedButtonTexts = [];
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
   
   it('when the tab content changes the Setter searches for buttons', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(capturedSelectors.length).to.be.eql(1);
      expect(capturedSelectors[0]).to.be.eql(DEFAULT_TAB_SELECTOR + ' button');
   });
   
   it('when the tab content changes the buttons get updated A', function() {
      
      givenAddToShoppingCartButtonTextIs('in den Warenkorb');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedButtonTextIs('in den Warenkorb')).to.be.eql(true);
   });
   
   it('when the tab content changes the buttons get updated B', function() {
      
      givenAddToShoppingCartButtonTextIs('a button text');
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedButtonTextIs('a button text')).to.be.eql(true);
   });
   
   it('when the tab content changes and the button text is undefined, then the buttons get updated with an empty text', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(lastCapturedButtonTextIs('')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the buttons get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenTabContentChanges();
      whenAddToShoppingCartButtonTextIs('new button text');
      expect(lastCapturedButtonTextIs('new button text')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the buttons of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInProductTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenAddToShoppingCartButtonTextIs('some text');
      expect(lastCapturedButtonTextIs('some text', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedButtonTextIs('some text', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
});  