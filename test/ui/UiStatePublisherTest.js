/* global global, shop, common, Map, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Language.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/UiStatePublisher.js');

assertNamespace('shop.Context');

var instance;
var publications;

shop.Context.defaultVisibleTab = 'defaultTab';
shop.Context.defaultLanguage = shop.Language.DE;

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

var publicationsContains = function publicationsContains(expectedTopic, expectedValue) {
   var found = false;
   for (var index = 0; found === false && index < publications.length; index++) {
      var currentPublication = publications[index];
      if (currentPublication.topic === expectedTopic && currentPublication.data === expectedValue) {
         found = true;
      }
   }
   
   return found;
};

var publicationsContainsVisibleTab = function publicationsContainsVisibleTab(expectedTabName) {
   return publicationsContains(shop.topics.VISIBLE_TAB, expectedTabName);
};

var publicationsContainsShownPicture = function publicationsContainsShownPicture(expectedFilename) {
   return publicationsContains(shop.topics.SHOWN_PICTURE, expectedFilename);
};

var publicationsContainsCurrentLanguage = function publicationsContainsCurrentLanguage(expectedLanguage) {
   return publicationsContains(shop.topics.CURRENT_LANGUAGE, expectedLanguage);
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

var getCurrentLanguagePublicationCount = function getCurrentLanguagePublicationCount() {
   return getPublicationCount(shop.topics.CURRENT_LANGUAGE);
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
      
      whenNewStateIs({visibleTab: 'tabA', language: shop.Language.DE});
      expect(getVisibleTabPublicationCount()).to.be.eql(1);
      expect(publicationsContainsVisibleTab('tabA')).to.be.eql(true);
   });
   
   it('receiving the same state does not updates the visible tab publication', function() {
      
      whenNewStateIs({visibleTab: 'tabA', language: shop.Language.DE});
      whenNewStateIs({visibleTab: 'tabA', language: shop.Language.DE});
      expect(getVisibleTabPublicationCount()).to.be.eql(1);
   });
   
   it('receiving another state updates the visible tab publication', function() {
      
      whenNewStateIs({visibleTab: 'tabA', language: shop.Language.DE});
      whenNewStateIs({visibleTab: 'tabB', language: shop.Language.DE});
      expect(getVisibleTabPublicationCount()).to.be.eql(2);
      expect(publicationsContainsVisibleTab('tabA')).to.be.eql(true);
      expect(publicationsContainsVisibleTab('tabB')).to.be.eql(true);
   });
   
   it('receiving a new state with a shown picture updates the shown picture publication', function() {
      
      whenNewStateIs({visibleTab: 'anyTab', shownPicture: 'pic.jpg', language: shop.Language.DE});
      expect(getShownPicturePublicationCount()).to.be.eql(1);
      expect(publicationsContainsShownPicture('pic.jpg')).to.be.eql(true);
   });
   
   it('receiving a new state with the same shown picture does not update the shown picture publication', function() {
      
      givenNewStateIs({visibleTab: 'anyTab', shownPicture: 'samePicture.jpg', language: shop.Language.DE});
      whenNewStateIs({visibleTab: 'anotherTab', shownPicture: 'samePicture.jpg', language: shop.Language.DE});
      expect(getShownPicturePublicationCount()).to.be.eql(1);
      expect(publicationsContainsShownPicture('samePicture.jpg')).to.be.eql(true);
   });
   
   it('receiving a new state with a language updates the current language publication', function() {
      
      whenNewStateIs({visibleTab: 'anyTab', language: shop.Language.DE});
      expect(getCurrentLanguagePublicationCount()).to.be.eql(1);
      expect(publicationsContainsCurrentLanguage(shop.Language.DE)).to.be.eql(true);
   });
   
   it('receiving a new state with the same language does not update the current language publication', function() {
      
      givenNewStateIs({visibleTab: 'anyTab', language: shop.Language.EN});
      whenNewStateIs({visibleTab: 'anyTab', language: shop.Language.EN});
      expect(getCurrentLanguagePublicationCount()).to.be.eql(1);
      expect(publicationsContainsCurrentLanguage(shop.Language.EN)).to.be.eql(true);
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
      
   it('receiving an invalid state publishes the default language from the context', function() {
      whenNewStateIs({someKey: 'tabA'});
      expect(getShownPicturePublicationCount()).to.be.eql(1);
      expect(publicationsContainsCurrentLanguage(shop.Language.DE)).to.be.eql(true);
   });
});  