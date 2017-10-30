/* global global, shop, testing, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/HtmlContentLoader.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Language.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var DEFAULT_CONTENT_BASE_URL = 'http://192.168.1.1/content';
var DEFAULT_LANGUAGES = [shop.Language.DE, shop.Language.EN];
var ERROR_MESSAGE = 'failed to load HTML resource';

var instance;
var capturedNames;
var capturedContentBaseUrl;
var contents;
var mockedBus;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var MockedAbstractContentLoader = function MockedAbstractContentLoader() {
   
   this.load = function load(contentBaseUrl, names) {
      capturedContentBaseUrl = contentBaseUrl;
      capturedNames = names;
      
      for (var nameIndex = 0; nameIndex < names.length; nameIndex++) {
         var name = names[nameIndex];
         var content = contents[name];
         if (content === undefined) {
            this.onContentLoadingFailed(name, ERROR_MESSAGE);
         } else {
            this.onContentLoaded(name, content);
         }
      }
   };
};

shop.configuration.HtmlContentLoader.prototype = new MockedAbstractContentLoader();
 
var givenHtmlContentLoader = function givenHtmlContentLoader(optionalContentBaseUrl, optionalLanguages) {
   var contentBaseUrl = (optionalContentBaseUrl === undefined) ? DEFAULT_CONTENT_BASE_URL : optionalContentBaseUrl;
   var languages = (optionalLanguages === undefined) ? DEFAULT_LANGUAGES : optionalLanguages;
   
   instance = new shop.configuration.HtmlContentLoader(contentBaseUrl, languages, mockedBus);
};

var givenContentOf = function givenContentOf(name, content) {
   contents[name] = content;
};
      
var whenContentGetsLoaded = function whenContentGetsLoaded(names) {
  instance.load((names === undefined) ? [] : names); 
};
      
var capturedNamesContains = function capturedNamesContains(expectedName) {
   var found = false;
   capturedNames.forEach(function(name) {
      if (name === expectedName) {
         found = true;
      }
   });
   return found;
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   capturedNames = undefined;
   capturedContentBaseUrl = undefined;
   contents = {};
};

describe('HtmlContentLoader', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a HtmlContentLoader is an instance/object', function() {
      givenHtmlContentLoader();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('HtmlContentLoader provides content base URL to ResourceProvider when load() called A', function() {
      givenHtmlContentLoader();
      whenContentGetsLoaded();
      expect(capturedContentBaseUrl).to.be.eql(DEFAULT_CONTENT_BASE_URL);
   });
   
   it('HtmlContentLoader provides content base URL to ResourceProvider when load() called B', function() {
      givenHtmlContentLoader('http://127.0.0.1');
      whenContentGetsLoaded();
      expect(capturedContentBaseUrl).to.be.eql('http://127.0.0.1');
   });
   
   it('HtmlContentLoader provides content names with language folder and file extension to ResourceProvider when load() called A', function() {
      givenHtmlContentLoader('http://127.0.0.1');
      whenContentGetsLoaded(['food', 'drinks']);
      expect(capturedNames.length).to.be.eql(4);
      expect(capturedNamesContains('de/food.html')).to.be.eql(true);
      expect(capturedNamesContains('de/drinks.html')).to.be.eql(true);
      expect(capturedNamesContains('en/food.html')).to.be.eql(true);
      expect(capturedNamesContains('en/drinks.html')).to.be.eql(true);
   });
   
   it('HtmlContentLoader provides content names with language folder and file extension to ResourceProvider when load() called B', function() {
      givenHtmlContentLoader('http://127.0.0.1/something', [shop.Language.EN]);
      whenContentGetsLoaded(['trees', 'rocks', 'fruits']);
      expect(capturedNames.length).to.be.eql(3);
      expect(capturedNamesContains('en/trees.html')).to.be.eql(true);
      expect(capturedNamesContains('en/fruits.html')).to.be.eql(true);
      expect(capturedNamesContains('en/rocks.html')).to.be.eql(true);
   });
   
   it('HtmlContentLoader publishes content A', function() {
      givenHtmlContentLoader('http://127.0.0.1/something', [shop.Language.EN]);
      givenContentOf('en/trees.html', 'there are some trees');
      whenContentGetsLoaded(['trees']);
      expect(mockedBus.getLastPublication('/htmlContent/' + shop.Language.EN + '/trees')).to.be.eql('there are some trees');
   });   
   
   it('HtmlContentLoader publishes content B', function() {
      givenHtmlContentLoader();
      givenContentOf('de/trees.html', 'Hier steht ein Wald!');
      givenContentOf('en/trees.html', 'there are some trees');
      givenContentOf('de/fruits.html', 'Fruchtsalat');
      givenContentOf('en/fruits.html', 'fruit salad');
      whenContentGetsLoaded(['trees', 'fruits']);
      expect(mockedBus.getLastPublication('/htmlContent/' + shop.Language.EN + '/trees')).to.be.eql('there are some trees');
      expect(mockedBus.getLastPublication('/htmlContent/' + shop.Language.EN + '/fruits')).to.be.eql('fruit salad');
      expect(mockedBus.getLastPublication('/htmlContent/' + shop.Language.DE + '/trees')).to.be.eql('Hier steht ein Wald!');
      expect(mockedBus.getLastPublication('/htmlContent/' + shop.Language.DE + '/fruits')).to.be.eql('Fruchtsalat');
   });
   
   it('HtmlContentLoader publishes an Error when it was not possible to load the content', function() {
      givenHtmlContentLoader('http://127.0.0.1/test', [shop.Language.DE]);
      whenContentGetsLoaded(['buildings']);
      expect(mockedBus.getLastPublication('/htmlContent/' + shop.Language.DE + '/buildings') instanceof Error).to.be.eql(true);
   });
});