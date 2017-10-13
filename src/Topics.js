/* global shop, assertNamespace */

require('./NamespaceUtils.js');

assertNamespace('shop.topics');

//                PUBLICATIONS

shop.topics.CURRENT_LANGUAGE = '/currentLanguage';

shop.topics.VISIBLE_TAB = '/visibleTab';

shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX = '/languageDependentText/';

//                COMMANDS

// data: the name of the tab that shall be visible
shop.topics.SET_VISIBLE_TAB = '/commands/setVisibleTab';

// data: the filename of the picture to show
shop.topics.SHOW_PICTURE = '/commands/showPicture';

// data: nothing
shop.topics.HIDE_PICTURE = '/commands/hidePicture';
