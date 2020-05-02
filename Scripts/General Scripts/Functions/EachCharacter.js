function eachCard(msg, givenFunction, options) {
  options = options || {}
  options.characterRequired = false
  options.defaultCharacter = false
  if(options.cardRequired == undefined) options.cardRequired = true
  if(options.deckRequired == undefined) options.deckRequired = true
  eachCharacter(msg, (character, graphic) => {
    let card
    let deck

    let cardid = graphic.get('_cardid')
    if(!cardid && graphic.get('gmnotes').startsWith('cardid:')) {
      cardid = graphic.get('gmnotes').replace('cardid:', '')
    }

    if(!cardid && options.cardRequired) {
      whisper("Select only cards for initiative.", {speakingTo: msg.playerid})
      return
    }

    if(cardid) {
      card = getObj('card', cardid)
      if(!card && options.cardRequired){
        whisper(`Invalid card: ${graphic.get('name')}. See log.`, {speakingTo: msg.playerid})
        log(`Invalid CardId: ${cardid}`)
        return
      }

      if(card) {
        let deckid = card.get('_deckid')
        if(!deckid && options.deckRequired) {
          whisper(`Card ${card.get("name")} does not belong to a deck`, {speakingTo: msg.playerid})
          return
        }

        if(deckid) {
          deck = getObj('deck', deckid)
          if(!deck && options.deckRequired) {
            whisper(`Card ${card.get("name")} belongs to an invalid deck. See log.`, {speakingTo: msg.playerid})
            log(`Invalid DeckId: ${deckid}`)
            return
          }
        }
      }
    }

    givenFunction(character, graphic, card, deck)
  }, options)
}

function eachGraphic(msg, givenFunction, options) {
  options = options || {}
  options.characterRequired = false
  options.defaultCharacter = false
  eachCharacter(msg, (character, graphic) => givenFunction(graphic), options)
}

function eachCharacter(msg, givenFunction, options){
  options = options || {}
  if(options.characterRequired == undefined) options.characterRequired = true;
  if(options.defaultCharacter == undefined) options.defaultCharacter = true;
  if(options.onlyOneCharacter) {
    options.min = 1
    options.max = 1
  }
  
  if((msg.selected == undefined || msg.selected.length <= 0) && options.defaultCharacter){
    msg.selected = [defaultCharacter(msg.playerid)];
    if(msg.selected[0] == undefined) return;
  }

  if(options.min && (!msg.selected || msg.selected.length < options.min)) {
    return whisper(`Select at least ${options.min} graphic(s).`);
  }

  if(options.max != undefined && msg.selected && msg.selected.length > options.max) {
    return whisper(`Select at most ${options.max} graphic(s).`);
  }

  _.each(msg.selected, function(obj){
    if(obj._type == 'graphic'){
      var graphic = getObj('graphic', obj._id);
      if(graphic == undefined) {
        log('graphic undefined')
        log(obj)
        return whisper('graphic undefined', {speakingTo: msg.playerid, gmEcho: true});
      }

      var character = getObj('character', graphic.get('represents'))
      if(character == undefined && options.characterRequired){
        log('character undefined')
        log(graphic)
        return whisper('character undefined', {speakingTo: msg.playerid, gmEcho: true});
      }
    } else if(obj._type == 'unique'){
      var graphic = undefined;
      var character = undefined;
    } else if(typeof obj.get === 'function' && obj.get('_type') == 'character') {
      var character = obj;
      var graphics = [];
      if(Campaign().get('playerspecificpages') && Campaign().get('playerspecificpages')[msg.playerid]){
        graphics = findObjs({
          _pageid: Campaign().get('playerspecificpages')[msg.playerid],
          _type: 'graphic',
          represents: character.id
        }) || [];
      }

      if(graphics[0] == undefined){
        graphics = findObjs({
          _pageid: Campaign().get('playerpageid'),
          _type: 'graphic',
          represents: character.id
        }) || [];
      }

      if(graphics[0] == undefined){
        graphics = findObjs({
          _type: 'graphic',
          represents: character.id
        }) || [];
      }

      if(graphics[0] == undefined){
        return whisper(character.get('name') + ' does not have a token on any map in the entire campaign.',
         {speakingTo: msg.playerid, gmEcho: true});
      }

      var graphic = graphics[0];
    } else if(typeof obj.get === 'function' && obj.get('_type') == 'graphic') {
      var graphic = obj;
      var character = getObj('character', graphic.get('represents'));
      if(character == undefined && options.characterRequired){
        log('character undefined')
        log(graphic)
        return whisper('character undefined', {speakingTo: msg.playerid, gmEcho: true});
      }
    } else {
      log('Selected is neither a graphic nor a character.')
      log(obj)
      return whisper('Selected is neither a graphic nor a character.', {speakingTo: msg.playerid, gmEcho: true});
    }

    givenFunction(character, graphic);
  });
}
