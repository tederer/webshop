/* global global, shop, common, Map, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/Tab.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

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
var publications;
var capturedSubscriptionCallbacks;
var capturedVisiblityChanges;

var MockedAbstractTab = function MockedAbstractTab() {
   this.initialize = function initialize() {};
   
   this.show = function show() {
      capturedVisiblityChanges[capturedVisiblityChanges.length] = 'show';
   };
   
   this.hide = function hide() {
      capturedVisiblityChanges[capturedVisiblityChanges.length] = 'hide';
   };
};

var mockedBus = {
   subscribeToPublication: function subscribeToPublication(topic, callback) {
      capturedSubscriptionCallbacks[topic] = callback;
      callback(publications[topic]);
   },
   
   publish: function publish(topic, data) {
      var callback =  capturedSubscriptionCallbacks[topic];
      if (callback !== undefined) {
         callback(data);
      }
   }
};

var setHtmlContent = function setHtmlContent(selector, content) {
   capturedHtmlContent = content;
};

var givenPublishedLanguageIsGerman = function givenPublishedLanguageIsGerman() {
   instance.onLanguageChanged(shop.Language.DE);
};

var givenPublishedLanguageIsEnglish = function givenPublishedLanguageIsEnglish() {
   instance.onLanguageChanged(shop.Language.EN);
};

var givenTabWithMockedPrototype = function givenTabWithMockedPrototype(tabId) {
   instance = new shop.ui.Tab(tabId, DEFAULT_SELECTOR, DEFAULT_CONFIG_NAME, DEFAULT_TEMPLATE_NAME, DEFAULT_LANGUAGES, setHtmlContent, mockedBus);
};

var givenDefaultTab = function givenDefaultTab() {
   instance = new shop.ui.Tab(DEFAULT_TAB_ID, DEFAULT_SELECTOR, DEFAULT_CONFIG_NAME, DEFAULT_TEMPLATE_NAME, DEFAULT_LANGUAGES, setHtmlContent, mockedBus);
};

var givenTabWithUndefinedContentTemplateTopic = function givenTabWithUndefinedContentTemplateTopic() {
   instance = new shop.ui.Tab(DEFAULT_TAB_ID, DEFAULT_SELECTOR, DEFAULT_CONFIG_NAME, undefined, DEFAULT_LANGUAGES, setHtmlContent, mockedBus);
};

var givenTabWithUndefinedConfigTopic = function givenTabWithUndefinedConfigTopic() {
   instance = new shop.ui.Tab(DEFAULT_TAB_ID, DEFAULT_SELECTOR, undefined, DEFAULT_TEMPLATE_NAME, DEFAULT_LANGUAGES, setHtmlContent, mockedBus);
};

var givenConfigPublication = function givenConfigPublication(name, language, data) {
   var dataToUse = data;
   
   if (data !== undefined && !(data instanceof Error)) {
      dataToUse = JSON.parse(data);
   }
   
   publications['/jsonContent/' + language + '/' + name] = dataToUse;
};

var givenTemplatePublication = function givenConfigPublication(name, language, data) {
   publications['/htmlContent/' + language + '/' + name] = data;
};

var whenConfigPublicationGetsUpdated = function whenConfigPublicationGetsUpdated(name, language, data) {
   var callback = capturedSubscriptionCallbacks['/jsonContent/' + language + '/' + name];
   if (callback !== undefined) {
      callback(JSON.parse(data));
   }
};

var whenTemplatePublicationGetsUpdated = function whenTemplatePublicationGetsUpdated(name, language, data) {
   var callback = capturedSubscriptionCallbacks['/htmlContent/' + language + '/' + name];
   if (callback !== undefined) {
      callback(data);
   }
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
   publications = {};
   capturedSubscriptionCallbacks = {};
   capturedHtmlContent = undefined;
   templatePrefix = '<h1>Hello World</h1>';
   placeholder = '<!--DYNAMIC_CONTENT-->';
   suffix = '<p>after configured content</p>';
   shop.Context.log = function log(message) {};
   capturedVisiblityChanges = [];
   shop.ui.Tab.prototype = new MockedAbstractTab();
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
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, templatePrefix + placeholder + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expect(capturedHtmlContent).to.be.eql('<h1>Hello World</h1><table><tr><td>Aerangis ellisii</td><td>10 EUR</td></tr><tr><td>Cattleya walkeriana</td><td>8 EUR</td></tr></table><p>after configured content</p>');
   });
   
   it('the Tab publishes a table with the configured plants when contentTemplateName is undefined', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, 'somePrefix' + placeholder + 'someSuffix');
      givenTabWithUndefinedContentTemplateTopic();
      givenPublishedLanguageIsGerman();
      expect(capturedHtmlContent).to.be.eql('<table><tr><td>Aerangis ellisii</td><td>10 EUR</td></tr><tr><td>Cattleya walkeriana</td><td>8 EUR</td></tr></table>');
   });
   
   it('the Tab publishes an error when the config is not available yet', function() {
      
      givenConfigPublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, '<h1>Hello World</h1><!--DYNAMIC_CONTENT--><p>after configured content</p>');
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainesTemplateWithErrorMessage();
   });
   
   it('the Tab publishes an error when the template is not available yet', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, undefined);
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainesErrorMessage();
   });
   
   it('the Tab publishes an error when the template cannot be loaded', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.DE, '{"products": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.DE, new Error('failed to load ' + DEFAULT_TEMPLATE_NAME));
      givenDefaultTab();
      givenPublishedLanguageIsGerman();
      expectContentContainesErrorMessage();
   });
   
   it('the Tab publishes an error when the template does not contain a placeholder', function() {
      
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
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.EN, templatePrefix + placeholder + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsEnglish();
      whenConfigPublicationGetsUpdated(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Sophronitis coccinea", "price":  15}]}');
      expect(capturedHtmlContent).to.be.eql('<h1>Hello World</h1><table><tr><td>Sophronitis coccinea</td><td>15 EUR</td></tr></table><p>after configured content</p>');
   });
   
   it('the Tab updates the content when a new template content is received', function() {
      
      givenConfigPublication(DEFAULT_CONFIG_NAME, shop.Language.EN, '{"products": [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplatePublication(DEFAULT_TEMPLATE_NAME, shop.Language.EN, templatePrefix + placeholder + suffix);
      givenDefaultTab();
      givenPublishedLanguageIsEnglish();
      whenTemplatePublicationGetsUpdated(DEFAULT_TEMPLATE_NAME, shop.Language.EN, '<p>new prefix</p>' + placeholder + '<p>new suffix</p>');
      expect(capturedHtmlContent).to.be.eql('<p>new prefix</p><table><tr><td>Aerangis ellisii</td><td>10 EUR</td></tr></table><p>new suffix</p>');
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
});  