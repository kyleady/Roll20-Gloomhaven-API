var numModifier = {};
numModifier.calc = function(stat, operator, modifier, msg) {
  if(msg && /\$\[\[\d+\]\]/.test(modifier)) {
    modifier = numModifier.getRolledModifier(modifier, msg)
  }

  if(operator.indexOf('+') != -1){
    stat = Number(stat) + Number(modifier);
    return Math.round(stat);
  } else if(operator.indexOf('-') != -1){
    stat = Number(stat) - Number(modifier);
    return Math.round(stat);
  } else if(operator.indexOf('*') != -1){
    stat = Number(stat) * Number(modifier);
    return Math.round(stat);
  } else if(operator.indexOf('/') != -1){
    stat = Number(stat) / Number(modifier);
    return Math.round(stat);
  } else if(operator.indexOf('=') != -1){
    return modifier;
  } else {
    return stat;
  }
}

numModifier.getRolledModifier = function(modifier, msg) {
  let inlineMatch = modifier1.match(/\$\[\[(\d+)\]\]/);
  if(!inlineMatch || !inlineMatch[1]) return log(modifier1);
  let inlineIndex = Number(inlineMatch[1])
  if(inlineIndex != undefined && msg.inlinerolls && msg.inlinerolls[inlineIndex]
  && msg.inlinerolls[inlineIndex].results
  && msg.inlinerolls[inlineIndex].results.total != undefined){
    return msg.inlinerolls[inlineIndex].results.total.toString();
  } else {
    log('Invalid Inline at ' + modifier)
    log(msg.inlinerolls);
    whisper('Invalid Inline. See log.')
  }
}

numModifier.regexStr = function(){
  return '(\\?\\s*\\+|\\?\\s*-|\\?\\s*\\*|\\?\\s*\\/|\\?|=|\\+\\s*=|-\\s*=|\\*\\s*=|\\/\\s*=)\s*(|\\+|-)'
}
