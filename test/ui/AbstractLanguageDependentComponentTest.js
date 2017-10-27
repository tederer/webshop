/* global global, shop, testing */

require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Context.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Language.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/AbstractLanguageDependentComponent.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var capturedLanguage;

var mockedBus = new testing.MockedBus();

shop.Context = { bus: mockedBus };

var instance;

var DerivedObject = function DerivedObject() {
   this.onLanguageChanged = function onLanguageChanged(newLanguage) {
      capturedLanguage = newLanguage;
   };
};

DerivedObject.prototype = new shop.ui.AbstractLanguageDependentComponent(mockedBus);

var givenDerivedObject = function givenDerivedObject() {
   instance = new DerivedObject();
   instance.initialize();
};

var whenCurrentLanguageIs = function whenCurrentLanguageIs(currentLanguage) {
   mockedBus.publish(shop.topics.CURRENT_LANGUAGE, currentLanguage);
};

var setup = function setup() {
   mockedBus.reset();
   capturedLanguage = undefined;
};


describe('AbstractLanguageDependentComponent', function() {
	
   beforeEach(setup);
   
   it('a new instance subscribes to the current language publication topic', function() {
      
      givenDerivedObject();
      var capturedSubscriptions = mockedBus.getPublicationSubscriptions();
      expect(capturedSubscriptions.length).to.be.eql(1);
      expect(capturedSubscriptions[0]).to.be.eql(shop.topics.CURRENT_LANGUAGE);
   });
   
   it('a new language (english) gets provided to a derived object', function() {
      
      givenDerivedObject();
      whenCurrentLanguageIs(shop.Language.EN);
      expect(capturedLanguage).to.be.eql(shop.Language.EN);
   });
   
   it('a new language (german) gets provided to a derived object', function() {
      
      givenDerivedObject();
      whenCurrentLanguageIs(shop.Language.DE);
      expect(capturedLanguage).to.be.eql(shop.Language.DE);
   });
}); 

