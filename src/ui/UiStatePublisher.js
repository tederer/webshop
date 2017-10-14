/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

/**
 * The UiStatePublisher process a received state object and publishes 
 * the visible tab and the shown picture if its state changed.
 */
shop.ui.UiStatePublisher = function UiStatePublisher(optionalBus) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var currentState;
   
   var stateIsValid = function stateIsValid(state) {
      return state !== undefined && state.visibleTab !== undefined;
   };
   
   var publishVisibleTab =  function publishVisibleTab(tabName) {
      bus.publish(shop.topics.VISIBLE_TAB, tabName);
   };
   
   var publishShownPicture =  function publishShownPicture(filename) {
      bus.publish(shop.topics.SHOWN_PICTURE, filename);
   };
   
   this.setNewState = function setNewState(newState) {
      if (stateIsValid(newState)) {
         if (currentState === undefined) {
            currentState = {};
         }
         
         if (currentState.visibleTab !== newState.visibleTab) {
            currentState.visibleTab = newState.visibleTab;
            publishVisibleTab(currentState.visibleTab);
         }
         if (currentState.shownPicture !== newState.shownPicture) {
            currentState.shownPicture = newState.shownPicture;
            publishShownPicture(newState.shownPicture);
         }
      } else {
         publishVisibleTab(shop.Context.defaultVisibleTab);
         publishShownPicture(undefined);
      }
   };
};

