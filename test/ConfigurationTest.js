/* global global, shop, Map */

require(global.PROJECT_SOURCE_ROOT_PATH + '/Configuration.js');

var config;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var setup = function setup() {
   config = new shop.configuration.Configuration();
};

describe('Configuration', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a configuration is an instance/object', function() {
      
      expect(valueIsAnObject(config)).to.be.eql(true);
   });
   
   /*it('the data of a publication get notified_A', function() {
      
      var topic = '/my/topic';
      var data = 'some data';
      
      givenASubscriptionForPublication(topic);
      
      bus.publish(topic, data);
      
      expect(capturedPublications.get(topic).length).to.be.eql(1);
      expect(capturedPublications.get(topic)[0]).to.be.eql(data);
   });*/
});  