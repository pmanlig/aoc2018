import React from 'react';

var infinite = 250 * 250;
var log = false;
var readOrder = (a, b) => a.row < b.row ? -1 : a.row > b.row ? 1 : a.col < b.col ? -1 : 1;
var manhattanDistance = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
var adjacent = (a, b) => manhattanDistance(a, b) === 1;

function write(m) {
	if (log) console.log(m);
}

class Position {
	constructor(row, col) {
		this.row = row;
		this.col = col;
	}

	up = () => new Position(this.row - 1, this.col);
	down = () => new Position(this.row + 1, this.col);
	left = () => new Position(this.row, this.col - 1);
	right = () => new Position(this.row, this.col + 1);
	pos = () => "(" + this.row + "," + this.col + ")";
	adjacent = () => [this.up(), this.left(), this.right(), this.down()];
}

class Creature extends Position {
	attack = 3;
	hp = 200;

	move(d) {
		var up = this.row < 1 || d[this.row - 1][this.col] === -1 ? infinite : d[this.row - 1][this.col];
		var left = this.col < 1 || d[this.row][this.col - 1] === -1 ? infinite : d[this.row][this.col - 1];
		var right = this.col > d[this.row].length - 2 || d[this.row][this.col + 1] === -1 ? infinite : d[this.row][this.col + 1];
		var down = this.row > d.length - 2 || d[this.row + 1][this.col] === -1 ? infinite : d[this.row + 1][this.col];
		if (up < infinite && up > -1 && up <= left && up <= right && up <= down) this.row--;
		else if (left < infinite && left > -1 && left <= right && left <= down) this.col--;
		else if (right < infinite && right > -1 && right <= down) this.col++;
		else if (down < infinite && down > -1) this.row++;
	}

	id() {
		return this.type + this.pos();
	}

	stats() {
		return this.id() + ": " + this.hp;
	}
}

class Elf extends Creature {
	type = "E";
}

class Goblin extends Creature {
	type = "G";
}

class Map {
	creatures = [];
	moving = [];
	baseMap = [];
	numRows = 0;
	numCols = 0;
	iterations = 0;
	score = 0;

	constructor(i) {
		var input = i.split("\n").map(l => l.trim());
		this.numRows = input.length;
		if (input.length > 0) {
			this.numCols = input[0].length;
			for (var r = 0; r < input.length; r++) {
				this.baseMap[r] = [];
				for (var c = 0; c < input[r].length; c++) {
					if (input[r][c] === '#') {
						this.baseMap[r][c] = '#';
					} else {
						this.baseMap[r][c] = '.';
					}
					if (input[r][c] === 'E') {
						this.creatures.push(new Elf(r, c));
					}
					if (input[r][c] === 'G') {
						this.creatures.push(new Goblin(r, c));
					}
				}
			}
			this.initRound();
		}
	}

	initRound() {
		this.moving = this.creatures.concat([]);
		this.moving.sort(readOrder);
	}

	construct(m) {
		var output = [];
		for (var r = 0; r < this.numRows; r++) {
			output[r] = [];
			for (var c = 0; c < this.numCols; c++) {
				output[r].push(m(r, c));
			}
		}
		return output;
	}

	iterate(m) {
		for (var r = 0; r < this.numRows; r++) {
			for (var c = 0; c < this.numCols; c++) {
				m(r, c);
			}
		}
	}

	getCell = (r, c) => {
		var occupant = this.creatures.find(critter => critter.row === r && critter.col === c);
		if (occupant !== undefined) return occupant.type;
		return this.baseMap[r][c];
	}

	getRows = () => this.construct(this.getCell);

	bestEnemy = (a, b) => a.hp < b.hp ? -1 : (a.hp > b.hp ? 1 : readOrder(a, b));
	initialDistance = (r, c) => this.getCell(r, c) === '.' ? infinite : -1;
	findTargets = (e) => [e.up(), e.left(), e.right(), e.down()];

	path2(d, p, s) {
		if (s > 35) return;
		this.numPaths++;
		if (s > 0 && s >= d[p.row][p.col]) return;
		if (d[p.row][p.col] > -1) d[p.row][p.col] = s;
		s++;
		if (p.row > 0) this.path(d, p.up(), s);
		if (p.row < this.numRows - 1) this.path(d, p.down(), s);
		if (p.col > 0) this.path(d, p.left(), s);
		if (p.col < this.numCols - 1) this.path(d, p.right(), s);
	}

	radiate(d, pos, step) {
		var cont = false;
		pos.forEach(p => {
			if ((p.row > 0 && d[p.row - 1][p.col] === step) ||
				(p.row < d.length - 1 && d[p.row + 1][p.col] === step) ||
				(p.col > 0 && d[p.row][p.col - 1] === step) ||
				(p.col < d[p.row].length - 1 && d[p.row][p.col + 1] === step)) {
				d[p.row][p.col] = step + 1;
				cont = true;
			}
		});
		step++;
		if (cont)
			this.radiate(d, pos.filter(p => d[p.row][p.col] > step), step);
	}

	path(d, start, step) {
		var pos = [];
		this.iterate((r, c) => pos.push(new Position(r, c)));
		pos = pos.filter(p => d[p.row][p.col] > -1);
		d[start.row][start.col] = step;
		this.radiate(d, pos, step);
	}

	distanceMap(pos) {
		var result = this.construct(this.initialDistance);
		this.path(result, pos, 0);
		return result;
	}

	debugMap = (d) => d.map(r => r.map(c => c === -1 ? '#' : (c === infinite ? '.' : String.fromCharCode("1".charCodeAt(0) - 1 + c % 10))).join("")).join("\n");

	within = (dist, pos) => pos.row > -1 && pos.col > -1 && pos.row < dist.length && pos.col < dist[pos.row].length;

	turn(critter) {
		log = this.iterations === 0 && critter.type === 'G' && critter.row === 5 && critter.col === 17;
		write(critter.id());
		if (critter.hp < 1) return false;
		var enemies = this.creatures.filter(e => e.type !== critter.type);
		if (enemies.length === 0) return true;
		var adj = enemies.filter(e => adjacent(critter, e));
		if (adj.length === 0) {
			write("No adjacent enemies");
			var dist = this.distanceMap(critter);
			// write(this.debugMap(dist));
			var targets = enemies.map(e => e.adjacent()).reduce((a, b) => a.concat(b), []);
			targets = targets.filter(t => this.within(dist, t) && dist[t.row][t.col] > -1 && dist[t.row][t.col] < infinite);
			write("Possible targets: " + targets.map(p => p.pos()).join());
			if (targets.length > 0) {
				targets.sort((a, b) => dist[a.row][a.col] - dist[b.row][b.col]);
				// write("Sorted targets: " + targets.map(p => p.pos()).join());
				// write("Distances: " + targets.map(p => dist[p.row][p.col]).join());
				targets = targets.filter(t => dist[t.row][t.col] === dist[targets[0].row][targets[0].col]);
				targets.sort(readOrder);
				write("Selected target: " + targets[0].pos());
				dist = this.distanceMap(targets[0]);
				critter.move(dist);
			}
		}
		adj = enemies.filter(e => adjacent(critter, e));
		if (adj.length > 0) {
			adj.sort(this.bestEnemy);
			adj[0].hp -= critter.attack;
			this.creatures = this.creatures.filter(c => c.hp > 0);
		}
		return false;
	}

	step() {
		while (this.moving.length > 0) {
			if (this.turn(this.moving.shift())) {
				this.score = this.creatures.map(c => c.hp).reduce((s, c) => s + c, 0) * this.iterations;
				return;
			}
		}
		this.iterations++;
		this.initRound();
	}
}

class Grid extends React.Component {
	static defaultCellStyle = {
		minWidth: 20,
		minHeight: 20,
		maxWidth: 20,
		maxHeight: 20,
		width: 20,
		height: 20,
		textAlign: "center",
		color: "black",
		backgroundColor: "white",
		margin: 0,
		padding: 0,
		border: "1pt solid black"
	}

	static Wall(props) {
		return <div style={{ ...Grid.defaultCellStyle, backgroundColor: "black" }}></div>;
	}

	static Open(props) {
		return <div style={{ ...Grid.defaultCellStyle }}></div>;
	}

	static Elf() {
		return <div style={{ ...Grid.defaultCellStyle, backgroundColor: "red" }}>E</div>;
	}

	static Goblin() {
		return <div style={{ ...Grid.defaultCellStyle, backgroundColor: "lightgrey" }}>G</div>;
	}

	static Cell(props) {
		if (props.data === '#') return <Grid.Wall />;
		if (props.data === '.') return <Grid.Open />;
		if (props.data === 'E') return <Grid.Elf />;
		if (props.data === 'G') return <Grid.Goblin />;

		return <div style={Grid.defaultCellStyle}></div>;
	}

	static Row(props) {
		var cell = 0;
		return <div style={{ display: "flex", flexDirection: "row" }}>
			{props.data.map(c => <Grid.Cell key={"" + cell++} data={c} />)}
		</div>;
	}

	step() {
		this.props.map.step();
		this.setState({});
	}

	fight() {
		this.continue = true;
		var map = this.props.map;
		window.setTimeout(() => {
			if (this.continue && map.creatures.filter(c => c.type !== map.creatures[0].type).length > 0) {
				this.step();
				this.fight();
			}
		}, 25);
	}

	stop() {
		this.continue = false;
	}

	render() {
		var row = 0;
		return <div style={{ display: "flex", flexDirection: "row" }}>
			<div style={{ display: "flex", flexDirection: "column" }}>
				{this.props.map.getRows().map(r => <Grid.Row key={"" + row++} data={r} />)}
			</div>
			<div style={{ marginLeft: 10 }}>
				{this.props.map.creatures.map(c => <p key={c.row + "" + c.col} style={{ padding: 0, margin: 0 }}>{"(" + c.row + "," + c.col + ") " + c.type + ": " + c.hp}</p>)}
			</div>
			<div style={{ marginLeft: 10 }}>
				<p style={{ padding: 0, margin: 0 }}>Rows: {this.props.map.numRows}</p>
				<p style={{ padding: 0, margin: 0 }}>Columns: {this.props.map.numCols}</p>
				<p style={{ padding: 0, margin: 0 }}>Iterations: {this.props.map.iterations}</p>
				<p style={{ padding: 0, margin: 0 }}>Remaining HP: {this.props.map.creatures.map(c => c.hp).reduce((t, n) => t + n, 0)}</p>
				<p style={{ padding: 0, margin: 0 }}>Score: {this.props.map.score}</p>
				<input type="button" value="Step" onClick={e => this.step()} />
				<input type="button" value="Fight!" onClick={e => this.fight()} />
				<input type="button" value="Stop!" onClick={e => this.stop()} />
			</div>
		</div>;
	}
}

class Test {
	constructor(m, s, r) {
		this.map = m;
		this.score = s;
		this.rounds = r;
	}

	report() {
		if (this.map.score === 0) return "working";
		if (this.map.score === this.score && this.map.iterations === this.rounds) return "OK";
		if (this.map.iterations !== this.rounds) return "FAIL (expected " + this.rounds + " rounds; actual is " + this.map.iterations + ")";
		return "FAIL (round " + this.map.iterations + "; expected score " + this.score + ", actual is " + this.map.score + ")";
	}
}

class Experiment {
	constructor(t, b) {
		this.map = new Map(t);
		this.elves = this.map.creatures.filter(c => c.type === "E");
		this.elves.forEach(e => e.attack += b);
		this.boost = b;
	}

	run() {
		while (this.map.score === 0)
			this.map.step();
	}

	success() { return this.map.creatures.filter(c => c.type === "E").length === this.elves.length; }

	report() {
		return "Experimenting with boost " + this.boost + (this.map.score !== 0 ? (this.success() ? " - ADEQUATE" : " - INSUFFICIENT") : "");
	}
}

export class AoC15 extends React.Component {
	state = { tests: [new Test(new Map("#######\n#.G...#\n#...EG#\n#.#.#G#\n#..G#E#\n#.....#\n#######"), 27730, 47)], exp: [], boost: 1 };

	fight(t) {
		window.setTimeout(() => {
			while (t.score === 0) {
				t.step();
			}
			this.setState({});
		}, 1);
	}

	experiment(txt) {
		var e = new Experiment(txt, this.state.boost);
		this.setState({ exp: this.state.exp.concat([e]), boost: this.state.boost + 1 });
		window.setTimeout(() => {
			e.run();
			this.setState({});
			if (!e.success()) {
				this.experiment(txt)
			} else {
				var dominate = new Map(txt);
				dominate.creatures.filter(c => c.type === "E").forEach(e => e.attack = this.state.boost + 2);
				this.setState({ map: dominate });
			}
		}, 1);
	}

	constructor(props) {
		super(props);
		this.fight(this.state.tests[0].map);

		fetch("test15a.txt")
			.then(res => res.text())
			.then(txt => {
				var t = new Test(new Map(txt), 36334, 37);
				this.setState({ tests: this.state.tests.concat([t]) });
				this.fight(t.map);
			});
		fetch("test15b.txt")
			.then(res => res.text())
			.then(txt => {
				var t = new Test(new Map(txt), 39514, 46);
				this.setState({ tests: this.state.tests.concat([t]) });
				this.fight(t.map);
			});
		fetch("test15c.txt")
			.then(res => res.text())
			.then(txt => {
				var t = new Test(new Map(txt), 27755, 35);
				this.setState({ tests: this.state.tests.concat([t]) });
				this.fight(t.map);
			});
		fetch("test15d.txt")
			.then(res => res.text())
			.then(txt => {
				var t = new Test(new Map(txt), 28944, 54);
				this.setState({ tests: this.state.tests.concat([t]) });
				this.fight(t.map);
			});
		fetch("test15e.txt")
			.then(res => res.text())
			.then(txt => {
				var t = new Test(new Map(txt), 18740, 20);
				this.setState({ tests: this.state.tests.concat([t]) });
				this.fight(t.map);
			});

		fetch("input15.txt")
			.then(res => res.text())
			.then(txt => {
				var t = new Test(new Map(txt), 191216, 68);
				this.setState({ input: txt, map: new Map(txt), tests: this.state.tests.concat([t]) });
				this.fight(t.map);
			});
	}

	render() {
		var i = 0;
		return <div className="content">
			<div style={{ display: "flex", margin: "5px" }}>
				{this.state.map && <Grid map={this.state.map} />}
				<div style={{ marginLeft: 10 }}>
					{this.state.tests.map(t => <p key={i++} style={{ padding: 0, margin: 0 }}>Test {i}: {t.report()}</p>)}
				</div>
				<div style={{ marginLeft: 10 }}>
					{this.state.input && <input type="button" value="Begin Experimentation!" onClick={e => this.experiment(this.state.input)} />}
					{this.state.exp.map(e => <p key={i++} style={{ padding: 0, margin: 0 }}>{e.report()}</p>)}
				</div>
			</div>
		</div>;
	}
}