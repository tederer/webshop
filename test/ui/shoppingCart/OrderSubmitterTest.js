/* global global, shop, testing, assertNamespace */

require(global.PROJECT_SOURCE_ROOT_PATH + '/ui/shoppingCart/OrderSubmitter.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js');

require(global.PROJECT_TEST_ROOT_PATH + '/MockedBus.js');

var DEFAULT_ORDER_TEXT = 'default order text';
var DEFAULT_HTTP_REQUEST_STATUS = 200;
var DEFAULT_HTTP_REQUEST_TEXT = 'completed successfully';
var VISIBLE = 'visible';
var HIDDEN = 'hidden';

var instance;
var mockedBus;
var httpRequesterInvocations;
var capturedOrderText;
var capturedAction;
var capturedActionDelay;
var overlaysVisibility;
var capturedSuccessCallback;
var capturedErrorCallback;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var mockedBus;

var mockedHttpRequester = function mockedHttpRequester(orderText, successCallback, errorCallback) {
   httpRequesterInvocations++;
   capturedOrderText = orderText;
   capturedSuccessCallback = successCallback;
   capturedErrorCallback = errorCallback;
};

var mockedScheduleDelayedAction = function mockedScheduleDelayedAction(action, delayInMillis) {
   capturedAction = action;
   capturedActionDelay = delayInMillis;
};

var inProgressOverlay = {
   show: function show() {
      overlaysVisibility.inProgressOverlay = VISIBLE;
   },
   
   hide: function hide() {
      overlaysVisibility.inProgressOverlay = HIDDEN;
   }
};

var successOverlay = {
   show: function show() {
      overlaysVisibility.successOverlay = VISIBLE;
   },
   
   hide: function hide() {
      overlaysVisibility.successOverlay = HIDDEN;
   }
};

var errorOverlay = {
   show: function show() {
      overlaysVisibility.errorOverlay = VISIBLE;
   },
   
   hide: function hide() {
      overlaysVisibility.errorOverlay = HIDDEN;
   }
};

var givenInstance = function givenInstance() {
   instance = new shop.ui.shoppingCart.OrderSubmitter(inProgressOverlay, successOverlay, errorOverlay, mockedBus, mockedHttpRequester, mockedScheduleDelayedAction);
};

var givenAnOrderGetsSubmitted = function givenAnOrderGetsSubmitted() {
   mockedBus.sendCommand(shop.topics.SUBMIT_ORDER, DEFAULT_ORDER_TEXT);
};

var givenHttpRequestCompletesSuccessfully = function givenHttpRequestCompletesSuccessfully() {
   capturedSuccessCallback();
};

var givenHttpRequestCompletesWithError = function givenHttpRequestCompletesWithError() {
   capturedErrorCallback({status: DEFAULT_HTTP_REQUEST_STATUS, statusText: DEFAULT_HTTP_REQUEST_TEXT});
};

var givenInProgressMinDurationPassed = function givenInProgressMinDurationPassed() {
   capturedAction();
};

var whenAnOrderGetsSubmitted = function whenAnOrderGetsSubmitted() {
   givenAnOrderGetsSubmitted();
};

var whenHttpRequestCompletesSuccessfully = function whenHttpRequestCompletesSuccessfully() {
   givenHttpRequestCompletesSuccessfully();
};

var whenHttpRequestCompletesWithError = function whenHttpRequestCompletesWithError() {
   givenHttpRequestCompletesWithError({status: DEFAULT_HTTP_REQUEST_STATUS, statusText: DEFAULT_HTTP_REQUEST_TEXT});
};

var whenInProgressMinDurationPassed = function whenInProgressMinDurationPassed() {
   givenInProgressMinDurationPassed();
};

var setup = function setup() {
   shop.Context.log = function log(message) {};
   capturedAction = undefined;
   capturedActionDelay = undefined;
   capturedSuccessCallback = undefined;
   capturedErrorCallback = undefined;
   httpRequesterInvocations = 0;
   capturedOrderText = undefined;
   overlaysVisibility = {};
   mockedBus = new testing.MockedBus();
};

describe('CartController', function() {
	
   beforeEach(setup);
   
   it('a created instance is an instance/object', function() {
      givenInstance();
      expect(valueIsAnObject(instance)).to.be.eql(true);
   });
   
   it('a new order submitter hides all used overlays', function() {
      givenInstance();
      expect(overlaysVisibility.inProgressOverlay).to.be.eql(HIDDEN);
      expect(overlaysVisibility.successOverlay).to.be.eql(HIDDEN);
      expect(overlaysVisibility.errorOverlay).to.be.eql(HIDDEN);
   });
   
   it('submitted order text gets provided to the http requester', function() {
      givenInstance();
      whenAnOrderGetsSubmitted();
      expect(httpRequesterInvocations).to.be.eql(1);
      expect(capturedOrderText).to.be.eql(DEFAULT_ORDER_TEXT);
   });
   
   it('submitting an order starts a schedules action that should get executed when the minimum in progress duration passed.', function() {
      givenInstance();
      whenAnOrderGetsSubmitted();
      expect(capturedActionDelay).to.be.eql(2000);
   });
   
   it('submitting an order shows the in progress overlay', function() {
      givenInstance();
      whenAnOrderGetsSubmitted();
      expect(overlaysVisibility.inProgressOverlay).to.be.eql(VISIBLE);
   });
   
   it('in progress overlay remains visible when http requests completes successfully before the minimum in progress duration passed', function() {
      givenInstance();
      givenAnOrderGetsSubmitted();
      whenHttpRequestCompletesSuccessfully();
      expect(overlaysVisibility.inProgressOverlay).to.be.eql(VISIBLE);
   });
   
   it('in progress overlay remains visible when http requests completes with an error before the minimum in progress duration passed', function() {
      givenInstance();
      givenAnOrderGetsSubmitted();
      whenHttpRequestCompletesWithError();
      expect(overlaysVisibility.inProgressOverlay).to.be.eql(VISIBLE);
   });
   
   it('in progress overlay gets hidden after its minimum duration when http requests completes successfully', function() {
      givenInstance();
      givenAnOrderGetsSubmitted();
      givenHttpRequestCompletesSuccessfully();
      whenInProgressMinDurationPassed();
      expect(overlaysVisibility.inProgressOverlay).to.be.eql(HIDDEN);
   });
   
   it('in progress overlay gets hidden after its minimum duration when http requests completes with an error', function() {
      givenInstance();
      givenAnOrderGetsSubmitted();
      givenHttpRequestCompletesWithError();
      whenInProgressMinDurationPassed();
      expect(overlaysVisibility.inProgressOverlay).to.be.eql(HIDDEN);
   });
   
   it('success overlay gets shown when http requests completes successfully within the in progress duration', function() {
      givenInstance();
      givenAnOrderGetsSubmitted();
      givenHttpRequestCompletesSuccessfully();
      whenInProgressMinDurationPassed();
      expect(overlaysVisibility.successOverlay).to.be.eql(VISIBLE);
   });
   
   it('error overlay gets shown when http requests completes with an error within the in progress duration', function() {
      givenInstance();
      givenAnOrderGetsSubmitted();
      givenHttpRequestCompletesWithError();
      whenInProgressMinDurationPassed();
      expect(overlaysVisibility.errorOverlay).to.be.eql(VISIBLE);
   });
   
   it('in progress overlay gets hidden when http requests completes successfully after the in progress duration', function() {
      givenInstance();
      givenAnOrderGetsSubmitted();
      givenInProgressMinDurationPassed();
      whenHttpRequestCompletesSuccessfully();
      expect(overlaysVisibility.inProgressOverlay).to.be.eql(HIDDEN);
   });
   
   it('in progress overlay gets hidden when http requests completes with an error after the in progress duration', function() {
      givenInstance();
      givenAnOrderGetsSubmitted();
      givenInProgressMinDurationPassed();
      whenHttpRequestCompletesWithError();
      expect(overlaysVisibility.inProgressOverlay).to.be.eql(HIDDEN);
   });
   
   it('success overlay gets shown when http requests completes successfully after the in progress duration', function() {
      givenInstance();
      givenAnOrderGetsSubmitted();
      givenInProgressMinDurationPassed();
      whenHttpRequestCompletesSuccessfully();
      expect(overlaysVisibility.successOverlay).to.be.eql(VISIBLE);
   });
   
   it('error overlay gets shown when http requests completes with an error after the in progress duration', function() {
      givenInstance();
      givenAnOrderGetsSubmitted();
      givenInProgressMinDurationPassed();
      whenHttpRequestCompletesWithError();
      expect(overlaysVisibility.errorOverlay).to.be.eql(VISIBLE);
   });
}); 
      