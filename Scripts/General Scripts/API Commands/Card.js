function flipCardFn([], msg) {
  eachGraphic(msg, graphic => {
    if(!(graphic.get('_cardid') || graphic.get('gmnotes').startsWith('cardid:'))) {
      whisper(`${graphic.get('name')} (${graphic.id}) is not a card.`, { speakingTo: msg.playerid })
      return
    }

    const isFaceup = Number(graphic.get('currentSide')) == 0
    const newSide = isFaceup ? 1 : 0
    const sides = graphic.get('sides').split('|')

    graphic.set({
      imgsrc: getCleanImgsrc(decodeURIComponent(sides[newSide])),
      currentSide: newSide
    })
  })
}

function topCardFn([, whereToPlace], msg) {
  const placeOnTop = whereToPlace.toLowerCase() == 'top'
  let deckid = undefined;
  let sameDeck = true;
  let cardDetails = []
  eachCard(msg, (character, graphic, card, deck) => {
    if(deckid != undefined && deckid != deck.id) {
      sameDeck = false
      whisper('All cards must belong to the same deck.', { speakingTo: msg.playerid })
      return
    } else if(sameDeck) {
      deckid = deck.id
      cardDetails.push({
        cardid: card.id,
        left: Number(graphic.get('left')),
        top: Number(graphic.get('top')),
        approximation: graphic.get('_subtype') != 'card',
        graphic: graphic
      })
    }
  }, { min: 1 })

  if(!sameDeck || !deckid) return;
  cardDetails.sort((cardA, cardB) => {
    if(cardA.left < cardB.left) {
      return -1
    } else if(cardA.left > cardB.left) {
      return 1
    } else if(cardA.top < cardB.top) {
      return -1
    } else if(cardA.top > cardB.top) {
      return 1
    } else {
      return 0
    }
  })

  const deck = getObj('deck', deckid)
  const cardsInTheDeck = deck.get('_currentDeck').split(',').slice(deck.get('_currentIndex')+1)
  const cardsInTheDiscard = deck.get('_discardPile').split(',')
  const cardsToPlaceOnTheDeck = []
  const cardsToPlaceBelowTheDeck = []
  _.each(cardDetails, cardDetail => {
    const cardid = cardDetail.cardid
    if(placeOnTop) {
      cardsToPlaceOnTheDeck.push(cardid)
    } else {
      cardsToPlaceBelowTheDeck.push(cardid)
    }

    if(cardDetail.approximation) {
      cardDetail.graphic.remove()
      for(let i = 0; i < cardsInTheDiscard.length; i++) {
        if(cardsInTheDiscard[i] == cardid) {
          cardsInTheDiscard.splice(i, 1)
          return
        }
      }

      whisper('WARNING: Card Id of approximated card not found in the discard pile. Please contact your GM.', { speakingTo: msg.playerid })
    } else {
      pickUpCard(cardid)
    }
  })

  const orderedList = [].concat(
                            cardsInTheDiscard,
                            cardsToPlaceOnTheDeck,
                            cardsInTheDeck,
                            cardsToPlaceBelowTheDeck
                          )

  shuffleDeck(deckid, true, orderedList)
  _.each(cardsInTheDiscard, cardInTheDiscard => hackyDrawCard(msg.playerid, deckid))
}

on('ready', () => {
  CentralInput.addCMD(/^!\s*card\s*flip\s*$/i, flipCardFn, true)

  CentralInput.addCMD(/^!\s*card\s*remove\s*$/i, ([], msg) => {
    eachCard(msg, (character, graphic, card, deck) => {
      whisper(deckNotification(deck, {"card": card, "status": "Removed"}), {speakingTo: msg.playerid, gmEcho: true})
      card.remove()
    }, { min: 1 })
  }, true)

  CentralInput.addCMD(/!\s*card\s*(top|bottom)\s*$/i, topCardFn, true)
})
