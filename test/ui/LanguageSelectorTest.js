/* global global, shop, common, Map, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/LanguageSelector.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

assertNamespace('shop.Context');

var DEFAULT_LANGUAGE = shop.Language.DE;
var DEFAULT_ALTERNATIVE_LANGUAGE = shop.Language.EN;
var DEFAULT_LANGUAGE_DEPENDENT_TEXT_ID = 'defaultTextId';

var instance;
var publications;
var capturedEventType;
var capturedCallback;
var capturedTexts;
var subscriptions;

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

var mockedBus = {
   subscribeToPublication: function subscribeToPublication(topic, callback) {
      subscriptions[topic] = callback;
   },
   
   publish: function publish(topic, data) {
      publications[publications.length] = {topic: topic, data: data};
   },
   
   simulatePublication: function simulatePublication(topic, data) {
      var callback = subscriptions[topic];
      if (callback !== undefined) {
         callback(data);
      }
   }
};

var givenLanguageDependentTextPublication = function givenLanguageDependentTextPublication(textId, text) {
   mockedBus.simulatePublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textId, text);
};

var givenDefaultLanguageSelector = function givenDefaultLanguageSelector() {
   var config = {
      uiComponentProvider:       mockedUiComponentProvider,
      languageDependentTextId:   DEFAULT_LANGUAGE_DEPENDENT_TEXT_ID,
      defaultLanguage:           DEFAULT_LANGUAGE, 
      alternativeLanguage:       DEFAULT_ALTERNATIVE_LANGUAGE
   };
   instance = new shop.ui.LanguageSelector(config, mockedBus);
};

var givenLanguageSelectorWithLanguages = function givenLanguageSelectorWithLanguages(defaultLanguage, alternativeLanguage) {
   var config = {
      uiComponentProvider:       mockedUiComponentProvider,
      languageDependentTextId:   DEFAULT_LANGUAGE_DEPENDENT_TEXT_ID,
      defaultLanguage:           defaultLanguage, 
      alternativeLanguage:       alternativeLanguage
   };
   instance = new shop.ui.LanguageSelector(config, mockedBus);
};

var givenLanguageSelectorWithTextId = function givenLanguageSelectorWithTextId(textId) {
   var config = {
      uiComponentProvider:       mockedUiComponentProvider,
      languageDependentTextId:   textId,
      defaultLanguage:           DEFAULT_LANGUAGE, 
      alternativeLanguage:       DEFAULT_ALTERNATIVE_LANGUAGE
   };
   instance = new shop.ui.LanguageSelector(config, mockedBus);
};


var whenTheComponentGetsClicked = function whenTheComponentGetsClicked() {
   capturedCallback();
};

var setup = function setup() {
   publications = [];
   capturedEventType = undefined;
   capturedCallback = undefined;
   capturedTexts = [];
   subscriptions = {};
};

describe('LanguageSelector', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a LanguageSelector is an instance/object', function() {
      
      givenDefaultLanguageSelector();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('a new instance publishes sets the current language to the default language A', function() {
      
      givenDefaultLanguageSelector();
      expect(publications.length).to.be.eql(1);
      expect(publications[0].topic).to.be.eql(shop.topics.CURRENT_LANGUAGE);
      expect(publications[0].data).to.be.eql(DEFAULT_LANGUAGE);
   });
   
   it('a new instance publishes sets the current language to the default language B', function() {
      
      givenLanguageSelectorWithLanguages(shop.Language.EN, shop.Language.DE);
      expect(publications.length).to.be.eql(1);
      expect(publications[0].topic).to.be.eql(shop.topics.CURRENT_LANGUAGE);
      expect(publications[0].data).to.be.eql(shop.Language.EN);
   });
   
   it('a new instance registers callback for click events', function() {
      
      givenDefaultLanguageSelector();
      expect(capturedEventType).to.be.eql('click');
   });
   
   it('the alternative language gets published when the component gets clicked once', function() {
      
      givenDefaultLanguageSelector();
      whenTheComponentGetsClicked();
      expect(publications.length).to.be.eql(2);
      expect(publications[1].topic).to.be.eql(shop.topics.CURRENT_LANGUAGE);
      expect(publications[1].data).to.be.eql(shop.Language.EN);
   });   
   
   it('the default language gets published when the component gets clicked twice', function() {
      
      givenDefaultLanguageSelector();
      whenTheComponentGetsClicked();
      whenTheComponentGetsClicked();
      expect(publications.length).to.be.eql(3);
      expect(publications[2].topic).to.be.eql(shop.topics.CURRENT_LANGUAGE);
      expect(publications[2].data).to.be.eql(shop.Language.DE);
   });
   
   it('a new instance sets the text to the currently published language dependent text A', function() {
      
      givenDefaultLanguageSelector();
      givenLanguageDependentTextPublication(DEFAULT_LANGUAGE_DEPENDENT_TEXT_ID, 'english');
      expect(capturedTexts.length).to.be.eql(1);
      expect(capturedTexts[0]).to.be.eql('english');
   });
   
   it('a new instance sets the text to the currently published language dependent text B', function() {
      
      givenLanguageSelectorWithTextId('lngButton');
      givenLanguageDependentTextPublication('lngButton', 'blabla');
      expect(capturedTexts.length).to.be.eql(1);
      expect(capturedTexts[0]).to.be.eql('blabla');
   });
});  