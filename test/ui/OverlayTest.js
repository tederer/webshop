/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/Overlay.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var DEFAULT_SELECTOR = 'selectorA';
var DEFAULT_LANGUAGES = [shop.Language.DE, shop.Language.EN];
var DEFAULT_TEMPLATE_NAME = 'defaultOverlayName';

var instance;
var capturedHtmlContent;
var capturedSelector;
var capturedVisiblityChanges;
var initializeInvocationCount;
var mockedBus;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var MockedAbstractHideableLanguageDependentComponent = function MockedAbstractHideableLanguageDependentComponent() {
   this.initialize = function initialize() {
      initializeInvocationCount++;
   };
   
   this.show = function show() {
      capturedVisiblityChanges[capturedVisiblityChanges.length] = 'show';
   };
   
   this.hide = function hide() {
      capturedVisiblityChanges[capturedVisiblityChanges.length] = 'hide';
   };
};

var setHtmlContent = function setHtmlContent(selector, content) {
   capturedSelector = selector;
   capturedHtmlContent = content;
};

var getDefaultConfig = function getDefaultConfig() {
   return {
      selector: DEFAULT_SELECTOR,
      contentTemplateName: DEFAULT_TEMPLATE_NAME,
      languages: DEFAULT_LANGUAGES
   };
};

var givenDefaultOverlay = function givenDefaultOverlay() {
   instance = new shop.ui.Overlay(getDefaultConfig(), setHtmlContent, mockedBus);
};

var givenTemplatePublication = function givenTemplatePublication(language, data) {
   mockedBus.publish('/htmlContent/' + language + '/' + DEFAULT_TEMPLATE_NAME, data);
};

var givenPublishedLanguageIs = function givenPublishedLanguageIs(language) {
   instance.onLanguageChanged(language);
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedHtmlContent = undefined;
   capturedVisiblityChanges = [];
   capturedSelector = undefined;
   initializeInvocationCount = 0;
   shop.ui.Overlay.prototype = new MockedAbstractHideableLanguageDependentComponent();
};

describe('Overlay', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a Overlay is an instance/object', function() {
      givenDefaultOverlay();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('a instance of a Overlay calls initialize() of its prototype', function() {
      givenDefaultOverlay();
      expect(initializeInvocationCount).to.be.eql(1);
   });
   
   it('german content gets set when language gets set to german', function() {
      givenTemplatePublication(shop.Language.DE, 'irgendwas davor und noch was danach');
      givenTemplatePublication(shop.Language.EN, 'a prefix a suffix');
      givenDefaultOverlay();
      givenPublishedLanguageIs(shop.Language.DE);
      expect(capturedHtmlContent).to.be.eql('irgendwas davor und noch was danach');
   });
   
   it('english content gets set when language gets set to english', function() {
      givenTemplatePublication(shop.Language.DE, 'irgendwas davor und noch was danach');
      givenTemplatePublication(shop.Language.EN, 'some english content');
      givenDefaultOverlay();
      givenPublishedLanguageIs(shop.Language.EN);
      expect(capturedHtmlContent).to.be.eql('some english content');
   });
});  