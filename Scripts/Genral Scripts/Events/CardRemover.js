function cardRemoverEvent(graphic) {
  if(graphic.get('layer') != 'objects') {
      return
  }

  const cardid = graphic.get("_cardid")
  if(!cardid) {
    return
  }

  const card = getObj('card', cardid)
  if(!card) {
      return
  }

  const deck = getObj('deck', card.get("_deckid"))
  const removerZones = findObjs({
    _type: 'graphic',
    _pageid: graphic.get("_pageid"),
    layer: 'gmlayer',
    name: `${deck.get('name')} INK CardRemover`
  })

  for(var removerZone of removerZones) {
    if(  graphic.get('top') > removerZone.get('top') - (removerZone.get('height')/2)
      && graphic.get('top') < removerZone.get('top') + (removerZone.get('height')/2)
      && graphic.get('left') > removerZone.get('left') - (removerZone.get('width')/2)
      && graphic.get('left') < removerZone.get('left') + (removerZone.get('width')/2)
    ) {
      card.remove()
      announce(deckNotification(deck, {"card": card, "status": "Removed"}))
      return;
    }
  }
}

on("change:graphic",cardRemoverEvent)
