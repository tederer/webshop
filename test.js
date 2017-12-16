require('./src/ui/shoppingCart/EmailTextGenerator.js');

var generator = new shop.shoppingCart.EmailTextGenerator();

   var cartData = {
      "productsInShoppingCart":[ {"productId": "AerangisEllisii",          "name": "Aerangis ellisii",         "quantity": 5,    "price": 2},
                                 {"productId": "CattleyaWalkerianaAlba",   "name": "Cattleya walkeriana alba", "quantity": 10,   "price": 2.5},
                                 {"productId": "zubehoer_Topf12cm",        "name": "Topf 12cm",                "quantity": 1,    "price": 1.2}],
      "shippingCostsText": "Versandkosten",
      "totalCostsText":    "Summe",
      "shippingCosts":     7.6,
      "totalCosts":        127.6,
      "tableHeaders":      {}
   };
   
   var customerData = {
      "firstname":            "Daisy",
      "lastname":             "Duck",
      "email":                "daisy@duck.com",
      "countryOfDestination": "ES",
      "comment":              "Hello world!"
   }
   console.log(generator.generateCartContentAsText(cartData));
   console.log('------------------------------------------');
   console.log(generator.generateCustomerDataAsText(customerData));
   