//announce the current turn
function announcePlan() {
  let output = '&{template:default} {{name=Planning Initiative}}'
  const players = findObjs({ _type: 'player', _online: true })
  const totalPlayers = players.length
  let readyPlayers = 0
  _.each(players, player => {
    const isReady = player.get('_d20userid') in state.INK_GLOOMHAVEN.playerInitiative
    output += `{{${player.get('_displayname')}=${isReady ? 'Ready' : '-'}}} `
    if(isReady) readyPlayers++
  })

  if(readyPlayers == totalPlayers) {
    output += '{{reveal=[!Reveal](!init reveal)}} '
  } else {
    output += '{{plan=Select and [!init plan](!init plan)}}'
  }

  announce(output)
}
