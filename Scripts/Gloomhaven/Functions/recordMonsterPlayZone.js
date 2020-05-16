function recordMonsterPlayZone(deckid, playerid) {
  if(!(deckid in state.INK_GLOOMHAVEN.monsterInitiative)) {
    const playIndex = 1 + Object.keys(state.INK_GLOOMHAVEN.monsterInitiative).length
    const playZones = findObjs({
      _type: 'graphic',
      _pageid: Campaign().get('playerpageid'),
      name: `Monster ${playIndex} INK CardPlayer`
    })

    if(!playZones || !playZones.length) return whisper(`Monster ${playIndex} INK CardPlayer does not exist.`, { speakingTo: playerid })
    state.INK_GLOOMHAVEN.monsterInitiative[deckid] = {
      playZoneId: playZones[0].id,
      initObj: undefined
    }
  }
}
