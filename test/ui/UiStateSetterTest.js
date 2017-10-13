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

var givenShowPictureCommandWasSentFor = function givenShowPictureCommandWasSentFor(filename) {
   mockedBus.sendCommand(shop.topics.SHOW_PICTURE, filename);
};

var whenSetVisibleTabCommandWasSentFor = function whenSetVisibleTabCommandWasSentFor(tabName) {
   mockedBus.sendCommand(shop.topics.SET_VISIBLE_TAB, tabName);
};

var whenShowPictureCommandWasSentFor = function whenShowPictureCommandWasSentFor(filename) {
   givenShowPictureCommandWasSentFor(filename);
};

var whenHidePictureCommandWasSent = function whenHidePictureCommandWasSent() {
   mockedBus.sendCommand(shop.topics.HIDE_PICTURE, '');
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
   
   it('ShowPicture command updated the state A', function() {
      whenShowPictureCommandWasSentFor('aerangis.jpg');
      expect(capturedState.shownPicture).to.be.eql('aerangis.jpg');
   });
   
   it('ShowPicture command updated the state B', function() {
      whenShowPictureCommandWasSentFor('phalaenopsis.jpg');
      expect(capturedState.shownPicture).to.be.eql('phalaenopsis.jpg');
   });
   
   it('ShowPicture command does not updated the state when the picture is the same in the next command', function() {
      whenShowPictureCommandWasSentFor('phalaenopsis.jpg');
      whenShowPictureCommandWasSentFor('phalaenopsis.jpg');
      expect(stateConsumerInvocations).to.be.eql(1);
   });
   
   it('hidePicture command updated the state A', function() {
      givenShowPictureCommandWasSentFor('phalaenopsis.jpg');
      whenHidePictureCommandWasSent();
      expect(capturedState.shownPicture).to.be.eql(undefined);
   });
   
   it('hidePicture command sent twice updates the state only once', function() {
      givenShowPictureCommandWasSentFor('phalaenopsis.jpg');
      whenHidePictureCommandWasSent();
      whenHidePictureCommandWasSent();
      expect(stateConsumerInvocations).to.be.eql(2);
   });
});  