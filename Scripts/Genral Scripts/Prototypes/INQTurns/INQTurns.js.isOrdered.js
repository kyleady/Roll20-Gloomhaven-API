INQTurns.prototype.isOrdered = function() {
  let isOrdered = true;
  let prev = undefined;
  let startIndex = this.order == 'ascending' ? this.smallestIndex() : this.largestIndex();
  for(var i = 0; i < this.turnorder.length; i++) {
      if(prev != undefined && i != startIndex) {
        if((this.order == 'ascending' && this.turnorder[i].pr < prev)
          || (this.order == 'descending' && this.turnorder[i].pr > prev)) {
          isOrdered = false
          break
        }
      }

    prev = this.turnorder[i].pr;
  }

  return isOrdered;
}
