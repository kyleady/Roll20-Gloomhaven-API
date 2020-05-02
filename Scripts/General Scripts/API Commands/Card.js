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

on('ready', () => {
  CentralInput.addCMD(/^!\s*card\s*flip\s*$/i, flipCardFn, true)

  CentralInput.addCMD(/^!\s*card\s*remove\s*$/i, ([], msg) => {
    eachCard(msg, (character, graphic, card, deck) => {
      whisper(deckNotification(deck, {"card": card, "status": "Removed"}), {speakingTo: msg.playerid, gmEcho: true})
      card.remove()
    }, { min: 1 })
  }, true)
})
