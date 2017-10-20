/* global global, shop, common, Map, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/LanguageDependentTextInProductTableSetter.js');

assertNamespace('shop.Context');

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var DEFAULT_TAB_SELECTOR = 'defaultTabSelector';
var instance;
var publications;
var capturedSubscriptionCallbacks;
var capturedTabContentChangedCallbacks;
var capturedSelectors;
var uiComponents;

var mockedUiComponentProvider = function mockedUiComponentProvider(selector) {
   capturedSelectors[capturedSelectors.length] = selector;
   return uiComponents;
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
   }
};

var MockedTab = function MockedTab() {
   var selector = DEFAULT_TAB_SELECTOR;
   
   this.onTabContentChanged = function onTabContentChanged(callback) {
      capturedTabContentChangedCallbacks[capturedTabContentChangedCallbacks.length] = callback;
   };
   
   this.simulateChangeOfTabContent = function simulateChangeOfTabContent() {
      capturedTabContentChangedCallbacks.forEach(function(callback) { callback(selector); });
   };
};

var mockedTab = new MockedTab();

var givenDefaultLanguageDependentTextInProductTableSetter = function givenDefaultLanguageDependentTextInProductTableSetter() {
   instance = new shop.ui.LanguageDependentTextInProductTableSetter(mockedUiComponentProvider, mockedBus);
   mockedTab.onTabContentChanged(instance.onTabContentChangedCallback);
};

var givenTheDivContainsTheButtons = function givenTheDivContainsTheButtons(buttons) {
   uiComponents = buttons;
};

var whenTabContentChanges = function whenTabContentChanges() {
   mockedTab.simulateChangeOfTabContent();
};

var setup = function setup() {
   publications = {};
   capturedSubscriptionCallbacks = {};
   capturedTabContentChangedCallbacks = [];
   capturedSelectors = [];
   uiComponents = undefined;
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
   /*
   it('when the tab content changes the buttons get updated', function() {
      
      givenTheDivContainsTheButtons([{id: 'button1'}, {id: 'button2'}]);
      givenDefaultLanguageDependentTextInProductTableSetter();
      whenTabContentChanges();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });*/
});  