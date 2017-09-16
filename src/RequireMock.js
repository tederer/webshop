/* global window */

/*
 * Mocking the global function require, which gets used by node.js to 
 * load necessary modules, is necessary because on the webpage the modules
 * get loaded via <script> tags and the require function does not exist there.
*/
window.require = function(filename) {};