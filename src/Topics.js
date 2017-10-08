/* global shop, assertNamespace */

require('./NamespaceUtils.js');

assertNamespace('shop.topics');

//                PUBLICATIONS

shop.topics.CURRENT_LANGUAGE = '/currentLanguage';

shop.topics.VISIBLE_TAB = '/visibleTab';

shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX = '/languageDependentText/';

//                COMMANDS

shop.topics.SET_VISIBLE_TAB = '/commands/setVisibleTab';
