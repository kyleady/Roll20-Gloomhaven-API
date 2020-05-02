//add or replace a turn
INQTurns.prototype.addTurnInCyclicOrder = function(turnObj, options) {
  //delete any previous instances of this character
  this.removeTurn(turnObj);
  //be sure the turns are properly ordered
  if(this.turnorder.length && this.isOrdered()){
    //determine where a new turn starts
    let startIndex = this.order == 'ascending' ? this.smallestIndex() : this.largestIndex();
    //if the array is empty, just add the turn
    if(startIndex == undefined){
      return this.turnorder.push(turnObj);
    }

    let turnAdded = false;
    for(var i = startIndex; i < this.turnorder.length; i++){
      if((this.order == 'ascending' && turnObj.pr < this.turnorder[i].pr)
        || (this.order == 'descending' && turnObj.pr > this.turnorder[i].pr)) {
        //insert the turn here
        this.turnorder.splice(i, 0, turnObj);
        return
      }
    }

    for(var i = 1; i < startIndex; i++){
      if((this.order == 'ascending' && turnObj.pr < this.turnorder[i].pr)
        || (this.order == 'descending' && turnObj.pr > this.turnorder[i].pr)) {
        //insert the turn here
        this.turnorder.splice(i, 0, turnObj);
        return
      }
    }

    if((this.order == 'ascending' && turnObj.pr < this.turnorder[0].pr)
      || (this.order == 'descending' && turnObj.pr > this.turnorder[0].pr)) {
        this.turnorder.push(turnObj)
    } else {
      this.turnorder.splice(startIndex, 0, turnObj)
    }
  } else {
    //just add the turn on the end
    this.turnorder.push(turnObj);
  }
}
