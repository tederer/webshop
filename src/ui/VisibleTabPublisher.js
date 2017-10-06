/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

/**
 * The VisibleTabPublisher process a received state object and publishes the visible tab if its state changed.
 */
shop.ui.VisibleTabPublisher = function VisibleTabPublisher(optionalBus, optionalStateConsumer) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var currentState;
   
   var stateIsValid = function stateIsValid(state) {
      return state !== undefined && state.visibleTab !== undefined;
   };
   
   this.setNewState = function setNewState(newState) {
      if (stateIsValid(newState)) {
         if (currentState === undefined || currentState.visibleTab !== newState.visibleTab) {
            currentState = {visibleTab: newState.visibleTab};
            bus.publish(shop.topics.VISIBLE_TAB, currentState.visibleTab);
         }
      } else {
         bus.publish(shop.topics.VISIBLE_TAB, shop.Context.defaultVisibleTab);
      }
   };
};

