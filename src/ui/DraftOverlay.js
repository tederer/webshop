/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

shop.ui.DraftOverlay = function DraftOverlay() {
   var thisInstance = this;
   var textFieldSelector = '#draftOverlay #passwordTextField';
   var buttonSelector = '#draftOverlay #draftOverlayButton';
   
   this.init = function init() {
      $(textFieldSelector).on('keypress', function (e) {
         if(e.which === 13){
            thisInstance.passwordEntered();
         }
      });
      $(textFieldSelector).focus();
      $(buttonSelector).on('click', function() {
         thisInstance.passwordEntered();
      });
   };
   
   this.passwordEntered = function passwordEntered() {
      var enteredPassword = $(textFieldSelector).val();
      if (enteredPassword === 'lotte') {
         $('#draftOverlay').css('visibility', 'hidden');
      }
   };
};
