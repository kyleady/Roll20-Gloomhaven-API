function recordMonsterDetails(deckid, playerid, characterid) {
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
      statId: undefined,
      initObj: undefined
    }

    const statZones = findObjs({
      _type: 'graphic',
      _pageid: Campaign().get('playerpageid'),
      name: `Monster ${playIndex} INK Stats`
    })

    if(!statZones || !playZones.length) return whisper(`Monster ${playIndex} INK Stats does not exist.`, { speakingTo: playerid })
    const statZone = statZones[0]
    const character = getObj('character', characterid)
    const statName = `${character.get('name').replace(/ - (Elite|Normal)$/i, '')} - Stats`
    const statObjs = findObjs({
      _type: 'character',
      name: statName
    })

    if(!statObjs || !statObjs.length) return whisper(`${statName} does not exist.`)
    const statObj = statObjs[0]

    statObj.get('_defaulttoken', _defaultjson => {
      const modifiedDetails = carefulParse(_defaultjson)
      delete modifiedDetails._type
      modifiedDetails._pageid = Campaign().get('playerpageid')
      modifiedDetails.layer = 'objects'
      modifiedDetails.left = statZone.get('left')
      modifiedDetails.top = statZone.get('top')
      modifiedDetails.width = statZone.get('width')
      modifiedDetails.height = statZone.get('height')
      modifiedDetails.represents = statObj.id
      modifiedDetails.controlledby = 'all'
      const currentSide = state.INK_GLOOMHAVEN.scenarioLevel < 4 ? 0 : 1
      modifiedDetails.rotation = 360 - (state.INK_GLOOMHAVEN.scenarioLevel - 4 * currentSide) * 90
      const sides = modifiedDetails.sides.split('|')
      modifiedDetails.imgsrc = getCleanImgsrc(decodeURIComponent(sides[currentSide]))
      const createdStats = createObj('graphic', modifiedDetails)
      state.INK_GLOOMHAVEN.monsterInitiative[deckid].statId = createdStats.id
    })
  }
}
