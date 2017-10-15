/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('../Topics.js');

assertNamespace('shop.ui');

/**
 * The UiStateSetter provides a new state object to the state consumer when a shop.topics.SET_VISIBLE_TAB command was sent.
 */
shop.ui.UiStateSetter = function UiStateSetter(stateConsumer, optionalBus ) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var visibleTab;
   var shownPicture;
   
   var notifyStateConsumer = function notifyStateConsumer() {
      var state = {};
      state.visibleTab = visibleTab;
      if (shownPicture !== undefined) {
         state.shownPicture = shownPicture;
      }
      stateConsumer(state);
   };
   
   var onVisibleTab = function onVisibleTab(tabName) {
      visibleTab = tabName;
   };
   
   var onSetVisibleTab = function onSetVisibleTab(tabName) {
      if (visibleTab === undefined || visibleTab !== tabName) {
         visibleTab = tabName;
         notifyStateConsumer();
      }
   };
   
   var onShowPicture = function onShowPicture(filename) {
      if (shownPicture === undefined || shownPicture !== filename) {
         shownPicture = filename;
         notifyStateConsumer();
      }
   };
   
   var onShownPicture = function onShownPicture(relativeFilePath) {
      shownPicture = relativeFilePath;
   };
   
   var onHidePicture = function onHidePicture() {
      if (shownPicture !== undefined) {
         shownPicture = undefined;
         notifyStateConsumer();
      }
   };
   
   bus.subscribeToPublication(shop.topics.VISIBLE_TAB, onVisibleTab);
   bus.subscribeToPublication(shop.topics.SHOWN_PICTURE, onShownPicture);
   
   bus.subscribeToCommand(shop.topics.SET_VISIBLE_TAB, onSetVisibleTab);
   bus.subscribeToCommand(shop.topics.SHOW_PICTURE, onShowPicture);
   bus.subscribeToCommand(shop.topics.HIDE_PICTURE, onHidePicture);
};

