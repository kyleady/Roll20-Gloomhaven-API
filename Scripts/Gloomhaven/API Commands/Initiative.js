const GLOOMHAVEN_INITIATIVE_ORDER = 'ascending'

//adds the commands after CentralInput has been initialized
on("ready",function(){
  //lets the user quickly view their initiative even when cards are face down
  CentralInput.addCMD(/^!\s*init(?:iative)?\s*\?\s*$/i,
    ([], msg) => {
      const initObj = calcGloomhavenInit(msg)
      if(!initObj) return;
      whisper(`${initObj.name} Initiative: ${initObj.first} ${initObj.second}`, {speakingTo: msg.playerid})
    }, true);

  //lets the user quickly view their initiative with a modifier
  CentralInput.addCMD(/^!\s*init(?:iative)?\s*(\?\+|\?-|\?\*|\?\/)\s*(-?\d+|\$\[\[\d+\]\])\s*$/i,
    ([,operator, modifier], msg) => {
      const initObj = calcGloomhavenInit(msg)
      if(!initObj) return;
      initObj.first = Number(numModifier.calc(initObj.first, operator, modifier, msg))
      if(initObj.first < 10) initObj.first = `0${initObj.first}`
      whisper(`${initObj.name} Initiative: ${initObj.first} ${initObj.second}`, {speakingTo: msg.playerid})
    }, true);

  //lets the user edit the initiative of a pre-existing turn
  CentralInput.addCMD(/^!\s*init(?:iative)?\s*(\+=|-=|\*=|\/=)\s*(-?\d+|\$\[\[\d+\]\])\s*$/i,
    ([, operator, modifier], msg) => {
      let name = undefined
      eachCard(msg, (character, graphic, card, deck) => {
        if(deck) {
          if(/^M /.test(deck.get('name'))) {
            name = deck.get('name').substring(2)
          } else {
            const player = getObj('player', msg.playerid)
            if(!player) return whisper('Invalid player.', { speakingTo: msg.playerid })
            name = player.get('_displayname')
          }
        } else {
          name = graphic.get('name')
        }
      }, { cardRequired: false, deckRequired: false })
      if(name == undefined) return;
      const turns = new INQTurns({ order: GLOOMHAVEN_INITIATIVE_ORDER})
      const initObj = turns.getInit({ custom: name, id: -1 })
      if(!initObj) return whisper('Initiative does not exist yet. Create with [!init](!init).', { speakingTo: msg.playerid })
      initObj.first = Number(numModifier.calc(initObj.first, operator, modifier, msg))
      if(initObj.first < 10) initObj.first = `0${initObj.first}`

      const turnObj = turns.toTurnObj(initObj.name, `${initObj.first} ${initObj.second}`)
      turns.addTurn(turnObj)
      turns.save()
      announce(`Set ${turnObj.custom} initiative to ${turnObj.pr}`)
    }, true);

  //lets the user create a custom turn for a monster
  CentralInput.addCMD(/^!\s*init(?:iative)?\s*=\s*(-?\d+|\$\[\[\d+\]\])\s*$/i,
    ([, modifier], msg) => {
      let name = undefined
      eachGraphic(msg, (graphic) => {
        name = graphic.get('name') || 'Custom'
      }, {onlyOneCharacter: true})
      if(!name) return;
      const turns = new INQTurns({ order: GLOOMHAVEN_INITIATIVE_ORDER})
      const initValue = Number(numModifier.calc(0, '=', modifier, msg))
      if(initValue < 10) initValue = `0${initValue}`
      const turnObj = turns.toTurnObj(name, `${initValue} M`)
      turns.addTurnThisRound(turnObj)
      turns.save()
      announce(`Added ${turnObj.custom} initiative as ${turnObj.pr}`)
    }, true);

  //add turn for selected player card pair or single monster card
  CentralInput.addCMD(/^!\s*init(?:iative)?\s*$/i,
    ([], msg) => {
      const initObj = calcGloomhavenInit(msg)
      if(!initObj) return;
      const turns = new INQTurns({ order: GLOOMHAVEN_INITIATIVE_ORDER})
      const turnObj = turns.toTurnObj(initObj.name, `${initObj.first} ${initObj.second}`)
      turns.addTurnThisRound(turnObj)
      turns.save()
      announce(`Added ${turnObj.custom} initiative as ${turnObj.pr}`)
    }, true);

  //advance the turnorder
  CentralInput.addCMD(/^!\s*init(?:iative)?\s*advance\s*$/i,
    ([], msg) => {
      const turns = new INQTurns({ order: GLOOMHAVEN_INITIATIVE_ORDER})
      turns.advance()
      turns.save()
      if(turns.isEndOfRound()) {
        newGloomRound(turns, msg)
      }

      announceTurn(turns)
    }, true);

  //sort the turnorder
  CentralInput.addCMD(/^!\s*init(?:iative)?\s*sort\s*$/i,
    ([], msg) => {
      const turns = new INQTurns({ order: GLOOMHAVEN_INITIATIVE_ORDER})
      turns.sort()
      turns.save()
      announceTurn(turns)
    }, true);

  //allow the gm to clear the turn tracker
  CentralInput.addCMD(/^!\s*init(?:iative)?\s+delete$/i, () => {
    Campaign().set("turnorder", "");
    whisper("Initiative cleared.")
  }, true);

  //clear the turn track for a new scenario
  CentralInput.addCMD(/^!\s*init(?:iative)?\s+clean$/i, () => {
    const turns = new INQTurns({ order: GLOOMHAVEN_INITIATIVE_ORDER })
    turns.turnorder = [turns.toTurnObj('End of Round', 'R0')]
    state.INK_GLOOMHAVEN = state.INK_GLOOMHAVEN || {}
    state.INK_GLOOMHAVEN.player_initiative = {}
    announceTurn(turns)
  }, true);

  //secretly store's player initaive for use when all players are ready
  CentralInput.addCMD(/^!\s*init(?:iative)?\s+plan\s*(|\s\S.*)$/i, ([, playername], msg) => {
    let player = undefined;
    if(playername) {
      let suggestion = '!init plan $'
      let players = suggestCMD(suggestion, playername, msg.playerid, 'player')
      if(!players) return
      player = players[0]
    } else {
      player = getObj('player', msg.playerid)
    }

    const initObj = calcGloomhavenInit(msg)
    if(!initObj) return
    const turns = new INQTurns({ order: GLOOMHAVEN_INITIATIVE_ORDER })
    const turnObj = turns.toTurnObj(initObj.name, `${initObj.first} ${initObj.second}`)
    state.INK_GLOOMHAVEN = state.INK_GLOOMHAVEN || {}
    state.INK_GLOOMHAVEN.playerInitiative = state.INK_GLOOMHAVEN.playerInitiative || {}
    state.INK_GLOOMHAVEN.playerInitiative[player.get('_d20userid')] = turnObj
    announcePlan()
    whisper(`Secretly added ${initObj.first} ${initObj.second} for ${player.get('_displayname')}'s initiative.`, { speakingTo: msg.playerid })
  }, true)

  //reveal and sort the initiatives
  CentralInput.addCMD(/^!\s*init(?:iative)?\s+reveal$/i, ([], msg) => {
    const turns = new INQTurns({ order: GLOOMHAVEN_INITIATIVE_ORDER })
    state.INK_GLOOMHAVEN = state.INK_GLOOMHAVEN || {}
    state.INK_GLOOMHAVEN.playerInitiative = state.INK_GLOOMHAVEN.playerInitiative || {}
    state.INK_GLOOMHAVEN.monsterPlayZone = state.INK_GLOOMHAVEN.monsterPlayZone || {}
    for(let readyPlayer in state.INK_GLOOMHAVEN.playerInitiative) {
      turns.turnorder.push(state.INK_GLOOMHAVEN.playerInitiative[readyPlayer])
    }

    const livingGraphics = filterObjs(obj => {
      if(obj.get('_type') != 'graphic') return false;
      if(obj.get('_pageid') != Campaign().get('playerpageid')) return false;
      if(obj.get('layer') != 'objects') return false;
      if(!obj.get('represents')) return false;
      if(!obj.get('bar3_value')) return false;
      return true;
    })

    const deckIds = [...new Set(livingGraphics.map(livingGraphic => {
      const monsterDeckAttrs = findObjs({ _type: 'attribute', _characterid: livingGraphic.get('represents'), name: 'M Deck'});
      if(!monsterDeckAttrs || monsterDeckAttrs.length != 1) return '';
      const decks = findObjs({ _type: 'deck', name: monsterDeckAttrs[0].get('current') })
      if(!decks || decks.length != 1) return '';
      const deck = decks[0];
      const deckid = deck.id
      if(!(deckid in state.INK_GLOOMHAVEN.monsterPlayZone)) {
        const playIndex = 1 + Object.keys(state.INK_GLOOMHAVEN.monsterPlayZone).length
        const playZones = findObjs({
          _type: 'graphic',
          _pageid: Campaign().get('playerpageid'),
          name: `Monster ${playIndex} INK CardPlayer`
        })

        if(!playZones || !playZones.length) return whisper(`Monster ${playIndex} INK CardPlayer does not exist.`, { speakingTo: msg.playerid })
        state.INK_GLOOMHAVEN.monsterPlayZone[deckid] = playZones[0].id
      }

      return deck.id
    }))]

    _.each(deckIds, deckId => {
      if(deckId) {
        let card = playDeckFn([], msg, { deckid: deckId, playZoneId: state.INK_GLOOMHAVEN.monsterPlayZone[deckId] })
        if(!card) {
          shuffleDeckFn([], msg, { deckid: deckId })
          card = playDeckFn([], msg, { deckid: deckId, playZoneId: state.INK_GLOOMHAVEN.monsterPlayZone[deckId] })
        }

        const deck = getObj('deck', deckId)
        if(card && deck) {
          turns.turnorder.push(turns.toTurnObj(deck.get('name').substring(2), `${card.get('name').substring(0, 2)} M`))
        }
      }
    })

    turns.sort()
    turns.save()
    announceTurn(turns)
  });
}, true);