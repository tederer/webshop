/* global shop, common, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

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
