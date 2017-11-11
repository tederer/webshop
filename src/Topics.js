/* global shop, assertNamespace */

require('./NamespaceUtils.js');

assertNamespace('shop.topics');

//                PUBLICATIONS

// data: a value defined in shop.Language
shop.topics.CURRENT_LANGUAGE = '/currentLanguage';

// data: the name of the visible tab
shop.topics.VISIBLE_TAB = '/visibleTab';

// data: the path (relative to the base URL of the shop) of the picture to show
shop.topics.SHOWN_PICTURE = '/shownPicture';

shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX = '/languageDependentText/';

// data: an array of { productId: <String>, quantity: <Integer> }
shop.topics.SHOPPING_CART_CONTENT = '/shoppingCartContent';

// data: the code (ISO 3166 Alpha 2) of the country where the order should be shipped to.
// https://de.wikipedia.org/wiki/ISO-3166-1-Kodierliste
shop.topics.COUNTRY_OF_DESTINATION = '/countryOfDestination';

//                COMMANDS

// data: the name of the tab that shall be visible
shop.topics.SET_VISIBLE_TAB = '/commands/setVisibleTab';

shop.topics.SET_CURRENT_LANGUAGE = '/commands/setCurrentLanguage';

// data: the path (relative to the base URL of the shop) of the picture to show
shop.topics.SHOW_PICTURE = '/commands/showPicture';

// data: nothing
shop.topics.HIDE_PICTURE = '/commands/hidePicture';

// data: an object {productId: <String>, quantity: <integer>}
shop.topics.ADD_PRODUCT_TO_SHOPPING_CART = '/commands/addProductToShoppingCart';

// data: the product ID of the product to remove
shop.topics.REMOVE_PRODUCT_FROM_SHOPPING_CART = '/commands/removeProductFromShoppingCart';

// data: the ID of the UI component whose content was changed
shop.topics.ORDER_FORM_ELEMENT_CHANGED = '/commands/orderFormElementChanged';
