on("ready", () => {
  CentralInput.addCMD(/^!\s*deck\s+(bless|curse|penalize)\s*(?:|x(\d+))\s+(\S.*)$/i, ([, deckAction, numberOfCards, deckPhrase], msg) => {
    numberOfCards = Number(numberOfCards) || 1
    const suggestion = `!deck ${deckAction.toLowerCase}x${numberOfCards} $`
    const decks = suggestCMD(suggestion, deckPhrase + ' Modifiers', msg.playerid, 'deck', obj => playerIsGM(msg.playerid) || obj.get('showplayers'))
    if(!decks) return;
    const deck = decks[0]
    const modifierBaseDecks = findObjs({
      _type: 'deck',
      name: 'Modifier Base'
    })
    if(!modifierBaseDecks) return whisper('The Modifier Base deck does not exist. Please contact your GM.', { speakingTo: msg.playerid })
    const modifierBase = modifierBaseDecks[0];
    let cardName = ''
    switch(deckAction.toLowerCase()) {
      case 'bless':
        cardName = 'Bless'
        break;
      case 'curse':
        cardName = `${deck.get('name') == 'Monster Modifiers' ? 'Monster' : 'Player'} Curse`
        break;
      case 'penalize':
        cardName = 'Penalty -1'
        break;
      default:
        whisper('Unknown card type: ' + deckAction + '. Please contact your GM.', { speakingTo: msg.playerid })
        return
    }

    const cardsToAdd = findObjs({
      _type: 'card',
      _deckid: modifierBase.id,
      name: cardName
    })
    if(!cardsToAdd) return whisper(`The Modifier Base deck did not contain the ${cardName} card. Please contact your GM.`, { speakingTo: msg.playerid })
    const cardToAdd = cardsToAdd[0]
    for(let i = 0; i < numberOfCards; i++) {
      let newCard = createObj('card', {
        _deckid: deck.id,
        name: cardName,
        avatar: cardToAdd.get('avatar')
      })

      whisper(deckNotification(deck, {"card": newCard, "status": "Added"}), {speakingTo: msg.playerid, gmEcho: true})
    }

    shuffleDeck(deck.id, false)
  }, true)
})
