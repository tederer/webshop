/* global global, shop, common, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/Tab.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Promise.js');

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
var DEFAULT_TABLE_GENERATOR   = 'defaultTableGenerator';

var instance;
var templatePrefix;
var placeholder;
var suffix;

var capturedHtmlContent;
var capturedTabContentChangeListeners;
var capturedTabContentConfig;
var mockedBus;
var htmlTabContent;
var getHtmlContentInvocationCount;
var tabContentChangedListenerInvocations;

var MockedAbstractHideableLanguageDependentComponent = function MockedAbstractHideableLanguageDependentComponent() {
   this.initialize = function initialize() {};
   
   this.show = function show() {
   };
   
   this.hide = function hide() {
   };
};

var mockedTabContentFactory = function mockedTabContentFactory(config) {
   capturedTabContentConfig.push(config);
   return {
      getHtmlContent: function getHtmlContent() {
         getHtmlContentInvocationCount++;
         return new common.Promise(function(fulfill, reject) { fulfill(htmlTabContent); });
      },
      
      addContentChangedListener: function addContentChangedListener(callback) {
         capturedTabContentChangeListeners.push(callback);
      }
   };
};

var mockedHtmlContentSetter = function mockedHtmlContentSetter(selector, content) {
   capturedHtmlContent[selector] = content;
};

var tabContentChangedListener = function tabContentChangedListener(selector, revision) {
   if (tabContentChangedListenerInvocations[selector] === undefined) {
      tabContentChangedListenerInvocations[selector] = [revision];
   } else {
      tabContentChangedListenerInvocations[selector].push(revision);
   }
};

var getDefaultConfig = function getDefaultConfig() {
   return {
      id:                  DEFAULT_TAB_ID,
      selector:            DEFAULT_SELECTOR,
      configName:          DEFAULT_CONFIG_NAME,
      contentTemplateName: DEFAULT_TEMPLATE_NAME,
      languages:           DEFAULT_LANGUAGES,
      tableGenerator:      DEFAULT_TABLE_GENERATOR
   };
};

var createInstance = function createInstance(config) {
   instance = new shop.ui.Tab(config, mockedTabContentFactory, mockedHtmlContentSetter);
};

var givenInstanceWith = function givenInstanceWith(configChanges) {
   var config = getDefaultConfig();
   Object.keys(configChanges).forEach(function(key) { config[key] = configChanges[key]; });
   createInstance(config);
};
   
var givenDefaultInstance = function givenDefaultInstance() {
   givenInstanceWith({});
};

var givenRegisteredTabContentChangedListener = function givenRegisteredTabContentChangedListener(callback) {
   instance.addTabContentChangedListener(callback);
};

var givenTabContentProvides = function givenTabContentProvides(htmlContent) {
   htmlTabContent = htmlContent;
};
   
var whenTabContentChanges = function whenTabContentChanges() {
   capturedTabContentChangeListeners.forEach(function(callback) { callback(); });
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

var lastCapturedTabContentConfig = function lastCapturedTabContentConfig() {
   return capturedTabContentConfig[capturedTabContentConfig.length - 1];
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
   capturedTabContentChangeListeners = [];
   capturedTabContentConfig = [];
   tabContentChangedListenerInvocations = {};
   htmlTabContent = undefined;
   getHtmlContentInvocationCount = 0;
   templatePrefix = '<h1>Hello World</h1>';
   suffix = '<p>after configured content</p>';
   shop.Context.log = function log(message) {};
   shop.ui.Tab.prototype = new MockedAbstractHideableLanguageDependentComponent();
};

describe('Tab', function() {
	
   beforeEach(setup);
   
   it('creating an instance is an instance/object', function() {
      givenDefaultInstance();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('new Instance provides configuration to TabContent A', function() {
      givenInstanceWith({});
      expect(lastCapturedTabContentConfig()).to.be.eql({ 
         configName: 'myConfig', 
         contentTemplateName: 'myTemplate', 
         languages: [ 'de', 'en' ],
         tableGenerator: DEFAULT_TABLE_GENERATOR
      });
   });
   
   it('new Instance provides configuration to TabContent B', function() {
      givenInstanceWith({id: 'id1', selector: 'sel1', configName: 'conf1', contentTemplateName: 'content1', languages: ['hu', 'sk'], tableGenerator: 'specialTableGen'});
      expect(lastCapturedTabContentConfig()).to.be.eql({ 
         configName: 'conf1', 
         contentTemplateName: 'content1', 
         languages: [ 'hu', 'sk' ],
         tableGenerator: 'specialTableGen'
     });
   });
   
   it('new instance adds ContentChangeListener to TabContent', function() {
      givenDefaultInstance();
      expect(capturedTabContentChangeListeners.length).to.be.eql(1);
   });
   
   it('getId() returns the ID of the tab A', function() {
      givenDefaultInstance();
      expect(instance.getId()).to.be.eql(DEFAULT_TAB_ID);
   });
   
   it('getId() returns the ID of the tab B', function() {
      givenInstanceWith({id: 'myIdentifier'});
      expect(instance.getId()).to.be.eql('myIdentifier');
   });
   
   it('a configured contentSelector does not influence the tab selector returned by getSelector()', function() {
      givenInstanceWith({contentSelector: 'myContentSelector'});
      expect(instance.getSelector()).to.be.eql(DEFAULT_SELECTOR);
   });
   
   it('the Tab does not publish something when no language publication is available', function() {
      givenDefaultInstance();
      expect(capturedHtmlContent[DEFAULT_SELECTOR]).to.be.eql(undefined);
   });
   
   it('the Tab publishes the html content provided by the TabContent instance A', function() {
      givenTabContentProvides('<p>some html content</p>');
      givenDefaultInstance();
      whenTabContentChanges();
      expect(capturedHtmlContent[DEFAULT_SELECTOR]).to.be.eql('<p>some html content</p>');
   });
   
   it('the Tab publishes the html content provided by the TabContent instance B', function() {
      givenTabContentProvides('<h1>I am a header</h1>');
      givenInstanceWith({selector: 'specialSelector', contentSelector: 'myContentSelector'});
      whenTabContentChanges();
      expect(capturedHtmlContent.myContentSelector).to.be.eql('<h1>I am a header</h1>');
   });
   
   it('the Tab publishes the html content provided by the TabContent instance by using the configured contentSelector', function() {
      givenTabContentProvides('<h1>I am a header</h1>');
      givenInstanceWith({contentSelector: 'myContentSelector'});
      whenTabContentChanges();
      expect(capturedHtmlContent.myContentSelector).to.be.eql('<h1>I am a header</h1>');
   });
   
   it('the Tab notifies the registered TabContentChangedCallbacks when tab content gets set to an error message', function() {
      givenDefaultInstance();
      givenRegisteredTabContentChangedListener(tabContentChangedListener);
      whenTabContentChanges();
      expect(tabContentChangedListenerInvocations[DEFAULT_SELECTOR].length).to.be.eql(1);
   });
   
   it('setHtmlContentOfChildElement sets the content of a child element A', function() {
      givenDefaultInstance();
      whenHtmlContentOfAChildElementGetsSet('childId', '<p>child content</p>');
      expect(capturedHtmlContent[DEFAULT_SELECTOR + ' #childId']).to.be.eql('<p>child content</p>');
   });
   
   it('setHtmlContentOfChildElement sets the content of a child element B', function() {
      givenInstanceWith({selector: 'sel123'});
      whenHtmlContentOfAChildElementGetsSet('anotherChildId', '<h1>child content for testing</h1>');
      expect(capturedHtmlContent['sel123 #anotherChildId']).to.be.eql('<h1>child content for testing</h1>');
   });
   
   it('the Tab notifies the registered TabContentChangedCallbacks when setHtmlContentOfChildElement called', function() {
      givenDefaultInstance();
      givenRegisteredTabContentChangedListener(tabContentChangedListener);
      whenHtmlContentOfAChildElementGetsSet('childId', '<p>child content</p>');
      expect(tabContentChangedListenerInvocations[DEFAULT_SELECTOR].length).to.be.eql(1);
   });
   
   it('the revision provided to the TabContentChangedCallbacks gets incremented by one every time', function() {
      givenDefaultInstance();
      givenRegisteredTabContentChangedListener(tabContentChangedListener);
      whenTabContentChanges();
      whenTabContentChanges();
      whenTabContentChanges();
      expect(tabContentChangedListenerInvocations[DEFAULT_SELECTOR]).to.be.eql([1,2,3]);
   });
});  