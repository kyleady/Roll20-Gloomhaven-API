function getPlayerPageID(playerid) {
  var player = getObj('player', playerid);
  if(!player) return whisper('Player does not exist.');
  var pageid;
  if(playerIsGM(playerid)) {
    pageid = player.get('_lastpage');
  } else {
    var specificPages = Campaign().get('playerspecificpages');
    if(specificPages) {
      pageid = specificPages[playerid];
    }
  }

  if(!pageid) {
    return Campaign().get('playerpageid')
  } else {
    return pageid;
  }
}
