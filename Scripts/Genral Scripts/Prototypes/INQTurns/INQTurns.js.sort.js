//sort the turn order
INQTurns.prototype.sort = function() {
  if(this.order == 'ascending') {
    this.turnorder.sort((a, b) => a.pr < b.pr ? -1 : (a.pr > b.pr ? 1 : 0))
  } else if(this.order == 'descending') {
    this.turnorder.sort((a, b) => a.pr > b.pr ? -1 : (a.pr < b.pr ? 1 : 0))
  } else {
    log('WARNING: unknown sort order')
  }
}
