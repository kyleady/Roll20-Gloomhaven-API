INQTurns.prototype.smallestIndex = function(){
  var result = undefined;
  var smallest = undefined;

  for(var i = 0; i < this.turnorder.length; i++){
    if(smallest == undefined || this.turnorder[i].pr < smallest){
      smallest = this.turnorder[i].pr;
      result = i;
    }
  }

  return result;
}
