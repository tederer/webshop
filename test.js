var Plant = function Plant() {
   
   var setVisible = function setVisible() {
      console.log('setVisible');
      console.log(this);
   };
   
   this.show = function show() {
      console.log('show');
      console.log(this);
      setVisible();
   }
};

var plant = new Plant();
plant.show();