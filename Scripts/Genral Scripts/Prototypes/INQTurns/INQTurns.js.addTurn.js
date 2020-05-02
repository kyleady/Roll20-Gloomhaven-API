//add or replace a turn
INQTurns.prototype.addTurn = function(turnObj, options) {
  this.removeTurn(turnObj);
  this.turnorder.push(turnObj);
  this.sort()
}
