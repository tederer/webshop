/* global global, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

assertNamespace('testing');

testing.MockedBus = function MockedBus() {

   var commandCallbacks = [];
   var publicationCallbacks = [];
   var lastPublications = {};
   var capturedCommands = [];
   var capturedPublications = [];
   
   this.subscribeToCommand = function subscribeToCommand(topic, callback) {
      commandCallbacks[topic] = callback;
   };
   
   this.subscribeToPublication = function subscribeToPublication(topic, callback) {
      publicationCallbacks[topic] = callback;
      callback(lastPublications[topic]);
   };
   
   this.sendCommand = function sendCommand(topic, data) {
      capturedCommands[capturedCommands.length] = {topic: topic, data: data};
      var callback = commandCallbacks[topic];
      if (callback !== undefined) {
         callback(data);
      }
   };
   
   this.publish = function publish(topic, data) {
      capturedPublications[capturedPublications.length] = {topic: topic, data: data};
      lastPublications[topic] = data;
      var callback = publicationCallbacks[topic];
      if (callback !== undefined) {
         callback(data);
      }
   };
   
   this.getLastPublication = function getLastPublication(topic) {
      return lastPublications[topic];
   };
};