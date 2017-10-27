/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/LanguageSelector.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

assertNamespace('shop.Context');

var DEFAULT_LANGUAGE = shop.Language.DE;
var DEFAULT_ALTERNATIVE_LANGUAGE = shop.Language.EN;
var DEFAULT_LANGUAGE_DEPENDENT_TEXT_ID = 'defaultTextId';

var instance;
var capturedEventType;
var capturedCallback;
var capturedTexts;
var mockedBus;

var mockedUiComponentProvider = function() {
   return {
      on: function on(eventType, callback) {
         capturedEventType = eventType;
         capturedCallback = callback;
      },
      text: function text(newText) {
         capturedTexts[capturedTexts.length] = newText;
      }
   };
};

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var givenLanguageDependentTextPublication = function givenLanguageDependentTextPublication(textId, text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textId, text);
};

var givenDefaultLanguageSelector = function givenDefaultLanguageSelector() {
   instance = new shop.ui.LanguageSelector(mockedUiComponentProvider, mockedBus);
};

var givenCurrentLanguageIs = function givenCurrentLanguageIs(language) {
   mockedBus.publish(shop.topics.CURRENT_LANGUAGE, language);
};

var givenLanguageSelectorTextIs = function givenLanguageSelectorTextIs(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'menu.languageSelectorButton', text);
};

var whenTheComponentGetsClicked = function whenTheComponentGetsClicked() {
   capturedCallback();
};

var lastSetLanguage = function lastSetLanguage() {
   return mockedBus.getLastCommand(shop.topics.SET_CURRENT_LANGUAGE);
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedEventType = undefined;
   capturedCallback = undefined;
   capturedTexts = [];
};

describe('LanguageSelector', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a LanguageSelector is an instance/object', function() {
      
      givenDefaultLanguageSelector();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('a new instance registers callback for click events', function() {
      
      givenDefaultLanguageSelector();
      expect(capturedEventType).to.be.eql('click');
   });
   
   it('a new instance sets the component text to the published language dependent text A', function() {
      givenLanguageSelectorTextIs('donald');
      givenDefaultLanguageSelector();
      expect(capturedTexts.length).to.be.eql(1);
      expect(capturedTexts[0]).to.be.eql('donald');
   });
      
   it('a new instance sets the component text to the published language dependent text B', function() {
      givenLanguageSelectorTextIs('daisy');
      givenDefaultLanguageSelector();
      expect(capturedTexts.length).to.be.eql(1);
      expect(capturedTexts[0]).to.be.eql('daisy');
   });
    
   it('english gets activated when the component gets clicked once and german was active before', function() {
      givenCurrentLanguageIs(shop.Language.DE);
      givenDefaultLanguageSelector();
      whenTheComponentGetsClicked();
      expect(lastSetLanguage()).to.be.eql(shop.Language.EN);
   });   
    
   it('german gets activated when the component gets clicked once and english was active before', function() {
      givenCurrentLanguageIs(shop.Language.EN);
      givenDefaultLanguageSelector();
      whenTheComponentGetsClicked();
      expect(lastSetLanguage()).to.be.eql(shop.Language.DE);
   });   
});  