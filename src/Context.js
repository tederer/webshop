/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./bus/Bus.js');

assertNamespace('shop');

shop.Context = {
   bus: new common.infrastructure.bus.Bus(),
   log: function(message) { console.log(message); }
};
   