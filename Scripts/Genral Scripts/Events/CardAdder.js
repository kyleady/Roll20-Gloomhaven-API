function cardAdderEvent(graphic) {
  if(graphic.get('layer') != 'objects') {
      return
  }
  const originalCard = getObj('card', graphic.get('_cardid'))
  for(var deck of findObjs({_type: 'deck'})) {
    var adderZones = findObjs({
      _type: 'graphic',
      _pageid: graphic.get("_pageid"),
      layer: 'gmlayer',
      name: `${deck.get('name')} INK CardAdder`
    })

    for(var adderZone of adderZones) {
      if(  graphic.get('top') > adderZone.get('top') - (adderZone.get('height')/2)
        && graphic.get('top') < adderZone.get('top') + (adderZone.get('height')/2)
        && graphic.get('left') > adderZone.get('left') - (adderZone.get('width')/2)
        && graphic.get('left') < adderZone.get('left') + (adderZone.get('width')/2)
      ) {
        if(originalCard && originalCard.get('_deckid') == deck.id) {
          log(`WARNING: Card ${card.get('name')} already added to Deck ${deck.get('name')}.`)
        }

        var name = graphic.get('name')
        if(originalCard && !name) {
          name = originalCard.get('name')
        }

        var card = createObj("card", {
          _deckid: deck.id,
          name: graphic.get("name"),
          avatar: graphic.get("imgsrc")
        });

        graphic.remove()
        announce(deckNotification(deck, {"card": card, "status": "Added"}))
        break
      }
    }
  }
}

on("change:graphic",cardAdderEvent)
