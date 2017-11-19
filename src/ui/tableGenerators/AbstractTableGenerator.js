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

   this.addText = function addText(text) {
      intentations++;
      this.append('<td>' + ((text === undefined) ? '&nbsp;' : text) + '</td>');
      intentations--;
   };
   
   this.startRow = function startRow() {
      intentations++;
      this.append('<tr>');
   };
   
   this.endRow = function endRow() {
      this.append('</tr>');
      intentations--;
   };
   
   this.getContent = function getContent() {
      return content;
   };
};
