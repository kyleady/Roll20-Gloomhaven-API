//move turn order to the next turn
INQTurns.prototype.advance = function() {
  let firstTurn = this.turnorder.shift()
  this.turnorder.push(firstTurn)
}
