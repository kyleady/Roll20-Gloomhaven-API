function showDeckFn(matches, msg) {
  var suggestion = '!deck show $'
  var deckPhrase = matches[1] || ''
  var decks = suggestCMD(suggestion, deckPhrase, msg.playerid, 'deck', obj => playerIsGM(msg.playerid) || obj.get('showplayers'))
  if(!decks) return;
  var deck = decks[0]
  deck.set('shown', true)
  whisper(deckNotification(deck, {"status": "Shown"}), {speakingTo: msg.playerid, gmEcho: true})
}

function hideDeckFn(matches, msg) {
  var suggestion = '!deck hide $'
  var deckPhrase = matches[1] || ''
  var decks = suggestCMD(suggestion, deckPhrase, msg.playerid, 'deck', obj => playerIsGM(msg.playerid) || obj.get('showplayers'))
  if(!decks) return;
  var deck = decks[0]
  deck.set('shown', false)

  whisper(deckNotification(deck, {"status": "Hidden"}), {speakingTo: msg.playerid, gmEcho: true})
}

function rebuildDeckFn(matches, msg) {
  var suggestion = '!deck rebuild $'
  var deckPhrase = matches[1] || ''
  var decks = suggestCMD(suggestion, deckPhrase, msg.playerid, 'deck', obj => playerIsGM(msg.playerid) || obj.get('showplayers'))
  if(!decks) return;
  var deck = decks[0]
  var cardsToRemove = findObjs({_deckid: deck.get("id")});
  _.each(cardsToRemove, (card) => card.remove())
  var leftmostGraphic = null
  var leftmostPosition = Infinity
  eachGraphic(msg, (graphic) => {
    var leftValue = graphic.get('left')
    if(leftValue < leftmostPosition) {
      leftmostPosition = leftValue
      leftmostGraphic = graphic
    }
  }, { min: 2 })

  deck.set({
      avatar: getCleanImgsrc(leftmostGraphic.get('imgsrc'), 'thumb'),
      defaultheight: leftmostGraphic.get('height'),
      defaultwidth: leftmostGraphic.get('width')
  })

  eachGraphic(msg, (graphic) => {
    if (graphic.id != leftmostGraphic.id) {
      const card = getObj('card', graphic.get('_cardid'))
      if(!card) {
        whisper("WARNING: Not a card.", {speakingTo: msg.playerid})
        return
      }

      createObj("card", {
        _deckid: deck.id,
        name: card.get("name"),
        avatar: graphic.get("imgsrc")
      });
    }
  })

  whisper(deckNotification(deck, {"cards": msg.selected.length-1 , "status": "Rebuilt"}), {speakingTo: msg.playerid, gmEcho: true})
}

function recallDeckFn(matches, msg, options) {
  options = options || {}
  if(options.alert == undefined) options.alert = true
  let deck = undefined
  if(!options.deckid) {
    let suggestion = '!deck recall $'
    let deckPhrase = matches[1] || ''
    let decks = suggestCMD(suggestion, deckPhrase, msg.playerid, 'deck', obj => playerIsGM(msg.playerid) || obj.get('showplayers'))
    if(!decks) return;
    deck = decks[0]
  } else {
    deck = getObj('deck', options.deckid)
  }

  const discardCardids = deck.get("_discardPile").split(",").map(cardid => `cardid:${cardid}`)
  log(discardCardids)
  const discardCardsAsGraphics = filterObjs(obj => {
    if(obj.get('_type') != 'graphic') return false;
    return discardCardids.includes(obj.get('gmnotes'))
  })

  _.each(discardCardsAsGraphics, discardCardAsGraphic => discardCardAsGraphic.remove())
  recallCards(deck.id, "graphic")

  if(options.alert) {
    whisper(deckNotification(deck, {"status": "Recalled"}), {speakingTo: msg.playerid, gmEcho: true})
  }
}

function shuffleDeckFn(matches, msg, options) {
  options = options || {}
  let deck = undefined
  if(!options.deckid) {
    var suggestion = '!deck shuffle $'
    var deckPhrase = matches[1] || ''
    var decks = suggestCMD(suggestion, deckPhrase, msg.playerid, 'deck', obj => playerIsGM(msg.playerid) || obj.get('showplayers'))
    if(!decks) return;
    deck = decks[0]
  } else {
    deck = getObj('deck', options.deckid)
  }

  recallDeckFn([], msg, { deckid: deck.id, alert: false })
  if(shuffleDeck(deck.id)) {
    whisper(deckNotification(deck, { status: "Shuffled" }), { speakingTo: msg.playerid, gmEcho: true })
  } else {
    whisper(deck.get('name') + ' failed to shuffle.', { speakingTo: msg.playerid })
  }
}

function drawDeckFn(matches, msg) {
  var suggestion = '!deck draw $'
  var deckPhrase = matches[1] || ''
  var decks = suggestCMD(suggestion, deckPhrase, msg.playerid, 'deck', obj => playerIsGM(msg.playerid) || obj.get('showplayers'))
  if(!decks) return;
  var deck = decks[0]
  var cardId = drawCard(deck.id)
  if(cardId) {
    var card = getObj('card', cardId)
    var maxCards = deck.get("_currentDeck").split(',').length
    var currentIndex = Number(deck.get("_cardSequencer"))
    announce(deckNotification(deck, {"card": card, "cards": maxCards - currentIndex}))
  } else {
    whisper(deck.get('name') + ' failed to draw a card.', {speakingTo: msg.playerid})
  }
}

function addDeckFn(matches, msg) {
  var suggestion = '!deck add $'
  var deckPhrase = matches[1] || ''
  var decks = suggestCMD(suggestion, deckPhrase, msg.playerid, 'deck', obj => playerIsGM(msg.playerid) || obj.get('showplayers'))
  if(!decks) return;
  var deck = decks[0]
  eachCard(msg, (character, graphic, originalCard, originalDeck) => {
    if(originalDeck && originalDeck.id == deck.id) {
      whisper(`WARNING: Card ${originalCard.get('name')} already added to Deck ${deck.get('name')}.`, {speakingTo: msg.playerid})
    }

    const name = graphic.get('name') || originalCard ? originalCard.get('name') : ''
    const card = createObj('card', {
      _deckid: deck.id,
      name: name,
      avatar: graphic.get("imgsrc")
    });

    whisper(deckNotification(deck, {"card": card, "status": "Added"}), {speakingTo: msg.playerid, gmEcho: true})
  }, { cardRequired: false, min: 1 })

  shuffleDeck(deck.id, false)
}

function playDeckFn(matches, msg, options) {
  options = options || {}
  let deck = undefined
  let playZone = undefined
  if(!options.deckid) {
    var suggestion = '!deck play $'
    var deckPhrase = matches[1] || ''
    var decks = suggestCMD(suggestion, deckPhrase, msg.playerid, 'deck', obj => playerIsGM(msg.playerid) || obj.get('showplayers'))
    if(!decks) return;
    deck = decks[0]
  } else {
    deck = getObj('deck', options.deckid)
  }

  if(!options.playZoneId) {
    var pageid = getPlayerPageID(msg.playerid)
    const playZones = findObjs({
      _type: 'graphic',
      _pageid: pageid,
      layer: 'gmlayer',
      name: `${deck.get('name')} INK CardPlayer`
    })

    if(playZones == 0) {
      whisper(`WARNING: The Deck ${deck.get('name')} does not have a designated play zone. Please contact your GM.`, {speakingTo: msg.playerid})
      return
    } else if(playZones > 1) {
      whisper(`WARNING: There is more than one play zone for the Deck ${deck.get('name')}. Plese contact your GM.`, {speakingTo: msg.playerid})
      return
    }

    playZone = playZones[0]
  } else {
    playZone = getObj('graphic', options.playZoneId)
  }

  const cardid = drawCard(deck.id)
  if(!cardid) {
    whisper(`WARNING: Deck ${deck.get('name')} has no more cards to play.`)
    return
  }

  fixedPlayCardToTable(cardid, { left: playZone.get('left'), top: playZone.get('top'), pageid: getPlayerPageID(msg.playerid)} )
  const card = getObj('card', cardid)
  announce(deckNotification(deck, {"card": card, "status": "Played"}))
  return card
}

function dumpDeckFn(matches, msg) {
  var suggestion = '!deck dump $'
  var deckPhrase = matches[1] || ''
  var decks = suggestCMD(suggestion, deckPhrase, msg.playerid, 'deck', obj => playerIsGM(msg.playerid) || obj.get('showplayers'))
  if(!decks) return;
  var deck = decks[0]
  var pageid = getPlayerPageID(msg.playerid)
  const playZones = findObjs({
    _type: 'graphic',
    _pageid: pageid,
    layer: 'gmlayer',
    name: `${deck.get('name')} INK CardPlayer`
  })

  if(playZones == 0) {
    whisper(`WARNING: The Deck ${deck.get('name')} does not have a designated play zone. Please contact your GM.`, {speakingTo: msg.playerid})
    return
  } else if(playZones > 1) {
    whisper(`WARNING: There is more than one play zone for the Deck ${deck.get('name')}. Plese contact your GM.`, {speakingTo: msg.playerid})
  }

  const playZone = playZones[0]
  const cardsToDump = deck.get("_cardSequencer");
  for(var dumpCount = 0; dumpCount < cardsToDump; dumpCount++) {
    cardid = drawCard(deck.id)
    fixedPlayCardToTable(cardid, { left: playZone.get('left'), top: playZone.get('top'), pageid: getPlayerPageID(msg.playerid)} )
  }

  whisper(deckNotification(deck, {"dumped": cardsToDump}), {speakingTo: msg.playerid, gmEcho: true})
}

on('ready',function(){
  CentralInput.addCMD(/^!\s*deck\s+show\s+(\S.*)$/i, showDeckFn, true);
  CentralInput.addCMD(/^!\s*deck\s+hide\s+(\S.*)$/i, hideDeckFn, true);
  CentralInput.addCMD(/^!\s*deck\s+rebuild\s+(\S.*)$/i, rebuildDeckFn, true);
  CentralInput.addCMD(/^!\s*deck\s+recall\s+(\S.*)$/i, recallDeckFn, true);
  CentralInput.addCMD(/^!\s*deck\s+shuffle\s+(\S.*)$/i, shuffleDeckFn, true);
  CentralInput.addCMD(/^!\s*deck\s+draw\s+(\S.*)$/i, drawDeckFn, true);
  CentralInput.addCMD(/^!\s*deck\s+add\s+(\S.*)$/i, addDeckFn,true);
  CentralInput.addCMD(/^!\s*deck\s+play\s+(\S.*)$/i, playDeckFn,true);
  CentralInput.addCMD(/^!\s*deck\s+dump\s+(\S.*)$/i, dumpDeckFn,true);
});
