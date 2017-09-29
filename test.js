var Parent = function Parent() {
   this.init = function init() {
      console.log('init of parent');
   };
      
   this.id = "parent";
};

var Son = function Son() {
   this.init = function init() {
      console.log('init of son');
      Son.prototype.init.call(this);
   };
   
   this.id = "son";
};

Son.prototype = new Parent();

var son = new Son();
console.log(Son.prototype);

son.init();

var a = { x:1 };
var b = { x:1 };

console.log(a === b);