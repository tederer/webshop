/* global shop, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');

assertNamespace('shop.ui');

shop.ui.BigPicture = {

   show: function show(filename) {
      shop.Context.bus.sendCommand(shop.topics.SHOW_PICTURE, filename);
   }
};

