/* global global, common, Map, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/Promise.js');

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var resolveCalled;
var rejectCalled;
var capturedData;
var capturedError;

var maxTimedExpectDurationInMs = 200;
var timedExpectIntervalInMs = 50;
var finishTest;

var recursiveTimedExpect = function recursiveTimedExpect(predicate, repetitionCount) {
   var result = predicate();
   
   if (result === true) {
      finishTest();
   } else {
      if ((repetitionCount * timedExpectIntervalInMs) < maxTimedExpectDurationInMs) {
         setTimeout(function() { recursiveTimedExpect(predicate, repetitionCount + 1); }, timedExpectIntervalInMs);
      } else {
         finishTest('predicate does not evaluate to true');
      }
   }
};

var timedExpect = function timedExpect(predicate) {
   recursiveTimedExpect(predicate, 0);
};

var onFulfilled = function onFulfilled(data) {
   resolveCalled = true;
   capturedData = data;
};
var onRejected = function onRejected(error) {
   rejectCalled = true;
   capturedError = error;
};
      
var setup = function setup() {
   resolveCalled = false;
   rejectCalled = false;
   capturedData = undefined;
   capturedError = undefined;
};

describe('Promise', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a Promise is an instance/object', function() {
      
      var promise = new common.Promise(function(){});
      expect(valueIsAnObject(promise)).to.be.eql(true);
   });
   
   it('then() returns a new Promise', function() {
      
      var promise = new common.Promise(function(resolve, reject) { 
         resolve();
      });
      
      var result = promise.then(onFulfilled);
      
      expect(result instanceof common.Promise).to.be.eql(true);
   });
   
   it('then() triggers executor function and onFulfilled gets called when executor function succeeded', function() {
      
      var promise = new common.Promise(function(resolve, reject) { 
         resolve();
      });
      
      promise.then(onFulfilled, onRejected);
      
      expect(resolveCalled && !rejectCalled).to.be.eql(true);
   });   
   
   it('onFulfilled of then() gets data provided by promise executor', function() {
      
      var executor = function(resolve, reject) { 
         resolve('this is a test!');
      };
      
      var promise = new common.Promise(executor);
      
      promise.then(onFulfilled, onRejected);
      
      expect(capturedData).to.be.eql('this is a test!');
   });   
   
   it('onFulfilled of then() gets data provided by promise executor as soon as he finished', function(done) {
      
      finishTest = done;
      var executor = function(resolve, reject) { 
         setTimeout(function() { resolve('this is another test!'); }, 100);
      };
      
      var promise = new common.Promise(executor);
      promise.then(onFulfilled, onRejected);
      
      timedExpect(function() { return capturedData === 'this is another test!'; });
   });   
   
   it('chained onFulfilledActions of then() get executed in the order of definition', function() {
      
      var promise = new common.Promise((fulfill, reject) => fulfill(3));
      promise.then((value) => value * 2).then((value) => value + 1).then(onFulfilled);
      
      expect(capturedData).to.be.eql(7);
   });   
   
   it('exception in onFulfilledActions of then() gets provided to onRejectedAction', function() {
      
      var promise = new common.Promise((fulfill, reject) => fulfill('some data'));
      promise.then((data) => {throw 'an error happened';}).then(onFulfilled, onRejected);
      
      expect(!resolveCalled && rejectCalled).to.be.eql(true);
      expect(capturedError).to.be.eql('an error happened');
   });   
   
   it('exception in onFulfilledActions of then() gets provided to last defined onRejectedAction when no onRejectedAction is defined before', function() {
      
      var promise = new common.Promise((fulfill, reject) => fulfill('some data'));
      promise.then((data) => {throw 'an error happened';}).then((data) => data).then(onFulfilled, onRejected);
      
      expect(!resolveCalled && rejectCalled).to.be.eql(true);
      expect(capturedError).to.be.eql('an error happened');
   });   
   
   it('then() triggers executor function and onRejected gets called when executor function fails', function() {
      
      var promise = new common.Promise(function(resolve, reject) { 
         reject();
      });
      
      promise.then(onFulfilled, onRejected);
      
      expect(!resolveCalled && rejectCalled).to.be.eql(true);
   });
   
   it('onRejected of then() gets error provided by promise executor', function() {
      
      var promise = new common.Promise(function(resolve, reject) { 
         reject('everything went wrong');
      });
      
      promise.then(onFulfilled, onRejected);
      
      expect(capturedError).to.be.eql('everything went wrong');
   });

   it('onRejectedAction providing data triggers onFulfilledActions of next then()', function() {
      
      var promise = new common.Promise((fulfill, reject) => fulfill('some data'));
      promise.then((data) => {throw 'an error happened';}).then(onFulfilled, (error) => 'corrected data').then(onFulfilled, onRejected);
      
      expect(resolveCalled && !rejectCalled).to.be.eql(true);
      expect(capturedData).to.be.eql('corrected data');
   });   

   it('exception in onRejectedAction gets provided to onRejectedAction', function() {
      
      var promise = new common.Promise((fulfill, reject) => fulfill('some data'));
      promise.then((data) => {throw 'an error happened';}).then(onFulfilled, (error) => {throw 'another error happened';}).then(onFulfilled, onRejected);
      
      expect(!resolveCalled && rejectCalled).to.be.eql(true);
      expect(capturedError).to.be.eql('another error happened');
   });   
});  