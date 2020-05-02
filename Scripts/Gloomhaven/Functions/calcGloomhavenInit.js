//calculate the initiative of currently selected graphics
function calcGloomhavenInit(msg){
  if(!msg.selected || msg.selected.length < 1) {
    whisper("Select at least one graphic.", {speakingTo: msg.playerid})
    return
  }

  var initiativeDetails = []
  eachCard(msg, (character, graphic, card, deck) => {
    let initiativeValue = card.get('name').substring(0,2)

    if(!RegExp('^\\d\\d$').test(initiativeValue)) {
      whisper(`Card ${card.get('name')} does not start with a valid initiative value.`)
      return
    }

    initiativeDetails.push({
      type: deck.get('name').startsWith('M ') ? 'Monster' : 'Player',
      position: graphic.get('left'),
      value: card.get('name').substring(0,2),
      deckname: deck.get('name')
    })
  })

  if(initiativeDetails.length == 1
    && initiativeDetails[0].type == 'Monster') {
    return {
      name: initiativeDetails[0].deckname.substring(2),
      first: initiativeDetails[0].value,
      second: 'M'
    }
  } else if(initiativeDetails.length == 2
    && initiativeDetails[0].type == 'Player'
    && initiativeDetails[1].type == 'Player') {
    let player = getObj('player', msg.playerid)
    if(!player) {
      whisper('You the player do not exist. Contacting the gm.', {speakingTo: msg.playerid, gmEcho: true})
      return
    }

    initiativeDetails.sort((a, b) => a.position - b.position)
    return {
      name: player.get('_displayname'),
      first: initiativeDetails[0].value,
      second: initiativeDetails[1].value
    }
  } else {
    whisper('Select exactly two player initiative cards or one monster initiative card.')
    return
  }
}
