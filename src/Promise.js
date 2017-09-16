/* global common, assertNamespace */

require('./NamespaceUtils.js');

assertNamespace('common');

var promiseCount = 0;
/**
 * constructor for the Promise.
 */
common.Promise = function Promise(executor) {

   var state = 'pending';
   var doNothing = function doNothing(data) {};
   var resolveCallback;
   var rejectCallback;
   var data;
   var error;
   var id = ++promiseCount;
   
   executor(
      function(d) { 
         data = d;
         state = 'fulfilled';
         if (resolveCallback !== undefined) {
            resolveCallback(data);
         }
      }, 
      function(err) { 
         error = err; 
         state = 'rejected';
         if (rejectCallback !== undefined) {
            rejectCallback(data);
         }
      });
   
   this.then = function then(onFulfilledAction, onRejectedAction) {
      
      return new common.Promise(function(resolve, reject) {

         var doResolve = function doResolve() {
            onFulfilledAction(data);
            // TODO abhängig von onFulfilledAction entweder resolve oder reject aufrufen
            resolve(data);
         };
         
         var doReject = function doReject() {
            if (onRejectedAction !== undefined) {
               onRejectedAction(error);
            } else {
               reject(error);
            }
         };
         
         if (state === 'fulfilled') {
            doResolve();
         } else if (state === 'rejected') {
            doReject();
         } else { // pending state
            resolveCallback = function() {
               doResolve();
            };
            rejectCallback = function() {
               doReject();
            };
         }
      });
   };
};