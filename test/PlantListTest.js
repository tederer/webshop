/* global global, shop, common, Map, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/PlantList.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Promise.js');

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var configContent;
var capturedHtmlContent;
var capturedConfigName;

var mockedConfigProvider = {
   get: function get(name) { 
         capturedConfigName = name; 
         return new common.Promise(function(fulfill, reject) { fulfill(configContent); }); 
      }
};

var mockedHtmlContent = {
   set: function set(content) { capturedHtmlContent = content; }
};

var givenPlantConfigurationContains = function givenPlantConfigurationContains(content) {
   configContent = content;
};

var setup = function setup() {
   configContent = undefined;
   capturedHtmlContent = undefined;
   capturedConfigName = undefined;
};

describe('PlantList', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a PlantList is an instance/object', function() {
      
      var plantList = new shop.PlantList(mockedConfigProvider, mockedHtmlContent);
      
      expect(valueIsAnObject(plantList)).to.be.eql(true);
   });
   
   it('PlantList requests its config file', function() {
      
      var plantList = new shop.PlantList(mockedConfigProvider, mockedHtmlContent);
      
      expect(capturedConfigName).to.be.eql('pflanzen');
   });
   
   it('the PlantList publishes a table with the configured plants', function() {
      
      givenPlantConfigurationContains('{"plants": [{"name": "Aerangis ellisii", "price": 10}, {"name": "Cattleya walkeriana", "price": 8}]}');
      
      var plantList = new shop.PlantList(mockedConfigProvider, mockedHtmlContent);
      
      expect(capturedHtmlContent).to.be.eql('<table><tr><td>Aerangis ellisii</td><td>10 EUR</td></tr><tr><td>Cattleya walkeriana</td><td>8 EUR</td></tr></table>');
   });
   
   it('the PlantList publishes an error when the config contains an error', function() {
      
      givenPlantConfigurationContains('{"plants"= [{"name": "Aerangis ellisii", "price": 10}]}');
      
      var plantList = new shop.PlantList(mockedConfigProvider, mockedHtmlContent);
      
      expect(capturedHtmlContent).to.be.eql('config contains an error');
   });
});  