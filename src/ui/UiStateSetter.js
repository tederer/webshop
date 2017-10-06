/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');

assertNamespace('shop.ui');

/**
 * The UiStateSetter provides a new state object to the state consumer when a shop.topics.SET_VISIBLE_TAB command was sent.
 */
shop.ui.UiStateSetter = function UiStateSetter(stateConsumer, optionalBus ) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var state = {};
   
   var onSetVisibleTab = function onSetVisibleTab(tabName) {
      state.visibleTab = tabName;
      stateConsumer(state);
   };
   
   bus.subscribeToCommand(shop.topics.SET_VISIBLE_TAB, onSetVisibleTab);
};

