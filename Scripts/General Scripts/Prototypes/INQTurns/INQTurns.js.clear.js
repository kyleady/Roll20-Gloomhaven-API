//delete items from the turnorder
INQTurns.prototype.clear = function(options) {
  options = options || { formula: true, custom: true, graphic: true }

  for(let i = 0; i < this.turnorder.length; i++) {
    if((options.formula && 'formula' in this.turnorder[i])
    || (options.custom && !('formula' in this.turnorder[i]) && this.turnorder[i].id == -1)
    || (options.graphic && !('formula' in this.turnorder[i]) && this.turnorder[i].id != -1)) {
      //remove this entry
      this.turnorder.splice(i, 1);
      //the array has shrunken, take a step back
      i--;
    }
  }
}
