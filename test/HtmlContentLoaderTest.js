/* global global, shop, common, Map, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/HtmlContentLoader.js');

var DEFAULT_CONFIG = {};

var instance;
var capturedNames;
var capturedContentBaseUrl;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var MockedAbstractContentLoader = function MockedAbstractContentLoader() {
   this.callOnContentLoaded = function callOnContentLoaded(name, content) {
      this.onContentLoaded(name, content);
   };
   
   this.callOnContentLoadingFailed = function callOnContentLoadingFailed(name, error) {
      this.onContentLoadingFailed(name, error);
   };
   
   this.load = function load(contentBaseUrl, names) {
      console.log('MockedAbstractContentLoader.load(' + contentBaseUrl + ', ' + names + ')');
      capturedContentBaseUrl = contentBaseUrl;
      capturedNames = names;
   };
};
   
var givenHtmlContentLoader = function givenHtmlContentLoader(config) {
   instance = new shop.configuration.HtmlContentLoader(config);
   instance.prototype = new MockedAbstractContentLoader();
};

var setup = function setup() {
   capturedNames = undefined;
};

describe('HtmlContentLoader', function() {
	
   beforeEach(setup);
   /*
   it('creating an instance of a HtmlContentLoader is an instance/object', function() {
      givenHtmlContentLoader(DEFAULT_CONFIG);
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('HtmlContentLoader provides content base URL to ResourceProvider A', function() {
      var config = {
         contentBaseUrl:   'http://127.0.0.1/htmlContent',
         contents:         [{name: 'plants', topic: '/htmlContent/plants'}, {name: 'accessories', topic: '/htmlContent/accessories'}]
      };
      givenHtmlContentLoader(config);
      expect(capturedContentBaseUrl).to.be.eql('http://127.0.0.1/htmlContent');
      expect(capturedNames).to.be.eql(['plants.html', 'accessories.html']);
   });*/
});