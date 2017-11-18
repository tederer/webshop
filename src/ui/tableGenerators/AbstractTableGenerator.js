/* global shop, common, assertNamespace */

require('../../NamespaceUtils.js');

assertNamespace('shop.ui.tablegenerators');

shop.ui.tablegenerators.AbstractTableGenerator = function AbstractTableGenerator() {

   var CRLF = '\r\n';
   var intentationAsString = '   ';
   var intentations;
   var content;

   this.reset = function reset() {
      intentations = 0;
      content = '';
   };
   
   this.incrementIntentation = function incrementIntentation() {
      intentations++;
   };
   
   this.decrementIntentation = function decrementIntentation() {
      intentations--;
   };
   
   this.append = function(text) {
      var line = '';
      for (var i = 0; i < intentations; i++) {
         line += intentationAsString;
      }
      content += line + text + CRLF;
   };
   
   this.addHeader = function addHeader(classId) {
      intentations++;
      this.append('<th class="' + classId + '"></th>');
      intentations--;
   };

   this.getContent = function getContent() {
      return content;
   };
};
