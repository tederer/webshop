/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/Tab.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

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
var capturedVisiblityChanges;
var productTable;
var mockedBus;

var MockedAbstractHideableLanguageDependentComponent = function MockedAbstractHideableLanguageDependentComponent() {
   this.initialize = function initialize() {};
   
   this.show = function show() {
      capturedVisiblityChanges[capturedVisiblityChanges.length] = 'show';
   };
   
   this.hide = function hide() {
      capturedVisiblityChanges[capturedVisiblityChanges.length] = 'hide';
   };
};

var mockedProductTableGenerator = {
   generateTable: function generateTable(config) {
      return productTable;
   }
};

var setHtmlContent = function setHtmlContent(selector, content) {
   capturedHtmlContent = content;
};

var getDefaultConfig = function getDefaultConfig() {
   return {
      tabId: DEFAULT_TAB_ID,
      selector: DEFAULT_SELECTOR,
      configName: DEFAULT_CONFIG_NAME,
      contentTemplateName: DEFAULT_TEMPLATE_NAME,
      languages: DEFAULT_LANGUAGES
   };
};

var givenPublishedLanguageIsGerman = function givenPublishedLanguageIsGerman() {
   instance.onLanguageChanged(shop.Language.DE);
};

var givenPublishedLanguageIsEnglish = function givenPublishedLanguageIsEnglish() {
   instance.onLanguageChanged(shop.Language.EN);
};

var givenTabWithMockedPrototype = function givenTabWithMockedPrototype(tabId) {
   var config = getDefaultConfig();
   config.tabId = tabId;
   instance = new shop.ui.Tab(config, setHtmlContent, mockedProductTableGenerator, mockedBus);
};

var givenDefaultTab = function givenDefaultTab() {
   instance = new shop.ui.Tab(getDefaultConfig(), setHtmlContent, mockedProductTableGenerator, mockedBus);
};

var givenTabWithUndefinedContentTemplateTopic = function givenTabWithUndefinedContentTemplateTopic() {
   var config = getDefaultConfig();
   config.contentTemplateName = undefined;
   instance = new shop.ui.Tab(config, setHtmlContent, mockedProductTableGenerator, mockedBus);
};

var givenTabWithUndefinedConfigTopic = function givenTabWithUndefinedConfigTopic() {
   var config = getDefaultConfig();
   config.configName = undefined;
   instance = new shop.ui.Tab(config, setHtmlContent, mockedProductTableGenerator, mockedBus);
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

var expectContentContainesErrorMessage = function expectContentContainesErrorMessage() {
   var error = '';
   
   var errorStart = capturedHtmlContent.indexOf('<p class="errorMessage">');
   if (errorStart > -1) {
      errorStart += '<p class="errorMessage">'.length;
      var errorEnd = capturedHtmlContent.indexOf('</p>', errorStart + '<p class="errorMessage">'.length );
      if (errorEnd > -1) {
         error = capturedHtmlContent.substring(errorStart, errorEnd);
      }
   }
   expect(error.length).to.be.greaterThan(0);
};

var expectContentContainesTemplateWithErrorMessage = function expectContentContainesTemplateWithErrorMessage() {
   
   var prefixStart = capturedHtmlContent.indexOf(templatePrefix);
   expect(prefixStart).to.be.greaterThan(-1);
   var errorStart = prefixStart + templatePrefix.length;
   var suffixStart = capturedHtmlContent.indexOf(suffix, errorStart);
   expect(suffixStart).to.be.greaterThan(-1);
   var error = capturedHtmlContent.substring(errorStart, suffixStart);
   expect(error.indexOf('<p class="errorMessage">')).to.be.eql(0);
   expect(error.indexOf('</p>')).to.be.eql(error.length - '</p>'.length);
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedHtmlContent = undefined;
   productTable = undefined;
   templatePrefix = '<h1>Hello World</h1>';
   placeholder = '<!--DYNAMIC_CONTENT-->';
   suffix = '<p>after configured content</p>';
   shop.Context.log = function log(message) {};
   capturedVisiblityChanges = [];
   shop.ui.Tab.prototype = new MockedAbstractHideableLanguageDependentComponent();
};

describe('Tab', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a Tab is an instance/object', function() {
      
      givenDefaultTab();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('the Tab does not publish something when no language publication is available', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenDefaultTab();
      expect(capturedHtmlContent).to.be.eql(undefined);
   });
   
   it('the Tab publishes a table with the configured plants', function() {
      
      var table = '<table></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + placeholder + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expect(capturedHtmlContent).to.be.eql(templatePrefix + table + suffix);
   });
   
   it('the Tab publishes a table with the configured plants when contentTemplateName is undefined', function() {
      
      var table = '<table id="bla"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, 'somePrefix' + placeholder + 'someSuffix');
      givenTabWithUndefinedContentTemplateTopic();
      givenPublishedLanguageIsGerman();
      expect(capturedHtmlContent).to.be.eql(table);
   });
   
   it('the Tab publishes an error when the config is not available yet', function() {
      
      givenConfigPublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, '<h1>Hello World</h1><!--DYNAMIC_CONTENT--><p>after configured content</p>');
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainesTemplateWithErrorMessage();
   });
   
   it('the Tab publishes an error when the template is not available yet', function() {
      
      var table = '<table id="anyTable"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainesErrorMessage();
   });
   
   it('the Tab publishes an error when the template cannot be loaded', function() {
      
      var table = '<table id="anyTable"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, new Error('failed to load ' + DEFAULT_TEMPLATE_NAME));
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainesErrorMessage();
   });
   
   it('the Tab publishes an error when the template does not contain a placeholder', function() {
      
      var table = '<table id="anyTable"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainesErrorMessage();
   });
   
   it('the Tab publishes an error when the config contains an error and template is undefined', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, new Error('error in configuration ' + DEFAULT_CONFIG_NAME));
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE,'a' + placeholder + 'b');
      givenTabWithUndefinedContentTemplateTopic();
      givenPublishedLanguageIsGerman();
      expectContentContainesErrorMessage();
   }); 
   
   it('the Tab publishes an error when the config is not available yet and template is undefined', function() {
      
      givenConfigPublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, 'a' + placeholder + 'b');
      givenTabWithUndefinedContentTemplateTopic();
      givenPublishedLanguageIsGerman();
      expectContentContainesErrorMessage();
   });   
   
   it('the Tab publishes the template without changes when the config is undefined', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.EN,'<p>hello world' + placeholder + '</p>');
      givenTabWithUndefinedConfigTopic();
      givenPublishedLanguageIsEnglish();
      expect(capturedHtmlContent).to.be.eql('<p>hello world' + placeholder + '</p>');
   });
   
   it('the Tab publishes the template, that does not contain the placeholder, without changes when the config is undefined', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE,'<p>hello world</p>');
      givenTabWithUndefinedConfigTopic();
      givenPublishedLanguageIsGerman();
      expect(capturedHtmlContent).to.be.eql('<p>hello world</p>');
   });
   
   it('the Tab updates the content when a new config is received', function() {
      
      var table = '<table id="id1"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.EN, templatePrefix + placeholder + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsEnglish();
      whenConfigPublicationGetsUpdated(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Sophronitis coccinea", "price":  15}]}');
      expect(capturedHtmlContent).to.be.eql(templatePrefix + table + suffix);
   });
   
   it('the Tab updates the content when a new template content is received', function() {
      
      var table = '<table id="id1"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.EN, templatePrefix + placeholder + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsEnglish();
      whenTemplatePublicationGetsUpdated(DEFAULT_TEMPLATE_NAME, shop.Language.EN, '<p>new prefix</p>' + placeholder + '<p>new suffix</p>');
      expect(capturedHtmlContent).to.be.eql('<p>new prefix</p>' + table + '<p>new suffix</p>');
   });
   
   it('the Tab gets shown when the published visible tab matches', function() {
      
      givenTabWithMockedPrototype('tabId-A');
      whenPublishedVisibleTabIs('tabId-A');
      expect(capturedVisiblityChanges.length).to.be.eql(1);
      expect(capturedVisiblityChanges[0]).to.be.eql('show');
   });
   
   it('the Tab gets hidden when the published visible tab does not matches', function() {
      
      givenTabWithMockedPrototype('tabId-A');
      whenPublishedVisibleTabIs('tabId-A');
      whenPublishedVisibleTabIs('tabId-B');
      expect(capturedVisiblityChanges.length).to.be.eql(2);
      expect(capturedVisiblityChanges[1]).to.be.eql('hide');
   });
   
   it('the Tab gets shown only once when the visible tab gets repeatedly published', function() {
      
      givenTabWithMockedPrototype('tabId-B');
      whenPublishedVisibleTabIs('tabId-B');
      whenPublishedVisibleTabIs('tabId-B');
      expect(capturedVisiblityChanges.length).to.be.eql(1);
   });
   
   it('the Tab gets hideen only once when the visible tab gets repeatedly published', function() {
      
      givenTabWithMockedPrototype('tabId-B');
      whenPublishedVisibleTabIs('tabId-B');
      whenPublishedVisibleTabIs('tabId-A');
      whenPublishedVisibleTabIs('tabId-A');
      expect(capturedVisiblityChanges.length).to.be.eql(2);
      expect(capturedVisiblityChanges[1]).to.be.eql('hide');
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
});  