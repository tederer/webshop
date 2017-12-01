/* global assertNamespace:true, myNamespace:true, global, window */

var recursiveAssertObject = function recursiveAssertObject(parentObject, objects) {
   
   if (parentObject[objects[0]] === undefined) {
      parentObject[objects[0]] = {};  
   }
   
   var newParentObject = parentObject[objects[0]];
   
   if (objects.length > 1) {
      recursiveAssertObject(newParentObject, objects.slice(1));
   }
};

assertNamespace = function assertNamespace(namespace) {
   var rootObject = (typeof window === 'undefined') ? global : window;
   var objects = namespace.split('.');
   recursiveAssertObject(rootObject, objects);
};
/* global shop, common, assertNamespace */

assertNamespace('shop.configuration');

/**
 * constructor for the AbstractContentLoader.
 *
 * Derived Object have to override:
 *    1) onContentLoaded
 *    2) onContentLoadingFailed
 *
 * To start the process of downloading content, call the load function.
 */
shop.configuration.AbstractContentLoader = function AbstractContentLoader(optionalresourceProviderFactoryFunction) {
   
   var defaultresourceProviderFactoryFunction = function defaultresourceProviderFactoryFunction(configBaseUrl) {
      return new shop.configuration.ResourceProvider(configBaseUrl);
   };
   
   var resourceProviderFactoryFunction = (optionalresourceProviderFactoryFunction === undefined) ? 
                                             defaultresourceProviderFactoryFunction : optionalresourceProviderFactoryFunction;
   
   this.onContentLoaded = function onContentLoaded(name, content) {
      shop.Context.log('Derived object does not override onContentLoaded() of AbstractContentLoader!');
   };
   
   this.onContentLoadingFailed = function onContentLoadingFailed(name, error) {
      shop.Context.log('Derived object does not override onContentLoaded() of AbstractContentLoader!');
   };
   
   /**
    * Starts the download process.
    *
    * contentBaseUrl    the base URL from which the content shall get downloaded (e.g. http://192.168.1.1/content)
    * names             an array of strings that define the names of the files whose content shall be downloaded (e.g. [ 'plants_template.html', 'plants_config.json' ])
    */
   this.load = function load(contentBaseUrl, names) {
      var resourceProvider = resourceProviderFactoryFunction(contentBaseUrl);
      
      for (var index = 0; index < names.length; index++) {
         var name = names[index];
         resourceProvider.get(name)
            .then(this.onContentLoaded.bind(this, name), this.onContentLoadingFailed.bind(this, name));
      }
   };
};

/* global common, assertNamespace */

assertNamespace('common.infrastructure.bus');

common.infrastructure.bus.Bus = (function () {

   var Bus = function Bus() {
      
      var publicationCallbacksPerTopic = {};
      var lastPublishedDataPerTopic = {};
      var commandCallbacksPerTopic = {};

      var add = function add(callback) {
         return { 
            relatedTo: function relatedTo(topic) {
               return {
                  to: function to(map) {
                     if (map[topic] === undefined) {
                        map[topic] = [];
                     }
                     var set = map[topic];
                     set[set.length] = callback;
                  }
               };
            }
         };
      }; 

      var invokeAllCallbacksOf = function invokeAllCallbacksOf(map) {
         return {
            ofType: function ofType(topic) {
               return {
                  withData: function withData(data) {
                     if (map[topic] !== undefined) {
                        map[topic].forEach(function(callback) {
                           callback(data);
                        });
                     }
                  }
               };
            }
         };
      };
      
      this.subscribeToPublication = function subscribeToPublication(topic, callback) {
         if(topic && (typeof callback === 'function')) {
            add(callback).relatedTo(topic).to(publicationCallbacksPerTopic);
            
            var lastPublishedData = lastPublishedDataPerTopic[topic];
            
            if (lastPublishedData) {
               callback(lastPublishedData);
            }
         }
      };
      
      this.subscribeToCommand = function subscribeToCommand(topic, callback) {
         if (topic && (typeof callback === 'function')) {
            add(callback).relatedTo(topic).to(commandCallbacksPerTopic);
         }
      };
      
      this.publish = function publish(topic, data) {
         lastPublishedDataPerTopic[topic] = data;
         invokeAllCallbacksOf(publicationCallbacksPerTopic).ofType(topic).withData(data);
      };
      
      this.sendCommand = function sendCommand(topic, data) {
         invokeAllCallbacksOf(commandCallbacksPerTopic).ofType(topic).withData(data);
      };
   };
   
   return Bus;
}());
/* global shop, common, assertNamespace */

assertNamespace('shop');

shop.Context = {
   bus: new common.infrastructure.bus.Bus(),
   log: function(message) { console.log(message); }
};

/* global shop, common, assertNamespace */

assertNamespace('shop.configuration');

/**
 * A HtmlContentLoader loads HTML content and publishes the content on the bus.
 * 
 * To start loading, call load() and provide the names of the files (without file extension) that should get loaded.
 * 
 * Content topic: /htmlContent/<language>/<contentName>
 *
 * example: The german content of "food" will get published on the topic "/htmlContent/de/food".
 */
shop.configuration.HtmlContentLoader = function HtmlContentLoader(downloadBaseUrl, languages, optionalBus) {
   
   var FILE_EXTENSION = '.html';
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var getTopicForName = function getTopicForName(name) {
      return '/htmlContent/' + name.substring(0, name.length - FILE_EXTENSION.length);
   };
   
   this.onContentLoaded = function onContentLoaded(name, content) {
      bus.publish(getTopicForName(name), content);
   };
   
   this.onContentLoadingFailed = function onContentLoadingFailed(name, error) {
      bus.publish(getTopicForName(name), new Error(error));
   };
   
   this.load = function load(names) {
      var namesWithLanguageAndFileExtension = [];
      
      for (var languageIndex = 0; languageIndex < languages.length; languageIndex++) {
         for (var nameIndex = 0; nameIndex < names.length; nameIndex++) {
            namesWithLanguageAndFileExtension[namesWithLanguageAndFileExtension.length] = languages[languageIndex] + '/' + names[nameIndex] + FILE_EXTENSION;
         }
      }
      shop.configuration.HtmlContentLoader.prototype.load.call(this, downloadBaseUrl, namesWithLanguageAndFileExtension);
   };
};



/* global shop, common, assertNamespace */

assertNamespace('shop.configuration');

/**
 * A JsonContentLoader loads JSON content and publishes the content on the bus.
 * 
 * To start loading, call load() and provide the names of the files (without file extension) that should get loaded.
 * 
 * Content topic: /jsonContent/<language>/<contentName>
 *
 * example: The german content of "food" will get published on the topic "/jsonContent/de/food".
 */
shop.configuration.JsonContentLoader = function JsonContentLoader(downloadBaseUrl, languages, optionalBus) {
   var FILE_EXTENSION = '.json';
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var getTopicForName = function getTopicForName(name) {
      return '/jsonContent/' + name.substring(0, name.length - FILE_EXTENSION.length);
   };
   
   this.onContentLoaded = function onContentLoaded(name, content) {
      var data;
      
      try {
         data = JSON.parse(content);
      } catch (error) {
         data = new Error(error);
      }
      bus.publish(getTopicForName(name), data);
   };
   
   this.onContentLoadingFailed = function onContentLoadingFailed(name, error) {
      bus.publish(getTopicForName(name), new Error(error));
   };
   
   this.load = function load(names) {
      var namesWithLanguageAndFileExtension = [];
      
      for (var languageIndex = 0; languageIndex < languages.length; languageIndex++) {
         for (var nameIndex = 0; nameIndex < names.length; nameIndex++) {
            namesWithLanguageAndFileExtension[namesWithLanguageAndFileExtension.length] = languages[languageIndex] + '/' + names[nameIndex] + FILE_EXTENSION;
         }
      }
      shop.configuration.JsonContentLoader.prototype.load.call(this, downloadBaseUrl, namesWithLanguageAndFileExtension);
   };
};



/* global shop, assertNamespace */

assertNamespace('shop');

shop.Language = {
   DE: 'de',
   EN: 'en'
};
/* global shop, common, assertNamespace */

assertNamespace('shop');

/**
 * The load() function downloads the configuration file languageDependentTexts.json from configBaseUrl 
 * and publishes the texts of this file in the current language on the topics /languageDependentText/<key>.
 *
 * format of the configuration file:
 * {
 *   <key>: { <language>: <text>, <language>: <text>, ... } 
 *   ...
 * }
 * 
 * <key>       a unique key of a text
 * <language>  one of the languages in shop.Language (e.g. "en", "de")
 * <text>      the text in the language
 *
 * example:
 *
 * {
 *  "button1": { "de": "Anleitungen", "en": "tutorials" }, 
 *  "button2": { "de": "Kontakt", "en": "contact" } 
 * }
 */
shop.LanguageDependentTexts = function LanguageDependentTexts(configBaseUrl, optionalBus, optionalResourceProviderFactoryFunction) {

   var CONFIG_NAME = 'languageDependentTexts.json';
   var config;
   var configKeys;
   var currentLanguage;
   var lastPublishedLanguage;
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var defaultResourceProviderFactoryFunction = function defaultResourceProviderFactoryFunction(baseUrl) {
      return new shop.configuration.ResourceProvider(baseUrl);
   };
   
   var resourceProviderFactoryFunction = (optionalResourceProviderFactoryFunction === undefined) ? 
                                             defaultResourceProviderFactoryFunction : optionalResourceProviderFactoryFunction;
   
   var updatePublications = function updatePublications() {
      if (config !== undefined && currentLanguage !== undefined && lastPublishedLanguage !== currentLanguage) {
         for (var index = 0; index < configKeys.length; index++) {
            bus.publish(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + configKeys[index], config[configKeys[index]][currentLanguage]);
         }
         lastPublishedLanguage = currentLanguage;
      }
   };
   
   var onConfigLoaded = function onConfigLoaded(content) {
      try {
         config = JSON.parse(content);
         configKeys = Object.keys(config);
         updatePublications();
      } catch(e) {
         shop.Context.log(e);
      }
   };
   
   var onCurrentLanguageChanged = function onCurrentLanguageChanged(newCurrentLanguage) {
      currentLanguage = newCurrentLanguage;
      updatePublications();
   };
   
   this.load = function load() {
      bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguageChanged);
      var resourceProvider = resourceProviderFactoryFunction(configBaseUrl);
      resourceProvider.get(CONFIG_NAME).then(onConfigLoaded, shop.Context.log);
   };
};


/* global common, assertNamespace */

assertNamespace('common');

var promiseCount = 0;
/**
 * constructor for the Promise.
 */
common.Promise = function Promise(executor) {

   var state = 'pending';
   var doNothing = function doNothing(data) {};
   var resolveCallback;
   var rejectCallback;
   var data;
   var error;
   var id = ++promiseCount;
   
   executor(
      function(d) { 
         data = d;
         state = 'fulfilled';
         if (resolveCallback !== undefined) {
            resolveCallback(data);
         }
      }, 
      function(err) { 
         error = err; 
         state = 'rejected';
         if (rejectCallback !== undefined) {
            rejectCallback(data);
         }
      });
   
   this.then = function then(onFulfilledAction, onRejectedAction) {
      
      return new common.Promise(function(resolve, reject) {

         var doResolve = function doResolve() {
            try {
               var result = onFulfilledAction(data);
               resolve(result);
            } catch(error) {
               reject(error);
            }
         };
         
         var doReject = function doReject() {
            if (onRejectedAction !== undefined) {
               try {
                  var result = onRejectedAction(error);
                  resolve(result);
               } catch(error) {
                  reject(error);
               }
            } else {
               reject(error);
            }
         };
         
         if (state === 'fulfilled') {
            doResolve();
         } else if (state === 'rejected') {
            doReject();
         } else { // pending state
            resolveCallback = function() {
               doResolve();
            };
            rejectCallback = function() {
               doReject();
            };
         }
      });
   };
};
/* global window */

/*
 * Mocking the global function require, which gets used by node.js to 
 * load necessary modules, is necessary because on the webpage the modules
 * get loaded via <script> tags and the require function does not exist there.
*/
window.require = function(filename) {};
/* global shop, common, assertNamespace */

assertNamespace('shop.configuration');

/**
 * constructor for the ResourceProvider.
 */
shop.configuration.ResourceProvider = function ResourceProvider(configBaseUrl) {
   
   this.get = function get(name) {
      var url = configBaseUrl + '/' + name;
      
      var executor = function executor(fulfill, reject) {
         $.ajax(url, {
            dataType: 'text',
            success: function(data) {
               fulfill(data);
               },
            error: function(jqXHR) {
               var errorMessage = 'failed to download ' + url + ': ' + jqXHR.status + ' ' + jqXHR.statusText;
               reject(errorMessage);
               }
            });
      };
      
      return new common.Promise(executor);
   };
};

/* global shop, common, assertNamespace */

assertNamespace('shop.configuration');

shop.ShoppingCart = function ShoppingCart(optionalBus) {
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var products = [];
   
   var getIndexOfProduct = function getIndexOfProduct(productId) {
      var result;
      for (var index = 0; result === undefined && index < products.length; index++) {
         if (products[index].productId === productId) {
            result = index;
         }
      }
      return result;
   };
   
   var removeProduct = function removeProduct(productId) {
      var indexToRemove = getIndexOfProduct(productId);
      products.splice(indexToRemove, 1);
   };
   
   var addProduct = function addProduct(productId, quantity) {
      var productIndex = getIndexOfProduct(productId);
      if (productIndex === undefined) {
         productIndex = products.length;
         products[productIndex] = {productId: productId, quantity: quantity};
      } else {
         products[productIndex].quantity += quantity;
      }
      if (products[productIndex].quantity < 1) {
         removeProduct(productId);
      }
   };
   
   var publishCartContent = function publishCartContent() {
      bus.publish(shop.topics.SHOPPING_CART_CONTENT, products);
   };
   
   var onAddProductToShoppingCart = function onAddProductToShoppingCart(data) {
      addProduct(data.productId, data.quantity);
      publishCartContent();
   };
   
   var onRemoveProductFromShoppingCart = function onRemoveProductFromShoppingCart(productId) {
      removeProduct(productId);
      publishCartContent();
   };
   
   bus.publish(shop.topics.SHOPPING_CART_CONTENT, []);
   bus.subscribeToCommand(shop.topics.ADD_PRODUCT_TO_SHOPPING_CART, onAddProductToShoppingCart);
   bus.subscribeToCommand(shop.topics.REMOVE_PRODUCT_FROM_SHOPPING_CART, onRemoveProductFromShoppingCart);
};

/* global shop, assertNamespace */

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

// data: nothing
shop.topics.USER_CLICKED_SUBMIT_ORDER_BUTTON = '/commands/userClickedSubmitOrderButton';

/* global shop, assertNamespace */

assertNamespace('shop.ui');

/**
 * Derived objects have to:
 *    *) override getSelector
 *    *) override onLanguageChanged (defined in AbstractLanguageDependentComponent)
 *    *) call the initialize (defined in AbstractLanguageDependentComponent)
 */
shop.ui.AbstractHideableLanguageDependentComponent = function AbstractHideableLanguageDependentComponent() {
   
   this.getSelector = function getSelector() {
      shop.Context.log('Subclass does not override getSelector() in AbstractHideableLanguageDependentComponent!');
   };
   
   this.show = function show() {
      $(this.getSelector()).css('visibility', 'visible');
   };
   
   this.hide = function hide() {
      $(this.getSelector()).css('visibility', 'hidden');
   };
};
   

/* global shop, assertNamespace */

assertNamespace('shop.ui');

/**
 * Derived objects have to call the initialize method!
 */
shop.ui.AbstractLanguageDependentComponent = function AbstractLanguageDependentComponent(optionalBus) {
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   this.onLanguageChanged = function onLanguageChanged(newLanguage) {
      shop.Context.log('Derived object does not override onLanguageChanged() in AbstractLanguageDependentComponent!');
   };
   
   this.initialize = function initialize() {
      bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, this.onLanguageChanged);
   };
};
   
   
/* global shop, assertNamespace */

assertNamespace('shop.ui');

shop.ui.AbstractTabContent = function AbstractTabContent() {
   
   this.getHtmlContent = function getHtmlContent() {
      shop.Context.log('Derived object does not override getHtmlContent() in AbstractTabContent!');
   };
   
   this.addContentChangedListener = function addContentChangedListener(callback) {
      shop.Context.log('Derived object does not override addContentChangedListener() in AbstractTabContent!');
   };
};

/* global shop, assertNamespace */

assertNamespace('shop.ui');

shop.ui.Actions = {

   showPicture: function showPicture(filename) {
      shop.Context.bus.sendCommand(shop.topics.SHOW_PICTURE, filename);
   },
   
   checkInputValidity: function checkInputValidity(productId) {
      
      var inputValueIsValid = function inputValueIsValid(value) {
         return !isNaN(parseInt(value)) && value > 0;
      };
      
      var textFieldSelector = '#' + productId + '_textfield';
      var buttonSelector = '#' + productId + '_button';
      
      var inputValue = $(textFieldSelector).val();
      
      if(inputValueIsValid(inputValue)) {
         $(textFieldSelector).removeClass( 'invalidInput' ).addClass( 'validInput' );
         $(buttonSelector).prop( 'disabled', false );
      } else {
         $(textFieldSelector).removeClass( 'validInput' ).addClass( 'invalidInput' );
         $(buttonSelector).prop( 'disabled', true );
      }
   },
   
   addProductToShoppingCart: function addProductToShoppingCart(productId, textfieldId) {
      var textFieldSelector = '#' + textfieldId;
      var textFieldContent = $(textFieldSelector).val();
      var quantity = parseInt(textFieldContent);
      
      if (isNaN(quantity)) {
         shop.Context.log('Failed to convert "' + textFieldContent + '" to integer!');
      } else {
         var data = { productId: productId, quantity: quantity };
         shop.Context.bus.sendCommand(shop.topics.ADD_PRODUCT_TO_SHOPPING_CART, data);
      }
   },
   
   removeProductFromShoppingCart: function removeProductFromShoppingCart(productId) {
      shop.Context.bus.sendCommand(shop.topics.REMOVE_PRODUCT_FROM_SHOPPING_CART, productId);
   },
   
   changeCountryOfDestination: function changeCountryOfDestination() {
      var selectedValue = $('#shop > #content > #shoppingCart #countryOfDestination').val();
      var valueToPublish = (selectedValue === 'nothing') ? undefined : selectedValue;
      shop.Context.bus.publish(shop.topics.COUNTRY_OF_DESTINATION, valueToPublish);
   },
   
   orderFormElementChanged: function orderFormElementChanged(uiComponentId) {
      shop.Context.bus.sendCommand(shop.topics.ORDER_FORM_ELEMENT_CHANGED, uiComponentId);
   },
   
   submitOrder: function submitOrder() {
      shop.Context.bus.sendCommand(shop.topics.SUBMIT_ORDER);
   }
};


/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

shop.ui.DraftOverlay = {
   init: function init() {
      $('#draftOverlay #passwordTextField').focus();
   },
   
   passwordEntered: function passwordEntered() {
      var enteredPassword = $('#draftOverlay #passwordTextField').val();
      if (enteredPassword === 'lolo') {
         console.log('password ok');
         $('#draftOverlay').css('visibility', 'hidden');
      }
   }
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

/**
 * This setter updates the text of the HTML element identified by its selector when the corresponding
 * language dependent text changes.
 */
shop.ui.LanguageDependentTextSetter = function LanguageDependentTextSetter(selector, languageDependentTextKey, optionalComponentTextSetter, optionalBus) {
   
   var defaultComponentTextSetter = function defaultComponentTextSetter(selector, text) {
      $(selector).text(text);
   };
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var componentTextSetter = (optionalComponentTextSetter === undefined) ? defaultComponentTextSetter : optionalComponentTextSetter;
   
   var onLanguageDependentText = function onLanguageDependentText(text) {
      componentTextSetter(selector, text);
   };
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + languageDependentTextKey, onLanguageDependentText);
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

shop.ui.LanguageSelector = function LanguageSelector(uiComponentProvider, optionalBus ) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var currentLanguage;
   
   var onClicked = function onClicked() {
      var language = (currentLanguage === shop.Language.EN) ? shop.Language.DE : shop.Language.EN;
      bus.sendCommand(shop.topics.SET_CURRENT_LANGUAGE, language);
   };
   
   var onCurrentLanguage = function onCurrentLanguage(newLanguage) {
      currentLanguage = newLanguage;
   };
   
   var onTextChanged = function onTextChanged(text) {
      uiComponentProvider().text(text);
   };
   
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguage);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + 'menu.languageSelectorButton', onTextChanged);
   
   uiComponentProvider().on('click', onClicked);
};


/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

/**
 * A picture overlay shows a picture as an overlay of the whole shop.
 */
shop.ui.PictureOverlay = function PictureOverlay(config, optionalSetHtmlContent, optionalBus) {
   
   var thisInstance = this;
   var TEMPLATE_NAME = 'pictureOverlay';
   var PLACEHOLDER = '<!--image-->';
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var defaultSetHtmlContent = function defaultSetHtmlContent(content) {
      $(config.selector).html(content);
   };
   
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultSetHtmlContent : optionalSetHtmlContent.bind(this, config.selector);
   var templateContents = {};
   var activeLanguage;
   var relativePicturePath;
   var isVisible;
   
   var updateHtmlContent = function updateHtmlContent() {
      if (activeLanguage !== undefined && templateContents[activeLanguage] !== undefined) {
         if (relativePicturePath !== undefined) {
            var replacement = '<img src="' + relativePicturePath + '">';
            setHtmlContent(templateContents[activeLanguage].replace(PLACEHOLDER, replacement));
            thisInstance.show();
            isVisible = true;
         } else {
            if (isVisible) {
               thisInstance.hide();
               isVisible = false;
            }
         }
      }
   };
   
   var setTemplateContent = function setTemplateContent(language, data) {
      templateContents[language] = data;
      updateHtmlContent();
   };
   
   var onShownPicture = function onShownPicture(newRelativePicturePath) {
      relativePicturePath = newRelativePicturePath;
      updateHtmlContent();
   };
   
   this.getSelector = function getSelector() {
      return config.selector;
   };
   
   this.onLanguageChanged = function onLanguageChanged(newLanguage) {
      activeLanguage = newLanguage;
      updateHtmlContent();
   };
   
   if (config.contentTemplateName !== undefined) {
      for (var index = 0; index < config.languages.length; index++) {
         var language = config.languages[index];
         bus.subscribeToPublication('/htmlContent/' + language + '/' + config.contentTemplateName, setTemplateContent.bind(this, language));
      }
   }
   
   bus.subscribeToPublication(shop.topics.SHOWN_PICTURE, onShownPicture.bind(this));
   this.initialize();
};


/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

/**
 * Publishes a SET_VISIBLE_TAB command when the component, identified by the selector, gets clicked.
 */
shop.ui.SetTabVisibleAction = function SetTabVisibleAction(selector, tabName) {
   var bus = shop.Context.bus;
   
   var onClicked = function onClicked() {
      bus.sendCommand(shop.topics.SET_VISIBLE_TAB, tabName);
   };
   
   $(selector).on('click', onClicked);
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.CartController = function CartController(products, tab, testingComponents) {
   
   var SHIPPING_COSTS_AUSTRIA = 4.6;
   var SHIPPING_COSTS_NON_AUSTRIA = 11.25;
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var testingComponentAvailable = function testingComponentAvailable(paramId) {
      return (testingComponents !== undefined && testingComponents[paramId] !== undefined);
   };
   
   var bus = testingComponentAvailable('bus') ? testingComponents.bus : shop.Context.bus;
   var uiComponentProvider = testingComponentAvailable('uiComponentProvider') ? testingComponents.uiComponentProvider : defaultUiComponentProvider;
   var tableGenerator = testingComponentAvailable('tableGenerator') ? testingComponents.tableGenerator : new shop.ui.shoppingCart.TableGenerator();
   var tableHeaders = testingComponentAvailable('tableHeaders') ? testingComponents.tableHeaders : new shop.ui.shoppingCart.TableHeaders();
   var productConfigs = testingComponentAvailable('productConfigs') ? testingComponents.productConfigs : new shop.ui.shoppingCart.ProductConfig(products);
   var texts = testingComponentAvailable('texts') ? testingComponents.texts : new shop.ui.shoppingCart.ShoppingCartTexts();
   var inputForm = testingComponentAvailable('inputForm') ? testingComponents.inputForm : new shop.ui.shoppingCart.InputForm('#shop > #content > #shoppingCart');
   var costCalculator = testingComponentAvailable('costCalculator') ? testingComponents.costCalculator : new shop.ui.shoppingCart.CostsCalculator(productConfigs);
   var emailTextGenerator = testingComponentAvailable('emailTextGenerator') ? testingComponents.emailTextGenerator : new shop.ui.shoppingCart.EmailTextGenerator();
   var orderSubmitter = testingComponentAvailable('orderSubmitter') ? testingComponents.orderSubmitter : new shop.ui.shoppingCart.OrderSubmitter();
   
   var cartContent;
   var tabSelector;
   var countryOfDestination;
   var cartContentAsText;
   var ignoreNextContentChangeCallback = false;
   
   var productConfigForCartContentAvailable = function productConfigForCartContentAvailable() {
      var configAvailable = true;
      
      for (var index = 0; configAvailable && index < cartContent.length; index++ ) {
         var productId = cartContent[index].productId;
         configAvailable = productConfigs.get(productId) !== undefined;
      }
      
      return configAvailable;
   };
   
   var allDataAvailable = function allDataAvailable() {
      return cartContent !== undefined && 
         tabSelector !== undefined &&
         tableHeaders.allHeadersAreAvailable() && 
         productConfigForCartContentAvailable() &&
         texts.allTextsAreAvailable();
   };
      
   var getShoppingCartData = function getShoppingCartData(costs) {
      var data = {
         productsInShoppingCart: [],
         shippingCosts: (costs !== undefined) ? costs.shippingCosts : undefined,
         totalCosts: (costs !== undefined) ? costs.totalCosts : undefined,
         shippingCostsText: texts.getShippingCostsText(),
         totalCostsText: texts.getTotalCostsText(),
         tableHeaders: tableHeaders
      };
      
      for(var index = 0; index < cartContent.length; index++) {
         var productConfig = productConfigs.get(cartContent[index].productId);
         data.productsInShoppingCart[data.productsInShoppingCart.length] = {
            productId: productConfig.id,
            name: productConfig.name,
            quantity: cartContent[index].quantity,
            price: productConfig.price
         };
      }
      return data;
   };
   
   var getHtmlTable = function getHtmlTable(data) {
      return tableGenerator.generateTable(data);
   };
   
   var updateTable = function updateTable() {
      if (allDataAvailable()) {
         var htmlCode;
         var costs = costCalculator.calculateCosts();
            
         if (cartContent.length < 1) {
            htmlCode = '<p>' + texts.getEmptyCartText() + '</p>';
         } else {
            var cartData = getShoppingCartData(costs);
            htmlCode = getHtmlTable(cartData);
            cartContentAsText = emailTextGenerator.generateCartContentAsText(cartData);
         }
         ignoreNextContentChangeCallback = true;
         tab.setHtmlContentOfChildElement('shoppingCartContent', htmlCode);
      }
   };

   var onShoppingCartContent = function onShoppingCartContent(content) {
      cartContent = content;
      costCalculator.setCartContent(content);
      updateTable();
   };
   
   var onCountryOfDestination = function onCountryOfDestination(countryCode) {
      countryOfDestination = countryCode;
      costCalculator.setCountryOfDestination(countryCode);
      updateTable();
   };
   
   var getCustomerData = function getCustomerData() {
      return {
         firstname:  uiComponentProvider('#shop > #content > #shoppingCart #firstname').val(),
         lastname:   uiComponentProvider('#shop > #content > #shoppingCart #lastname').val(),
         email:      uiComponentProvider('#shop > #content > #shoppingCart #email').val(),
         comment:    uiComponentProvider('#shop > #content > #shoppingCart #comment').val(),
      };
   };
   
   var onUserClickedSubmitOrderButton = function onUserClickedSubmitOrderButton() {
      var customerDataAsText = emailTextGenerator.generateCustomerDataAsText(getCustomerData());
      var emailText = cartContentAsText + customerDataAsText;
      orderSubmitter.submit(emailText);
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      if (!ignoreNextContentChangeCallback) {
         tabSelector = selector;
         updateTable();
         inputForm.setValuesEnteredByUser();
      } else {
         ignoreNextContentChangeCallback = false;
      }
   };
   
   tableHeaders.onTableHeaderChanged(updateTable);
   texts.onLanguageDependentTextChanged(updateTable);
   
   bus.subscribeToPublication(shop.topics.COUNTRY_OF_DESTINATION, onCountryOfDestination);
   bus.subscribeToPublication(shop.topics.SHOPPING_CART_CONTENT, onShoppingCartContent);
   
   bus.subscribeToCommand(shop.topics.USER_CLICKED_SUBMIT_ORDER_BUTTON, onUserClickedSubmitOrderButton);
};


/* global shop, common, assertNamespace */

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.CostsCalculator = function CostsCalculator(productConfigs) {

   var SHIPPING_COSTS_AUSTRIA = 4.6;
   var SHIPPING_COSTS_NON_AUSTRIA = 11.25;
   
   var cartContent;
   var countryOfDestination;
   
   var cartContainsProducts = function cartContainsProducts() {
      return cartContent !== undefined && cartContent.length > 0;
   };
   
   this.setCartContent = function setCartContent(content) {
      cartContent = content;
   };
   
   this.setCountryOfDestination = function setCountryOfDestination(countryCode) {
      countryOfDestination = countryCode;
   };
   
   this.calculateCosts = function calculateCosts() {
      var result;
      
      if (cartContainsProducts() && countryOfDestination !== undefined) {
         var totalProductCosts = 0;
         var shippingCosts;
      
         for(var index = 0; index < cartContent.length; index++) {
            var productConfig = productConfigs.get(cartContent[index].productId);
            totalProductCosts += productConfig.price * cartContent[index].quantity;
         }

         if (countryOfDestination === 'AT') {
            shippingCosts = (totalProductCosts >= 50) ? 0 : SHIPPING_COSTS_AUSTRIA;
         } else {
            shippingCosts = (totalProductCosts >= 100) ? 0 : SHIPPING_COSTS_NON_AUSTRIA;
         }
         result = {totalCosts: totalProductCosts + shippingCosts, shippingCosts: shippingCosts};
      }
      return result;
   };
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.EmailTextGenerator = function EmailTextGenerator() {
   
   
   //var data = {
   //      productsInShoppingCart: [],
   //      shippingCosts: (costs !== undefined) ? costs.shippingCosts : undefined,
   //      totalCosts: (costs !== undefined) ? costs.totalCosts : undefined,
   //      shippingCostsText: texts.getShippingCostsText(),
   //      totalCostsText: texts.getTotalCostsText(),
   //      tableHeaders: tableHeaders
   //   };
      
   //data.productsInShoppingCart[data.productsInShoppingCart.length] = {
   //      productId: productConfig.id,
   //      name: productConfig.name,
   //      quantity: cartContent[index].quantity,
   //      price: productConfig.price
   //   };
   this.generateCartContentAsText = function generateCartContentAsText(cartData) {
      var emailText = '';
      
      // TODO
      
      return emailText;
   };
   
   this.generateCustomerDataAsText = function generateCustomerDataAsText(customerData) {
      
      // TODO
      return '';
   };
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.InputForm = function InputForm(selector, optionalUiComponentProvider, optionalBus) {
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var uiComponentProvider = (optionalUiComponentProvider === undefined) ? defaultUiComponentProvider : optionalUiComponentProvider;
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var countryOfDestination;
   var firstname;
   var lastname;
   var email;
   var cartContent;
   
   var updateSubmitButton = function updateSubmitButton() {
      var submitButtonEnabled = countryOfDestination !== undefined && 
            firstname !== undefined && 
            lastname !== undefined && 
            email !== undefined &&
            cartContent !== undefined && cartContent.length > 0;
            
      if (selector !== undefined) {
         uiComponentProvider(selector + ' #submitButton').attr('disabled', !submitButtonEnabled);
      }
   };

   var isValidName = function isValidName(value) {
      return value !== undefined && value.length >= 3;
   };
   
   var isValidEmail = function isValidEmail(value) {
      return value !== undefined && value.match(/.+@.+\.[^.]+/) !== null;
   };
   
   var onOrderFormElementChanged = function onOrderFormElementChanged(uiComponentId) {
      var value = uiComponentProvider(selector + ' #' + uiComponentId).val();
      switch(uiComponentId) {
         case 'firstname': firstname = isValidName(value) ? value : undefined;
                           break;
                           
         case 'lastname':  lastname = isValidName(value) ? value : undefined;
                           break;
                           
         case 'email':     email = isValidEmail(value) ? value : undefined;
                           break;
      }
      
      updateSubmitButton();
   };
   
   var onCountryOfDestination = function onCountryOfDestination(country) {
      countryOfDestination = country;
      updateSubmitButton();
   };
   
   var onShoppingCartContent = function onShoppingCartContent(content) {
      cartContent = content;
      updateSubmitButton();
   };

   this.allValuesAreAvailable = function allValuesAreAvailable() {
      return firstname !== undefined && 
            lastname !== undefined && 
            email !== undefined;
   };
   
   this.setValuesEnteredByUser = function setValuesEnteredByUser() {
      uiComponentProvider(selector + ' #countryOfDestination').val((countryOfDestination === undefined) ? 'nothing' : countryOfDestination);
      uiComponentProvider(selector + ' #firstname').val(firstname);
      uiComponentProvider(selector + ' #lastname').val(lastname);
      uiComponentProvider(selector + ' #email').val(email);
      updateSubmitButton();
   };
   
   bus.subscribeToPublication(shop.topics.SHOPPING_CART_CONTENT, onShoppingCartContent);
   bus.subscribeToPublication(shop.topics.COUNTRY_OF_DESTINATION, onCountryOfDestination);
   bus.subscribeToCommand(shop.topics.ORDER_FORM_ELEMENT_CHANGED, onOrderFormElementChanged);
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.OrderSubmitter = function OrderSubmitter() {
   this.submit = function submit(orderText) {
      shop.Context.log('submit of OrderSubmitter not yet implemented');
   };
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.ProductConfig = function ProductConfig(products, optionalBus) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var productConfigurations = {};
   var languages = [];
   var currentLanguage;
   
   var onProductConfiguration = function onProductConfiguration(productName, language, config) {
      if (productConfigurations[language] === undefined) {
         productConfigurations[language] = {};
      }
      productConfigurations[language][productName] = config;
   };

   var subscribeTo = function subscribeTo(language) {
      for (var index = 0; index < products.length; index++) {
         var product = products[index];
         var topic = '/jsonContent/' + language + '/' + product;
         bus.subscribeToPublication(topic, onProductConfiguration.bind(this, product, language));
      }
   };
   
   var onCurrentLanguage = function onCurrentLanguage(language) {
      currentLanguage = language;
      var index = languages.indexOf(language);
      if (index === -1) {
         languages[languages.length] = language;
         subscribeTo(language);
      }
   };
      
   this.get = function get(productId) {
      var config;
      if (currentLanguage !== undefined) {
         var languageRelatedConfigs = productConfigurations[currentLanguage];
         var productCategories = Object.keys(languageRelatedConfigs);
         for (var index = 0; config === undefined && index < productCategories.length; index++) {
            var configuredProducts = languageRelatedConfigs[productCategories[index]].products;
            for (var productIndex = 0; config === undefined && productIndex < configuredProducts.length; productIndex++) {
               var productConfig = configuredProducts[productIndex];
               if (productConfig.id === productId) {
                  config = productConfig;
               }
            }
         }
      }
      return config;
   };
      
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguage.bind(this));
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.ShoppingCartTexts = function ShoppingCartTexts(optionalBus) {

   var TEXT_KEY_PREFIX = 'shoppingCartContentTable.';
   var SHIPPING_COSTS_ID = 'shippingCosts';
   var TOTAL_COSTS_ID = 'totalCosts';
   var EMPTY_CART_ID = 'emptyCart';
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var shippingCostsText;
   var totalCostsText;
   var emptyCartText;
   var callbacks = [];
   var texts = {};
   
   var notifycallbacks = function notifycallbacks() {
      for (var index = 0; index < callbacks.length; index++) {
         callbacks[index]();
      }
   };
   
   var onTextChanged = function onTextChanged(textId, text) {
      texts[textId] = text;
      notifycallbacks();
   };
   
   var subscribeToPublication = function subscribeToPublication(textId) {
      bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + textId, onTextChanged.bind(this, textId));
   };
   
   this.onLanguageDependentTextChanged = function onLanguageDependentTextChanged(callback) {
      callbacks[callbacks.length] = callback;
   };
   
   this.getShippingCostsText = function getShippingCostsText() {
      return texts[SHIPPING_COSTS_ID];
   };
   
   this.getTotalCostsText = function getTotalCostsText() {
      return texts[TOTAL_COSTS_ID];
   };
   
   this.getEmptyCartText = function getEmptyCartText() {
      return texts[EMPTY_CART_ID];
   };
   
   this.allTextsAreAvailable = function allTextsAreAvailable() {
      var allAvailable = true;
      var textIds = [SHIPPING_COSTS_ID, TOTAL_COSTS_ID, EMPTY_CART_ID];
      for (var index=0; allAvailable && index < textIds.length; index++) {
         allAvailable = texts[textIds[index]] !== undefined;
      }
      return allAvailable;
   };
   
   subscribeToPublication('shippingCosts');
   subscribeToPublication('totalCosts');
   subscribeToPublication('emptyCart');
};
/* global shop, common, assertNamespace */

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.TableGenerator = function TableGenerator() {

   var CRLF = '\r\n';
   var intentationAsString = '   ';
   var intentations;
   var htmlContent;
   var tableHeaders;
   
   var append = function(text) {
      var line = '';
      for (var i = 0; i < intentations; i++) {
         line += intentationAsString;
      }
      htmlContent += line + text + CRLF;
   };
   
   var addHeader = function addHeader(id) {
      intentations++;
      append('<th>' + tableHeaders.get(id) + '</th>');
      intentations--;
   };
   
   var addEmptyHeader = function addEmptyHeader() {
      intentations++;
      append('<th class="rightMostColumn">&nbsp;</th>');
      intentations--;
   };
   
   var addText = function addText(text, cssClass) {
      intentations++;
      append('<td' + ((cssClass !== undefined) ? ' class="' + cssClass + '"' : '') + '>' + ((text === undefined) ? '&nbsp;' : text) + '</td>');
      intentations--;
   };
   
   var addPrice = function addPrice(price, isRightMostColumn) {
      intentations++;
      append('<td class="rechtsAusgerichteterText' + (isRightMostColumn ? ' rightMostColumn"' : '') + '">' + price.toFixed(2) + ' EUR</td>');
      intentations--;
   };
   
   var addDeleteButton = function addDeleteButton(productId) {
      intentations++;
      append('<td class="zentrierterText rightMostColumn"><button type="button" class="removeButton" onclick="shop.ui.Actions.removeProductFromShoppingCart(\'' + productId + '\');"><img src="/images/warenkorb/kreuz.svg"></button></td>');
      intentations--;
   };
   
   var addCaptions = function addCaptions() {
      intentations++;
      append('<tr class="headers">');
      addHeader('quantityHeader');
      addHeader('nameHeader');
      addHeader('priceHeader');
      addEmptyHeader();
      append('</tr>');
      intentations--;
   };
   
   var addRow = function addRow(product, isTotalCostRow) {
      intentations++;
      append('<tr>');
      addText(product.quantity, 'zentrierterText');
      addText(product.name);
      addPrice(product.price * product.quantity);
      addDeleteButton(product.productId);
      append('</tr>');
      intentations--;
   };
   
   var addShippingCosts = function addShippingCosts(shippingCosts, shippingCostsText) {
      intentations++;
      append('<tr>');
      addText('&nbsp;');
      addText(shippingCostsText);
      addPrice(shippingCosts, true);
      append('<td class="rightMostColumn">&nbsp;</td>');
      append('</tr>');
      intentations--;
   };
   
   var addTotalCosts = function addTotalCosts(totalCosts, totalCostsText) {
      intentations++;
      append('<tr class="totalCostRow">');
      intentations++;
      append('<td colspan="2">' + ((totalCostsText === undefined) ? '&nbsp;' : totalCostsText) + '</td>');
      intentations--;
      addPrice(totalCosts, true);
      append('<td class="rightMostColumn">&nbsp;</td>');
      append('</tr>');
      intentations--;
   };

   this.generateTable = function generateTable(data) {
      intentations = 1;
      htmlContent = '';
      tableHeaders = data.tableHeaders;
      
      append('<table>');
      addCaptions();
      for (var index = 0; index < data.productsInShoppingCart.length; index++) { 
         addRow(data.productsInShoppingCart[index]);
      }
      if (data.shippingCosts !== undefined) {
         addShippingCosts(data.shippingCosts, data.shippingCostsText);
      }
      if (data.totalCosts !== undefined) {
         addTotalCosts(data.totalCosts, data.totalCostsText);
      }
      append('</table>');
      
      return htmlContent;
   };
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui.shoppingCart');

shop.ui.shoppingCart.TableHeaders = function TableHeaders(optionalBus) {

   var TEXT_KEY_PREFIX = 'shoppingCartContentTable.';

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var tableHeaders = {};
   var callbacks = [];
   
   var notifyListeners = function notifyListeners() {
      for(var index = 0; index < callbacks.length; index++) {
         callbacks[index]();
      }
   };
   
   var onLanguageDependentTextChanged = function onLanguageDependentTextChanged(id, text) {
      tableHeaders[id] = text;
      notifyListeners();
   };
   
   var subscribeToLanguageDependentTextPublication = function subscribeToLanguageDependentTextPublication(id) {
      tableHeaders[id] = undefined;
      var topic = shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + TEXT_KEY_PREFIX + id;
      bus.subscribeToPublication(topic, onLanguageDependentTextChanged.bind(this, id));
   };

   this.onTableHeaderChanged = function onTableHeaderChanged(callback) {
      callbacks[callbacks.length] = callback;
   };
   
   this.get = function get(key) {
      return tableHeaders[key];
   };
   
   this.allHeadersAreAvailable = function allHeadersAreAvailable() {
      var result = true;
      var ids = Object.keys(tableHeaders);
      for(var index = 0; result && index < ids.length; index++) {
         if (tableHeaders[ids[index]] === undefined) {
            result = false;
         }
      }
      return result;
   };
   
   subscribeToLanguageDependentTextPublication('quantityHeader');
   subscribeToLanguageDependentTextPublication('nameHeader');
   subscribeToLanguageDependentTextPublication('priceHeader');
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

/**
 * This setter updates the text of the HTML element identified by its selector when the corresponding
 * language dependent text changes.
 */
shop.ui.ShoppingCartButtonTextSetter = function ShoppingCartButtonTextSetter(selector, languageDependentTextKey, optionalComponentTextSetter, optionalBus) {
   
   var defaultComponentTextSetter = function defaultComponentTextSetter(selector, text) {
      $(selector).text(text);
   };
   
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var componentTextSetter = (optionalComponentTextSetter === undefined) ? defaultComponentTextSetter : optionalComponentTextSetter;
   var text;
   var quantity = 0;
   
   var updateText = function updateText() {
      var textToSet = text;
      if (quantity > 0) {
         textToSet += ' (' + quantity + ')';
      }
      componentTextSetter(selector, textToSet);
   };
   
   var onLanguageDependentText = function onLanguageDependentText(newText) {
      text = newText;
      updateText();
   };
   
   var onShoppingCartContent = function onShoppingCartContent(content) {
      
      var newAmount = 0;
      for (var index = 0; index < content.length; index++) {
         newAmount += content[index].quantity;
      }
      quantity = newAmount;
      updateText();
   };
   
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + languageDependentTextKey, onLanguageDependentText);
   bus.subscribeToPublication(shop.topics.SHOPPING_CART_CONTENT, onShoppingCartContent);
};

/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

/**
 * A Tab is responsible to insert HTML code into a <div> that can be selected by config.selector.
 * 
 * configuration object description:
 *
 * {
 *    selector:                     the selector identifies the <div> that is the tab
 *    contentSelector (optional):   the selector identifies the <div> that should receive the content. If it is undefined the value in "selector" will be used.
 *    configName:                   the name of the configuration to use to genenerate the product table. No table gets added when it's undefined.
 *    contentTemplateName:          the name of the HTML template to use. If a product table is configured, the template also requires the PLACEHOLDER in its content.
 *    languages:                    an array of supported languages defined in shop.Language
 *    tableGenerator (optional):    the name of the generator to use, default = ProductTableGenerator
 * }
 *
 * addTabContentChangedListener(callback) adds a callback to the tab that gets called every time when the tab content gets updated.
 * The callback does not get anything from the caller (argument count = 0).
 */
shop.ui.Tab = function Tab(config, optionalTabContentFactory, optionalSetHtmlContent) {
   var PLACEHOLDER = '<!--DYNAMIC_CONTENT-->';
   
   var createTabContentConfig = function createTabContentConfig(config) {
      return {
         configName:          config.configName,
         contentTemplateName: config.contentTemplateName,
         languages:           config.languages,
         tableGenerator:      config.tableGenerator
      };
   };
   
   var tabContentConfig = createTabContentConfig(config);
   var tabContent = optionalTabContentFactory === undefined ? new shop.ui.TabContent(tabContentConfig) : optionalTabContentFactory(tabContentConfig);
   
   var tabContentChangedCallbacks = [];
   
   var defaultHtmlContentSetter = function defaultHtmlContentSetter(selector, htmlContent) {
      $(selector).html(htmlContent);
   };
   
   var contentSelector = config.contentSelector || config.selector;
   var setHtmlContentOfTab = (optionalSetHtmlContent === undefined) ? defaultHtmlContentSetter.bind(this, contentSelector) : optionalSetHtmlContent.bind(this, contentSelector);
   var setHtmlContent = (optionalSetHtmlContent === undefined) ? defaultHtmlContentSetter : optionalSetHtmlContent;
   
   var notifyTableChangeListeners = function notifyTableChangeListeners() {
      tabContentChangedCallbacks.forEach(function(callback) { callback(config.selector);});
   };
   
   var updateHtmlContent = function updateHtmlContent() {
      tabContent.getHtmlContent()
         .then(setHtmlContentOfTab)
         .then(notifyTableChangeListeners, shop.Context.log);
   };
   
   this.getId = function getId() {
      return config.id;
   }; 
   
   this.getSelector = function getSelector() {
      return config.selector;
   };
   
   this.onLanguageChanged = function onLanguageChanged(newLanguage) {
      updateHtmlContent();
   };
   
   this.addTabContentChangedListener = function addTabContentChangedListener(callback) {
      tabContentChangedCallbacks[tabContentChangedCallbacks.length] = callback;
   };
   
   this.setHtmlContentOfChildElement = function setHtmlContentOfChildElement(childElementId, htmlContent) {
      setHtmlContent(config.selector + ' #' + childElementId, htmlContent);
      notifyTableChangeListeners();
   };
   
   tabContent.addContentChangedListener(function() {updateHtmlContent();});
   
   this.initialize();
};


/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

/**
 * A TabContent is responsible provide the current tab content when getHtmlContent() gets called.
 * ContentChangedListener get notified when the content changed.
 * 
 * configuration object description:
 *
 * {
 *    configName:                the name of the configuration to use to genenerate the product table. No table gets added when it's undefined.
 *    contentTemplateName:       the name of the HTML template to use. If a product table is configured, the template also requires the PLACEHOLDER in its content.
 *    languages:                 an array of supported languages defined in shop.Language
 *    tableGenerator (optional): the name of the generator to use, default = ProductTableGenerator
 * }
 */
shop.ui.TabContent = function TabContent(config, optionalProductTableGenerator, optionalBus) {
   var PLACEHOLDER = '<!--DYNAMIC_CONTENT-->';
   
   var bus = optionalBus || shop.Context.bus;
   var tableGenerator;

   if (optionalProductTableGenerator !== undefined) {
      tableGenerator = optionalProductTableGenerator;
   } else {
      if (config.tableGenerator === undefined) {
         tableGenerator = new shop.ui.tablegenerators.ProductTableGenerator();
      } else {
         tableGenerator = new shop.ui.tablegenerators[config.tableGenerator]();
      }
   }
   
   var configs = {};
   var templateContents = {};
   var activeLanguage;
   var contentChangedCallbacks = [];
   
   var formatErrorMessage = function formatErrorMessage(message) {
      return '<p class="errorMessage">' + message + '</p>';
   };
   
   var createDynamicHtmlContent = function createDynamicHtmlContent() {
      var executor = function executor(fulfill, reject) {

         if (config.configName === undefined) {
            fulfill('');
         } else {
            if (activeLanguage === undefined) {
               fulfill('');
            } else {
               var configKey = config.configName + '_' + activeLanguage;
               var data = configs[configKey];
               if (data instanceof Error) {
                  fulfill(formatErrorMessage(data.message));
               } else {
                  if (data === undefined) {
                     fulfill(formatErrorMessage('configuration ' + config.configName + ' is not available in language ' + activeLanguage + '!'));
                  } else {
                     fulfill(tableGenerator.generateTable(configKey, data));
                  }
               }
            }
         }
      };
      
      return new common.Promise(executor);
   };
   
   var insertContentIntoTemplate = function insertContentIntoTemplate(dynamicContent) {
      var content = '';
      
      if (activeLanguage === undefined) {
         throw 'can not insert dynamic HTML content into template because no language is active!';
      } else {
         var templateContent = (config.contentTemplateName === undefined) ? PLACEHOLDER : templateContents[config.contentTemplateName + '_' + activeLanguage];
         if (templateContent === undefined) {
            content = formatErrorMessage('template content ' + config.contentTemplateName + ' is not available!');
         } else {
            if (templateContent instanceof Error) {
               content = formatErrorMessage(templateContent.message);
            } else {
               if (dynamicContent.length === 0) {
                  content = templateContent;
               } else {
                  var placeholderStartPosition = templateContent.indexOf(PLACEHOLDER);
                  var placeholderEndPosition = Math.min(templateContent.length - 1, placeholderStartPosition + PLACEHOLDER.length - 1);
                  
                  if (placeholderStartPosition > -1) {
                     var prefix = templateContent.substring(0, placeholderStartPosition);
                     var suffix = templateContent.substring(placeholderEndPosition + 1);
                     content = prefix + dynamicContent + suffix;
                  } else {
                     content = formatErrorMessage('Template does not contain placeholder');
                  }
               }
            }
         }
      }
      return content;
   };
   
   this.getHtmlContent = function getHtmlContent() {
      return createDynamicHtmlContent().then(insertContentIntoTemplate);
   };
   
   this.addContentChangedListener = function addContentChangedListener(callback) {
      contentChangedCallbacks.push(callback);
   };
   
   var notifyTabContentChangedListeners = function notifyTabContentChangedListeners() {
      for(var index = 0; index < contentChangedCallbacks.length; index++) {
         contentChangedCallbacks[index]();
      }
   };
   
   var onLanguageChanged = function onLanguageChanged(newLanguage) {
      activeLanguage = newLanguage;
      notifyTabContentChangedListeners();
   };
   
   var setMapContent = function setMapContent(map, key, value) {
      map[key] = value;
      notifyTabContentChangedListeners();
   };
   
   for (var index = 0; index < config.languages.length; index++) {
      var language = config.languages[index];
      
      if (config.configName !== undefined) {
         bus.subscribeToPublication('/jsonContent/' + language + '/' + config.configName, setMapContent.bind(this, configs, config.configName + '_' + language));
      }
      
      if (config.contentTemplateName !== undefined) {
         bus.subscribeToPublication('/htmlContent/' + language + '/' + config.contentTemplateName, setMapContent.bind(this, templateContents, config.contentTemplateName + '_' + language));
      }
   }
   
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onLanguageChanged);
};


/* global shop, common, assertNamespace */

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

/* global shop, common, assertNamespace */

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
 *             description:   "Internationale Ausstellung"
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
   
   var addRow = function addRow(event) {
      thisInstance.startRow();
      thisInstance.addText(event.date);
      thisInstance.addText(event.location);
      thisInstance.addText(event.description);
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



/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

/**
 * The ProductTableGenerator takes an object containing the products configuration and transform it
 * into a HTML table. 
 *
 * example configuration:
 *
 *   {
 *      "products": [
 *         { 
 *            "id": "AerangisEllisii",
 *            "name": "Aerangis ellisii",
 *            "price": 10,
 *            "description": "weiße Blüte, kleine Pflanze",
 *            "url": "http://some.webpage.com"
 *         },
 *         {
 *            "id": "CattleyaWalkerianaAlba",
 *            "name": "Cattleya walkeriana alba",
 *            "price": 12,
 *            "description": "Miniatur aus Brasilien",
 *            "imageSmall": "cattleya_small.jpg"
 *         }
 *      ]
 *   }
 */
shop.ui.tablegenerators.ProductTableGenerator = function ProductTableGenerator() {

   var thisInstance = this;
   var configKey;
   
   var addPrice = function addPrice(price) {
      thisInstance.addText(price.toFixed(2) + ' EUR');
   };
   
   var addShoppingCartAdder = function addShoppingCartAdder(product) {
      var commonId = configKey + '_' + product.id;
      var buttonId = commonId + '_button';
      var textfieldId = commonId + '_textfield';
      var button = '<button type="button" id="' + buttonId + '" onClick="shop.ui.Actions.addProductToShoppingCart(\'' + product.id + '\', \'' + textfieldId + '\');"></button>';
      var input = '<input type="text" id="' + textfieldId + '" value="1" size="2" onKeyUp="shop.ui.Actions.checkInputValidity(\'' + commonId + '\');">';
      thisInstance.addText(input + '&nbsp;' + button);
   };
   
   var addImage = function addImage(imageSmall, imageBig, url) {
      var htmlContent = '';
      if (imageSmall !== undefined) {
         htmlContent = '<img src="' + imageSmall + '">';
         if (imageBig !== undefined) {
            htmlContent = htmlContent + '<br><a class="bigPictureAnchor" href="javascript:shop.ui.Actions.showPicture(\'' + imageBig + '\');"></a>';
         }
      } else {
         if (url !== undefined) {
            htmlContent = '<a class="onTheInternetAnchor" href="' + url + '"></a>';
         }
      }
      thisInstance.addText(htmlContent);
   };
   
   var addRow = function addRow(product) {
      thisInstance.startRow();
      addImage(product.imageSmall, product.imageBig, product.url);
      thisInstance.addText(product.name);
      thisInstance.addText(product.description);
      addPrice(product.price);
      addShoppingCartAdder(product);
      thisInstance.endRow();
   };
   
   var addCaptions = function addCaptions() {
      thisInstance.startRow();
      thisInstance.addHeader('fotoHeader');
      thisInstance.addHeader('nameHeader');
      thisInstance.addHeader('descriptionHeader');
      thisInstance.addHeader('priceHeader');
      thisInstance.addHeader('&nbsp;');
      thisInstance.endRow();
   };
   
   this.generateTable = function generateTable(configurationId, config) {
      configKey = configurationId;
      
      thisInstance.reset();
      thisInstance.append('<table class="alternierendeZeilenFarbe ersteSpalteZentriert dritteSpalteZentriert">');
      addCaptions();
      config.products.forEach(function(product) { 
         addRow(product);
      });  
      thisInstance.append('</table>');
      return thisInstance.getContent();
   };
};



/* global shop, common, assertNamespace */

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


/* global shop, common, assertNamespace */

assertNamespace('shop.ui.tablesetters');

/**
 * Every call of onTabContentChangedCallback() or a change of the associated language dependent texts
 * updates the following sub elements of the <div> determined by the selector provided in onTabContentChangedCallback().
 * 
 * Sub elements that get updates:
 *
 *    <button>
 *    <a class="onTheInternetAnchor">
 *    <a class="bigPictureAnchor">
 *
 * Associated language dependent texts:
 *
 *    'productTable.addToShoppingCartButton'
 *    'productTable.onTheInternetAnchor'
 *    'productTable.bigPictureAnchor'
 */
shop.ui.tablesetters.LanguageDependentTextInProductsTableSetter = function LanguageDependentTextInProductsTableSetter(optionalTextKeyPrefix, optionalUiComponentProvider, optionalBus) {
   
   var addToShoppingCartButtonText;
   var onTheInternetAnchorText;
   var bigPictureAnchorText;
   var fotoHeader;
   var nameHeader;
   var descriptionHeader;
   var priceHeader;
   var selectors = [];
   
   var textKeyPrefix = (optionalTextKeyPrefix === undefined) ? 'productsTable' : optionalTextKeyPrefix;
   
   var defaultUiComponentProvider = function defaultUiComponentProvider(selector) {
      return $(selector);
   };
   
   var uiComponentProvider = (optionalUiComponentProvider === undefined) ? defaultUiComponentProvider : optionalUiComponentProvider;
   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   
   var updateButtons = function updateButtons() {
      var textToSet = (addToShoppingCartButtonText !== undefined) ? addToShoppingCartButtonText : '';
      selectors.forEach(function(selector) {
         uiComponentProvider(selector + ' button').text(textToSet);
      });
   };
   
   var updateAnchors = function updateAnchors() {
      var updateTextToSet = (onTheInternetAnchorText !== undefined) ? onTheInternetAnchorText : '';
      selectors.forEach(function(selector) {
         uiComponentProvider(selector + ' .onTheInternetAnchor').text(updateTextToSet);
      });
      
      var bigPictureTextToSet = (bigPictureAnchorText !== undefined) ? bigPictureAnchorText : '';
      selectors.forEach(function(selector) {
         uiComponentProvider(selector + ' .bigPictureAnchor').text(bigPictureTextToSet);
      });
   };
   
   var getFormattedText = function getFormattedText(text) {
      return (text !== undefined) ? text : '';
   };
   
   var updateTableHeaders = function updateTableHeaders() {
      selectors.forEach(function(selector) {
         uiComponentProvider(selector + ' .fotoHeader').text(getFormattedText(fotoHeader));
         uiComponentProvider(selector + ' .nameHeader').text(getFormattedText(nameHeader));
         uiComponentProvider(selector + ' .descriptionHeader').text(getFormattedText(descriptionHeader));
         uiComponentProvider(selector + ' .priceHeader').text(getFormattedText(priceHeader));
      });
   };
   
   var onAddToShoppingCartButtonText = function onAddToShoppingCartButtonText(text) {
      addToShoppingCartButtonText = text;
      updateButtons();
   };
   
   var onOnTheInternetAnchorText = function onOnTheInternetAnchorText(text) {
      onTheInternetAnchorText = text;
      updateAnchors();
   };
   
   var onBigPictureAnchorText = function onBigPictureAnchorText(text) {
      bigPictureAnchorText = text;
      updateAnchors();
   };
   
   var onFotoHeader = function onFotoHeader(text) {
      fotoHeader = text;
      updateTableHeaders();
   };
   
   var onNameHeader = function onNameHeader(text) {
      nameHeader = text;
      updateTableHeaders();
   };
   
   var onDescriptionHeader = function onDescriptionHeader(text) {
      descriptionHeader = text;
      updateTableHeaders();
   };
   
   var onPriceHeader = function onPriceHeader(text) {
      priceHeader = text;
      updateTableHeaders();
   };
   
   this.onTabContentChangedCallback = function onTabContentChangedCallback(selector) {
      if (selectors.indexOf(selector) === -1) {
         selectors[selectors.length] = selector;
      }
      updateButtons();
      updateAnchors();
      updateTableHeaders();
   };

   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.addToShoppingCartButton', onAddToShoppingCartButtonText);

   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.onTheInternetAnchor', onOnTheInternetAnchorText);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.bigPictureAnchor', onBigPictureAnchorText);

   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.fotoHeader', onFotoHeader);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.nameHeader', onNameHeader);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.descriptionHeader', onDescriptionHeader);
   bus.subscribeToPublication(shop.topics.LANGUAGE_DEPENDENT_TEXT_PREFIX + textKeyPrefix + '.priceHeader', onPriceHeader);
};


/* global shop, common, assertNamespace */

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


/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

/**
 * The UiStateSetter provides a new state object to the state consumer when a shop.topics.SET_VISIBLE_TAB command was sent.
 */
shop.ui.UiStateSetter = function UiStateSetter(stateConsumer, optionalBus ) {

   var bus = (optionalBus === undefined) ? shop.Context.bus : optionalBus;
   var visibleTab;
   var shownPicture;
   var currentLanguage;
   
   var notifyStateConsumer = function notifyStateConsumer() {
      var state = {};
      state.visibleTab = visibleTab;
      if (shownPicture !== undefined) {
         state.shownPicture = shownPicture;
      }
      state.language = currentLanguage;
      stateConsumer(state);
   };
   
   var onSetVisibleTabCommand = function onSetVisibleTabCommand(tabName) {
      if (visibleTab === undefined || visibleTab !== tabName) {
         visibleTab = tabName;
         notifyStateConsumer();
      }
   };
   
   var onSetCurrentLanguageCommand = function onSetCurrentLanguageCommand(language) {
      if (currentLanguage !== language) {
         currentLanguage = language;
         notifyStateConsumer();
      }
   };
   
   var onShowPictureCommand = function onShowPictureCommand(filename) {
      if (shownPicture === undefined || shownPicture !== filename) {
         shownPicture = filename;
         notifyStateConsumer();
      }
   };
   
   var onHidePictureCommand = function onHidePictureCommand() {
      if (shownPicture !== undefined) {
         shownPicture = undefined;
         notifyStateConsumer();
      }
   };
   
   var onVisibleTabPublication = function onVisibleTabPublication(tabName) {
      visibleTab = tabName;
      notifyStateConsumer();
   };
   
   var onShownPicturePublication = function onShownPicturePublication(relativeFilePath) {
      shownPicture = relativeFilePath;
      notifyStateConsumer();
   };
   
   var onCurrentLanguagePublication = function onCurrentLanguagePublication(language) {
      currentLanguage = language;
      notifyStateConsumer();
   };
   
   bus.subscribeToPublication(shop.topics.VISIBLE_TAB, onVisibleTabPublication);
   bus.subscribeToPublication(shop.topics.SHOWN_PICTURE, onShownPicturePublication);
   bus.subscribeToPublication(shop.topics.CURRENT_LANGUAGE, onCurrentLanguagePublication);
   
   bus.subscribeToCommand(shop.topics.SET_CURRENT_LANGUAGE, onSetCurrentLanguageCommand);
   bus.subscribeToCommand(shop.topics.SET_VISIBLE_TAB, onSetVisibleTabCommand);
   bus.subscribeToCommand(shop.topics.SHOW_PICTURE, onShowPictureCommand);
   bus.subscribeToCommand(shop.topics.HIDE_PICTURE, onHidePictureCommand);
};


/* global shop, common, assertNamespace */

assertNamespace('shop.ui');

shop.ui.VisibleTabController = function VisibleTabController(tabs, containerSelector) {
   
   var visibleTabId;
   
   var uiComponentProvider = function uiComponentProvider(selector) {
      return $(selector);
   };
   
   var updateVisibleTab = function updateVisibleTab() {
      tabs.forEach(function(currentTab) {
         var currentTabId = currentTab.getId();
         var visible = visibleTabId === currentTabId;
         var tabUiComponent = $(containerSelector + ' #' + currentTabId);
         if (visible) {
            var tabHeight = uiComponentProvider(containerSelector + ' #' + currentTabId).outerHeight();
            tabUiComponent.css('top', '0em');
            $(containerSelector).height(tabHeight);
         } else {
            tabUiComponent.css('top', '-9999em');
         }
         tabUiComponent.css('visibility', visible ? 'visible' : 'hidden');
      });
   };
   
   var onVisibleTab = function onVisibleTab(tabId) {
      visibleTabId = tabId;
      updateVisibleTab();
   };
   
   var onTabContentChanged = function onTabContentChanged(selector) {
      updateVisibleTab();
   };
   
   tabs.forEach(function(tab) {
      tab.addTabContentChangedListener(onTabContentChanged);
   });
   
   shop.Context.bus.subscribeToPublication(shop.topics.VISIBLE_TAB, onVisibleTab);
};

shop.configuration.HtmlContentLoader.prototype = new shop.configuration.AbstractContentLoader();
shop.configuration.JsonContentLoader.prototype = new shop.configuration.AbstractContentLoader();
shop.ui.AbstractHideableLanguageDependentComponent.prototype = new shop.ui.AbstractLanguageDependentComponent();
shop.ui.PictureOverlay.prototype = new shop.ui.AbstractHideableLanguageDependentComponent();
shop.ui.Tab.prototype = new shop.ui.AbstractHideableLanguageDependentComponent();
shop.ui.TabContent.prototype = new shop.ui.AbstractTabContent();
shop.ui.tablegenerators.EventsTableGenerator.prototype = new shop.ui.tablegenerators.AbstractTableGenerator();
shop.ui.tablegenerators.ProductTableGenerator.prototype = new shop.ui.tablegenerators.AbstractTableGenerator();