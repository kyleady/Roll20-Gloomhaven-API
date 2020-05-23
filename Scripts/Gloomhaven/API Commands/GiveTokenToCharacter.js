function giveTokenToCharacter([, isPlayer, name], msg){
  //get the selected token
  let graphic
  if(msg.selected && msg.selected.length == 1){
    graphic = getObj('graphic', msg.selected[0]._id);
    if(graphic == undefined) return whisper('graphic undefined');
  } else {
    return whisper('Please select exactly one graphic.');
  }

  let characters = suggestCMD('!Give Token To $', name, msg.playerid, 'character');
  if(!characters) return;
  let character = characters[0];
  graphic.set({
    represents: character.id,
    name: character.get('name'),
    showname: true,
    showplayers_name: true,
    showplayers_bar1: true,
    showplayers_bar2: true,
    showplayers_bar3: true,
    showplayers_aura1: true,
    showplayers_aura2: true
  });

  setDefaultTokenForCharacter(character, graphic);
  if(!character.get('avatar')) character.set('avatar', graphic.get('imgsrc').replace('/thumb.png?', '/med.png?'));
  whisper('Default Token set for *' + getLink(character.get('name')) + '*.');
}

on('ready', function(){
  CentralInput.addCMD(/^!\s*give\s*(|player)\s*token\s*to\s+(.+)$/i, giveTokenToCharacter);
});
