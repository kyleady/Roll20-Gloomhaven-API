//announce the current turn
function announceTurn(turns) {
  if(!turns.turnorder || !turns.turnorder.length) {
    announce(`&{template:default} {{name=Current Turn}} {{status=Empty}}`)
    return
  }

  if(turns.isEndOfRound()) {
    const currentRound = Number(turns.turnorder[0].pr.replace(/^R/, ''))
    announce(`&{template:default} {{name=Current Turn}} {{status=${currentRound > 1 ? 'New Round' : 'Scenario Start' }}} {{Round=${currentRound}}} {{plan=[!init plan](!init plan)}}`)
  } else {
    let avatars = []
    const players = findObjs({ _type: 'player', _displayname: turns.turnorder[0].custom })
    if(players && players.length) {
      avatars = state.INK_GLOOMHAVEN.playerInitiative[players[0].get('_d20userid')].imgsrcs
    }

    if(!avatars.length) {
      const decks = filterObjs(obj => {
        if(obj.get('_type') != 'deck') return false;
        if(obj.get('name') == `M ${turns.turnorder[0].custom}`) return true;
        return false;
      });

      if(decks && decks.length) {
        avatars = state.INK_GLOOMHAVEN.monsterInitiative[decks[0].id].initObj.imgsrcs
      }
    }

    announce(`&{template:default} {{name=Current Turn}} {{turn=${turns.turnorder[0].custom}}} ${avatars.length ? `{{cards=${avatars.map(avatar => `[avatar](${avatar}#.png)`).join(' ')}}}` : ''} {{next=[!init advance](!init advance)}}`)
  }
}
