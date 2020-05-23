function gloomhavenSetRoundToOne() {
  const turns = new INQTurns({ order: GLOOMHAVEN_INITIATIVE_ORDER })
  turns.turnorder = [turns.toTurnObj('End of Round', 'R1')]
  turns.save()
  Campaign().set('initiativepage', Campaign().get('playerpageid'))
}

function gloomhavenSetScenarioDifficulty(difficulty, currentPlayers) {
  let scenarioLevel;
  if(/^\d+$/.test(difficulty)) {
    scenarioLevel = Number(difficulty)
  } else {
    let totalLevel = 0
    let totalCharacters = 0
    _.each(currentPlayers, currentPlayer => {
        const character = defaultCharacter(currentPlayer.id)
        if(!character) return
        const level = calcCharacterLevel(character.id)
        if(!level) return
        totalLevel += level
        totalCharacters++
    })

    scenarioLevel = Math.ceil(totalLevel / (totalCharacters || 1) / 2)
  }

  if(/^easy$/i.test(difficulty)) {
    scenarioLevel += -1
  } else if(/^hard$/i.test(difficulty)) {
    scenarioLevel += 1
  } else if(/^very\s+hard$/i.test(difficulty)) {
    scenarioLevel += 2
  }

  if(scenarioLevel < 0) {
    scenarioLevel = 0
  } else if(scenarioLevel > 7) {
    scenarioLevel = 7
  }

  state.INK_GLOOMHAVEN.scenarioLevel = scenarioLevel
}

function gloomhavenDealBattleGoals(currentPlayers) {
  const battleGoalDecks = findObjs({
    _type: "deck",
    name: "Battle Goals"
  })

  if(!battleGoalDecks && !battleGoalDecks.length) whisper('The Battle Goal deck does not exist. Please contact your GM.', { speakingTo: true})
  const battleGoalDeckId = battleGoalDecks[0].id
  recallCards(battleGoalDeckId)
  shuffleDeck(battleGoalDeckId, true)
  _.each(currentPlayers, currentPlayer => {
    const firstCardid = drawCard(battleGoalDeckId)
    giveCardToPlayer(firstCardid, currentPlayer.id)
    const secondCardid = drawCard(battleGoalDeckId)
    giveCardToPlayer(secondCardid, currentPlayer.id)
  })
}

function gloomhavenHideInitiative(msg) {
  const turns = new INQTurns({ order: GLOOMHAVEN_INITIATIVE_ORDER })
  turns.turnorder = []
  turns.save()
  Campaign().set('initiativepage', false)
  state.INK_GLOOMHAVEN = state.INK_GLOOMHAVEN || {}
  state.INK_GLOOMHAVEN.playerInitiative = {}
  _.each(state.INK_GLOOMHAVEN.monsterInitiative, (monsterInitDetails, deckid) => {
    const statObj = getObj('graphic', monsterInitDetails.statId)
    if(statObj) statObj.remove()
    shuffleDeckFn([], msg, { deckid: deckid })
  })

  state.INK_GLOOMHAVEN.monsterInitiative = {}
}

function gloomhavenCleanDecks(msg) {
  const modifierDecks = [
    'Player 1 Modifiers',
    'Player 2 Modifiers',
    'Player 3 Modifiers',
    'Player 4 Modifiers',
    'Monster Modifiers',
  ]
  const temporaryCards = filterObjs(obj => {
    if(obj.get('_type') != 'card') return false;
    if(![
      'Player Curse',
      'Monster Curse',
      'Bless',
      'Penalty -1',
    ].includes(obj.get('name'))) return false;
    const deck = getObj('deck', obj.get('_deckid'))
    if(!modifierDecks.includes(deck.get('name'))) return false;
    return true;
  })

  _.each(temporaryCards, temporaryCard => temporaryCard.remove())
  _.each(modifierDecks, modifierDeck => shuffleDeckFn([, modifierDeck], msg))
}

on('ready', () => {
  //start a scenario by setting the scenario level and resetting the Round tracker.
  CentralInput.addCMD(/^!\s*scenario\s+start\s*(|easy|normal|hard|very\s+hard|\d+)\s*$/i, ([, difficulty], msg) => {
    const currentPlayers = findObjs({
      _type: 'player',
      _online: true
    })
    gloomhavenSetRoundToOne()
    gloomhavenSetScenarioDifficulty(difficulty, currentPlayers)
    gloomhavenDealBattleGoals(currentPlayers)
    announcePlan()
  }, true)

  //clear out an old scenario after it has ended
  CentralInput.addCMD(/^!\s*scenario?\s+end$/i, ([], msg) => {
    gloomhavenHideInitiative(msg)
    gloomhavenCleanDecks(msg)
    whisper('Scenario ended.', { speakingTo: msg.playerid })
  }, true);
})
