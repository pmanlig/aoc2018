import React from 'react';

export class AoC17 extends React.Component {
	static classes = ["spring", "sand", "clay", "falling", "water"];
	state = { input: "", minx: 0, maxx: 0, miny: 0, maxy: 0 }
	grid = [[]];

	constructor(props) {
		super(props);
		fetch("input17.txt")
			.then(res => res.text())
			.then(txt => {
				this.setState({ input: txt });
				window.setTimeout(() => this.buildMap(), 1);
			});
	}

	parse(i) {
		var x1, x2, y1, y2;
		if (i.startsWith("x=")) {
			x1 = parseInt(i.substring(2), 10);
			x2 = x1;
			y1 = parseInt(i.split("y=")[1], 10);
			if (i.includes(".."))
				y2 = parseInt(i.split("..")[1], 10);
			else
				y2 = y1;
		} else {
			y1 = parseInt(i.substring(2), 10);
			y2 = y1;
			x1 = parseInt(i.split("x=")[1], 10);
			if (i.includes(".."))
				x2 = parseInt(i.split("..")[1], 10);
			else
				x2 = x1;
		}
		return [x1, x2, y1, y2];
	}

	findBounds(i) {
		var bounds = i[0].concat([]);
		i.forEach(s => {
			if (s[0] < bounds[0]) bounds[0] = s[0];
			if (s[1] > bounds[1]) bounds[1] = s[1];
			if (s[2] < bounds[2]) bounds[2] = s[2];
			if (s[3] > bounds[3]) bounds[3] = s[3];
		});
		return bounds;
	}

	buildMap() {
		var instructions = this.state.input.split('\n').map(l => l.trim()).map(i => this.parse(i));
		var bounds = this.findBounds(instructions);
		this.grid = [];
		var r;
		for (var y = 0; y <= bounds[3]; y++) {
			r = [];
			for (var x = bounds[0] - 2; x < bounds[1] + 3; x++) r.push(1);
			this.grid.push(r);
		}
		var minx = bounds[0] - 2;
		instructions.forEach(i => {
			for (var y = i[2]; y <= i[3]; y++) {
				for (var x = i[0]; x <= i[1]; x++) {
					this.grid[y][x - minx] = 2;
				}
			}
		});
		this.setState({ minx: bounds[0], maxx: bounds[1], miny: bounds[2], maxy: bounds[3], instructions: instructions });
	}

	static Cell(props) {
		return <div className={"cell " + AoC17.classes[props.class]}></div>;
	}

	static Row(props) {
		var cell = 0;
		return <div className="row">
			{props.data.map(c => <AoC17.Cell key={cell++} class={c} />)}
		</div>;
	}

	put(x, y, t) {
		this.grid[y][x + 2 - this.state.minx] = t;
	}

	get(x, y) {
		return this.grid[y][x + 2 - this.state.minx];
	}

	block(t) {
		return t === 2 || t === 4;
	}

	canDrop(t) {
		return t === 1 || t === 3;
	}

	overflow(x, y) {
		var x1 = x, x2 = x;
		while (!this.block(this.get(x1 - 1, y)) && !this.canDrop(this.get(x1, y + 1))) x1--;
		while (!this.block(this.get(x2 + 1, y)) && !this.canDrop(this.get(x2, y + 1))) x2++;
		var n = this.canDrop(this.get(x1, y + 1)) || this.canDrop(this.get(x2, y + 1)) ? 3 : 4;
		for (var i = x1; i <= x2; i++) this.put(i, y, n);
		if (this.canDrop(this.get(x1, y + 1))) this.drop(x1, y + 1);
		if (this.canDrop(this.get(x2, y + 1))) this.drop(x2, y + 1);
	}

	drop(x, y) {
		while (y <= this.state.maxy && 1 === this.get(x, y)) this.put(x, y++, 3);
		if (y > this.state.maxy) return;
		while (this.block(this.get(x, y--))) this.overflow(x, y);
	}

	fill() {
		window.setTimeout(() => {
			console.log("Filling");
			this.put(500, 0, 0);
			this.drop(500, 1);
			this.setState({});
			console.log("Done");
		}, 1);
	}

	reach() {
		var r = 0;
		for (var y = this.state.miny; y <= this.state.maxy; y++)
			for (var x = 0; x <= 4 + this.state.maxx - this.state.minx; x++)
				if (this.grid[y][x] === 3 || this.grid[y][x] === 4) r++
		return r;
	}

	retain() {
		var r = 0;
		for (var y = this.state.miny; y <= this.state.maxy; y++)
			for (var x = 0; x <= 4 + this.state.maxx - this.state.minx; x++)
				if (this.grid[y][x] === 4) r++
		return r;
	}

	render() {
		var row = 0;
		return <div className="main">
			<div>
				<p>Input:</p>
				<textarea rows="40" cols="50" value={this.state.input} readOnly />
			</div>
			<div>
				<p>Result:</p>
				<div className="grid">
					{this.grid.slice(0, 500).map(r => <AoC17.Row key={row++} data={r} />)}
				</div>
			</div>
			<div>
				<p>Data:</p>
				<p>Instructions: {this.state.instructions ? this.state.instructions.length : 0}</p>
				<p>X: {this.state.minx} - {this.state.maxx}<br />Y: {this.state.miny} - {this.state.maxy}</p>
				<p>{this.grid.length} x {this.grid[0].length}</p>
				<p>Can reach {this.reach()}, retains {this.retain()}</p>
				<input type="button" value="Fill" onClick={e => this.fill()} />
			</div>
		</div>;
	}
}