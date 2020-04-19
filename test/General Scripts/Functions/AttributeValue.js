var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
require('mock20');
var INKTotal = '';
describe('attributeValue()', function() {
	it('should get the current value of the named attribute when no options are specified', function () {
		Campaign().MOCK20reset();
		var filePath = path.join(__dirname, '..', '..', '..', 'INKTotal.js');
		INKTotal = fs.readFileSync(filePath, 'utf8');
		eval(INKTotal);

		var character = createObj('character', {name: 'test character'});
		var page = createObj('page', {name: 'test page'}, {MOCK20override: true});
		var graphic = createObj('graphic', {name: 'test graphic', _pageid: page.id, represents: character.id});
		var attribute = createObj('attribute', {name: 'test attribute', _characterid: character.id, current: 'current', max: 'max'});
		var current = attributeValue(attribute.get('name'));
		expect(current).to.equal(attribute.get('current'));
  });
	it('should be able to get the max value', function () {
		Campaign().MOCK20reset();
		var filePath = path.join(__dirname, '..', '..', '..', 'INKTotal.js');
		INKTotal = fs.readFileSync(filePath, 'utf8');
		eval(INKTotal);

		var character = createObj('character', {name: 'test character'});
		var page = createObj('page', {name: 'test page'}, {MOCK20override: true});
		var graphic = createObj('graphic', {name: 'test graphic', _pageid: page.id, represents: character.id});
		var attribute = createObj('attribute', {name: 'test attribute', _characterid: character.id, current: 'current', max: 'max'});
		var max = attributeValue(attribute.get('name'), {max: true});
		expect(max).to.equal(attribute.get('max'));
	});
	it('should be able to write to the current or max value', function () {
		Campaign().MOCK20reset();
		var filePath = path.join(__dirname, '..', '..', '..', 'INKTotal.js');
		INKTotal = fs.readFileSync(filePath, 'utf8');
		eval(INKTotal);

		var character = createObj('character', {name: 'test character'});
		var page = createObj('page', {name: 'test page'}, {MOCK20override: true});
		var graphic = createObj('graphic', {name: 'test graphic', _pageid: page.id, represents: character.id});
		var attribute = createObj('attribute', {name: 'test attribute', _characterid: character.id, current: 'current', max: 'max'});
		expect(attribute.get('current')).to.equal('current');
		expect(attribute.get('max')).to.equal('max');
		attributeValue(attribute.get('name'), {setTo: 'newCurrent'});
		expect(attribute.get('current')).to.equal('newCurrent');
		expect(attribute.get('max')).to.equal('max');
		attributeValue(attribute.get('name'), {max: true, setTo: 'newMax'});
		expect(attribute.get('max')).to.equal('newMax');
	});
});
