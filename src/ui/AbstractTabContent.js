/* global shop, assertNamespace */

require('../NamespaceUtils.js');
require('../Context.js');
require('./AbstractLanguageDependentComponent.js');

assertNamespace('shop.ui');

/**
 * Derived objects have to:
 *    *) override getSelector
 *    *) override onLanguageChanged (defined in AbstractLanguageDependentComponent)
 *    *) call the initialize (defined in AbstractLanguageDependentComponent)
 */
shop.ui.AbstractTabContent = function AbstractTabContent() {
   
   this.getSelector = function getSelector() {
      shop.Context.log('Subclass does not override getSelector() in AbstractTabContent!');
   };
   
   this.show = function show() {
      $(this.getSelector()).css('visibility', 'visible');
   };
   
   this.hide = function hide() {
      $(this.getSelector()).css('visibility', 'hidden');
   };
};
   
shop.ui.AbstractTabContent.prototype = new shop.ui.AbstractLanguageDependentComponent();