/* global global, shop, common, Map, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/UiStateSetter.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Language.js');

var instance;
var commandCallbacks;
var publicationCallbacks;
var capturedStates;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var mockedStateConsumer = function mockedStateConsumer(state) {
   capturedStates[capturedStates.length] = state;
};

var mockedBus = {
   subscribeToCommand: function subscribeToCommand(topic, callback) {
      commandCallbacks[topic] = callback;
   },
   
   subscribeToPublication: function subscribeToPublication(topic, callback) {
      publicationCallbacks[topic] = callback;
   },
   
   sendCommand: function sendCommand(topic, data) {
      var callback = commandCallbacks[topic];
      if (callback !== undefined) {
         callback(data);
      }
   },
   
   publish: function publish(topic, data) {
      var callback = publicationCallbacks[topic];
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

var whenTheCurrentLanguageIs = function whenTheCurrentLanguageIs(language) {
   mockedBus.publish(shop.topics.CURRENT_LANGUAGE, language);
};

var givenPublishedVisibleTabIs = function givenPublishedVisibleTabIs(tabName) {
   mockedBus.publish(shop.topics.VISIBLE_TAB, tabName);
};

var givenPublishedShownPictureIs = function givenPublishedShownPictureIs(relativeFilePath) {
   mockedBus.publish(shop.topics.SHOWN_PICTURE, relativeFilePath);
};

var whenShowPictureCommandWasSentFor = function whenShowPictureCommandWasSentFor(filename) {
   givenShowPictureCommandWasSentFor(filename);
};

var whenHidePictureCommandWasSent = function whenHidePictureCommandWasSent() {
   mockedBus.sendCommand(shop.topics.HIDE_PICTURE, '');
};

var lastCapturedState = function lastCapturedState() {
   return (capturedStates.length > 0 ) ? capturedStates[capturedStates.length - 1] : undefined;
};

var setup = function setup() {
   commandCallbacks = {};
   publicationCallbacks = {};
   capturedStates = [];
   givenDefaultUiStateSetter();
};

describe('UiStateSetter', function() {
	
   beforeEach(setup);
   
   it('creating an UiStateSetter of a TabContent is an instance/object', function() {
      
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('SetVisibleTab command updated the state A', function() {
      whenSetVisibleTabCommandWasSentFor('tab1');
      expect(lastCapturedState().visibleTab).to.be.eql('tab1');
   });
   
   it('SetVisibleTab command updated the state B', function() {
      whenSetVisibleTabCommandWasSentFor('anotherTab');
      expect(lastCapturedState().visibleTab).to.be.eql('anotherTab');
   });
   
   it('SetVisibleTab command does not updated the state when the visible tab is the same in the next command', function() {
      whenSetVisibleTabCommandWasSentFor('tabB');
      whenSetVisibleTabCommandWasSentFor('tabB');
      expect(capturedStates.length).to.be.eql(1);
   });
   
   it('ShowPicture command updated the state A', function() {
      whenShowPictureCommandWasSentFor('aerangis.jpg');
      expect(lastCapturedState().shownPicture).to.be.eql('aerangis.jpg');
   });
   
   it('ShowPicture command updated the state B', function() {
      whenShowPictureCommandWasSentFor('phalaenopsis.jpg');
      expect(lastCapturedState().shownPicture).to.be.eql('phalaenopsis.jpg');
   });
   
   it('ShowPicture command does not updated the state when the picture is the same in the next command', function() {
      whenShowPictureCommandWasSentFor('phalaenopsis.jpg');
      whenShowPictureCommandWasSentFor('phalaenopsis.jpg');
      expect(capturedStates.length).to.be.eql(1);
   });
   
   it('HidePicture command updated the state A', function() {
      givenShowPictureCommandWasSentFor('phalaenopsis.jpg');
      whenHidePictureCommandWasSent();
      expect(lastCapturedState().shownPicture).to.be.eql(undefined);
   });
   
   it('HidePicture command sent twice updates the state only once', function() {
      givenShowPictureCommandWasSentFor('phalaenopsis.jpg');
      whenHidePictureCommandWasSent();
      whenHidePictureCommandWasSent();
      expect(capturedStates.length).to.be.eql(2);
   });
   
   it('the published visible tab is part of the state', function() {
      givenPublishedVisibleTabIs('tabX');
      expect(lastCapturedState().visibleTab).to.be.eql('tabX');
   });
   
   it('the published shown picture is part of the state', function() {
      givenPublishedShownPictureIs('aerangis.jpg');
      expect(lastCapturedState().shownPicture).to.be.eql('aerangis.jpg');
   });
   
   it('a published language updates the state A', function() {
      whenTheCurrentLanguageIs(shop.Language.DE);
      expect(lastCapturedState().language).to.be.eql(shop.Language.DE);
   });
   
   it('a published language updates the state B', function() {
      whenTheCurrentLanguageIs(shop.Language.EN);
      expect(lastCapturedState().language).to.be.eql(shop.Language.EN);
   });
});  