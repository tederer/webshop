/* global global */
'use strict';

var path = require('path');
var fileSystem = require('fs');

global.PROJECT_ROOT_PATH = path.resolve('.');
global.PROJECT_SOURCE_ROOT_PATH = global.PROJECT_ROOT_PATH + '/src';
global.PROJECT_TEST_ROOT_PATH   = global.PROJECT_ROOT_PATH + '/test';

var JAVASCRIPT_TARGET_FOLDER = global.PROJECT_ROOT_PATH + '/webroot/javascripts';
var CONCAT_FOLDER = JAVASCRIPT_TARGET_FOLDER;
var CONCATENATED_FILE = CONCAT_FOLDER + '/webshop_spa.js';

// Grunt is a JavaScript task runner, similar to Ant. 
// See http://gruntjs.com/ for details

module.exports = function(grunt) {

   var jsFiles = ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'];
   
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

       // Run JSHint on all sources. JSHint is a linter that checks for specific
       // formatting rules and/or coarse syntax checks. The file '.jshintrc'
       // contains the settings.
       // See http://jshint.org/about/ for details
      jshint: {
         allButNotSettings : {
            options: {
               jshintrc: '.jshintrc'
            },
            src: jsFiles,
            filter: function filter(path) { var index = path.indexOf('settings.js'); return index === -1; }
         }
      },

      // Run tests using mocha. Mocha is one of the more commonly used test
      // frameworks.
      // See http://visionmedia.github.io/mocha/ for details
      mochaTest: {
      libRaw: {
        options: {
          require: ['./test/testGlobals.js', './test/testStandard.js'],
          reporter: 'spec'
        },
        src: ['test/**/*Test.js']
      }
      },
      
      clean: [JAVASCRIPT_TARGET_FOLDER],

      copy: {
         // main: {
         //    expand: true,
         //    flatten: false,
         //    cwd: 'src',
         //    src: '**/*.js',
         //    dest: 'webroot/javascripts'
         // }
      },
      
      concat: {
         javascripts: {
            src: ['src/**/*.js'],
            dest: CONCATENATED_FILE,
            filter: function(filepath) {
               var nameSpaceUtils = 'NamespaceUtils.js';
               return filepath.length < nameSpaceUtils.length ||
                        filepath.indexOf(nameSpaceUtils) !== (filepath.length - nameSpaceUtils.length);
            }
         }
      }
   });

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-mocha-test');
   //grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-concat');
   
   grunt.task.registerTask('correctConcatenatedFile', 'moves the prototype assignements to the and of the file and brings them into the right order', function() {
      var CRLF = '\r\n';
      var prototypeRegexp = /.*prototype =.*/g;
      var requireRegexp = /require\([^\(]*\);\s*\r?\n/g;
      var linterSettingsRegexp = /\/\*\s*global[^\n]*\r?\n/g;
      var concatenatedContent = fileSystem.readFileSync(CONCATENATED_FILE, 'utf8');
      var namespaceUtilsContent = fileSystem.readFileSync(global.PROJECT_SOURCE_ROOT_PATH + '/NamespaceUtils.js', 'utf8');
      var prototypeAssignments = concatenatedContent.match(prototypeRegexp);
      
      if (prototypeAssignments === null) {
         console.log('no prototype assignments found');
      } else {
         var newContent = (namespaceUtilsContent + concatenatedContent)
                              .replace(prototypeRegexp, '')
                              .replace(requireRegexp, '')
                              .replace(linterSettingsRegexp, '');
         fileSystem.writeFileSync(CONCATENATED_FILE, newContent, 'utf8');
         fileSystem.appendFileSync(CONCATENATED_FILE, CRLF + prototypeAssignments.join(CRLF), 'utf8');
         console.log(CRLF + '\tmoved ' + prototypeAssignments.length + ' prototype assignements to the end of ' + CONCATENATED_FILE);
      }
   });

   grunt.registerTask('lint', ['jshint']);
   grunt.registerTask('format', ['jsbeautifier']);
   grunt.registerTask('test', ['mochaTest:libRaw']);
   grunt.registerTask('default', ['clean', 'lint', 'test', 'concat', 'correctConcatenatedFile']);
 };
