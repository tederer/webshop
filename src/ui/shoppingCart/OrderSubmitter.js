/* global shop, setTimeout, assertNamespace */

require('../../NamespaceUtils.js');
require('../../Context.js');
require('../../Topics.js');

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.OrderSubmitter = function OrderSubmitter() {
   
   var MIN_POPUP_DISPLAY_TIME_IN_MILLIS = 2000;
   var IDLE = 'IDLE';
   var PENDING = 'PENDING';
   var PENDING_AFTER_MIN_POPUP_DISPLAY_TIME = 'PENDING_AFTER_MIN_POPUP_DISPLAY_TIME';
   var OK = 'OK';
   var FAILED = 'FAILED';
   
   var state = IDLE;
   
   var hidePopup = function hidePopup() {
      console.log('hide popup');
   };
   
   var onMinPopupDisplayTimeExpired = function onMinPopupDisplayTimeExpired() {
      switch(state) {
         case PENDING:  state =  PENDING_AFTER_MIN_POPUP_DISPLAY_TIME;
                        break;
         
         case FAILED:
         case OK:       hidePopup();
                        // TODO show success message
                        state = IDLE;
                        break;
                        
         default:       console.log('min timeout reached in wrong state ' + state);
      }
   };
   
   var onAjaxSuccess = function onAjaxSuccess(data) {
      hidePopup();
      if (state === PENDING_AFTER_MIN_POPUP_DISPLAY_TIME) {
         // TODO show success message
         state = IDLE;
      } else {
         state = OK;
      }
   };
   
   var onAjaxError = function onAjaxError(jqXHR) {
      var errorMessage = jqXHR.status + ' ' + jqXHR.statusText;
      state = FAILED;
      hidePopup();
      // TODO show error message
      console.log(errorMessage);
   };
   
   this.submit = function submit(orderText) {
      if (state === IDLE) {
         state = PENDING;
         setTimeout(onMinPopupDisplayTimeExpired, MIN_POPUP_DISPLAY_TIME_IN_MILLIS);
         $.ajax({
            type: 'POST',
            url: '/cgi-bin/postOrder.pl',
            data: orderText,
            success: onAjaxSuccess,
            error: onAjaxError
         });
      }
   };
};
