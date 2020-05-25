on('ready', () => {
  CentralInput.addCMD(/^!\s*(city|road|rift)\s*play\s*$/i, ([, deckType], msg) => {
    //get ACTIVE deck
    const deckName = `${deckType.toTitleCase()} Events`
    const activeDecks = findObjs({
      _type: 'deck',
      name: deckName
    })

    if(!activeDecks || !activeDecks.length) return whisper(`The ${deckName} deck does not exist. Please contact your GM.`, { speakingTo: msg.playerid})
    const activeDeck = activeDecks[0]

    //get BACK deck
    const backDecks = findObjs({
      _type: 'deck',
      name: deckName + ' Back'
    })

    if(!backDecks || !backDecks.length) return whisper(`The ${deckName + ' Back'} deck does not exist. Please contact your GM.`, { speakingTo: msg.playerid})
    const backDeck = backDecks[0]

    //get playzone
    const playZone = getPlayZone(deckName, msg.playerid)
    if(!playZone) return;

    //draw top of ACTIVE deck
    const activeCardid = hackyDrawCard(msg.playerid, activeDeck.id)
    if(!activeCardid) return whisper(`Failed to draw a card from ${deckName}. Please shuffle with [!deck shuffle ${deckName}](!deck shuffle ${deckName}) and try again.`, { speakingTo: msg.playerid })
    const activeCard = getObj('card', activeCardid)

    //get matching card from BACK deck
    const cardBacks = findObjs({
      _type: 'card',
      _deckid: backDeck.id,
      name: activeCard.get('name')
    })

    if(!cardBacks || !cardBacks.length) return whisper(`Failed to find a card back for the card ${activeCard.get('name')} from the deck ${deckName} anywhere in the campaign. Please contact your GM.`)
    const cardBack = cardBacks[0]

    //play ACTIVE card to playZone but override cardBack
    fixedPlayCardToTable(activeCardid, { left: playZone.get('left'), top: playZone.get('top'), pageid: playZone.get('_pageid'), _deckAvatar: cardBack.get('avatar') })
    announce(deckNotification(activeDeck, { card: activeCard, status: 'Played' }))
  }, true)

  CentralInput.addCMD(/^!\s*(city|road|rift)\s*add\s*(\w+)\s*$/i, ([, deckType, cardName], msg) => {
    //get ACTIVE deck
    const deckName = `${deckType.toTitleCase()} Events`
    const activeDecks = findObjs({
      _type: 'deck',
      name: deckName
    })

    if(!activeDecks || !activeDecks.length) return whisper(`The ${deckName} deck does not exist. Please contact your GM.`, { speakingTo: msg.playerid})
    const activeDeck = activeDecks[0]

    //get FRONT deck
    const frontDecks = findObjs({
      _type: 'deck',
      name: deckName + ' Front'
    })

    if(!frontDecks || !frontDecks.length) return whisper(`The ${deckName + ' Front'} deck does not exist. Please contact your GM.`, { speakingTo: msg.playerid})
    const frontDeck = frontDecks[0]

    //get selected card from the FRONT deck
    const cardFronts = findObjs({
      _type: 'card',
      _deckid: frontDeck.id,
      name: cardName
    })

    if(!cardFronts || !cardFronts.length) return whisper(`Failed to find a card front for the card ${cardName} from the deck ${frontDeck} anywhere in the campaign. Please contact your GM.`)
    const cardFront = cardFronts[0]

    //add the card to the ACTIVE deck
    const addedCard = createObj('card', {
      _deckid: activeDeck.id,
      name: cardFront.get('name'),
      avatar: getCleanImgsrc(cardFront.get('avatar'))
    });
    shuffleDeck(activeDeck.id)
    announce(deckNotification(activeDeck, { card: addedCard, status: 'Added' }))
  }, true)

  CentralInput.addCMD(/^!\s*(city|road|rift)\s*remove\s*$/i, ([, deckType, cardName], msg) => {
    //get ACTIVE deck
    const deckName = `${deckType.toTitleCase()} Events`
    const activeDecks = findObjs({
      _type: 'deck',
      name: deckName
    })

    if(!activeDecks || !activeDecks.length) return whisper(`The ${deckName} deck does not exist. Please contact your GM.`, { speakingTo: msg.playerid})
    const activeDeck = activeDecks[0]

    //remove cards if they belong to the event deck
    eachCard(msg, (character, graphic, card, deck) => {
      if(deck.id == activeDeck.id) {
        whisper(deckNotification(deck, {"card": card, "status": "Removed"}), {speakingTo: msg.playerid, gmEcho: true})
        card.remove()
        graphic.remove()
      } else {
        whisper(`The card ${card.get('name')} does not belong to the deck ${activeDeck.get('name')}. Skipping removal of that card.`)
      }
    }, { min: 1 })
  }, true)

  CentralInput.addCMD(/^!\s*(?:city|road|rift)\s*(bottom)\s*$/i, topCardFn, true)
})
