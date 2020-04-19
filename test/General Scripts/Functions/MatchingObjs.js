var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
require('mock20');
var INKTotal = '';
describe('matchingObjs()', function() {
	it('should return an array of every matching obj', function () {
		Campaign().MOCK20reset();
		var filePath = path.join(__dirname, '..', '..', '..', 'INKTotal.js');
		INKTotal = fs.readFileSync(filePath, 'utf8');
		eval(INKTotal);
    MOCK20endOfLastScript();

    var player = createObj('player', {_displayname: 'matchingObjs player'}, {MOCK20override: true});
    var player2 = createObj('player', {_displayname: 'not a match player'}, {MOCK20override: true});
    var character = createObj('character', {name: 'matchingObjs character'});
    var character2 = createObj('character', {name: 'not a match character'});
    var handout = createObj('handout', {name: 'matchingObjs handout'});
    var handout2 = createObj('handout', {name: 'not a match handout'});

    var objs = matchingObjs(['player', 'character'], ['matchingObjs']);
    expect(objs).to.include.members([player, character]);
  });
  it('should accept a string instead of an array for the obj types', function () {
		Campaign().MOCK20reset();
		var filePath = path.join(__dirname, '..', '..', '..', 'INKTotal.js');
		INKTotal = fs.readFileSync(filePath, 'utf8');
		eval(INKTotal);
    MOCK20endOfLastScript();

    var player = createObj('player', {_displayname: 'matchingObjs player'}, {MOCK20override: true});
    var player2 = createObj('player', {_displayname: 'not a match player'}, {MOCK20override: true});
    var character = createObj('character', {name: 'matchingObjs character'});
    var character2 = createObj('character', {name: 'not a match character'});
    var handout = createObj('handout', {name: 'matchingObjs handout'});
    var handout2 = createObj('handout', {name: 'not a match handout'});

    var objs = matchingObjs('handout', ['matchingObjs']);
    expect(objs).to.include.members([handout]);
  });
  it('should allow for additional criteria', function () {
		Campaign().MOCK20reset();
		var filePath = path.join(__dirname, '..', '..', '..', 'INKTotal.js');
		INKTotal = fs.readFileSync(filePath, 'utf8');
		eval(INKTotal);
    MOCK20endOfLastScript();

    var player = createObj('player', {_displayname: 'matchingObjs player'}, {MOCK20override: true});
    var player2 = createObj('player', {_displayname: 'not a match player'}, {MOCK20override: true});
    var character = createObj('character', {name: 'matchingObjs character', inplayerjournals: '1'});
    var character2 = createObj('character', {name: 'not a match character', inplayerjournals: '2'});
    var handout = createObj('handout', {name: 'matchingObjs handout', inplayerjournals: 'all,1'});
    var handout2 = createObj('handout', {name: 'not a match handout', inplayerjournals: 'all,1'});

    var objs = matchingObjs(['handout', 'character'], ['matchingObjs'], function(obj) {
      return obj.get('inplayerjournals').split(',').includes('all');
    });
    expect(objs).to.include.members([handout]);
  });
	it('should search default characters when searching for just players', function () {
		Campaign().MOCK20reset();
		var filePath = path.join(__dirname, '..', '..', '..', 'INKTotal.js');
		INKTotal = fs.readFileSync(filePath, 'utf8');
		eval(INKTotal);
    MOCK20endOfLastScript();

    var player = createObj('player', {_displayname: 'matchingObjs player'}, {MOCK20override: true});
    var player2 = createObj('player', {_displayname: 'not a match player'}, {MOCK20override: true});
		var player3 = createObj('player', {_displayname: 'third player'}, {MOCK20override: true});
    var character = createObj('character', {name: 'matchingObjs character', controlledby: player2.id});
    var character2 = createObj('character', {name: 'also a matchingObjs character', controlledby: 'all'});
		var character3 = createObj('character', {name: 'yet one more matchingObjs character', controlledby: player.id + ',' + player2.id});

    var objs = matchingObjs('player', ['matchingObjs']);
    expect(objs).to.include.members([player, player2]);
		expect(objs).to.not.include.members([player3]);
  });
});
