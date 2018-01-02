/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/shoppingCart/InputForm.js');
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
      prop: function prop(propertyName, value) {
         if (value === undefined) {
            return (propertyName === 'checked') ? inputs[selector] : undefined;
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
   instance = new shop.shoppingCart.InputForm(formSelector, mockedUiComponentProvider, mockedBus);
};

var givenDefaultInstance = function givenDefaultInstance() {
   formSelector = DEFAULT_SELECTOR;
   createInstance();
};

var givenAnInstanceWithSelector = function givenAnInstanceWithSelector(selector) {
   formSelector = selector;
   createInstance();
};

var givenInputFormDataAre = function givenInputFormDataAre(firstName, lastName, eMail, comment, termsChecked) {
   inputs[formSelector + ' #firstname']                  = firstName;
   inputs[formSelector + ' #lastname']                   = lastName;
   inputs[formSelector + ' #email']                      = eMail;
   inputs[formSelector + ' #comment']                    = comment;
   inputs[formSelector + ' #termsAndConditionsCheckbox'] = termsChecked;
   ['firstname', 'lastname', 'email', 'comment', 'termsAndConditionsCheckbox'].forEach(function(uiComponentId) {
      mockedBus.sendCommand(shop.topics.ORDER_FORM_ELEMENT_CHANGED, uiComponentId);
   });
};

var givenTheShoppingCartContentIs = function givenTheShoppingCartContentIs(content) {
   mockedBus.publish(shop.topics.SHOPPING_CART_CONTENT, content);
};

var givenCountryOfDestinationIs = function givenCountryOfDestinationIs(countryCode) {
   mockedBus.publish(shop.topics.COUNTRY_OF_DESTINATION, countryCode);
};

var whenInputFormDataAre = function whenInputFormDataAre(firstName, lastName, eMail, comment, termsChecked) {
   givenInputFormDataAre(firstName, lastName, eMail, comment, termsChecked);
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

var inputFormDataAre = function inputFormDataAre(expectedFirstname, expectedLastname, expectedEmail, expectedCountry, expectedComment, expectedTermsChecked) {
   return capturedInputValues[formSelector + ' #firstname'] === expectedFirstname &&
      capturedInputValues[formSelector + ' #lastname'] === expectedLastname &&
      capturedInputValues[formSelector + ' #email'] === expectedEmail &&
      capturedInputValues[formSelector + ' #countryOfDestination'] === expectedCountry &&
      capturedInputValues[formSelector + ' #comment'] === expectedComment &&
      capturedInputValues[formSelector + ' #termsAndConditionsCheckbox'] === expectedTermsChecked;
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
   
   it('a created instance disables the submit button', function() {
      givenDefaultInstance();
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('the submit button gets enabled when all necessary data are available - formSelectorA', function() {
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment', true);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(submitButtonDisabled).to.be.eql(false);
   });
   
   it('all requested UI components are childs of input form_A', function() {
      givenAnInstanceWithSelector('selector-A');
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment', true);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(allRequestedUiComponentsAreChildsOf('selector-A')).to.be.eql(true);
   });
   
   it('all requested UI components are childs of input form_B', function() {
      givenAnInstanceWithSelector('selector-B');
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment', true);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(allRequestedUiComponentsAreChildsOf('selector-B')).to.be.eql(true);
   });
   
   it('the submit button gets disabled when the firstname is shorter than 3 characters', function() {
      givenDefaultInstance();
      givenInputFormDataAre('Do', 'Duck', 'donald@duck.com', 'not relevant', true);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('the submit button gets disabled when the lastname is shorter than 3 characters', function() {
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Du', 'donald@duck.com', 'not relevant', true);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('the submit button gets disabled when the email address is invalid', function() {
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck', 'not relevant', true);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('the submit button gets disabled when the email address is invalid', function() {
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck', 'not relevant', true);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('the submit button gets disabled when the terms are not checked', function() {
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'not relevant', false);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs('AT');
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('the submit button gets disabled when the shopping cart is empty', function() {
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment', true);
      givenTheShoppingCartContentIs([]);
      whenCountryOfDestinationIs('AT');
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('the submit button gets disabled when no country of destination is selected', function() {
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'a comment', true);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      whenCountryOfDestinationIs(undefined);
      expect(submitButtonDisabled).to.be.eql(true);
   });
   
   it('setValuesEnteredByUser() restores previously entered values A', function() {
      givenDefaultInstance();
      givenInputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'please choose a cheap shipping method', true);
      givenTheShoppingCartContentIs([{ productId: 'prodA', quantity: 2 }]);
      givenCountryOfDestinationIs('AT');
      whenSetValuesEnteredByUserCalled();
      expect(inputFormDataAre('Donald', 'Duck', 'donald@duck.com', 'AT', 'please choose a cheap shipping method', true)).to.be.eql(true);
      expect(submitButtonDisabled).to.be.eql(false);
      expect(allRequestedUiComponentsAreChildsOf(DEFAULT_SELECTOR)).to.be.eql(true);
   });
   
   it('setValuesEnteredByUser() restores previously entered values B', function() {
      givenAnInstanceWithSelector('anotherSelector');
      givenInputFormDataAre('Spider', 'Man', 'spider@man.com', 'another comment', false);
      givenCountryOfDestinationIs('DE');
      whenSetValuesEnteredByUserCalled();
      expect(inputFormDataAre('Spider', 'Man', 'spider@man.com', 'DE', 'another comment', false)).to.be.eql(true);
      expect(submitButtonDisabled).to.be.eql(true);
      expect(allRequestedUiComponentsAreChildsOf('anotherSelector')).to.be.eql(true);
   });
 });  