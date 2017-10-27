/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Language.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/UiStatePublisher.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var instance;
var config;
var mockedBus;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var givenDefaultUiStatePublisher = function givenDefaultUiStatePublisher() {
   instance = new shop.ui.UiStatePublisher(config, mockedBus);
};

var givenNewStateIs = function givenNewStateIs(newState) {
   instance.setNewState(newState);
};

var givenSupportedTabsAre = function givenSupportedLanguagesAre(tabs) {
   config.supportedTabs = tabs;
};

var givenSupportedLanguagesAre = function givenSupportedLanguagesAre(languages) {
   config.supportedLanguages = languages;
};

var givenDefaultLanguageIs = function givenDefaultLanguageIs(language) {
   config.defaultLanguage = language;
};

var givenDefaultTabIs = function givenDefaultTabIs(tab) {
   config.defaultTab = tab;
};

var whenNewStateIs = function whenNewStateIs(newState) {
   givenNewStateIs(newState);
};

var publicationsContains = function publicationsContains(expectedTopic, expectedValue) {
   var capturedValue = mockedBus.getLastPublication(expectedTopic);
   return capturedValue === expectedValue;
};

var lastVisibleTabPublication = function lastVisibleTabPublication() {
   return mockedBus.getLastPublication(shop.topics.VISIBLE_TAB);
};

var lastShownPicturePublication = function lastShownPicturePublication() {
   return mockedBus.getLastPublication(shop.topics.SHOWN_PICTURE);
};

var lastCurrentLanguagePublication = function lastCurrentLanguagePublication() {
   return mockedBus.getLastPublication(shop.topics.CURRENT_LANGUAGE);
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

var getVisibleTabPublicationCount = function getVisibleTabPublicationCount() {
   return mockedBus.getPublicationCount(shop.topics.VISIBLE_TAB);
};

var getShownPicturePublicationCount = function getShownPicturePublicationCount() {
   return mockedBus.getPublicationCount(shop.topics.SHOWN_PICTURE);
};

var getCurrentLanguagePublicationCount = function getCurrentLanguagePublicationCount() {
   return mockedBus.getPublicationCount(shop.topics.CURRENT_LANGUAGE);
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   config = {};
   givenDefaultUiStatePublisher();
};

describe('UiStatePublisher', function() {
	
   beforeEach(setup);
   
   it('creating an UiStateSetter of a TabContent is an instance/object', function() {
      
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('receiving a new state updates the visible tab publication', function() {
      givenSupportedTabsAre(['tabA']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      whenNewStateIs({visibleTab: 'tabA', language: shop.Language.DE});
      expect(lastVisibleTabPublication()).to.be.eql('tabA');
   });
   
   it('receiving the same state does not updates the visible tab publication', function() {
      givenSupportedTabsAre(['tabA']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      whenNewStateIs({visibleTab: 'tabA', language: shop.Language.DE});
      whenNewStateIs({visibleTab: 'tabA', language: shop.Language.DE});
      expect(getVisibleTabPublicationCount()).to.be.eql(1);
   });
   
   it('receiving another state updates the visible tab publication', function() {
      givenSupportedTabsAre(['tabA', 'tabB']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      whenNewStateIs({visibleTab: 'tabA', language: shop.Language.DE});
      whenNewStateIs({visibleTab: 'tabB', language: shop.Language.DE});
      expect(lastVisibleTabPublication()).to.be.eql('tabB');
   });
   
   it('receiving a new state with a shown picture updates the shown picture publication', function() {
      givenSupportedTabsAre(['anyTab']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      whenNewStateIs({visibleTab: 'anyTab', shownPicture: 'pic.jpg', language: shop.Language.DE});
      expect(lastShownPicturePublication()).to.be.eql('pic.jpg');
   });
   
   it('receiving a new state with the same shown picture does not update the shown picture publication', function() {
      givenSupportedTabsAre(['anyTab', 'anotherTab']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      givenNewStateIs({visibleTab: 'anyTab', shownPicture: 'samePicture.jpg', language: shop.Language.DE});
      whenNewStateIs({visibleTab: 'anotherTab', shownPicture: 'samePicture.jpg', language: shop.Language.DE});
      expect(lastShownPicturePublication()).to.be.eql('samePicture.jpg');
   });
   
   it('receiving a new state with a language updates the current language publication', function() {
      givenSupportedTabsAre(['anyTab']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      whenNewStateIs({visibleTab: 'anyTab', language: shop.Language.DE});
      expect(lastCurrentLanguagePublication()).to.be.eql(shop.Language.DE);
   });
   
   it('receiving a new state with the same language does not update the current language publication', function() {
      givenSupportedTabsAre(['anyTab']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
     givenNewStateIs({visibleTab: 'anyTab', language: shop.Language.EN});
      whenNewStateIs({visibleTab: 'anyTab', language: shop.Language.EN});
      expect(lastCurrentLanguagePublication()).to.be.eql(shop.Language.EN);
   });
       
   it('receiving an invalid state publishes the configured default tab', function() {
      givenSupportedTabsAre(['anyTab', 'secondTab']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      givenDefaultTabIs('secondTab');
      whenNewStateIs({someKey: 'tabA'});
      expect(lastVisibleTabPublication()).to.be.eql('secondTab');
   });
      
   it('receiving an invalid state publishes undefined as shown picture', function() {
      givenSupportedTabsAre(['anyTab']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      whenNewStateIs({someKey: 'tabA'});
      expect(lastShownPicturePublication()).to.be.eql(undefined);
   });
      
   it('receiving an invalid state publishes the configured default language', function() {
      givenSupportedTabsAre(['anyTab']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      givenDefaultLanguageIs(shop.Language.EN);
      whenNewStateIs({someKey: 'tabA'});
      expect(lastCurrentLanguagePublication()).to.be.eql(shop.Language.EN);
   });
   
   it('receiving an unsupported language publishes the configured default language', function() {
      givenSupportedTabsAre(['anyTab']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      givenDefaultLanguageIs(shop.Language.DE);
      whenNewStateIs({visibleTab: 'anyTab', language: ''});
      expect(lastCurrentLanguagePublication()).to.be.eql(shop.Language.DE);
   });
   
   it('receiving an unsupported tab publishes the configured default tab', function() {
      givenSupportedTabsAre(['plants', 'accessories']);
      givenSupportedLanguagesAre([shop.Language.DE, shop.Language.EN]);
      givenDefaultTabIs('accessories');
      whenNewStateIs({visibleTab: 'anyTab', language: shop.Language.EN});
      expect(lastVisibleTabPublication()).to.be.eql('accessories');
   });
});  