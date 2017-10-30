/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/LanguageDependentTextSetter.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

assertNamespace('shop.Context');

var DEFAULT_SELECTOR = '#shop > #myComp';
var DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY = 'myText';

var instance;
var capturedSetTexts;
var mockedBus;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var mockedComponentTextSetter = function mockedComponentTextSetter(selector, text) {
   capturedSetTexts[capturedSetTexts.length] = {selector: selector, text: text};
};

var givenDefaultLanguageDependentTextSetter = function givenDefaultLanguageDependentTextSetter() {
   instance = new shop.ui.LanguageDependentTextSetter(DEFAULT_SELECTOR, DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY, mockedComponentTextSetter, mockedBus);
};

var givenLanguageDependentTextSetter = function givenLanguageDependentTextSetter(selector, textKey) {
   instance = new shop.ui.LanguageDependentTextSetter(selector, textKey, mockedComponentTextSetter, mockedBus);
};

var whenTheLanguageDependentTextGetsPublished =  function whenTheLanguageDependentTextGetsPublished(textKey, text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKey, text);
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedSetTexts = [];
   shop.Context.log = function log(message) {};
};

describe('LanguageDependentTextSetter', function() {
	
   beforeEach(setup);
   
   it('creating an instance is an instance/object', function() {
      givenDefaultLanguageDependentTextSetter();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('the published language dependent text gets set on the component A', function() {
      givenDefaultLanguageDependentTextSetter();
      whenTheLanguageDependentTextGetsPublished(DEFAULT_LANGUAGE_DEPENDENT_TEXT_KEY, 'some text');
      expect(capturedSetTexts.length).to.be.eql(1);
      expect(capturedSetTexts[0].selector).to.be.eql(DEFAULT_SELECTOR);
      expect(capturedSetTexts[0].text).to.be.eql('some text');
   });
   
   it('the published language dependent text gets set on the component B', function() {
      givenLanguageDependentTextSetter('#spa > #anotherComp', 'anotherCompTextKey');
      whenTheLanguageDependentTextGetsPublished('anotherCompTextKey', 'another special text');
      expect(capturedSetTexts.length).to.be.eql(1);
      expect(capturedSetTexts[0].selector).to.be.eql('#spa > #anotherComp');
      expect(capturedSetTexts[0].text).to.be.eql('another special text');
   });
});  