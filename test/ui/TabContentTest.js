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
var contentChangedListenerInvocationCount;
var capturedHtmlContent;
var capturedConfigId;
var capturedConfig;
var capturedNewProductLabelText;
var productTable;
var mockedBus;

var mockedProductTableGenerator = {
   generateTable: function generateTable(configId, config, newProductLabelText) {
      capturedConfigId = configId;
      capturedConfig = config;
      capturedNewProductLabelText = newProductLabelText;
      return productTable;
   }
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
};

var givenPublishedLanguageIsGerman = function givenPublishedLanguageIsGerman() {
   publishCurrentLanguage(shop.Language.DE);
};

var givenPublishedLanguageIsEnglish = function givenPublishedLanguageIsEnglish() {
   publishCurrentLanguage(shop.Language.EN);
};

var createTabContentWith = function createTabContentWith(configChanges) {
   var config = getDefaultConfig();
   Object.keys(configChanges).forEach(function(key) { config[key] = configChanges[key]; });
   instance = new shop.ui.TabContent(config, mockedProductTableGenerator, mockedBus);
};

var givenDefaultTabContent = function givenDefaultTabContent() {
   createTabContentWith({});
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

var givenRegisteredTabContentChangedListener = function givenRegisteredTabContentChangedListener() {
   instance.addContentChangedListener(function() { contentChangedListenerInvocationCount++; });
};

var givenNewProductLabelTextPublished = function givenNewProductLabelTextPublished(text) {
   mockedBus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'productsTable.newProductLabelText', text);   
};

var whenActiveLanguageChanges = function whenActiveLanguageChanges() {
   mockedBus.publish(shop.topics.CURRENT_LANGUAGE, 'AT');
};

var whenConfigPublished = function whenConfigPublished() {
   givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{}');
};

var whenTemplatePublished = function whenTemplatePublished() {
   givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, 'notRelevant');
};

var whenNewProductLabelTextPublished = function whenNewProductLabelTextPublished() {
   givenNewProductLabelTextPublished('notRelevant');   
};

var whenGetHtmlContentCalled = function whenGetHtmlContentCalled(done) {
   instance.getHtmlContent().then(function(content) {
      capturedHtmlContent.push(content);
      done();
   });
};

var lastCapturedHtmlContent = function lastCapturedHtmlContent() {
   return capturedHtmlContent[capturedHtmlContent.length - 1];
};

var expectContentContainsErrorMessage = function expectContentContainsErrorMessage() {
   var error = '';
   
   var errorStart = lastCapturedHtmlContent().indexOf('<p class="errorMessage">');
   if (errorStart > -1) {
      errorStart += '<p class="errorMessage">'.length;
      var errorEnd = lastCapturedHtmlContent().indexOf('</p>', errorStart + '<p class="errorMessage">'.length );
      if (errorEnd > -1) {
         error = lastCapturedHtmlContent().substring(errorStart, errorEnd);
      }
   }
   expect(error.length).to.be.greaterThan(0);
};

var expectContentContainsTemplateWithErrorMessage = function expectContentContainsTemplateWithErrorMessage() {
   
   var prefixStart = lastCapturedHtmlContent().indexOf(templatePrefix);
   expect(prefixStart).to.be.greaterThan(-1);
   var errorStart = prefixStart + templatePrefix.length;
   var suffixStart = lastCapturedHtmlContent().indexOf(suffix, errorStart);
   expect(suffixStart).to.be.greaterThan(-1);
   var error = lastCapturedHtmlContent().substring(errorStart, suffixStart);
   expect(error.indexOf('<p class="errorMessage">')).to.be.eql(0);
   expect(error.indexOf('</p>')).to.be.eql(error.length - '</p>'.length);
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   productTable = undefined;
   contentChangedListenerInvocationCount = 0;
   capturedHtmlContent = [];
   capturedConfigId = undefined;
   capturedConfig = undefined;
   capturedNewProductLabelText = undefined;
   templatePrefix = '<h1>Hello World</h1>';
   placeholder = '<!--DYNAMIC_CONTENT-->';
   suffix = '<p>after configured content</p>';
   shop.Context.log = function log(message) {};
};

describe('TabContent', function() {
	
   beforeEach(setup);
   
   it('creating an instance is an instance/object', function() {
      givenDefaultTabContent();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('registered TabContentChangedListener gets notified when language changed', function() {
      givenDefaultTabContent();
      givenRegisteredTabContentChangedListener();
      whenActiveLanguageChanges();
      expect(contentChangedListenerInvocationCount).to.be.eql(1);
   });
   
   it('registered TabContentChangedListener gets notified when config received', function() {
      givenDefaultTabContent();
      givenRegisteredTabContentChangedListener();
      whenConfigPublished();
      expect(contentChangedListenerInvocationCount).to.be.eql(1);
   });
   
   it('registered TabContentChangedListener gets notified when template received', function() {
      givenDefaultTabContent();
      givenRegisteredTabContentChangedListener();
      whenTemplatePublished();
      expect(contentChangedListenerInvocationCount).to.be.eql(1);
   });
   
   it('registered TabContentChangedListener gets notified when new product label text received', function() {
      givenDefaultTabContent();
      givenRegisteredTabContentChangedListener();
      whenNewProductLabelTextPublished();
      expect(contentChangedListenerInvocationCount).to.be.eql(1);
   });
   
   it('generateTable() of table generator gets the language dependent config key_A', function(done) {
      var table = '<table></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication('tabConfigA', shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + placeholder + suffix);
      createTabContentWith({configName: 'tabConfigA'});
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expect(capturedConfigId).to.be.eql('tabConfigA_de');
   });
   
   it('generateTable() of table generator gets the language dependent config key_B', function(done) {
      var table = '<table></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication('tabConfigA', shop.Language.EN, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.EN, templatePrefix + placeholder + suffix);
      createTabContentWith({configName: 'tabConfigA'});
      givenPublishedLanguageIsEnglish();
      whenGetHtmlContentCalled(done);
      expect(capturedConfigId).to.be.eql('tabConfigA_en');
   });
   
   it('generateTable() of table generator gets the current data_DE', function(done) {
      var table = '<table></table>';
      var configDE = {products: [{name: 'Aerangis ellisii', price: 10}, {name: 'Cattleya walkeriana', price: 8}]};
      var configEN = {products: [{name: 'Aerangis ellisii_en', price: 10}, {name: 'Cattleya walkeriana_en', price: 8}]};
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, JSON.stringify(configDE));
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, JSON.stringify(configEN));
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + placeholder + suffix);
      givenDefaultTabContent();
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expect(capturedConfig).to.be.eql(configDE);
   });
   
   it('generateTable() of table generator gets the current data_EN', function(done) {
      var table = '<table></table>';
      var configDE = {products: [{name: 'Aerangis ellisii', price: 10}, {name: 'Cattleya walkeriana', price: 8}]};
      var configEN = {products: [{name: 'Aerangis ellisii_en', price: 10}, {name: 'Cattleya walkeriana_en', price: 8}]};
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, JSON.stringify(configDE));
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, JSON.stringify(configEN));
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + placeholder + suffix);
      givenDefaultTabContent();
      givenPublishedLanguageIsEnglish();
      whenGetHtmlContentCalled(done);
      expect(capturedConfig).to.be.eql(configEN);
   });
      
   it('generateTable() of table generator gets the new product label text_A', function(done) {
      var table = '<table></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + placeholder + suffix);
      givenNewProductLabelTextPublished('totalNew');
      givenDefaultTabContent();
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expect(capturedNewProductLabelText).to.be.eql('totalNew');
   });
   
   it('generateTable() of table generator gets the new product label text_B', function(done) {
      var table = '<table></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + placeholder + suffix);
      givenNewProductLabelTextPublished('neu');
      givenDefaultTabContent();
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expect(capturedNewProductLabelText).to.be.eql('neu');
   });

   it('getHtmlContent() provides the HTML content with the configured plants', function(done) {
      var table = '<table></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + placeholder + suffix);
      givenDefaultTabContent();
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expect(lastCapturedHtmlContent()).to.be.eql(templatePrefix + table + suffix);
   });
   
   it('getHtmlContent() provides the HTML content with the configured plants when contentTemplateName is undefined', function(done) {
      var table = '<table id="bla"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, 'somePrefix' + placeholder + 'someSuffix');
      createTabContentWith({contentTemplateName: undefined});
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expect(lastCapturedHtmlContent()).to.be.eql(table);
   });
   
   it('getHtmlContent() provides an error when the config is not available yet', function(done) {
      givenConfigPublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, '<h1>Hello World</h1><!--DYNAMIC_CONTENT--><p>after configured content</p>');
      givenDefaultTabContent();
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expectContentContainsTemplateWithErrorMessage();
   });
   
   it('getHtmlContent() provides an error when the template is not available yet', function(done) {
      var table = '<table id="anyTable"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenDefaultTabContent();
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expectContentContainsErrorMessage();
   });
   
   it('getHtmlContent() provides an error when the template cannot be loaded', function(done) {
      var table = '<table id="anyTable"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, new Error('failed to load ' + DEFAULT_TEMPLATE_NAME));
      givenDefaultTabContent();
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expectContentContainsErrorMessage();
   });
   
   it('getHtmlContent() provides an error when the template does not contain a placeholder', function(done) {
      var table = '<table id="anyTable"></table>';
      givenTheProductTableGeneratorReturns(table);
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + suffix);
      givenDefaultTabContent();
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expectContentContainsErrorMessage();
   });
   
   it('getHtmlContent() provides an error when the config contains an error and template is undefined', function(done) {
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, new Error('error in configuration ' + DEFAULT_CONFIG_NAME));
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE,'a' + placeholder + 'b');
      createTabContentWith({contentTemplateName: undefined});
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expectContentContainsErrorMessage();
   }); 
   
   it('getHtmlContent() provides an error when the config is not available yet and template is undefined', function(done) {
      givenConfigPublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, 'a' + placeholder + 'b');
      createTabContentWith({contentTemplateName: undefined});
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expectContentContainsErrorMessage();
   });   
   
   it('getHtmlContent() provides the template without changes when the config is undefined', function(done) {
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.EN,'<p>hello world' + placeholder + '</p>');
      createTabContentWith({configName: undefined});
      givenPublishedLanguageIsEnglish();
      whenGetHtmlContentCalled(done);
      expect(lastCapturedHtmlContent()).to.be.eql('<p>hello world' + placeholder + '</p>');
   });
   
   it('getHtmlContent() provides the template, that does not contain the placeholder, without changes when the config is undefined', function(done) {
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE,'<p>hello world</p>');
      createTabContentWith({configName: undefined});
      givenPublishedLanguageIsGerman();
      whenGetHtmlContentCalled(done);
      expect(lastCapturedHtmlContent()).to.be.eql('<p>hello world</p>');
   });
});  