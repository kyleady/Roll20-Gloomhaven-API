//creates a turn object for the listed graphic or custom string with initiative
INQTurns.prototype.toTurnObj = function(obj, initiative, options) {
  options = options || {}
  let turnObj = {};
  if(typeof obj == 'object') {
    turnObj.custom = '';
    turnObj.id = obj.id;
    turnObj.pr = initiative;
    turnObj._pageid = obj.get('_pageid');
  } else {
    turnObj.custom = obj;
    turnObj.id = -1 + '';
    turnObj.pr = initiative;
  }

  if(options.formula) {
    turnObj.formula = options.formula
  }

  return turnObj;
}
