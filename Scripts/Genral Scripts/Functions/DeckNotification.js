function deckNotification(deck, lines) {
  var card = lines['card']
  delete lines['card']
  var output = `&{template:default} {{name=${deck.get("name")}}} `
  if(card) {
    output += `{{card=[card front](${card.get("avatar")}#.png)}} `
  } else {
    output += `{{back=[deck back](${deck.get("avatar")}#.png)}} `
  }

  _.each(lines, (value, key) => output += `{{${key}=${value}}}`)
  return output
}
