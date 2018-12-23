import React from 'react';

const pixel_size = 2;
const x_scale = 35;
const y_scale = 1.1;
const MAX_PATH = 10000;
const Tools = { torch: 1, gear: 2, none: 3 };
const Ground = { rocky: 0, wet: 1, narrow: 2 };
const tools = [[Tools.torch, Tools.gear], [Tools.gear, Tools.none], [Tools.torch, Tools.none]];
const toolName = ["", "torch", "gear", "none"];
var log = false;

class Distances {
	constructor(map) {
		this.map = map;
		this.dist = [[], [], [], []];
		for (var r = 0; r < map.length; r++) {
			this.dist[Tools.torch][r] = [];
			this.dist[Tools.gear][r] = [];
			this.dist[Tools.none][r] = [];
			for (var c = 0; c < map[r].length; c++) {
				this.dist[Tools.torch][r][c] = map[r][c] === Ground.wet ? -1 : MAX_PATH;
				this.dist[Tools.gear][r][c] = map[r][c] === Ground.narrow ? -1 : MAX_PATH;
				this.dist[Tools.none][r][c] = map[r][c] === Ground.rocky ? -1 : MAX_PATH;
			}
		}
	}

	valid(x, y, tool, time) {
		return this.dist[tool][y][x] > time;
	}

	set(x, y, tool, time) {
		this.dist[tool][y][x] = time;
	}
}

class PathStep {
	constructor(x, y, time, tool, from) {
		this.x = x;
		this.y = y;
		this.time = time;
		this.tool = tool;
		this.from = from;
	}

	toList() {
		if (this.from === undefined) {
			return [this];
		}
		var r = this.from.toList();
		r.push(this);
		return r;
	}
}

class Map extends React.Component {
	static red = [64, 159, 127, 255];
	static green = [64, 159, 127, 0];
	static blue = [64, 255, 0, 0];

	constructor(props) {
		super(props);
		this.canvasRef = React.createRef();
	}

	componentDidUpdate() {
		if (this.props.data === undefined) return;
		var pixelsize = this.props.pixelsize || 1;
		const ctx = this.canvasRef.current.getContext('2d');
		var image = ctx.createImageData(this.props.data[0].length * pixelsize, this.props.data.length * pixelsize);
		var imgPtr = 0;
		var map = [];
		for (var r = 0; r < this.props.data.length; r++) {
			map[r] = [];
			for (var c = 0; c < this.props.data[r].length; c++) {
				map[r][c] = this.props.data[r][c];
			}
		}
		for (var y = 0; y < map.length * pixelsize; y++)
			for (var x = 0; x < map[0].length * pixelsize; x++) {
				image.data[imgPtr++] = Map.red[map[Math.floor(y / pixelsize)][Math.floor(x / pixelsize)]];
				image.data[imgPtr++] = Map.green[map[Math.floor(y / pixelsize)][Math.floor(x / pixelsize)]];
				image.data[imgPtr++] = Map.blue[map[Math.floor(y / pixelsize)][Math.floor(x / pixelsize)]];
				image.data[imgPtr++] = 255;
			}
		ctx.putImageData(image, 0, 0);
	}

	render() {
		if (this.props.data === undefined) return null;
		var pixelsize = this.props.pixelsize || 1;
		return <canvas ref={this.canvasRef} width={this.props.data[0].length * pixelsize} height={this.props.data.length * pixelsize} />;
	}
}

export class AoC22 extends React.Component {
	static red = [64, 159, 127, 255];
	static green = [64, 159, 127, 0];
	static blue = [64, 255, 0, 0];

	constructor(props) {
		super(props);
		this.state = {};
		fetch("input22.txt")
			.then(res => res.text())
			.then(txt => {
				this.processInput(txt);
			});
		fetch("test22.txt")
			.then(res => res.text())
			.then(txt =>
				fetch("test22b.txt")
					.then(res => res.text())
					.then(ans => this.test(txt, ans)));
	}

	parseLine(txt) {
		var line = [];
		for (var i = 0; i < txt.length; i++) {
			var c = txt.charAt(i);
			if (c === '.') line.push(0);
			if (c === '=') line.push(1);
			if (c === '|') line.push(2);
		}
		return line;
	}

	validate(map, ans) {
		for (var r = 0; r < ans.length; r++) {
			for (var c = 0; c < ans[r].length; c++) {
				if (map[r][c] !== ans[r][c]) {
					console.log("Mismatch at " + c + "," + r + " expected " + ans[r][c] + " but found " + map[r][c]);
					return false;
				}
			}
		}
		return true;
	}

	test(txt, answer) {
		var input = txt.split(" ");
		var depth = parseInt(input[1]);
		input = input[2].split(",");
		var x = parseInt(input[0]);
		var y = parseInt(input[1]);
		var map = this.calculateMap(x, y, depth, 2, 2);
		var ans = answer.split("\n").map(l => l.trim()).map(l => this.parseLine(l));
		this.setState({ test: this.validate(map, ans), testmap: map, answer: ans });
	}

	processInput(txt) {
		var input = txt.split(" ");
		var depth = parseInt(input[1]);
		input = input[2].split(",");
		var x = parseInt(input[0]);
		var y = parseInt(input[1]);
		var map = this.calculateMap(x, y, depth);
		this.distances = new Distances(map);
		var risk = this.risk(map, x, y);
		this.paths = [new PathStep(0, 0, 0, Tools.torch)];
		this.distances.set(0, 0, Tools.torch, 0);
		this.setState({ depth: depth, x: x, y: y, map: map, risk: risk, path: this.paths[0], iteration: 0 });
	}

	calculateMap(x, y, d, x_s, y_s) {
		var map = [];
		for (var r = 0; r <= y * (y_s || y_scale); r++) {
			map[r] = [];
			for (var c = 0; c <= x * (x_s || x_scale); c++) {
				if (r === y && c === x) map[r][c] = 0;
				else if (r === 0) map[r][c] = c * 16807;
				else if (c === 0) map[r][c] = r * 48271;
				else map[r][c] = map[r - 1][c] * map[r][c - 1];
				map[r][c] = (map[r][c] + d) % 20183;
			}
		}
		for (var i = 0; i < map.length; i++)
			for (var j = 0; j < map[i].length; j++)
				map[i][j] = map[i][j] % 3;
		return map;
	}

	risk(map, x, y) {
		var sum = 0;
		for (var r = 0; r <= y; r++) {
			for (var c = 0; c <= x; c++) {
				sum += map[r][c];
			}
		}
		return sum;
	}

	iterate(x, y, map, times, iterations) {
		var i = 0;
		while (i++ < iterations && this.paths.length > 0 && (this.paths[0].x !== x || this.paths[0].y !== y || this.paths[0].tool !== Tools.torch)) {
			var p = this.paths.shift();
			// log = p.x === 8 && p.y === 12;
			if (log) console.log(p);
			if (p.x === x && p.y === y) {
				p.tool = Tools.torch;
				p.time += 7;
				// this.paths = this.paths.filter(c => c.time <= p.time);
				this.paths.push(p);
			} else {
				p.up(this.paths, map, times);
				p.left(this.paths, map, times);
				p.right(this.paths, map, times);
				p.down(this.paths, map, times);
			}
			this.paths.sort((a, b) => a.time - b.time);
			this.paths = this.paths.filter(p => p.time < 962);
		}
		console.log(i + " iterations");
		console.log(this.paths);
		return this.paths[0];
	}

	calculatePath(x, y, map) {
		this.times = [];
		for (var r = 0; r < map.length; r++) {
			this.times[r] = [];
			for (var c = 0; c < map[r].length; c++) {
				this.times[r][c] = [];
			}
		}
		var initial = new PathStep(0, 0, 0, Tools.torch, undefined);
		var changeToGear = new PathStep(0, 0, 7, Tools.gear, initial);
		this.times[0][0][Tools.torch] = initial;
		this.times[0][0][Tools.gear] = changeToGear;
		this.paths = [initial, changeToGear];
		return this.iterate(x, y, map, this.times, 2/*00000*/);
	}

	componentDidUpdate() {
		if (this.state.map === undefined) return;
		const ctx = this.refs.canvas.getContext('2d');
		var image = ctx.createImageData(this.state.map[0].length * pixel_size, this.state.map.length * pixel_size);
		var imgPtr = 0;
		var map = [];
		for (var r = 0; r < this.state.map.length; r++) {
			map[r] = [];
			for (var c = 0; c < this.state.map[r].length; c++) {
				map[r][c] = this.state.map[r][c];
			}
		}
		this.state.path.toList().forEach(p => {
			map[p.y][p.x] = 3;
		});
		map[this.state.y][this.state.x] = 3;
		var map_x, map_y;
		for (var y = 0; y < map.length * pixel_size; y++)
			for (var x = 0; x < map[0].length * pixel_size; x++) {
				map_x = Math.floor(x / pixel_size);
				map_y = Math.floor(y / pixel_size);
				image.data[imgPtr++] = AoC22.red[map[map_y][map_x]];
				image.data[imgPtr++] = AoC22.green[map[map_y][map_x]];
				image.data[imgPtr++] = AoC22.blue[map[map_y][map_x]];
				image.data[imgPtr++] = (this.distances.dist[Tools.torch][map_y][map_x] < MAX_PATH && this.distances.dist[Tools.torch][map_y][map_x] > -1) ? 127 : 255;
			}
		ctx.putImageData(image, 0, 0);
	}

	step(path, paths) {
		var x = path.x;
		var y = path.y;
		var tool = path.tool;
		var time = path.time;

		if (path.y > 0 && this.distances.valid(x, y - 1, tool, time + 1)) {
			this.distances.set(x, y - 1, tool, time + 1);
			paths.push(new PathStep(x, y - 1, time + 1, tool, path));
		}
		if (path.x > 0 && this.distances.valid(x - 1, y, tool, time + 1)) {
			this.distances.set(x - 1, y, tool, time + 1);
			paths.push(new PathStep(x - 1, y, time + 1, tool, path));
		}
		if (path.x < this.state.map[y].length - 1 && this.distances.valid(x + 1, y, tool, time + 1)) {
			this.distances.set(x + 1, y, tool, time + 1);
			paths.push(new PathStep(x + 1, y, time + 1, tool, path));
		}
		if (path.y < this.state.map.length - 1 && this.distances.valid(x, y + 1, tool, time + 1)) {
			this.distances.set(x, y + 1, tool, time + 1);
			paths.push(new PathStep(x, y + 1, time + 1, tool, path));
		}

		var otherTool = tools[this.state.map[y][x]].find(t => t !== tool);
		if (this.distances.valid(x, y, otherTool, time + 7)) {
			this.distances.set(x, y, otherTool, time + 7);
			paths.push(new PathStep(x, y, time + 7, otherTool, path));
		}
	}

	calculateNextIteration() {
		var current = this.paths.filter(p => p.time === this.state.iteration);
		current.forEach(p => this.step(p, this.paths));
		this.paths = this.paths.filter(p => p.time > this.state.iteration);
		var path = this.paths.find(p => p.x === this.state.x && p.y === this.state.y && p.tool === Tools.torch);
		if (path !== undefined)
			this.setState({ path: path, iteration: this.state.iteration + 1 });
		else
			this.setState({ /*path: this.paths[0],*/ iteration: this.state.iteration + 1 });
		if (this.calculate && this.state.iteration < 1000)
			window.setTimeout(() => this.calculateNextIteration(), 1);
	}

	startIteration() {
		if (!this.calculate) {
			this.calculate = true;
			window.setTimeout(() => this.calculateNextIteration(), 1);
		}
	}

	stopIteration() {
		this.calculate = false;
	}

	render() {
		return <div className="main">
			<div>
				{this.state.depth && <p>Depth: {this.state.depth}</p>}
				{this.state.x && this.state.y && <p>Target coordinates: {this.state.x},{this.state.y}</p>}
				{this.state.risk && <p>Risk sum: {this.state.risk}</p>}
				<p>Test 1: {this.state.test === undefined ? "Pending" : (this.state.test ? "OK" : "FAIL")}</p>
				{this.state.path && <p>Path to: {this.state.path.x},{this.state.path.y}</p>}
				<p>Iteration: {this.state.iteration}</p>
				{this.state.path && <p>Path length: {this.state.path.toList().length}</p>}
				{this.state.path && <p>Path time: {this.state.path.time}</p>}
				{/*this.state.path && <input type="button" value="Step" onClick={e => {
					var path = this.iterate(this.state.x, this.state.y, this.state.map, this.times, 50000);
					this.setState({ path: path });
				}} />*/}
				<input type="button" value="Step" onClick={e => this.calculateNextIteration()} />
				<input type="button" value="Go" onClick={e => this.startIteration()} />
				<input type="button" value="Stop" onClick={e => this.stopIteration()} />
				{this.state.path && this.state.path.toList().map(p => <p key={p.x + "," + p.y}>=> {p.x},{p.y} ({toolName[p.tool]}, {p.time} min)</p>)}
			</div>
			<div style={{ backgroundColor: "black" }}>
				<canvas ref="canvas" width={this.state.map ? this.state.map[0].length * pixel_size : 0} height={this.state.map ? this.state.map.length * pixel_size : 0} />
			</div>
			<div>
				<Map data={this.state.testmap} pixelsize={8} />
			</div>
			{/*
			<div>
				<Map data={this.state.answer} pixelsize={8} />
			</div>
			*/}
		</div>;
	}
}