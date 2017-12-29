/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');
require('./AbstractTableGenerator.js');

assertNamespace('shop.ui');

/**
 * The EventsTableGenerator takes an object containing the events configuration and transform it
 * into a HTML table. 
 *
 * example configuration:
 *
 *   {
 *      "events": [
 *         { 
 *             date:          "17. - 25. Februar 2018",
 *             location:      "Hirschstetten",
 *             description:   "Internationale Ausstellung",
 *             url:           "http://www.orchideenausstellung-wien.at"
 *         },
 *         {
 *             date:          "7. April 2018",
 *             location:      "Guntramsdorf - Austropalm",
 *             description:   "Exot. Pflanzenmarkt"
 *         }
 *      ]
 *   }
 */
shop.ui.tablegenerators.EventsTableGenerator = function EventsTableGenerator() {
   var thisInstance = this;
   var configKey;
   
   var getDescription = function getDescription(description, url) {
      return url ? '<a href="' + url + '" target="_blank">' + description + '</a>' : description;
   };
   
   var addRow = function addRow(event) {
      thisInstance.startRow();
      thisInstance.addText(event.date);
      thisInstance.addText(event.location);
      thisInstance.addText(getDescription(event.description, event.url));
      thisInstance.endRow();
   };
   
   var addCaptions = function addCaptions() {
      thisInstance.startRow();
      thisInstance.addHeader('dateHeader');
      thisInstance.addHeader('locationHeader');
      thisInstance.addHeader('descriptionHeader');
      thisInstance.endRow();
   };
   
   this.generateTable = function generateTable(configurationId, config) {
      configKey = configurationId;
      
      thisInstance.reset();
      thisInstance.append('<table class="alternierendeZeilenFarbe ersteSpalteZentriert dritteSpalteZentriert">');
      addCaptions();
      config.events.forEach(function(event) { 
         addRow(event);
      });  
      thisInstance.append('</table>');
      return thisInstance.getContent();
   };
};

shop.ui.tablegenerators.EventsTableGenerator.prototype = new shop.ui.tablegenerators.AbstractTableGenerator();
