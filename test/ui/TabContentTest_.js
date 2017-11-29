/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/TabContent.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

assertNamespace('shop.Context');

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var DEFAULT_TAB_ID            = 'defaultTabId';
var DEFAULT_SELECTOR          = 'defaultSelector';
var DEFAULT_CONFIG_NAME       = 'myConfig';
var DEFAULT_TEMPLATE_NAME     = 'myTemplate';
var DEFAULT_LANGUAGES         = [shop.Language.DE, shop.Language.EN];
   
var instance;
var templatePrefix;
var placeholder;
var suffix;

var capturedHtmlContent;
var productTable;
var mockedBus;

var MockedAbstractHideableLanguageDependentComponent = function MockedAbstractHideableLanguageDependentComponent() {
   this.initialize = function initialize() {};
   
   this.show = function show() {
   };
   
   this.hide = function hide() {
   };
   
   this.simulateLanguageChangeTo = function simulateLanguageChangeTo(language) {
      this.onLanguageChanged(language);
   };
};

var mockedProductTableGenerator = {
   generateTable: function generateTable(configId, config) {
      return productTable;
   }
};

var setHtmlContent = function setHtmlContent(selector, content) {
   capturedHtmlContent[selector] = content;
};

var getDefaultConfig = function getDefaultConfig() {
   return {
      id:                  DEFAULT_TAB_ID,
      selector:            DEFAULT_SELECTOR,
      configName:          DEFAULT_CONFIG_NAME,
      contentTemplateName: DEFAULT_TEMPLATE_NAME,
      languages:           DEFAULT_LANGUAGES
   };
};

var publishCurrentLanguage = function publishCurrentLanguage(language) {
   mockedBus.publish(shop.topics.CURRENT_LANGUAGE, language);
   instance.simulateLanguageChangeTo(language);
};

var givenPublishedLanguageIsGerman = function givenPublishedLanguageIsGerman() {
   publishCurrentLanguage(shop.Language.DE);
};

var givenPublishedLanguageIsEnglish = function givenPublishedLanguageIsEnglish() {
   publishCurrentLanguage(shop.Language.EN);
};

var givenTabWithMockedPrototype = function givenTabWithMockedPrototype(tabId) {
   var config = getDefaultConfig();
   config.tabId = tabId;
   instance = new shop.ui.TabContent(config, setHtmlContent, mockedProductTableGenerator, mockedBus);
};

var givenDefaultTab = function givenDefaultTab() {
   instance = new shop.ui.TabContent(getDefaultConfig(), setHtmlContent, mockedProductTableGenerator, mockedBus);
};

var givenTabWithUndefinedContentTemplateTopic = function givenTabWithUndefinedContentTemplateTopic() {
   var config = getDefaultConfig();
   config.contentTemplateName = undefined;
   instance = new shop.ui.TabContent(config, setHtmlContent, mockedProductTableGenerator, mockedBus);
};

var givenTabWithUndefinedConfigTopic = function givenTabWithUndefinedConfigTopic() {
   var config = getDefaultConfig();
   config.configName = undefined;
   instance = new shop.ui.TabContent(config, setHtmlContent, mockedProductTableGenerator, mockedBus);
};

var givenTabWithId = function givenTabWithId(id) {
   var config = getDefaultConfig();
   config.id = id;
   instance = new shop.ui.TabContent(config, setHtmlContent, mockedProductTableGenerator, mockedBus);
};

var givenConfigPublication = function givenConfigPublication(name, language, data) {
   var dataToUse = data;
   
   if (data !== undefined && !(data instanceof Error)) {
      dataToUse = JSON.parse(data);
   }
   
   mockedBus.publish('/jsonContent/' + language + '/' + name, dataToUse);
};

var givenTemplatePublication = function givenTemplatePublication(name, language, data) {
   mockedBus.publish('/htmlContent/' + language + '/' + name, data);
};

var givenTheProductTableGeneratorReturns = function givenTheProductTableGeneratorReturns(text) {
   productTable = text;
};

var givenRegisteredTableChangeListener = function givenRegisteredTableChangeListener(callback) {
   instance.onTabContentChanged(callback);
};
   
var whenConfigPublicationGetsUpdated = function whenConfigPublicationGetsUpdated(name, language, data) {
   mockedBus.publish('/jsonContent/' + language + '/' + name, JSON.parse(data));
};

var whenTemplatePublicationGetsUpdated = function whenTemplatePublicationGetsUpdated(name, language, data) {
   mockedBus.publish('/htmlContent/' + language + '/' + name, data);
};

var whenPublishedVisibleTabIs = function whenPublishedVisibleTabIs(tabId) {
   mockedBus.publish(shop.topics.VISIBLE_TAB, tabId);
};

var whenHtmlContentOfAChildElementGetsSet = function whenHtmlContentOfAChildElementGetsSet(childElementId, htmlContent) {
   instance.setHtmlContentOfChildElement(childElementId, htmlContent);
};

var expectContentContainsErrorMessage = function expectContentContainsErrorMessage() {
   var error = '';
   
   var errorStart = capturedHtmlContent[DEFAULT_SELECTOR].indexOf('<p class="errorMessage">');
   if (errorStart > -1) {
      errorStart += '<p class="errorMessage">'.length;
      var errorEnd = capturedHtmlContent[DEFAULT_SELECTOR].indexOf('</p>', errorStart + '<p class="errorMessage">'.length );
      if (errorEnd > -1) {
         error = capturedHtmlContent[DEFAULT_SELECTOR].substring(errorStart, errorEnd);
      }
   }
   expect(error.length).to.be.greaterThan(0);
};

var expectContentContainsTemplateWithErrorMessage = function expectContentContainsTemplateWithErrorMessage() {
   
   var prefixStart = capturedHtmlContent[DEFAULT_SELECTOR].indexOf(templatePrefix);
   expect(prefixStart).to.be.greaterThan(-1);
   var errorStart = prefixStart + templatePrefix.length;
   var suffixStart = capturedHtmlContent[DEFAULT_SELECTOR].indexOf(suffix, errorStart);
   expect(suffixStart).to.be.greaterThan(-1);
   var error = capturedHtmlContent[DEFAULT_SELECTOR].substring(errorStart, suffixStart);
   expect(error.indexOf('<p class="errorMessage">')).to.be.eql(0);
   expect(error.indexOf('</p>')).to.be.eql(error.length - '</p>'.length);
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedHtmlContent = {};
   productTable = undefined;
   templatePrefix = '<h1>Hello World</h1>';
   placeholder = '<!--DYNAMIC_CONTENT-->';
   suffix = '<p>after configured content</p>';
   shop.Context.log = function log(message) {};
   shop.ui.Tab.prototype = new MockedAbstractHideableLanguageDependentComponent();
};

describe('TabContent', function() {
	
   beforeEach(setup);
   
   it('creating an instance is an instance/object', function() {
      
      givenDefaultTab();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('getId() returns the ID of the tab A', function() {
      
      givenDefaultTab();
      expect(instance.getId()).to.be.eql(DEFAULT_TAB_ID);
   });
   
   it('getId() returns the ID of the tab B', function() {
      
      givenTabWithId('myIdentifier');
      expect(instance.getId()).to.be.eql('myIdentifier');
   });
   
   it('the Tab does not publish something when no language publication is available', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenDefaultTab();
      expect(capturedHtmlContent[DEFAULT_SELECTOR]).to.be.eql(undefined);
   });
   
   it('the Tab publishes a table with the configured plants', function() {
      
      var table = '<table></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + placeholder + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expect(capturedHtmlContent[DEFAULT_SELECTOR]).to.be.eql(templatePrefix + table + suffix);
   });
   
   it('the Tab publishes a table with the configured plants when contentTemplateName is undefined', function() {
      
      var table = '<table id="bla"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, 'somePrefix' + placeholder + 'someSuffix');
      givenTabWithUndefinedContentTemplateTopic();
      givenPublishedLanguageIsGerman();
      expect(capturedHtmlContent[DEFAULT_SELECTOR]).to.be.eql(table);
   });
   
   it('the Tab publishes an error when the config is not available yet', function() {
      
      givenConfigPublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, '<h1>Hello World</h1><!--DYNAMIC_CONTENT--><p>after configured content</p>');
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainsTemplateWithErrorMessage();
   });
   
   it('the Tab publishes an error when the template is not available yet', function() {
      
      var table = '<table id="anyTable"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainsErrorMessage();
   });
   
   it('the Tab publishes an error when the template cannot be loaded', function() {
      
      var table = '<table id="anyTable"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, new Error('failed to load ' + DEFAULT_TEMPLATE_NAME));
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainsErrorMessage();
   });
   
   it('the Tab publishes an error when the template does not contain a placeholder', function() {
      
      var table = '<table id="anyTable"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainsErrorMessage();
   });
   
   it('the Tab publishes an error when the config contains an error and template is undefined', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, new Error('error in configuration ' + DEFAULT_CONFIG_NAME));
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE,'a' + placeholder + 'b');
      givenTabWithUndefinedContentTemplateTopic();
      givenPublishedLanguageIsGerman();
      expectContentContainsErrorMessage();
   }); 
   
   it('the Tab publishes an error when the config is not available yet and template is undefined', function() {
      
      givenConfigPublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, 'a' + placeholder + 'b');
      givenTabWithUndefinedContentTemplateTopic();
      givenPublishedLanguageIsGerman();
      expectContentContainsErrorMessage();
   });   
   
   it('the Tab publishes the template without changes when the config is undefined', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.EN,'<p>hello world' + placeholder + '</p>');
      givenTabWithUndefinedConfigTopic();
      givenPublishedLanguageIsEnglish();
      expect(capturedHtmlContent[DEFAULT_SELECTOR]).to.be.eql('<p>hello world' + placeholder + '</p>');
   });
   
   it('the Tab publishes the template, that does not contain the placeholder, without changes when the config is undefined', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE,'<p>hello world</p>');
      givenTabWithUndefinedConfigTopic();
      givenPublishedLanguageIsGerman();
      expect(capturedHtmlContent[DEFAULT_SELECTOR]).to.be.eql('<p>hello world</p>');
   });
   
   it('the Tab updates the content when a new config is received', function() {
      
      var table = '<table id="id1"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.EN, templatePrefix + placeholder + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsEnglish();
      whenConfigPublicationGetsUpdated(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Sophronitis coccinea", "price":  15}]}');
      expect(capturedHtmlContent[DEFAULT_SELECTOR]).to.be.eql(templatePrefix + table + suffix);
   });
   
   it('the Tab updates the content when a new template content is received', function() {
      
      var table = '<table id="id1"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.EN, templatePrefix + placeholder + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsEnglish();
      whenTemplatePublicationGetsUpdated(DEFAULT_TEMPLATE_NAME, shop.Language.EN, '<p>new prefix</p>' + placeholder + '<p>new suffix</p>');
      expect(capturedHtmlContent[DEFAULT_SELECTOR]).to.be.eql('<p>new prefix</p>' + table + '<p>new suffix</p>');
   });
   
   
   it('the Tab notifies the registered TabContentChangedCallbacks when tab content gets set to an error message', function() {

      var callbackAInvocations = 0;
      var callbackA = function callbackA() { callbackAInvocations++; };
      givenTabWithUndefinedConfigTopic();
      givenRegisteredTableChangeListener(callbackA);
      givenPublishedLanguageIsEnglish();
      expect(callbackAInvocations).to.be.eql(1);
   });
   
   it('the Tab notifies the registered TabContentChangedCallbacks when the table content changes', function() {

      var callbackAInvocations = 0;
      var callbackBInvocations = 0;
      var capturedSelectorA;
      var capturedSelectorB;
      var callbackA = function callbackA(selector) { capturedSelectorA = selector; callbackAInvocations++; };
      var callbackB = function callbackB(selector) { capturedSelectorB = selector; callbackBInvocations++; };
      
      givenTabWithUndefinedConfigTopic();
      givenRegisteredTableChangeListener(callbackA);
      givenRegisteredTableChangeListener(callbackB);
      givenPublishedLanguageIsEnglish();
      whenTemplatePublicationGetsUpdated(DEFAULT_TEMPLATE_NAME, shop.Language.EN, 'some webpage content');
      expect(callbackAInvocations).to.be.eql(2);
      expect(callbackBInvocations).to.be.eql(2);
      expect(capturedSelectorA).to.be.eql(DEFAULT_SELECTOR);
      expect(capturedSelectorB).to.be.eql(DEFAULT_SELECTOR);
   });
   
   it('setHtmlContentOfChildElement sets the content of a child element A', function() {
      givenDefaultTab();
      whenHtmlContentOfAChildElementGetsSet('childId', '<p>child content</p>');
      expect(capturedHtmlContent[DEFAULT_SELECTOR + ' #childId']).to.be.eql('<p>child content</p>');
   });
   
   it('setHtmlContentOfChildElement sets the content of a child element B', function() {
      givenDefaultTab();
      whenHtmlContentOfAChildElementGetsSet('anotherChildId', '<h1>child content for testing</h1>');
      expect(capturedHtmlContent[DEFAULT_SELECTOR + ' #anotherChildId']).to.be.eql('<h1>child content for testing</h1>');
   });
   
      
   it('the Tab notifies the registered TabContentChangedCallbacks when setHtmlContentOfChildElement called', function() {
      var callbackAInvocations = 0;
      var callbackA = function callbackA() { callbackAInvocations++; };
      givenDefaultTab();
      givenRegisteredTableChangeListener(callbackA);
      whenHtmlContentOfAChildElementGetsSet('childId', '<p>child content</p>');
      expect(callbackAInvocations).to.be.eql(1);
   });
});  