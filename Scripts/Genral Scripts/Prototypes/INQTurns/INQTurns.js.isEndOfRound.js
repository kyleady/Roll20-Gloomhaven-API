INQTurns.prototype.isEndOfRound = function(index) {
  index = index || 0
  return /^\s*end\s*of\s*round\s*$/i.test(this.turnorder[index].custom)
}
