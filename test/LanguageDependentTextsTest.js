/* global global, shop, common, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/LanguageDependentTexts.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Promise.js');

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var DEFAULT_CONFIG_BASE_URL = 'http://localhost:8080/config';
var ERROR_MESSAGE = 'cannot load resource';

var instance;
var capturedConfigBaseUrl;
var capturedPublications;
var configuredTexts;
var capturedSubscriptions;
var capturedResourceName;
var publications;

var quietLog = function quietLog(message) {};

var mockedBus = {
   subscribeToPublication: function subscribeToPublication(topic, callback) {
      capturedSubscriptions[capturedSubscriptions.length] = { topic: topic, callback: callback };
      var lastPublishedData = publications[topic];
      if (lastPublishedData !== undefined) {
         callback(lastPublishedData);
      }
   },
   publish: function publish(topic, data) {
      capturedPublications[capturedPublications.length] = {topic: topic, data: data};
   },

   notifySubscribers: function notifySubscribers(topic, data) {
      publications[topic] = data;
      capturedSubscriptions.forEach(function(subscription) {
         if (subscription.topic === topic) {
            subscription.callback(data);
         }
      });
   }
};

var mockedResourceProvider = {
      get: function get(name) {
         capturedResourceName = name;
         var executor = function executor(fulfill, reject) {
            if (typeof(configuredTexts) === 'string' || configuredTexts instanceof String) {
               fulfill(configuredTexts);
            } else {
               fulfill(JSON.stringify(configuredTexts));
            }
         };
         
         return new common.Promise(executor);
      }
};

var resourceProviderFactoryFunction = function resourceProviderFactoryFunction(configBaseUrl) {
   capturedConfigBaseUrl = configBaseUrl;
   return mockedResourceProvider;
};

var givenDefaultLanguageSelector = function givenDefaultLanguageSelector() {
   instance = new shop.LanguageDependentTexts(DEFAULT_CONFIG_BASE_URL, mockedBus, resourceProviderFactoryFunction, quietLog);
};

var givenConfiguredText = function givenConfiguredText(id, language, text) {
   var configuredText = configuredTexts[id];
   
   if (configuredText === undefined) {
      configuredTexts[id] = {};
   }
   
   configuredTexts[id][language] = text;
};

var givenCurrentLanguageIs = function givenCurrentLanguageIs(currentLanguage) {
   mockedBus.notifySubscribers(shop.topics.CURRENT_LANGUAGE, currentLanguage);
};

var givenTextsAreLoaded = function givenTextsAreLoaded() {
   instance.load();
};

var whenCurrentLanguageIs = function whenCurrentLanguageIs(currentLanguage) {
   givenCurrentLanguageIs(currentLanguage);
};

var whenTextsAreLoaded = function whenTextsAreLoaded() {
   givenTextsAreLoaded();
};

var capturedPublicationsContains = function capturedPublicationsContains(expectedPublication) {
   var found = false;
   for (var index = 0; found !== true && index < capturedPublications.length; index++) {
      var publication = capturedPublications[index];
      if (publication.topic === expectedPublication.topic && publication.data === expectedPublication.data) {
         found = true;
      }
   }
   return found;
};

var setup = function setup() {
   capturedConfigBaseUrl = undefined;
   capturedPublications = [];
   configuredTexts = {};
   capturedSubscriptions = [];
   capturedResourceName = undefined;
   publications = {};
};


describe('LanguageDependentTexts', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a LanguageDependentTexts is an instance/object', function() {
      givenDefaultLanguageSelector();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('LanguageDependentTexts provides config base URL to ResourceProvider A', function() {
      givenDefaultLanguageSelector();
      whenTextsAreLoaded();
      expect(capturedConfigBaseUrl).to.be.eql(DEFAULT_CONFIG_BASE_URL);
   });
   
   it('LanguageDependentTexts provides config base URL to ResourceProvider B', function() {
      instance = new shop.LanguageDependentTexts('http://192.168.1.1/settings', mockedBus, resourceProviderFactoryFunction);
      whenTextsAreLoaded();
      expect(capturedConfigBaseUrl).to.be.eql('http://192.168.1.1/settings');
   });
   
   it('LanguageDependentTexts provides config base URL to ResourceProvider B', function() {
      instance = new shop.LanguageDependentTexts('http://192.168.1.1/settings', mockedBus, resourceProviderFactoryFunction);
      whenTextsAreLoaded();
      expect(capturedConfigBaseUrl).to.be.eql('http://192.168.1.1/settings');
   });
      
   it('LanguageDependentTexts starts loading the config resource called "languageDependentTexts"', function() {
      givenDefaultLanguageSelector();
      whenTextsAreLoaded();
      expect(capturedResourceName).to.be.eql('languageDependentTexts.json');
   });
      
   it('LanguageDependentTexts subscribes to the current language publication', function() {
      givenDefaultLanguageSelector();
      whenTextsAreLoaded();
      expect(capturedSubscriptions.length).to.be.eql(1);
      expect(capturedSubscriptions[0].topic).to.be.eql(shop.topics.CURRENT_LANGUAGE);
   });
      
   it('LanguageDependentTexts publishes german text', function() {
      givenDefaultLanguageSelector();
      givenConfiguredText('buttonA', shop.Language.DE, 'Knopf A');
      givenConfiguredText('buttonA', shop.Language.EN, 'Button A');
      givenTextsAreLoaded();
      whenCurrentLanguageIs(shop.Language.DE);
      expect(capturedPublications.length).to.be.eql(1);
      expect(capturedPublicationsContains({topic: '/languageDependentText/buttonA', data: 'Knopf A'})).to.be.eql(true);
   });
      
   it('LanguageDependentTexts publishes multiple texts', function() {
      givenDefaultLanguageSelector();
      givenConfiguredText('buttonA', shop.Language.DE, 'Knopf A');
      givenConfiguredText('buttonA', shop.Language.EN, 'Button A');
      givenConfiguredText('buttonB', shop.Language.DE, 'Knopf B');
      givenConfiguredText('buttonB', shop.Language.EN, 'Button B');
      givenTextsAreLoaded();
      whenCurrentLanguageIs(shop.Language.EN);
      expect(capturedPublications.length).to.be.eql(2);
      expect(capturedPublicationsContains({topic: '/languageDependentText/buttonA', data: 'Button A'})).to.be.eql(true);
      expect(capturedPublicationsContains({topic: '/languageDependentText/buttonB', data: 'Button B'})).to.be.eql(true);
   });
      
   it('LanguageDependentTexts publishes english text', function() {
      givenDefaultLanguageSelector();
      givenConfiguredText('buttonA', shop.Language.DE, 'Knopf A');
      givenConfiguredText('buttonA', shop.Language.EN, 'Button A');
      givenTextsAreLoaded();
      whenCurrentLanguageIs(shop.Language.EN);
      expect(capturedPublications.length).to.be.eql(1);
      expect(capturedPublicationsContains({topic: '/languageDependentText/buttonA', data: 'Button A'})).to.be.eql(true);
   });
      
   it('LanguageDependentTexts publishes german text independent of the order of current language and config publication', function() {
      givenDefaultLanguageSelector();
      givenConfiguredText('buttonA', shop.Language.DE, 'Knopf A');
      givenConfiguredText('buttonA', shop.Language.EN, 'Button A');
      givenCurrentLanguageIs(shop.Language.DE);
      whenTextsAreLoaded();
      expect(capturedPublications.length).to.be.eql(1);
      expect(capturedPublicationsContains({topic: '/languageDependentText/buttonA', data: 'Knopf A'})).to.be.eql(true);
   });
   
   it('LanguageDependentTexts publishes nothing when config can not be parsed', function() {
      givenDefaultLanguageSelector();
      configuredTexts = '{donald={}}';
      givenCurrentLanguageIs(shop.Language.DE);
      whenTextsAreLoaded();
      expect(capturedPublications.length).to.be.eql(0);
   });
});  