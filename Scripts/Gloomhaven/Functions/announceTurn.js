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
    let avatar = undefined
    const players = findObjs({ _type: 'player', _displayname: turns.turnorder[0].custom })
    if(players && players.length) {
      const character = defaultCharacter(players[0].id)
      if(character) {
        avatar = character.get('avatar')
      }
    }

    if(!avatar) {
      const decks = filterObjs(obj => {
        if(obj.get('_type') != 'deck') return false;
        if(obj.get('name') == `M ${turns.turnorder[0].custom}`) return true;
        return false;
      });

      if(decks && decks.length) {
        avatar = decks[0].get('avatar')
      }
    }

    announce(`&{template:default} {{name=Current Turn}} {{turn=${turns.turnorder[0].custom}}} ${avatar ? `{{avatar=[avatar](${avatar}#.png)}}` : ''} {{next=[!init advance](!init advance)}}`)
  }
}
