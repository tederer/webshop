/* global global, shop, common, Map, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/UiStateSetter.js');

var instance;
var callbacks;
var stateConsumerInvocations;
var capturedState;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var mockedStateConsumer = function mockedStateConsumer(state) {
   stateConsumerInvocations++;
   capturedState = state;
};

var mockedBus = {
   subscribeToCommand: function subscribeToCommand(topic, callback) {
      callbacks[topic] = callback;
   },
   
   sendCommand: function sendCommand(topic, data) {
      var callback = callbacks[topic];
      if (callback !== undefined) {
         callback(data);
      }
   }
};

var givenDefaultUiStateSetter = function givenDefaultUiStateSetter() {
   instance = new shop.ui.UiStateSetter(mockedStateConsumer, mockedBus);
};

var whenSetVisibleTabCommandWasSentFor =  function whenSetVisibleTabCommandWasSentFor(tabName) {
   mockedBus.sendCommand(shop.topics.SET_VISIBLE_TAB, tabName);
};

var setup = function setup() {
   callbacks = {};
   capturedState = undefined;
   stateConsumerInvocations = 0;
   givenDefaultUiStateSetter();
};

describe('UiStateSetter', function() {
	
   beforeEach(setup);
   
   it('creating an UiStateSetter of a TabContent is an instance/object', function() {
      
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('SetVisibleTab command updated the state A', function() {
      whenSetVisibleTabCommandWasSentFor('tab1');
      expect(capturedState.visibleTab).to.be.eql('tab1');
   });
   
   it('SetVisibleTab command updated the state B', function() {
      whenSetVisibleTabCommandWasSentFor('anotherTab');
      expect(capturedState.visibleTab).to.be.eql('anotherTab');
   });
   
   it('SetVisibleTab command does not updated the state when the visible tab is the same in the next command', function() {
      whenSetVisibleTabCommandWasSentFor('tabB');
      whenSetVisibleTabCommandWasSentFor('tabB');
      expect(stateConsumerInvocations).to.be.eql(1);
   });
});  