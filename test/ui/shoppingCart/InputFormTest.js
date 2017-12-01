/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/shoppingCart/InputForm.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var DEFAULT_SELECTOR = 'selectorA';

var instance;

var mockedBus;

var formSelector;
var inputs;
var capturedInputValues;
var capturedSelectors;
var submitButtonDisabled;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var mockedUiComponentProvider = function mockedUiComponentProvider(selector) {
   capturedSelectors[selector] = (capturedSelectors[selector] === undefined) ? 1 : capturedSelectors[selector] + 1;
   return {
      val: function val(value) {
         if (value === undefined) {
            return inputs[selector];
         } else {
            capturedInputValues[selector] = value;
         }
      },
      attr: function attr(key, value) {
         if (selector === (formSelector + ' #submitButton') && key === 'disabled') {
            submitButtonDisabled = value;
         }
      }
   };
};

var createInstance = function createInstance() {
   instance = new shop.ui.shoppingCart.InputForm(formSelector, mockedUiComponentProvider, mockedBus);
};

var givenDefaultInstance = function givenDefaultInstance() {
   formSelector = DEFAULT_SELECTOR;
   createInstance();
};

var givenAnInstanceWithSelector = function givenAnInstanceWithSelector(selector) {
   formSelector = selector;
   createInstance();
};

var givenInputFormDataAre = function givenInputFormDataAre(firstName, lastName, eMail, comment) {
   inputs[formSelector + ' #firstname']   = firstName;
   inputs[formSelector + ' #lastname']    = lastName;
   inputs[formSelector + ' #email']       = eMail;
   inputs[formSelector + ' #comment']     = comment;
   ['firstname', 'lastname', 'email', 'comment'].forEach(function(uiComponentId) {
      mockedBus.sendCommand(shop.topics.ORDER_FORM_ELEMENT_CHANGED, uiComponentId);
   });
};

var givenTheShoppingCartContentIs = function givenTheShoppingCartContentIs(content) {
   mockedBus.publish(shop.topics.SHOPPING_CART_CONTENT, content);
};

var givenCountryOfDestinationIs = function givenCountryOfDestinationIs(countryCode) {
   mockedBus.publish(shop.topics.COUNTRY_OF_DESTINATION, countryCode);
};

var whenInputFormDataAre = function whenInputFormDataAre(firstName, lastName, eMail, comment) {
   givenInputFormDataAre(firstName, lastName, eMail, comment);
};

var whenCountryOfDestinationIs = function whenCountryOfDestinationIs(countryCode) {
   givenCountryOfDestinationIs(countryCode);
};

var whenSetValuesEnteredByUserCalled = function whenSetValuesEnteredByUserCalled() {
   instance.setValuesEnteredByUser();
};

var allRequestedUiComponentsAreChildsOf = function allRequestedUiComponentsAreChildsOf(expectedSelectorPrefix) {
   var result = true;
   var selectors = Object.keys(capturedSelectors);
   for (var index = 0; result && index < selectors.length; index++) {
      var prefixIndex = selectors[index].indexOf(expectedSelectorPrefix);
      result = prefixIndex === 0;
   }
   return result;
};

var inputFormDataAre = function inputFormDataAre(expectedFirstname, expectedLastname, expectedEmail, expectedCountry, expectedComment) {
   return capturedInputValues[formSelector + ' #firstname'] === expectedFirstname &&
      capturedInputValues[formSelector + ' #lastname'] === expectedLastname &&
      capturedInputValues[formSelector + ' #email'] === expectedEmail &&
      capturedInputValues[formSelector + ' #countryOfDestination'] === expectedCountry &&
      capturedInputValues[formSelector + ' #comment'] === expectedComment;
};

var setup = function setup() {
   mockedBus = new testing.MockedBus();
   inputs = {};
   capturedInputValues = {};
   capturedSelectors = {};
   submitButtonDisabled = undefined;
};

describe('InputForm', function() {
	
   beforeEach(setup);
   
   it('a created instance is an instance/object', function() {
      
      givenDefaultInstance();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('an inputForm with no valid input returns false on allValuesAreAvailable()', function() {
      
      givenDefaultInstance();
      whenInputFormDataAre(undefined, undefined, undefined, undefined);
      expect(instance.allValuesAreAvailable()).to.be.eql(false);
   });
   
   it('an inputForm with too short names returns false on allValuesAreAvailable()', function() {
      
      givenDefaultInstance();
      whenInputFormDataAre('a', 'b', 'a@b.c', 'd');
      expect(instance.allValuesAreAvailable()).to.be.eql(false);
   });
   
   it('an inputForm with invalid email address returns false on allValuesAreAvailable()', function() {
      
      givenDefaultInstance();
      whenInputFormDataAre('Daisy', 'Duck', 'daisy@duck', 'a comment');
      expect(instance.allValuesAreAvailable()).to.be.eql(false);
   });
   
   it('an inputForm with valid input returns true on allValuesAreAvailable() - formSelectorA', function() {
      
      givenDefaultInstance();
      whenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment');
      expect(instance.allValuesAreAvailable()).to.be.eql(true);
   });
   
   it('an inputForm with valid input returns true on allValuesAreAvailable() - formSelectorB', function() {
      
      givenAnInstanceWithSelector('anotherSelector');
      whenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment');
      expect(allRequestedUiComponentsAreChildsOf('anotherSelector')).to.be.eql(true);
   });
   
   it('the submit button gets enabled when all necessary data are available - formSelectorA', function() {
      
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment');
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(submitButtonDisabled).to.be.eql(false);
   });
   
   it('the submit button gets enabled when all necessary data are available - formSelectorB', function() {
      
      givenAnInstanceWithSelector('selector-B');
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment');
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(allRequestedUiComponentsAreChildsOf('selector-B')).to.be.eql(true);
   });
   
   it('the submit button gets disabled when the input form data are invalid', function() {
      
      givenDefaultInstance();
      givenInputFormDataAre('Donald', undefined, 'donald@duck.com', 'a comment');
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('the submit button gets disabled when the shopping cart is empty', function() {
      
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment');
      givenTheShoppingCartContentIs([]);
      whenCountryOfDestinationIs('AT');
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('the submit button gets disabled when no country of destination is selected', function() {
      
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment');
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs(undefined);
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('setValuesEnteredByUser() restores previously entered values A', function() {
      
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'please choose a cheap shipping method');
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      givenCountryOfDestinationIs('AT');
      whenSetValuesEnteredByUserCalled();
      expect(inputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'AT', 'please choose a cheap shipping method')).to.be.eql(true);
      expect(submitButtonDisabled).to.be.eql(false);
   });
   
   it('setValuesEnteredByUser() restores previously entered values B', function() {
      
      givenAnInstanceWithSelector('anotherSelector');
      givenInputFormDataAre('Spider', 'Man', 'spider@man.com', 'another comment');
      givenCountryOfDestinationIs('DE');
      whenSetValuesEnteredByUserCalled();
      expect(inputFormDataAre('Spider', 'Man', 'spider@man.com', 'DE', 'another comment')).to.be.eql(true);
      expect(submitButtonDisabled).to.be.eql(true);
      expect(allRequestedUiComponentsAreChildsOf('anotherSelector')).to.be.eql(true);
   });
 });  