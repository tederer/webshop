/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('../../Context.js');
require('../../Topics.js');

assertNamespace('shop.ui.tablesetters');

/**
 * Every call of onTabContentChangedCallback() or a change of the associated language dependent texts
 * updates the following sub elements of the <div> determined by the selector provided in onTabContentChangedCallback().
 * 
 * Sub elements that get updates:
 *
 *    <th class="dateHeader">
 *    <th class="locationHeader">
 *    <th class="descriptionHeader">
 *
 * Associated language dependent texts:
 *
 *    'eventsTable.dateHeader'    
 *    'eventsTable.locationHeader' 
 *    'eventsTable.descriptionHeader'
 */
shop.ui.tablesetters.LanguageDependentTextInEventsTableSetter = function LanguageDependentTextInEventsTableSetter(optionalUiComponentProvider, optionalBus) {
   
   var date;
   var location;
   var description;
   var selectors = [];
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var uiComponentProvider = (optionalUiComponentProvider === undefined) ? defaultUiComponentProvider : optionalUiComponentProvider;
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var getFormattedText = function getFormattedText(text) {
      return (text !== undefined) ? text : '';
   };
   
   var updateTableHeaders = function updateTableHeaders() {
      selectors.forEach(function(selector) {
         uiComponentProvider(selector + ' .dateHeader').text(getFormattedText(date));
         uiComponentProvider(selector + ' .locationHeader').text(getFormattedText(location));
         uiComponentProvider(selector + ' .descriptionHeader').text(getFormattedText(description));
      });
   };
   
   var onDate = function onDate(text) {
      date = text;
      updateTableHeaders();
   };
   
   var onLocation = function onLocation(text) {
      location = text;
      updateTableHeaders();
   };
   
   var onDescription = function onDescription(text) {
      description = text;
      updateTableHeaders();
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      if (selectors.indexOf(selector) === -1) {
         selectors[selectors.length] = selector;
      }
      updateTableHeaders();
   };
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'eventsTable.dateHeader', onDate);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'eventsTable.locationHeader', onLocation);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'eventsTable.descriptionHeader', onDescription);
};

