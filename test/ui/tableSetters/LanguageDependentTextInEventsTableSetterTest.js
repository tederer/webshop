/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/tableSetters/LanguageDependentTextInEventsTableSetter.js');

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

var givenDefaultLanguageDependentTextInEventsTableSetter = function givenDefaultLanguageDependentTextInEventsTableSetter() {
   instance = new shop.ui.tablesetters.LanguageDependentTextInEventsTableSetter(mockedUiComponentProvider, mockedBus);
   mockedTab.onTabContentChanged(instance.onTabContentChangedCallback);
};

var givenTabContentChanges = function givenTabContentChanges() {
   mockedTab.simulateChangeOfTabContent();
};

var givenDateTextIs = function givenDateTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'eventsTable.dateHeader', text);
};

var givenLocationTextIs = function givenLocationTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'eventsTable.locationHeader', text);
};

var givenDescriptionTextIs = function givenDescriptionTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'eventsTable.descriptionHeader', text);
};

var givenContentOfBothTabsChanges = function givenContentOfBothTabsChanges() {
   givenTabContentChanges();
   mockedTab2.simulateChangeOfTabContent();
};

var givenAnotherTabGetsObservedByTheSetter = function givenAnotherTabGetsObservedByTheSetter() {
   mockedTab2.onTabContentChanged(instance.onTabContentChangedCallback);
};

var whenDateTextIs = function whenDateTextIs(text) {
   givenDateTextIs(text);
};

var whenLocationTextIs = function whenLocationTextIs(text) {
   givenLocationTextIs(text);
};

var whenDescriptionTextIs = function whenDescriptionTextIs(text) {
   givenDescriptionTextIs(text);
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

var lastCapturedDateTextIs = function lastCapturedDateTextIs(expectedText, selector) {
   return lastCapturedTextIs(expectedText, selector, '.dateHeader');
};

var lastCapturedLocationTextIs = function lastCapturedLocationTextIs(expectedText, selector) {
   return lastCapturedTextIs(expectedText, selector, '.locationHeader');
};

var lastCapturedDescriptionTextIs = function lastCapturedDescriptionTextIs(expectedText, selector) {
   return lastCapturedTextIs(expectedText, selector, '.descriptionHeader');
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

describe('LanguageDependentTextInEventsTableSetter', function() {
	
   beforeEach(setup);
   
   it('creating an instance is an instance/object', function() {
      
      givenDefaultLanguageDependentTextInEventsTableSetter();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('when the tab content changes the Setter searches for all components that should get changed', function() {
      
      givenDateTextIs('in den Warenkorb');
      givenLocationTextIs('im www');
      givenDescriptionTextIs('groaßes buedl');
      givenDefaultLanguageDependentTextInEventsTableSetter();
      whenTabContentChanges();
      expect(capturedSelectors.length).to.be.eql(3);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .dateHeader')).to.be.eql(true);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .locationHeader')).to.be.eql(true);
      expect(capturedSelectorsContains(DEFAULT_TAB_SELECTOR + ' .descriptionHeader')).to.be.eql(true);
   });
   
   it('when the tab content changes the "dateHeader" gets updated', function() {
      
      givenDateTextIs('date header');
      givenDefaultLanguageDependentTextInEventsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedDateTextIs('date header')).to.be.eql(true);
   });
   
   it('when the tab content changes the "locationHeader" gets updated', function() {
      
      givenLocationTextIs('location header');
      givenDefaultLanguageDependentTextInEventsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedLocationTextIs('location header')).to.be.eql(true);
   });
   
   it('when the tab content changes the "descriptionHeader" gets updated', function() {
      
      givenDescriptionTextIs('description');
      givenDefaultLanguageDependentTextInEventsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedDescriptionTextIs('description')).to.be.eql(true);
   });
   
   it('when the tab content changes and the "dateHeader" text is undefined, then the empty text gets set', function() {
      
      givenDefaultLanguageDependentTextInEventsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedDateTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the "locationHeader" text is undefined, then the empty text gets set', function() {
      
      givenDefaultLanguageDependentTextInEventsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedLocationTextIs('')).to.be.eql(true);
   });
      
   it('when the tab content changes and the "descriptionHeader" text is undefined, then the empty text gets set', function() {
      
      givenDefaultLanguageDependentTextInEventsTableSetter();
      whenTabContentChanges();
      expect(lastCapturedDescriptionTextIs('')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "dateHeader" get updated', function() {
      
      givenDefaultLanguageDependentTextInEventsTableSetter();
      givenTabContentChanges();
      whenDateTextIs('new date header');
      expect(lastCapturedDateTextIs('new date header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "locationHeader" get updated', function() {
      
      givenDefaultLanguageDependentTextInEventsTableSetter();
      givenTabContentChanges();
      whenLocationTextIs('new location header');
      expect(lastCapturedLocationTextIs('new location header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "descriptionHeader" get updated', function() {
      
      givenDefaultLanguageDependentTextInEventsTableSetter();
      givenTabContentChanges();
      whenDescriptionTextIs('new description header');
      expect(lastCapturedDescriptionTextIs('new description header')).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "dateHeader" of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInEventsTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenDateTextIs('some date text');
      expect(lastCapturedDateTextIs('some date text', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedDateTextIs('some date text', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "locationHeader" of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInEventsTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenLocationTextIs('some location header');
      expect(lastCapturedLocationTextIs('some location header', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedLocationTextIs('some location header', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
      
   it('when the language dependent text changes the "descriptionHeader" of previously changes tabs get updated', function() {
      
      givenDefaultLanguageDependentTextInEventsTableSetter();
      givenAnotherTabGetsObservedByTheSetter();
      givenContentOfBothTabsChanges();
      whenDescriptionTextIs('some description header');
      expect(lastCapturedDescriptionTextIs('some description header', DEFAULT_TAB_SELECTOR)).to.be.eql(true);
      expect(lastCapturedDescriptionTextIs('some description header', DEFAULT_TAB2_SELECTOR)).to.be.eql(true);
   });
});  