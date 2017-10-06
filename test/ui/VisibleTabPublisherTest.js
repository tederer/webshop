/* global global, shop, common, Map, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/Topics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/VisibleTabPublisher.js');

var instance;
var publications;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var mockedBus = {
   publish: function publish(topic, data) {
      publications[publications.length] = {topic:topic, data:data};
   }
};

var givenDefaultVisibleTabPublisher = function givenDefaultVisibleTabPublisher() {
   instance = new shop.ui.VisibleTabPublisher(mockedBus);
};

var whenNewStateIs = function whenNewStateIs(newState) {
   instance.setNewState(newState);
};

var publicationsContains = function publicationsContains(expectedTabName) {
   var found = false;
   for (var index = 0; found === false && index < publications.length; index++) {
      var currentPublication = publications[index];
      if (currentPublication.topic === shop.topics.VISIBLE_TAB && currentPublication.data === expectedTabName) {
         found = true;
      }
   }
   
   return found;
};

var setup = function setup() {
   publications = [];
   givenDefaultVisibleTabPublisher();
};

describe('VisibleTabPublisher', function() {
	
   beforeEach(setup);
   
   it('creating an UiStateSetter of a TabContent is an instance/object', function() {
      
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('receiving a new state updates the visible tab publiaction', function() {
      
      whenNewStateIs({visibleTab: 'tabA'});
      expect(publications.length).to.be.eql(1);
      expect(publicationsContains('tabA')).to.be.eql(true);
   });
   
   it('receiving the same state does not updates the visible tab publiaction', function() {
      
      whenNewStateIs({visibleTab: 'tabA'});
      whenNewStateIs({visibleTab: 'tabA'});
      expect(publications.length).to.be.eql(1);
   });
   
   it('receiving another state updates the visible tab publiaction', function() {
      
      whenNewStateIs({visibleTab: 'tabA'});
      whenNewStateIs({visibleTab: 'tabB'});
      expect(publications.length).to.be.eql(2);
      expect(publicationsContains('tabA')).to.be.eql(true);
      expect(publicationsContains('tabB')).to.be.eql(true);
   });
});  