/* global shop, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

shop.ui.Actions = {

   showPicture: function showPicture(filename) {
      shop.Context.bus.sendCommand(shop.topics.SHOW_PICTURE, filename);
   }
};

