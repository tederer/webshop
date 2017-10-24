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
   var currentLanguage;
   
   var notifyStateConsumer = function notifyStateConsumer() {
      var state = {};
      state.visibleTab = visibleTab;
      if (shownPicture !== undefined) {
         state.shownPicture = shownPicture;
      }
      state.language = currentLanguage;
      stateConsumer(state);
   };
   
   var onSetVisibleTabCommand = function onSetVisibleTabCommand(tabName) {
      if (visibleTab === undefined || visibleTab !== tabName) {
         visibleTab = tabName;
         notifyStateConsumer();
      }
   };
   
   var onShowPictureCommand = function onShowPictureCommand(filename) {
      if (shownPicture === undefined || shownPicture !== filename) {
         shownPicture = filename;
         notifyStateConsumer();
      }
   };
   
   var onHidePictureCommand = function onHidePictureCommand() {
      if (shownPicture !== undefined) {
         shownPicture = undefined;
         notifyStateConsumer();
      }
   };
   
   var onVisibleTabPublication = function onVisibleTabPublication(tabName) {
      visibleTab = tabName;
      notifyStateConsumer();
   };
   
   var onShownPicturePublication = function onShownPicturePublication(relativeFilePath) {
      shownPicture = relativeFilePath;
      notifyStateConsumer();
   };
   
   var onCurrentLanguagePublication = function onCurrentLanguagePublication(language) {
      currentLanguage = language;
      notifyStateConsumer();
   };
   
   bus.subscribeToPublication(shop.topics.VISIBLE_TAB, onVisibleTabPublication);
   bus.subscribeToPublication(shop.topics.SHOWN_PICTURE, onShownPicturePublication);
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguagePublication);
   
   bus.subscribeToCommand(shop.topics.SET_VISIBLE_TAB, onSetVisibleTabCommand);
   bus.subscribeToCommand(shop.topics.SHOW_PICTURE, onShowPictureCommand);
   bus.subscribeToCommand(shop.topics.HIDE_PICTURE, onHidePictureCommand);
};

