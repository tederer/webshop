/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

/**
 * The UiStatePublisher process a received state object and publishes 
 * the visible tab and the shown picture if its state changed.
 *
 * {
 *    supportedTabs:       array of supported tabs
 *    supportedLanguages:  array of supported languages
 *    defaultTab:          
 *    defaultLanguage:
 * }
 */
shop.ui.UiStatePublisher = function UiStatePublisher(config, optionalBus) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var currentState;
   
   var languageIsValid = function languageIsValid(state) {
      var valid = false;
      for (var index = 0; !valid && index < config.supportedLanguages.length; index++) {
         valid = config.supportedLanguages[index] === state.language;
      }
      return valid;
   };
   
   var visibleTabIsValid = function visibleTabIsValid(state) {
      var valid = false;
      for (var index = 0; !valid && index < config.supportedTabs.length; index++) {
         valid = config.supportedTabs[index] === state.visibleTab;
      }
      return valid;
    };
   
   var stateIsValid = function stateIsValid(state) {
      return state !== undefined && visibleTabIsValid(state) && languageIsValid(state);
   };
   
   var publishVisibleTab =  function publishVisibleTab(tabName) {
      bus.publish(shop.topics.VISIBLE_TAB, tabName);
   };
   
   var publishShownPicture =  function publishShownPicture(filename) {
      bus.publish(shop.topics.SHOWN_PICTURE, filename);
   };
   
   var publishCurrentLanguage =  function publishCurrentLanguage(language) {
      bus.publish(shop.topics.CURRENT_LANGUAGE, language);
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
         
         if (currentState.language !== newState.language) {
            currentState.language = newState.language;
            publishCurrentLanguage(newState.language);
         }
      } else {
         publishVisibleTab(config.defaultTab);
         publishShownPicture(undefined);
         publishCurrentLanguage(config.defaultLanguage);
      }
   };
};

