/* global global, shop, common, Map, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/UiStatePublisher.js');

assertNamespace('shop');

var instance;
var publications;

shop.Context.defaultVisibleTab = 'defaultTab';

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var mockedBus = {
   publish: function publish(topic, data) {
      publications[publications.length] = {topic:topic, data:data};
   }
};

var givenDefaultUiStatePublisher = function givenDefaultUiStatePublisher() {
   instance = new shop.ui.UiStatePublisher(mockedBus);
};

var givenNewStateIs = function givenNewStateIs(newState) {
   instance.setNewState(newState);
};

var whenNewStateIs = function whenNewStateIs(newState) {
   givenNewStateIs(newState);
};

var publicationsContainsVisibleTab = function publicationsContainsVisibleTab(expectedTabName) {
   var found = false;
   for (var index = 0; found === false && index < publications.length; index++) {
      var currentPublication = publications[index];
      if (currentPublication.topic === shop.topics.VISIBLE_TAB && currentPublication.data === expectedTabName) {
         found = true;
      }
   }
   
   return found;
};

var publicationsContainsShownPicture = function publicationsContainsShownPicture(expectedFilename) {
   var found = false;
   for (var index = 0; found === false && index < publications.length; index++) {
      var currentPublication = publications[index];
      if (currentPublication.topic === shop.topics.SHOWN_PICTURE && currentPublication.data === expectedFilename) {
         found = true;
      }
   }
   
   return found;
};

var getPublicationCount = function getPublicationCount(topic) {
   var count = 0;
   for (var index = 0; index < publications.length; index++) {
      if (publications[index].topic === topic) {
         count++;
      }
   }
   return count;
};

var getVisibleTabPublicationCount = function getVisibleTabPublicationCount() {
   return getPublicationCount(shop.topics.VISIBLE_TAB);
};

var getShownPicturePublicationCount = function getShownPicturePublicationCount() {
   return getPublicationCount(shop.topics.SHOWN_PICTURE);
};

var setup = function setup() {
   publications = [];
   givenDefaultUiStatePublisher();
};

describe('UiStatePublisher', function() {
	
   beforeEach(setup);
   
   it('creating an UiStateSetter of a TabContent is an instance/object', function() {
      
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('receiving a new state updates the visible tab publication', function() {
      
      whenNewStateIs({visibleTab: 'tabA'});
      expect(getVisibleTabPublicationCount()).to.be.eql(1);
      expect(publicationsContainsVisibleTab('tabA')).to.be.eql(true);
   });
   
   it('receiving the same state does not updates the visible tab publication', function() {
      
      whenNewStateIs({visibleTab: 'tabA'});
      whenNewStateIs({visibleTab: 'tabA'});
      expect(getVisibleTabPublicationCount()).to.be.eql(1);
   });
   
   it('receiving another state updates the visible tab publication', function() {
      
      whenNewStateIs({visibleTab: 'tabA'});
      whenNewStateIs({visibleTab: 'tabB'});
      expect(getVisibleTabPublicationCount()).to.be.eql(2);
      expect(publicationsContainsVisibleTab('tabA')).to.be.eql(true);
      expect(publicationsContainsVisibleTab('tabB')).to.be.eql(true);
   });
   
   it('receiving a new state with a shown picture updates the shown picture publication', function() {
      
      whenNewStateIs({visibleTab: 'anyTab', shownPicture: 'pic.jpg'});
      expect(getShownPicturePublicationCount()).to.be.eql(1);
      expect(publicationsContainsShownPicture('pic.jpg')).to.be.eql(true);
   });
   
   it('receiving a new state with the same shown picture does not update the shown picture publication', function() {
      
      givenNewStateIs({visibleTab: 'anyTab', shownPicture: 'samePicture.jpg'});
      whenNewStateIs({visibleTab: 'anotherTab', shownPicture: 'samePicture.jpg'});
      expect(getShownPicturePublicationCount()).to.be.eql(1);
      expect(publicationsContainsShownPicture('samePicture.jpg')).to.be.eql(true);
   });
      
   it('receiving an invalid state publishes the default visible tab from the context', function() {
      
      whenNewStateIs({someKey: 'tabA'});
      expect(getVisibleTabPublicationCount()).to.be.eql(1);
      expect(publicationsContainsVisibleTab('defaultTab')).to.be.eql(true);
   });
      
   it('receiving an invalid state publishes undefined as shown picture', function() {
      
      whenNewStateIs({someKey: 'tabA'});
      expect(getShownPicturePublicationCount()).to.be.eql(1);
      expect(publicationsContainsShownPicture(undefined)).to.be.eql(true);
   });
});  