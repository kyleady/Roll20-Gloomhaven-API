function calcCharacterLevel(characterid) {
  const xpAttrs = findObjs({
    _type: 'attribute',
    _characterid: characterid,
    name: 'XP'
  })

  if(!xpAttrs || !xpAttrs.length) return null
  const xp = xpAttrs[0].get('current')
  if(xp < 45) {
    return 1
  } else if(xp < 95) {
    return 2
  } else if(xp < 150) {
    return 3
  } else if(xp < 210) {
    return 4
  } else if(xp < 275) {
    return 5
  } else if(xp < 345) {
    return 6
  } else if(xp < 420) {
    return 7
  } else if(xp < 500) {
    return 8
  } else {
    return 9
  }
}
