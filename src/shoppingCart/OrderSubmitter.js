/* global shop, setTimeout, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../Topics.js');

assertNamespace('shop.shoppingCart');

shop.shoppingCart.OrderSubmitter = function OrderSubmitter(inProgressOverlay, successOverlay, errorOverlay, optionalBus, optionalHttpRequester, optionalScheduleDelayedAction) {
   
   var bus = (optionalBus !== undefined) ? optionalBus : shop.Context.bus;
   
   var defaultHttpRequester = function defaultHttpRequester(orderText, successCallback, errorCallback) {
      $.ajax({
            type: 'POST',
            url: '/cgi-local/shop/postOrder.pl',
            data: orderText,
            success: successCallback,
            error: errorCallback
         });
   };
   
   var httpRequester = (optionalHttpRequester === undefined) ? defaultHttpRequester : optionalHttpRequester;
   var scheduleDelayedAction = (optionalScheduleDelayedAction === undefined) ? setTimeout : optionalScheduleDelayedAction;
   
   var MIN_POPUP_DISPLAY_TIME_IN_MILLIS = 2000;
   var IDLE = 'IDLE';
   var PENDING = 'PENDING';
   var PENDING_AFTER_MIN_POPUP_DISPLAY_TIME = 'PENDING_AFTER_MIN_POPUP_DISPLAY_TIME';
   var OK = 'OK';
   var FAILED = 'FAILED';
   
   var state = IDLE;
   
   var showErrorOverlay = function showErrorOverlay() {
      inProgressOverlay.hide();
      errorOverlay.show();
   };
   
   var showSuccessOverlay = function showSuccessOverlay() {
      inProgressOverlay.hide();
      successOverlay.show();
   };
   
   var minimumInProgressDurationPassed = function minimumInProgressDurationPassed() {
      switch(state) {
         case PENDING:  state = PENDING_AFTER_MIN_POPUP_DISPLAY_TIME;
                        break;
         
         case FAILED:   showErrorOverlay();
                        state = IDLE;
                        break;
                        
         case OK:       showSuccessOverlay();
                        state = IDLE;
                        break;
                        
         default:       shop.Context.log('minimum in progress duration passed but the state "' + state + '" is not correct.');
      }
   };
   
   
   var httpRequestCallback = function httpRequestCallback(actionToPerformIfInProgressDurationPassed, stateIfInProgressDurationNotPassed, jqXHR) {
      if (state === PENDING_AFTER_MIN_POPUP_DISPLAY_TIME) {
         actionToPerformIfInProgressDurationPassed();
         state = IDLE;
      } else {
         state = stateIfInProgressDurationNotPassed;
      }
   };

   var onHttpRequestSuccess = function onHttpRequestSuccess(data) {
      httpRequestCallback(showSuccessOverlay, OK, null);
   };
   
   var onHttpRequestError = function onHttpRequestError(jqXHR) {
      shop.Context.log(jqXHR.status + ' ' + jqXHR.statusText);
      httpRequestCallback(showErrorOverlay, FAILED, jqXHR);
    };
   
   var submit = function submit(orderText) {
      if (state === IDLE) {
         state = PENDING;
         inProgressOverlay.show();
         scheduleDelayedAction(minimumInProgressDurationPassed, MIN_POPUP_DISPLAY_TIME_IN_MILLIS);
         console.log(orderText);
         httpRequester(orderText, onHttpRequestSuccess, onHttpRequestError);
      } else {
         shop.Context.log('can not submit order because the current state "' + state + '" is not "' + IDLE + '"');
      }
   };
   
   [inProgressOverlay, successOverlay, errorOverlay].forEach(function(overlay) { overlay.hide(); });

   bus.subscribeToCommand(shop.topics.SUBMIT_ORDER, submit);
};
