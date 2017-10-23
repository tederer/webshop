/* global shop, common, assertNamespace */

require('./NamespaceUtils.js');
require('./Language.js');
require('./bus/Bus.js');

assertNamespace('shop');

shop.Context = {
   bus: new common.infrastructure.bus.Bus(),
   log: function(message) { console.log(message); },
   defaultVisibleTab: 'start',
   defaultLanguage: shop.Language.DE
};
