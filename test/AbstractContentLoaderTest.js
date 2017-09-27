/* global global, shop, common, Map, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/AbstractContentLoader.js');

var DEFAULT_CONTENT_BASE_URL = 'http://www.edererthomas.at/content';
var DEFAULT_FILE_EXTENSION = 'html';
var ERROR_MESSAGE = 'cannot load resource';

var resources;
var instance;
var capturedContentBaseUrl;
var capturedOnContentLoadedCalls;
var capturedOnContentLoadingFailed;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var mockedResourceProvider = {
      get: function get(name) {
         var executor = function executor(fulfill, reject) {
            if (resources[name] === undefined) {
               reject(ERROR_MESSAGE);
            } else {
               fulfill(resources[name]);
            }
         };
         
         return new common.Promise(executor);
      }
};

var resourceProviderFactoryFunction = function resourceProviderFactoryFunction(configBaseUrl) {
   capturedContentBaseUrl = configBaseUrl;
   return mockedResourceProvider;
};

var DerivedContentLoader = function DerivedContentLoader() {
   this.onContentLoaded = function onContentLoaded(name, content) {
      capturedOnContentLoadedCalls[capturedOnContentLoadedCalls.length] = {name: name, content: content};
   };
   
   this.onContentLoadingFailed = function onContentLoadingFailed(name, error) {
      capturedOnContentLoadingFailed[capturedOnContentLoadingFailed.length] = {name: name, error: error};
   };
};

DerivedContentLoader.prototype = new shop.configuration.AbstractContentLoader(resourceProviderFactoryFunction);
   
var givenDerivedContentLoader = function givenDerivedContentLoader() {
   instance = new DerivedContentLoader();
};

var givenResourceContent = function givenResourceContent(name, content) {
   resources[name] = content;
};

var indexOfCapturedOnContentLoadedCall = function indexOfCapturedOnContentLoadedCall(name, content) {
   var index = -1;
   
   for(var currentIndex = 0; currentIndex < capturedOnContentLoadedCalls.length; currentIndex++) {
      var capturedData = capturedOnContentLoadedCalls[currentIndex];
      if (capturedData.name === name && capturedData.content === content) {
         index = currentIndex;
      }
   }
   
   return index;
};

var indexOfCapturedOnContentLoadingFailed = function indexOfCapturedOnContentLoadingFailed(name, error) {
   var index = -1;
   
   for(var currentIndex = 0; currentIndex < capturedOnContentLoadingFailed.length; currentIndex++) {
      var capturedData = capturedOnContentLoadingFailed[currentIndex];
      if (capturedData.name === name && capturedData.error === error) {
         index = currentIndex;
      }
   }
   
   return index;
};

var whenContentGetsLoaded = function whenContentGetsLoaded(names) {
   instance.load(DEFAULT_CONTENT_BASE_URL, names);
};

var setup = function setup() {
   resources = {};
   capturedContentBaseUrl = undefined;
   capturedOnContentLoadedCalls = [];
   capturedOnContentLoadingFailed = [];
   givenDerivedContentLoader();
};

describe('AbstractContentLoader', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a AbstractContentLoader is an instance/object', function() {
      
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('AbstractContentLoader provides content base URL to ResourceProvider A', function() {
      
      instance.load(DEFAULT_CONTENT_BASE_URL, [ 'plants_template.html', 'plants_config.json' ]);
      expect(capturedContentBaseUrl).to.be.eql(DEFAULT_CONTENT_BASE_URL);
   });
   
   it('AbstractContentLoader provides content base URL to ResourceProvider B', function() {
      
      instance.load('http://127.0.0.1/', [ 'plants_template.html', 'plants_config.json' ]);
      expect(capturedContentBaseUrl).to.be.eql('http://127.0.0.1/');
   });
   
   it('AbstractContentLoader calls onContentLoaded of derived object when content was loaded successfully', function() {
      
      givenResourceContent('plants_template.html', '<h1>plants</h1>');
      givenResourceContent('plants_config.json', '{ "lastUpdate": "19. Sept. 2017" }');
      whenContentGetsLoaded([ 'plants_template.html', 'plants_config.json' ]);
      expect(capturedOnContentLoadedCalls.length).to.be.eql(2);
      expect(indexOfCapturedOnContentLoadedCall('plants_template.html', '<h1>plants</h1>')).to.be.greaterThan(-1);
      expect(indexOfCapturedOnContentLoadedCall('plants_config.json', '{ "lastUpdate": "19. Sept. 2017" }')).to.be.greaterThan(-1);
   });
   
   it('AbstractContentLoader calls onContentLoadingFailed of derived object when content loading failed', function() {
      
      whenContentGetsLoaded([ 'plants_template.html', 'plants_config.json' ]);
      expect(capturedOnContentLoadingFailed.length).to.be.eql(2);
      expect(indexOfCapturedOnContentLoadingFailed('plants_template.html', ERROR_MESSAGE)).to.be.greaterThan(-1);
      expect(indexOfCapturedOnContentLoadingFailed('plants_config.json', ERROR_MESSAGE)).to.be.greaterThan(-1);
   });
});