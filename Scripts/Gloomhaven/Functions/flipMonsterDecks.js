function flipMonsterDecks(decksToFlipObj, initiativeAction, msg) {
  _.each(decksToFlip, (deckNeedsToBeFlipped, deckId) => {
    if(deckId) {
      const playZoneId = state.INK_GLOOMHAVEN.monsterInitiative[deckId].playZoneId
      let card = playDeckFn([], msg, { deckid: deckId, playZoneId: playZoneId, announce: false })
      if(!card) {
        shuffleDeckFn([], msg, { deckid: deckId })
        card = playDeckFn([], msg, { deckid: deckId, playZoneId: playZoneId, announce: false })
      }

      const deck = getObj('deck', deckId)
      if(card && deck) {
        let monsterInitObj = calcGloomhavenInit(msg, { selected: [card] })
        state.INK_GLOOMHAVEN.monsterInitiative[deckId].initObj = monsterInitObj
        initiativeAction(monsterInitObj)
      }
    }
  })
}
