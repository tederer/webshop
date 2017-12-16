/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');

assertNamespace('shop.shoppingCart');

shop.shoppingCart.EmailTextGenerator = function EmailTextGenerator() {
   
   var CRLF = '\r\n';
   var EUR = 'EUR';
   
   var countries = {
      AT: { en: 'Austria',          de: 'Österreich'},
      BE: { en: 'Belgium',          de: 'Belgien'},
      BG: { en: 'Bulgaria',         de: 'Bulgarien'},
      CY: { en: 'Cyprus',           de: 'Zypern'},
      CZ: { en: 'Czech Republic',   de: 'Tschechien'},
      DE: { en: 'Germany',          de: 'Deutschland'},
      DK: { en: 'Denmark',          de: 'Dänemark'},
      EE: { en: 'Estonia',          de: 'Estland'},
      ES: { en: 'Spain',            de: 'Spanien'},
      FI: { en: 'Finland',          de: 'Finnland'},
      FR: { en: 'France',           de: 'Frankreich'},
      GB: { en: 'United Kingdom',   de: 'Vereinigtes Königreich'},
      GR: { en: 'Greece',           de: 'Griechenland'},
      HR: { en: 'Croatia',          de: 'Kroatien'},
      HU: { en: 'Hungary',          de: 'Ungarn'},
      IE: { en: 'Ireland',          de: 'Irland'},
      IT: { en: 'Italy',            de: 'Italien'},
      LT: { en: 'Lithuania',        de: 'Litauen'},
      LU: { en: 'Luxembourg',       de: 'Luxemburg'},
      LV: { en: 'Latvia',           de: 'Lettland'},
      MT: { en: 'Malta',            de: 'Malta'},
      NL: { en: 'Netherlands',      de: 'Niederlande'},
      PL: { en: 'Poland',           de: 'Polen'},
      PT: { en: 'Portugal',         de: 'Portugal'},
      RO: { en: 'Romania',          de: 'Rumänien'},
      SE: { en: 'Sweden',           de: 'Schweden'},
      SI: { en: 'Slovenia',         de: 'Slowenien'},
      SK: { en: 'Slovakia',         de: 'Slowakei'}
   };
   
   var MIN_SPACE_COUNT_BETWEEN_COLUMNS = 3;
   
   var toTableRow = function toTableRow(product) {
      return {
         quantity:   '' + product.quantity,
         name:       product.name,
         price:      (product.price * product.quantity).toFixed(2) + ' ' + EUR
      };
   };
   
   var toTextLength = function toTextLength(tableRow) {
      var result = [];
      var keys = Object.keys(tableRow);
      for (var index = 0; index < keys.length; index++) {
         result.push(tableRow[keys[index]].length);
      }
      return result;
   };
   
   var maxColumnTextLength = function maxColumnTextLength(previousColumnTextLengths, currentColumnTextLengths) {
      var result = [];
      for(var index = 0; index < previousColumnTextLengths.length; index++) {
         result.push((previousColumnTextLengths[index] > currentColumnTextLengths[index]) ? previousColumnTextLengths[index] : currentColumnTextLengths[index]);
      }
      return result;
   };
   
   var calculateColumnWidths = function calculateColumnWidths(tableRows) {
      return tableRows.map(toTextLength).reduce(maxColumnTextLength);
   };
   
   var addPadding = function addPadding(width) {
      return width + MIN_SPACE_COUNT_BETWEEN_COLUMNS;
   };
   
   var adjustTextWidth = function adjustTextWidth(text, expectedLength, insertSpacesOnTheLeftSide) {
      var result = text;
      while (result.length < expectedLength) {
         if (insertSpacesOnTheLeftSide) {
            result = ' ' + result;
         } else {
            result += ' ';
         }
      }
      return result;
   };
   
   var addSpacesToHaveSameColumnLengths = function addSpacesToHaveSameColumnLengths(columnWidths, product) {
      return {
         quantity:   adjustTextWidth(product.quantity, columnWidths[0]),
         name:       adjustTextWidth(product.name, columnWidths[1]),
         price:      adjustTextWidth(product.price, columnWidths[2], true)
      };
   };
   
   var getProductAsText = function getProductAsText(product) {
      return product.quantity + product.name + product.price;
   };
   
   var concat = function concat(previous, next) {
      var previousIsString = typeof(previous) === 'string' || previous instanceof String;
      return (previousIsString ? previous : getProductAsText(previous)) + CRLF + getProductAsText(next);
   };
   
   // cartData example:
   // {
   //    "productsInShoppingCart":[ {"productId": "AerangisEllisii",          "name": "Aerangis ellisii",         "quantity": 5,    "price": 2},
   //                               {"productId": "CattleyaWalkerianaAlba",   "name": "Cattleya walkeriana alba", "quantity": 10,   "price": 2.5},
   //                               {"productId": "zubehoer_Topf12cm",        "name": "Topf 12cm",                "quantity": 1,    "price": 1.2}],
   //    "shippingCostsText": "Versandkosten",
   //    "totalCostsText":    "Summe",
   //    "tableHeaders":      {}
   // }
   this.generateCartContentAsText = function generateCartContentAsText(cartData) {
      var emailText = '';
      
      var table = cartData.productsInShoppingCart.map(toTableRow);
      var columnWidths = calculateColumnWidths(table).map(addPadding);
      var productsAsText = table.map(addSpacesToHaveSameColumnLengths.bind(null, columnWidths)).reduce(concat);
      var shippingCostsAsText =  cartData.shippingCostsText + ': ' + 
                                    (cartData.shippingCosts ? cartData.shippingCosts.toFixed(2) + ' ' + EUR : '');
      var totalCostsAsText =     cartData.totalCostsText + ': ' + 
                                    (cartData.totalCosts ? cartData.totalCosts.toFixed(2) + ' ' + EUR : '');
      return productsAsText + CRLF + CRLF + shippingCostsAsText + CRLF + CRLF + totalCostsAsText;
   };
   
   // customerData example:
   // {
   //    "firstname":            "Daisy",
   //    "lastname":             "Duck",
   //    "email":                "daisy@duck.com",
   //    "countryOfDestination": "Ireland",
   //    "comment":              "Hello world!"
   // }
   this.generateCustomerDataAsText = function generateCustomerDataAsText(customerData) {
      var countryCode = customerData.countryOfDestination;
      
      return     'Vorname/firstname:    ' + customerData.firstname            + CRLF +
                 'Nachname/lastname:    ' + customerData.lastname             + CRLF +
                 'EMail:                ' + customerData.email                + CRLF +
                 'Zielland/destination: ' + countries[countryCode].de + '/' + countries[countryCode].en + CRLF +
                 'Kommentar/comment:    ' + customerData.comment              + CRLF;
   };
};
