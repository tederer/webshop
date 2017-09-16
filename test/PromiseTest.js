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

var maxTimedExpectRepitation = 10;
var timedExpectIntervalInMs = 100;
var finishTest;

var recursiveTimedExpect = function recursiveTimedExpect(predicate, repetitionCount) {
   var result = predicate();
   
   if (result === true) {
      finishTest();
   } else {
      if (repetitionCount < maxTimedExpectRepitation) {
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
         setTimeout(function() { resolve('this is another test!'); }, 500);
      };
      
      var promise = new common.Promise(executor);
      promise.then(onFulfilled, onRejected);
      
      timedExpect(function() { return capturedData === 'this is another test!'; });
   });   
   
   it('then() triggers executor function and onRejecteded gets called when executor function fails', function() {
      
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
});  