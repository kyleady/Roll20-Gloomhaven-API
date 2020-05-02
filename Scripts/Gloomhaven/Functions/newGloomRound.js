function newGloomRound(turns, msg) {
  //calculate round count
  const nextRound = 1 + Number(turns.turnorder[0].pr.replace(/^R/, ''))

  //empty round initiative
  turns.turnorder = [turns.toTurnObj('End of Round', `R${nextRound}`)]
  turns.save()

  //empty secret initiative for players
  state.INK_GLOOMHAVEN.playerInitiative = {}

  //shuffle decks that have at least one card that requires shuffling
  const cardsOnTheTable = filterObjs(obj => {
    if(obj.get('_type') != 'graphic') return false;
    if(obj.get('_pageid') != Campaign().get('playerpageid')) return false;
    return obj.get('_subtype') == 'card' || obj.get('gmnotes').startsWith('cardid:')
  })

  const decksToShuffle = {}
  _.each(cardsOnTheTable, graphic => {
    const cardid = graphic.get('_cardid') || graphic.get('gmnotes').replace('cardid:', '')
    const card = getObj('card', cardid)
    if(card.get('name').endsWith(' {Shuffle}')) {
      decksToShuffle[card.get('_deckid')] = true
    }
  })

  _.each(decksToShuffle, (needsShuffling, deckid) => shuffleDeckFn([], msg, { deckid: deckid }))
}
