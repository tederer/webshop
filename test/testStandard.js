/* global global, __dirname */
"use strict";

// This file is used to provide a common path access to all the tests.
// Alone this does not make much sense, but in combination with code coverage,
// where tests have to run using instrumented production code, they need
// to point to the instrumented code.
//
// It is not a wise idea to try to overwrite require(), as this one is hardwired
// in Node.js .

var path = require("path");

var testSourceBase = path.resolve(path.join(__dirname, "..", "src"));

global.resolveSource = function(file) {
  return path.join(testSourceBase, file);
};
