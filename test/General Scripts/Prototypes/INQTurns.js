var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
require('mock20');
describe('INQTurns', function() {
	Campaign().MOCK20reset();
	var filePath = path.join(__dirname, '..', '..', '..', 'INKTotal.js');
	var MyScript = fs.readFileSync(filePath, 'utf8');
  eval(MyScript);
  it('should auto-sort turns with this.addTurn()', function(){
    const turns = new INQTurns({ order: 'ascending' })
    turns.turnorder.push(turns.toTurnObj('Turn D', 4))
    turns.turnorder.push(turns.toTurnObj('Turn B', 2))
    turns.turnorder.push(turns.toTurnObj('Turn C', 3))
    turns.turnorder.push(turns.toTurnObj('Turn A', 1))

    turns.addTurn(turns.toTurnObj('Turn E', 5))

    expect(turns.turnorder[0].custom).to.equal('Turn A');
    expect(turns.turnorder[1].custom).to.equal('Turn B');
    expect(turns.turnorder[2].custom).to.equal('Turn C');
    expect(turns.turnorder[3].custom).to.equal('Turn D');
    expect(turns.turnorder[4].custom).to.equal('Turn E');
  });

  it('should replace an identical turn with this.addTurn()', function(){
    const turns = new INQTurns({ order: 'ascending' })
    turns.turnorder.push(turns.toTurnObj('Turn A', 4))

    turns.addTurn(turns.toTurnObj('Turn A', 2))

    expect(turns.turnorder.length).to.equal(1);
    expect(turns.turnorder[0].pr).to.equal(2);
  });

	it('should add initiative to the end if it is un-ordered with this.addTurnInCyclicOrder()', function(){
		const turns = new INQTurns({ order: 'ascending' })
    turns.turnorder.push(turns.toTurnObj('Turn E', 5))
    turns.turnorder.push(turns.toTurnObj('Turn C', 3))
    turns.turnorder.push(turns.toTurnObj('Turn D', 4))
    turns.turnorder.push(turns.toTurnObj('Turn B', 2))

    turns.addTurnInCyclicOrder(turns.toTurnObj('Turn A', 1))

    expect(turns.turnorder[0].custom).to.equal('Turn E');
    expect(turns.turnorder[1].custom).to.equal('Turn C');
    expect(turns.turnorder[2].custom).to.equal('Turn D');
    expect(turns.turnorder[3].custom).to.equal('Turn B');
    expect(turns.turnorder[4].custom).to.equal('Turn A');
  });

	it('should add initiative in cyclic order with this.addTurnInCyclicOrder()', function(){
		const turns = new INQTurns({ order: 'ascending' })
		turns.turnorder.push(turns.toTurnObj('Turn E', 50))
    turns.turnorder.push(turns.toTurnObj('Turn B', 20))
    turns.turnorder.push(turns.toTurnObj('Turn C', 30))
    turns.turnorder.push(turns.toTurnObj('Turn D', 40))

    turns.addTurnInCyclicOrder(turns.toTurnObj('Turn A', 10))

    expect(turns.turnorder.map(e => e.custom)).to.deep.equal([
			'Turn E', 'Turn A', 'Turn B', 'Turn C', 'Turn D'
		]);

		turns.addTurnInCyclicOrder(turns.toTurnObj('Turn Da', 41))

		expect(turns.turnorder.map(e => e.custom)).to.deep.equal([
			'Turn E', 'Turn A', 'Turn B', 'Turn C', 'Turn D', 'Turn Da'
		]);

		turns.addTurnInCyclicOrder(turns.toTurnObj('Turn Ea', 51))

		expect(turns.turnorder.map(e => e.custom)).to.deep.equal([
			'Turn E', 'Turn Ea', 'Turn A', 'Turn B', 'Turn C', 'Turn D', 'Turn Da'
		]);
  });

	it('should add initiative to the end if it is un-ordered with this.addTurnThisRound()', function(){
		const turns = new INQTurns({ order: 'ascending' })
    turns.turnorder.push(turns.toTurnObj('Turn E', 5))
    turns.turnorder.push(turns.toTurnObj('Turn C', 3))
    turns.turnorder.push(turns.toTurnObj('Turn D', 4))
    turns.turnorder.push(turns.toTurnObj('Turn B', 2))

    turns.addTurnThisRound(turns.toTurnObj('Turn A', 1))

    expect(turns.turnorder[0].custom).to.equal('Turn E');
    expect(turns.turnorder[1].custom).to.equal('Turn C');
    expect(turns.turnorder[2].custom).to.equal('Turn D');
    expect(turns.turnorder[3].custom).to.equal('Turn B');
    expect(turns.turnorder[4].custom).to.equal('Turn A');
  });

	it('should add initiative in this Round, after the current turn with this.addTurnThisRound()', function(){
		const turns = new INQTurns({ order: 'ascending' })
		turns.turnorder.push(turns.toTurnObj('Turn E', 50))
		turns.turnorder.push(turns.toTurnObj('End Of Round', 100))
    turns.turnorder.push(turns.toTurnObj('Turn B', 20))
    turns.turnorder.push(turns.toTurnObj('Turn C', 30))
    turns.turnorder.push(turns.toTurnObj('Turn D', 40))

    turns.addTurnThisRound(turns.toTurnObj('Turn A', 10))

    expect(turns.turnorder.map(e => e.custom)).to.deep.equal([
			'Turn E', 'Turn A', 'End Of Round', 'Turn B', 'Turn C', 'Turn D'
		]);

		turns.addTurnThisRound(turns.toTurnObj('Turn Da', 41))

		expect(turns.turnorder.map(e => e.custom)).to.deep.equal([
			'Turn E', 'Turn A', 'Turn Da', 'End Of Round', 'Turn B', 'Turn C', 'Turn D'
		]);

		turns.addTurnThisRound(turns.toTurnObj('Turn Ca', 31))

		expect(turns.turnorder.map(e => e.custom)).to.deep.equal([
			'Turn E', 'Turn A', 'Turn Ca', 'Turn Da', 'End Of Round', 'Turn B', 'Turn C', 'Turn D'
		]);
  });
});
