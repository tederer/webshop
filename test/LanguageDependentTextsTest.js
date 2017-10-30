/* global global, shop, common, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/LanguageDependentTexts.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Promise.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

assertNamespace('shop.Context');

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var DEFAULT_CONFIG_BASE_URL = 'http://localhost:8080/config';
var ERROR_MESSAGE = 'cannot load resource';

var instance;
var capturedConfigBaseUrl;
var configuredTexts;
var capturedResourceName;
var mockedBus;

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

var givenDefaultLanguageDependentTexts = function givenDefaultLanguageDependentTexts() {
   instance = new shop.LanguageDependentTexts(DEFAULT_CONFIG_BASE_URL, mockedBus, resourceProviderFactoryFunction);
};

var givenConfiguredText = function givenConfiguredText(id, language, text) {
   var configuredText = configuredTexts[id];
   
   if (configuredText === undefined) {
      configuredTexts[id] = {};
   }
   
   configuredTexts[id][language] = text;
};

var givenCurrentLanguageIs = function givenCurrentLanguageIs(currentLanguage) {
   mockedBus.publish(shop.topics.CURRENT_LANGUAGE, currentLanguage);
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

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedConfigBaseUrl = undefined;
   configuredTexts = {};
   capturedResourceName = undefined;
   shop.Context.log = function log(message) {};
};


describe('LanguageDependentTexts', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a LanguageDependentTexts is an instance/object', function() {
      givenDefaultLanguageDependentTexts();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('LanguageDependentTexts provides config base URL to ResourceProvider A', function() {
      givenDefaultLanguageDependentTexts();
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
      givenDefaultLanguageDependentTexts();
      whenTextsAreLoaded();
      expect(capturedResourceName).to.be.eql('languageDependentTexts.json');
   });
      
   it('LanguageDependentTexts publishes german text', function() {
      givenDefaultLanguageDependentTexts();
      givenConfiguredText('buttonA', shop.Language.DE, 'Knopf A');
      givenConfiguredText('buttonA', shop.Language.EN, 'Button A');
      givenTextsAreLoaded();
      whenCurrentLanguageIs(shop.Language.DE);
      expect(mockedBus.getLastPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'buttonA')).to.be.eql('Knopf A');
   });
      
   it('LanguageDependentTexts publishes multiple texts', function() {
      givenDefaultLanguageDependentTexts();
      givenConfiguredText('buttonA', shop.Language.DE, 'Knopf A');
      givenConfiguredText('buttonA', shop.Language.EN, 'Button A');
      givenConfiguredText('buttonB', shop.Language.DE, 'Knopf B');
      givenConfiguredText('buttonB', shop.Language.EN, 'Button B');
      givenTextsAreLoaded();
      whenCurrentLanguageIs(shop.Language.EN);
      expect(mockedBus.getLastPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'buttonA')).to.be.eql('Button A');
      expect(mockedBus.getLastPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'buttonB')).to.be.eql('Button B');
   });
      
   it('LanguageDependentTexts publishes english text', function() {
      givenDefaultLanguageDependentTexts();
      givenConfiguredText('buttonA', shop.Language.DE, 'Knopf A');
      givenConfiguredText('buttonA', shop.Language.EN, 'Button A');
      givenTextsAreLoaded();
      whenCurrentLanguageIs(shop.Language.EN);
      expect(mockedBus.getLastPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'buttonA')).to.be.eql('Button A');
   });
      
   it('LanguageDependentTexts publishes german text independent of the order of current language and config publication', function() {
      givenDefaultLanguageDependentTexts();
      givenConfiguredText('buttonA', shop.Language.DE, 'Knopf A');
      givenConfiguredText('buttonA', shop.Language.EN, 'Button A');
      givenCurrentLanguageIs(shop.Language.DE);
      whenTextsAreLoaded();
      expect(mockedBus.getLastPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'buttonA')).to.be.eql('Knopf A');
   });
   
   it('LanguageDependentTexts publishes nothing when config can not be parsed', function() {
      givenDefaultLanguageDependentTexts();
      configuredTexts = '{donald={}}';
      givenCurrentLanguageIs(shop.Language.DE);
      whenTextsAreLoaded();
      expect(mockedBus.getTotalPublicationCount()).to.be.eql(1);
   });
});  