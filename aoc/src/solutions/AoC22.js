import React from 'react';

const pixel_size = 4;
const Tools = { torch: 1, gear: 2, none: 3 };
const tools = [[Tools.torch, Tools.gear], [Tools.gear, Tools.none], [Tools.torch, Tools.none]];
const toolName = ["", "torch", "gear", "none"];

class PathStep {
	constructor(x, y, time, tool, from) {
		this.x = x;
		this.y = y;
		this.time = time;
		this.tool = tool;
		this.from = from;
	}

	newPath(x, y, time, tool, paths, times) {
		var n = new PathStep(x, y, time, tool, this);
		if (times[tool][y][x] !== undefined) {
			paths = paths.filter(p => !p.toList().includes(times[tool][y][x]));
		}
		times[tool][y][x] = n;
		paths.push(n);
	}

	shorter(x, y, time, tool, times) {
		return times[tool][y][x] === undefined || times[tool][y][x] > time;
	}

	step(x, y, paths, map, times) {
		var terrain = map[y][x] % 3;
		if (tools[terrain].includes(this.tool) && this.shorter(x, y, this.time + 1, this.tool, times)) {
			this.newPath(x, y, this.time + 1, this.tool, paths, times);
		} else {
			var myTerrain = map[this.y][this.x] % 3;
			tools[myTerrain].filter(t => t !== this.tool).forEach(t => {
				if (tools[terrain].includes(t) && this.shorter(x, y, this.time + 8, t, times))
					this.newPath(x, y, this.time + 8, t, paths, times);
			});
		}
	}

	up(paths, map, times) {
		if (this.y > 0) this.step(this.x, this.y - 1, paths, map, times);
	}

	left(paths, map, times) {
		if (this.x > 0) this.step(this.x - 1, this.y, paths, map, times);
	}

	right(paths, map, times) {
		if (this.x < map[0].length - 1) this.step(this.x + 1, this.y, paths, map, times);
	}

	down(paths, map, times) {
		if (this.y < map.length - 1) this.step(this.x, this.y + 1, paths, map, times);
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

export class AoC22 extends React.Component {
	static red = [64, 159, 127, 255];
	static green = [64, 159, 127, 0];
	static blue = [64, 255, 0, 0];

	constructor(props) {
		super(props);
		this.state = {};
		fetch("input22.txt")
			// fetch("test22.txt")
			.then(res => res.text())
			.then(txt => {
				this.processInput(txt);
			});
	}

	processInput(txt) {
		console.log(txt);
		var input = txt.split(" ");
		var depth = parseInt(input[1]);
		input = input[2].split(",");
		var x = parseInt(input[0]);
		var y = parseInt(input[1]);
		var map = this.calculateMap(x, y, depth);
		var risk = this.risk(map, x, y);
		var path = this.calculatePath(x, y, map);
		this.setState({ depth: depth, x: x, y: y, map: map, risk: risk, path: path });
		this.updateCanvas();
	}

	calculateMap(x, y, d) {
		var map = [];
		for (var r = 0; r <= y * 1.1; r++) {
			map[r] = [];
			for (var c = 0; c <= x * 10; c++) {
				if (r === 0) map[r][c] = c * 16807;
				else if (c === 0) map[r][c] = r * 48271;
				else map[r][c] = map[r - 1][c] * map[r][c - 1];
				map[r][c] = (map[r][c] + d) % 20183;
			}
		}
		map[y][x] = map[0][0];
		return map;
	}

	risk(map, x, y) {
		var sum = 0;
		for (var r = 0; r <= y; r++) {
			for (var c = 0; c <= x; c++) {
				sum += map[r][c] % 3;
			}
		}
		return sum;
	}

	iterate(x, y, map, times) {
		var i = 0;
		while (i++ < times && this.paths.length > 0 && (this.paths[0].x !== x || this.paths[0].y !== y || this.paths[0].tool !== Tools.torch)) {
			var p = this.paths.shift();
			if (p.x === x && p.y === y) {
				p.tool = Tools.torch;
				p.time += 7;
				this.paths.push(p);
			} else {
				p.up(this.paths, map, this.times);
				p.left(this.paths, map, this.times);
				p.right(this.paths, map, this.times);
				p.down(this.paths, map, this.times);
			}
			this.paths.sort((a, b) => a.time - b.time);
		}
		console.log(i + " iterations");
		console.log(this.paths);
		return this.paths[0];
	}

	calculatePath(x, y, map) {
		this.times = [];
		for (var t = 1; t < 4; t++) {
			this.times[t] = [];
			for (var r = 0; r < map.length; r++) {
				this.times[t][r] = [];
				for (var c = 0; c < map[r].length; c++) {
					this.times[t][r][c] = undefined;
				}
			}
		}
		this.paths = [new PathStep(0, 0, 0, Tools.torch, undefined)];
		this.times[Tools.torch][0][0] = this.paths[0];
		return this.iterate(x, y, map, 10);
	}

	updateCanvas() {
		const ctx = this.refs.canvas.getContext('2d');
		var image = ctx.createImageData(this.state.map[0].length * pixel_size, this.state.map.length * pixel_size);
		var imgPtr = 0;
		var map = [];
		for (var r = 0; r < this.state.map.length; r++) {
			map[r] = [];
			for (var c = 0; c < this.state.map[r].length; c++) {
				map[r][c] = this.state.map[r][c] % 3;
			}
		}
		this.state.path.toList().forEach(p => {
			map[p.y][p.x] = 3;
		});
		for (var y = 0; y < map.length * pixel_size; y++)
			for (var x = 0; x < map[0].length * pixel_size; x++) {
				image.data[imgPtr++] = AoC22.red[map[Math.floor(y / pixel_size)][Math.floor(x / pixel_size)]];
				image.data[imgPtr++] = AoC22.green[map[Math.floor(y / pixel_size)][Math.floor(x / pixel_size)]];
				image.data[imgPtr++] = AoC22.blue[map[Math.floor(y / pixel_size)][Math.floor(x / pixel_size)]];
				image.data[imgPtr++] = 255;
			}
		ctx.putImageData(image, 0, 0);
	}

	render() {
		return <div className="main">
			<div>
				{this.state.depth && <p>Depth: {this.state.depth}</p>}
				{this.state.x && this.state.y && <p>Target coordinates: {this.state.x},{this.state.y}</p>}
				{this.state.risk && <p>Risk sum: {this.state.risk}</p>}
				{this.state.path && <p>Path to: {this.state.path.x},{this.state.path.y}</p>}
				{this.state.path && <p>Path length: {this.state.path.toList().length}</p>}
				{this.state.path && <p>Path time: {this.state.path.time}</p>}
				{this.state.path && <input type="button" value="Step" onClick={e => {
					this.setState({path:this.iterate(this.state.x, this.state.y, this.state.map, 50000)});
					this.updateCanvas();
				}} />}
				{this.state.path && this.state.path.toList().map(p => <p key={p.x + "," + p.y}>=> {p.x},{p.y} ({toolName[p.tool]}, {p.time} min)</p>)}
			</div>
			<div>
				<canvas ref="canvas" width={this.state.map ? this.state.map[0].length * pixel_size : 0} height={this.state.map ? this.state.map.length * pixel_size : 0} />
			</div>
		</div>;
	}
}