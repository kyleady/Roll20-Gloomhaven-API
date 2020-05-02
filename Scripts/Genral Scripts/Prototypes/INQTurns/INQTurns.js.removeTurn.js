INQTurns.prototype.removeTurn = function(turnObj) {
  const isCustom = turnObj.id == '-1'
  //step through the turn order and delete any previous initiative rolls
  for(var i = 0; i < this.turnorder.length; i++){
    //has this token already been included?
    if((isCustom && turnObj.custom == this.turnorder[i].custom)
      || (!isCustom && turnObj.id == this.turnorder[i].id)) {
      //remove this entry
      this.turnorder.splice(i, 1);
      //the array has shrunken, take a step back
      i--;
    }
  }
}
