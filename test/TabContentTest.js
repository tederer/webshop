/* global global, shop, common, Map, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/TabContent.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Promise.js');

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var DEFAULT_SELECTOR = 'defaultSelector';
var DEFAULT_CONFIG_NAME = 'defaultConfig';
var DEFAULT_CONTENT_TEMPLATE_NAME = 'defaultContentTemplateName';

var templatePrefix;
var placeholder;
var suffix;


var configContent;
var templateContent;
var capturedHtmlContent;
var capturedConfigName;
var capturedTemplateName;
var templateProviderRejects;
var configProviderRejects;

var mockedConfigProvider = {
   get: function get(name) { 
         capturedConfigName = name; 
         return new common.Promise(function(fulfill, reject) { 
               if (configProviderRejects) {
                  reject('config cannot be provided');
               } else {
                  fulfill(configContent); 
               }
            });
   }
};

var mockedTemplateProvider = {
   get: function get(name) { 
         capturedTemplateName = name; 
         return new common.Promise(function(fulfill, reject) { 
               if (templateProviderRejects) {
                  reject('template cannot be provided');
               } else {
                  fulfill(templateContent); 
               }
            });
   }
};

var setHtmlContent = function setHtmlContent(selector, content) {
   capturedHtmlContent = content;
};

var givenDefaultTabContent = function givenDefaultTabContent() {
   return new shop.ui.TabContent(DEFAULT_SELECTOR, DEFAULT_CONFIG_NAME, DEFAULT_CONTENT_TEMPLATE_NAME, mockedConfigProvider, mockedTemplateProvider, setHtmlContent);
};

var givenTemplateRejects = function givenTemplateRejects() {
   templateProviderRejects = true;
};

var givenConfigurationRejects = function givenConfigurationRejects() {
   configProviderRejects = true;
};

var givenConfigurationContains = function givenConfigurationContains(content) {
   configContent = content;
};

var givenTemplateContains = function givenTemplateContains(content) {
   templateContent = content;
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
   configContent = undefined;
   capturedHtmlContent = undefined;
   capturedConfigName = undefined;
   capturedTemplateName = undefined;
   templateProviderRejects = false;
   configProviderRejects = false;
   templatePrefix = '<h1>Hello World</h1>';
   placeholder = '<!--DYNAMIC_CONTENT-->';
   suffix = '<p>after configured content</p>';
};

describe('TabContent', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a TabContent is an instance/object', function() {
      
      var tabContent = givenDefaultTabContent();
      expect(valueIsAnObject(tabContent)).to.be.eql(true);
   });
   
   it('TabContent requests its config file', function() {
      
      new shop.ui.TabContent(DEFAULT_SELECTOR, 'config1', DEFAULT_CONTENT_TEMPLATE_NAME, mockedConfigProvider, mockedTemplateProvider, setHtmlContent);
      expect(capturedConfigName).to.be.eql('config1');
   });
   
   it('TabContent requests its template file', function() {
      
      new shop.ui.TabContent(DEFAULT_SELECTOR, DEFAULT_CONFIG_NAME, 'template1', mockedConfigProvider, mockedTemplateProvider, setHtmlContent);
      expect(capturedTemplateName).to.be.eql('template1');
   });
   
   it('the TabContent publishes a table with the configured plants', function() {
      
      givenConfigurationContains('{"plants": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      givenTemplateContains(templatePrefix + placeholder + suffix);
      givenDefaultTabContent();
      expect(capturedHtmlContent).to.be.eql('<h1>Hello World</h1><table><tr><td>Aerangis ellisii</td><td>10 EUR</td></tr><tr><td>Cattleya walkeriana</td><td>8 EUR</td></tr></table><p>after configured content</p>');
   });
   
   it('the TabContent publishes an error when the config contains an error', function() {
      
      givenConfigurationContains('{"plants"= [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplateContains(templatePrefix + placeholder + suffix);
      givenDefaultTabContent();
      expectContentContainesTemplateWithErrorMessage();
   });
   it('the TabContent publishes an error when the config cannot be provided', function() {
      
      givenConfigurationRejects();
      givenTemplateContains('<h1>Hello World</h1><!--DYNAMIC_CONTENT--><p>after configured content</p>');
      givenDefaultTabContent();
      expectContentContainesTemplateWithErrorMessage();
   });
   
   it('the TabContent publishes an error when the template can not be provided', function() {
      
      givenConfigurationContains('{"plants"= [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplateContains(templatePrefix + placeholder + suffix);
      givenTemplateRejects();
      givenDefaultTabContent();
      expectContentContainesErrorMessage();
   });
   
   it('the TabContent publishes an error when the template does not contain a placeholder', function() {
      
      givenConfigurationContains('{"plants"= [{"name": "Aerangis ellisii", "price": 10}]}');
      givenTemplateContains(templatePrefix + suffix);
      givenDefaultTabContent();
      expectContentContainesErrorMessage();
   });
   
   //TODO testen wenn config und template hin sind
});  