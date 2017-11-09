/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/PictureOverlay.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var DEFAULT_SELECTOR = 'selectorA';
var DEFAULT_LANGUAGES = [shop.Language.DE, shop.Language.EN];
var DEFAULT_TEMPLATE_NAME = 'pictureOverlay';
var PLACEHOLDER = '<!--image-->';

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

var givenDefaultPictureOverlay = function givenDefaultPictureOverlay() {
   instance = new shop.ui.PictureOverlay(getDefaultConfig(), setHtmlContent, mockedBus);
};

var givenTemplatePublication = function givenTemplatePublication(language, data) {
   mockedBus.publish('/htmlContent/' + language + '/' + DEFAULT_TEMPLATE_NAME, data);
};

var givenPublishedLanguageIs = function givenPublishedLanguageIs(language) {
   instance.onLanguageChanged(language);
};

var givenShownPicturePublicationIs = function givenShownPicturePublicationIs(relativePicturePath) {
   mockedBus.publish(shop.topics.SHOWN_PICTURE, relativePicturePath);
};

var whenShownPicturePublicationIs = function whenShownPicturePublicationIs(relativePicturePath) {
   givenShownPicturePublicationIs(relativePicturePath);
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedHtmlContent = undefined;
   capturedVisiblityChanges = [];
   capturedSelector = undefined;
   initializeInvocationCount = 0;
   shop.ui.PictureOverlay.prototype = new MockedAbstractHideableLanguageDependentComponent();
};

describe('PictureOverlay', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a PictureOverlay is an instance/object', function() {
      
      givenDefaultPictureOverlay();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('a instance of a PictureOverlay calls initialize() of its prototype', function() {
      
      givenDefaultPictureOverlay();
      expect(initializeInvocationCount).to.be.eql(1);
   });
   
   it('german content gets set when picture publication gets updated and language is german', function() {
      
      givenTemplatePublication(shop.Language.DE, 'irgendwas davor' + PLACEHOLDER + 'und noch was danach');
      givenTemplatePublication(shop.Language.EN, 'a prefix' + PLACEHOLDER + 'a suffix');
      givenDefaultPictureOverlay();
      givenPublishedLanguageIs(shop.Language.DE);
      whenShownPicturePublicationIs('/images/plants/flower.jpg');
      expect(capturedHtmlContent).to.be.eql('irgendwas davor<img src="/images/plants/flower.jpg">und noch was danach');
   });
   
   it('english content gets set when picture publication gets updated and language is english', function() {
      
      givenTemplatePublication(shop.Language.DE, 'irgendwas davor' + PLACEHOLDER + 'und noch was danach');
      givenTemplatePublication(shop.Language.EN, 'a prefix' + PLACEHOLDER + 'a suffix');
      givenDefaultPictureOverlay();
      givenPublishedLanguageIs(shop.Language.EN);
      whenShownPicturePublicationIs('/images/plants/flower.jpg');
      expect(capturedHtmlContent).to.be.eql('a prefix<img src="/images/plants/flower.jpg">a suffix');
   });
   
   it('the overlay gets set visible when an image was published', function() {
      
      givenTemplatePublication(shop.Language.DE, 'irgendwas davor' + PLACEHOLDER + 'und noch was danach');
      givenTemplatePublication(shop.Language.EN, 'a prefix' + PLACEHOLDER + 'a suffix');
      givenDefaultPictureOverlay();
      givenPublishedLanguageIs(shop.Language.DE);
      whenShownPicturePublicationIs('/images/plants/flower.jpg');
      expect(capturedVisiblityChanges.length).to.be.eql(1);
      expect(capturedVisiblityChanges[0]).to.be.eql('show');
   });
   
   it('the overlay gets set hidden when undefined was published as image', function() {
      
      givenTemplatePublication(shop.Language.DE, 'irgendwas davor' + PLACEHOLDER + 'und noch was danach');
      givenTemplatePublication(shop.Language.EN, 'a prefix' + PLACEHOLDER + 'a suffix');
      givenDefaultPictureOverlay();
      givenPublishedLanguageIs(shop.Language.DE);
      givenShownPicturePublicationIs('/images/plants/flower.jpg');
      whenShownPicturePublicationIs(undefined);
      expect(capturedVisiblityChanges.length).to.be.eql(2);
      expect(capturedVisiblityChanges[1]).to.be.eql('hide');
   });

});  