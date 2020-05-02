//get the initiative roll of a turn already in the turn order
INQTurns.prototype.getInit = function(turnObj) {
  const isCustom = turnObj.id == -1
  for(var i = 0; i < this.turnorder.length; i++){
    //has this token already been included?
    if((isCustom && turnObj.custom == turnObj.custom)
      || (!isCustom && graphicid == this.turnorder[i].id)) {
      return this.turnorder[i]
    }
  }
}
