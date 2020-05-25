function getPlayZone(deckName, playerid) {
  var pageid = getPlayerPageID(playerid)
  const playZones = findObjs({
    _type: 'graphic',
    _pageid: pageid,
    layer: 'gmlayer',
    name: `${deckName} INK CardPlayer`
  })

  if(playZones == 0) {
    whisper(`WARNING: The Deck ${deckName} does not have a designated play zone. Please contact your GM.`, {speakingTo: playerid})
    return
  } else if(playZones > 1) {
    whisper(`WARNING: There is more than one play zone for the Deck ${deckName}. Plese contact your GM.`, {speakingTo: playerid})
    return
  }

  return playZones[0]
}
