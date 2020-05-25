//Roll20 currently has a bug in drawCard. It does not change the state of the
//deck for the deck object. However, the actual deck's state is changing. This
//leads to the reality of the deck getting out of sync with the data that the
//API has access to.

//To hackily get around this bug, this function hands the card to a player,
//takes the card from the player, and puts the card in the discard pile. Now
//the deck understands that a card has been drawn from the deck and it is now
//in the discard pile.
function hackyDrawCard(playerid, deckid, inputCardid) {
  const cardid = drawCard(deckid, inputCardid)
  if(cardid) {
    giveCardToPlayer(cardid, playerid)
    takeCardFromPlayer(playerid, { cardid: cardid })
  }

  return cardid
}
