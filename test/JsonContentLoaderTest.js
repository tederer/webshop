/* global global, shop, common, Map, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/JsonContentLoader.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Language.js');

var DEFAULT_CONTENT_BASE_URL = 'http://192.168.1.1/content';
var DEFAULT_LANGUAGES = [shop.Language.DE, shop.Language.EN];
var ERROR_MESSAGE = 'failed to load JSON resource';

var instance;
var capturedNames;
var capturedContentBaseUrl;
var capturedPublications;
var contents;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var mockedBus = {
   publish: function publish(topic, data) {
      capturedPublications[capturedPublications.length] = {topic: topic, data: data};
   }
};

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

shop.configuration.JsonContentLoader.prototype = new MockedAbstractContentLoader();
 
var givenJsonContentLoader = function givenJsonContentLoader(optionalContentBaseUrl, optionalLanguages) {
   var contentBaseUrl = (optionalContentBaseUrl === undefined) ? DEFAULT_CONTENT_BASE_URL : optionalContentBaseUrl;
   var languages = (optionalLanguages === undefined) ? DEFAULT_LANGUAGES : optionalLanguages;
   
   instance = new shop.configuration.JsonContentLoader(contentBaseUrl, languages, mockedBus);
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

var capturedPublicationsContains = function capturedPublicationsContains(expectedPublication) {
   var found = false;
   capturedPublications.forEach(function(publication) {
      if (publication.topic === expectedPublication.topic && publication.data === expectedPublication.data) {
         found = true;
      }
   });
   return found;
};

var setup = function setup() {
   capturedNames = undefined;
   capturedContentBaseUrl = undefined;
   capturedPublications = [];
   contents = {};
};

describe('JsonContentLoader', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a JsonContentLoader is an instance/object', function() {
      givenJsonContentLoader();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('JsonContentLoader provides content base URL to ResourceProvider when load() called A', function() {
      givenJsonContentLoader();
      whenContentGetsLoaded();
      expect(capturedContentBaseUrl).to.be.eql(DEFAULT_CONTENT_BASE_URL);
   });
   
   it('JsonContentLoader provides content base URL to ResourceProvider when load() called B', function() {
      givenJsonContentLoader('http://127.0.0.1');
      whenContentGetsLoaded();
      expect(capturedContentBaseUrl).to.be.eql('http://127.0.0.1');
   });
   
   it('JsonContentLoader provides content names with language folder and file extension to ResourceProvider when load() called A', function() {
      givenJsonContentLoader('http://127.0.0.1');
      whenContentGetsLoaded(['food', 'drinks']);
      expect(capturedNames.length).to.be.eql(4);
      expect(capturedNamesContains('de/food.json')).to.be.eql(true);
      expect(capturedNamesContains('de/drinks.json')).to.be.eql(true);
      expect(capturedNamesContains('en/food.json')).to.be.eql(true);
      expect(capturedNamesContains('en/drinks.json')).to.be.eql(true);
   });
   
   it('JsonContentLoader provides content names with language folder and file extension to ResourceProvider when load() called B', function() {
      givenJsonContentLoader('http://127.0.0.1/something', [shop.Language.EN]);
      whenContentGetsLoaded(['trees', 'rocks', 'fruits']);
      expect(capturedNames.length).to.be.eql(3);
      expect(capturedNamesContains('en/trees.json')).to.be.eql(true);
      expect(capturedNamesContains('en/fruits.json')).to.be.eql(true);
      expect(capturedNamesContains('en/rocks.json')).to.be.eql(true);
   });
   
   it('JsonContentLoader publishes content A', function() {
      givenJsonContentLoader('http://127.0.0.1/something', [shop.Language.EN]);
      givenContentOf('en/orchid.json', '{"genera": "Cattleya", "species": "skinerii"}');
      whenContentGetsLoaded(['orchid']);
      expect(capturedPublications.length).to.be.eql(1);
      expect(capturedPublications[0].topic).to.be.eql('/jsonContent/' + shop.Language.EN + '/orchid');
      expect(capturedPublications[0].data.genera).to.be.eql('Cattleya');
      expect(capturedPublications[0].data.species).to.be.eql('skinerii');
   });   
   
   it('JsonContentLoader publishes content B', function() {
      givenJsonContentLoader('http://127.0.0.1/data', [shop.Language.DE]);
      givenContentOf('de/car.json', '{"brand": "Toyota", "type": "hybrid"}');
      whenContentGetsLoaded(['car']);
      expect(capturedPublications.length).to.be.eql(1);
      expect(capturedPublications[0].topic).to.be.eql('/jsonContent/' + shop.Language.DE + '/car');
      expect(capturedPublications[0].data.brand).to.be.eql('Toyota');
      expect(capturedPublications[0].data.type).to.be.eql('hybrid');
   });   
   
   it('JsonContentLoader publishes an Error when it was not possible to load the content', function() {
      givenJsonContentLoader('http://127.0.0.1/test', [shop.Language.DE]);
      whenContentGetsLoaded(['buildings']);
      expect(capturedPublications.length).to.be.eql(1);
      expect(capturedPublications[0].topic).to.be.eql('/jsonContent/' + shop.Language.DE + '/buildings');
      expect(capturedPublications[0].data instanceof Error).to.be.eql(true);
   });
   
   it('JsonContentLoader publishes an Error when the content cannot be parsed', function() {
      givenJsonContentLoader('http://127.0.0.1/test', [shop.Language.DE]);
      givenContentOf('de/buildings.json', '{"brand"= "Toyota", "type": "hybrid"}');
      whenContentGetsLoaded(['buildings']);
      expect(capturedPublications.length).to.be.eql(1);
      expect(capturedPublications[0].topic).to.be.eql('/jsonContent/' + shop.Language.DE + '/buildings');
      expect(capturedPublications[0].data instanceof Error).to.be.eql(true);
   });
});