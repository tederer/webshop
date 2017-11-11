/* global global, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

assertNamespace('testing');

testing.MockedBus = function MockedBus() {

   var commandCallbacks = [];
   var publicationCallbacks = [];
   var lastPublications = {};
   var capturedCommands = [];
   var capturedPublications = [];
   var totalPublicationCount = 0;
   
   this.subscribeToCommand = function subscribeToCommand(topic, callback) {
      commandCallbacks[topic] = callback;
   };
   
   this.subscribeToPublication = function subscribeToPublication(topic, callback) {
      publicationCallbacks[topic] = callback;
      var data = (lastPublications[topic] === undefined) ? undefined : lastPublications[topic].data;
      if (data) {
         callback(data);
      }
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
      totalPublicationCount++;
      
      if (lastPublications[topic] === undefined) {
         lastPublications[topic] = {data: data, count: 1};
      } else {
         lastPublications[topic] = {data: data, count: lastPublications[topic].count + 1};
      }
      var callback = publicationCallbacks[topic];
      if (callback !== undefined) {
         callback(data);
      }
   };
   
   this.getLastPublication = function getLastPublication(topic) {
      return lastPublications[topic].data;
   };
   
   this.getPublicationCount = function getPublicationCount(topic) {
      return lastPublications[topic].count;
   };
   
   this.getTotalPublicationCount = function getTotalPublicationCount() {
      return totalPublicationCount;
   };
   
   this.getLastCommand = function getLastCommand(topic) {
      var data;
      for (var index = 0; data === undefined && index < capturedCommands.length; index++) {
         if (capturedCommands[index].topic === topic) {
            data = capturedCommands[index].data;
         }
      }
      return data;
   };
   
   this.getPublicationSubscriptions = function getPublicationSubscriptions() {
      return Object.keys(publicationCallbacks);
   };
   
   this.removeCallbackFor = function removeCallbackFor(topic) {
      if (Object.keys(publicationCallbacks).indexOf(topic) > -1) {
         delete publicationCallbacks[topic];
      }
   };
   
   this.reset = function reset() {
      commandCallbacks = [];
      publicationCallbacks = [];
      lastPublications = {};
      capturedCommands = [];
      capturedPublications = [];
      totalPublicationCount = 0;
   };
};