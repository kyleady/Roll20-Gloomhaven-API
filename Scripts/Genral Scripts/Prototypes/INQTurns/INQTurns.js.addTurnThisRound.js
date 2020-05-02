//add or replace a turn
INQTurns.prototype.addTurnThisRound = function(turnObj, options) {
  //delete any previous instances of this character
  this.removeTurn(turnObj);

  //determine where a new turn starts
  let endOfRoundIndex = undefined
  for(let i = 0; i < this.turnorder.length; i++) {
    if(this.isEndOfRound(i)) {
      endOfRoundIndex = i
      break;
    }
  }

  //if the array is empty, just add the turn
  if(endOfRoundIndex == undefined){
    this.turnorder.push(turnObj);
    return
  }

  for(let i = 1; i < endOfRoundIndex; i++){
    if((this.order == 'ascending' && turnObj.pr < this.turnorder[i].pr)
      || (this.order == 'descending' && turnObj.pr > this.turnorder[i].pr)){
      //insert the turn here
      this.turnorder.splice(i, 0, turnObj);
      return;
    }
  }

  this.turnorder.splice(endOfRoundIndex, 0, turnObj);
}
