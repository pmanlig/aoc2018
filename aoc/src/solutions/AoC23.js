import React from 'react';

class Coordinate {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	distance(other) {
		return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z);
	}

	distanceXYZ(x, y, z) {
		return Math.abs(this.x - x) + Math.abs(this.y - y) + Math.abs(this.z - z);
	}

	setXYZ(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

class Sphere extends Coordinate {
	constructor(x, y, z, r) {
		super(x, y, z);
		this.r = r;
	}

	reaches(coord) {
		return this.distance(coord) <= this.r;
	}

	reachesXYZ(x, y, z) {
		return this.distanceXYZ(x, y, z) <= this.r;
	}

	clone() {
		return new Sphere(this.x, this.y, this.z, this.r);
	}
}

class Bot extends Sphere {
	static fromText(txt) {
		var coordinates = txt.split("<")[1].split(">")[0].split(",").map(c => parseInt(c, 10));
		return new Bot(coordinates[0], coordinates[1], coordinates[2], parseInt(txt.split("r=")[1], 10));
	}
}

class Envelope {
	constructor(xmin, xmax, ymin, ymax, zmin, zmax, bots) {
		this.xmin = xmin;
		this.xmax = xmax;
		this.ymin = ymin;
		this.ymax = ymax;
		this.zmin = zmin;
		this.zmax = zmax;
		this.bots = [];
		if (bots !== undefined) this.addBots(bots);
	}

	clone() {
		return new Envelope(this.xmin, this.xmax, this.ymin, this.ymax, this.zmin, this.zmax);
	}

	volume() {
		return (1 + this.xmax - this.xmin) * (1 + this.ymax - this.ymin) * (1 + this.zmax - this.zmin);
	}

	static sorter(a, b) {
		var diff = b.bots.length - a.bots.length;
		if (diff !== 0) return diff;
		diff = a.volume() - b.volume();
		if (diff !== 0) return diff;
		return Math.abs(a.xmin) + Math.abs(a.ymin) + Math.abs(a.zmin) - Math.abs(b.xmin) - Math.abs(b.ymin) - Math.abs(b.zmin);
	}

	overlaps(bot) {
		var r = bot.r;
		if (bot.x > this.xmax) {
			r -= (bot.x - this.xmax);
		} else if (bot.x < this.xmin) {
			r -= (this.xmin - bot.x);
		}
		if (bot.y > this.ymax) {
			r -= (bot.y - this.ymax);
		} else if (bot.y < this.ymin) {
			r -= (this.ymin - bot.y);
		}
		if (bot.z > this.zmax) {
			r -= (bot.z - this.zmax);
		} else if (bot.z < this.zmin) {
			r -= (this.zmin - bot.z);
		}
		return r >= 0;
	}

	addBots(bots) {
		this.bots = [];
		bots.forEach(b => {
			if (this.overlaps(b)) this.bots.push(b);
		})
	}

	split() {
		var xmid = this.xmin + Math.floor((this.xmax - this.xmin) / 2);
		var ymid = this.ymin + Math.floor((this.ymax - this.ymin) / 2);
		var zmid = this.zmin + Math.floor((this.zmax - this.zmin) / 2);
		var newEnvelopes = [];
		newEnvelopes.push(new Envelope(this.xmin, xmid, this.ymin, ymid, this.zmin, zmid, this.bots));
		newEnvelopes.push(new Envelope(this.xmin, xmid, this.ymin, ymid, zmid + 1, this.zmax, this.bots));
		newEnvelopes.push(new Envelope(this.xmin, xmid, ymid + 1, this.ymax, this.zmin, zmid, this.bots));
		newEnvelopes.push(new Envelope(this.xmin, xmid, ymid + 1, this.ymax, zmid + 1, this.zmax, this.bots));
		newEnvelopes.push(new Envelope(xmid + 1, this.xmax, this.ymin, ymid, this.zmin, zmid, this.bots));
		newEnvelopes.push(new Envelope(xmid + 1, this.xmax, this.ymin, ymid, zmid + 1, this.zmax, this.bots));
		newEnvelopes.push(new Envelope(xmid + 1, this.xmax, ymid + 1, this.ymax, this.zmin, zmid, this.bots));
		newEnvelopes.push(new Envelope(xmid + 1, this.xmax, ymid + 1, this.ymax, zmid + 1, this.zmax, this.bots));
		return newEnvelopes;
	}
}

export class AoC23 extends React.Component {
	constructor(props) {
		super(props);
		this.state = { closest: { tested: -1, r: -1, count: 0 } };
		fetch("input23.txt")
			.then(res => res.text())
			.then(txt => {
				this.processInput(txt);
			});
	}

	processInput(txt) {
		var bots = txt.split('\n').map(s => Bot.fromText(s.trim()));
		bots.sort((a, b) => a.r - b.r);
		var strongest = bots[0];
		var env = new Envelope(bots[0].x, bots[0].x, bots[0].y, bots[0].y, bots[0].z, bots[0].z);
		bots.forEach(b => {
			if (b.r > strongest.r) strongest = b;
			if (b.x < env.xmin) env.xmin = b.x;
			if (b.x > env.xmax) env.xmax = b.x;
			if (b.y < env.ymin) env.ymin = b.y;
			if (b.y > env.ymax) env.ymax = b.y;
			if (b.z < env.zmin) env.zmin = b.z;
			if (b.z > env.zmax) env.zmax = b.z;
		});
		strongest.strength = bots.filter(o => o.distance(strongest) <= strongest.r);
		this.setState({ loaded: true, bots: bots, strongest: strongest, env: env });
	}

	testDistance() {
		var a = Bot.fromText("<0,0,0> r=4"), b = Bot.fromText("<1,3,1> r=5"), c = Bot.fromText("<-10,2,8> r=28");
		return a.distance(b) === 5 && a.distance(c) === 20;
	}

	calculateReach(x, y, z) {
		var count = 0;
		this.state.bots.forEach(c => { if (c.reachesXYZ(x, y, z)) count++; });
		return count;
	}

	findClosest() {
		var corners = [];
		this.state.bots.forEach(b => {
			corners.push(new Coordinate(b.x - b.r, b.y, b.z));
			corners.push(new Coordinate(b.x + b.r, b.y, b.z));
			corners.push(new Coordinate(b.x, b.y - b.r, b.z));
			corners.push(new Coordinate(b.x, b.y + b.r, b.z));
			corners.push(new Coordinate(b.x, b.y, b.z - b.r));
			corners.push(new Coordinate(b.x, b.y, b.z + b.r));
		});
		corners.forEach(c => c.count = this.calculateReach(c.x, c.y, c.z));
		corners.sort((a, b) => b.count - a.count);
		this.setState({ corners: corners });
	}

	processQueue() {
		console.log("PQ called");
		var first = this.queue.shift();
		this.queue = this.queue.concat(first.split()).sort(Envelope.sorter);
		console.log(this.queue);
		this.setState({ solution: this.queue[0] });
		if (this.queue[0].volume() === 1 || this.limit-- > 0) window.setTimeout(() => this.processQueue(), 1);
	}

	findClosest2() {
		var bots = this.state.bots;
		var initial = this.state.env.clone();
		bots.forEach(b => {
			var d = b.distance(initial);
			if (d > initial.r) initial.r = d;
		});
		initial.addBots(bots);
		this.queue = [initial];
		this.limit = 150;
		this.processQueue();
	}

	render() {
		var i = 1, j = 1;
		var closest = this.state.closest;
		var env = this.state.env;
		var solution = this.state.solution;
		return <div className="main">
			<div>
				<p>{this.state.loaded ? "Done" : "Loading..."}</p>
				<p>Testing distance: {this.testDistance() ? "OK" : "FAIL"}</p>
				{this.state.bots && <p>Bots: {this.state.bots.length}</p>}
				{this.state.strongest && <p>Strongest: {this.state.strongest.strength.length}</p>}
				{env && <p>Span: &lt;{env.xmin}, {env.ymin}, {env.zmin}&gt; - &lt;{env.xmax}, {env.ymax}, {env.zmax}&gt;</p>}
				{env && <p>Size: {env.xmax - env.xmin} x {env.ymax - env.ymin} x {env.zmax - env.zmin} = {(env.xmax - env.xmin) * (env.ymax - env.ymin) * (env.zmax - env.zmin)}</p>}
				<input type="button" value="Find closest" onClick={e => this.findClosest2()} />
				{solution &&
					<p>Solution: {1 + solution.xmax - solution.xmin} x {1 + solution.ymax - solution.ymin} x {1 + solution.zmax - solution.zmin},
					bots={solution.bots.length},
					pos=&lt;{solution.xmin},{solution.ymin},{solution.zmin}&gt;,
					dist={Math.abs(solution.xmin) + Math.abs(solution.ymin) + Math.abs(solution.zmin)}
					</p>}
			</div>
			<div>
				{this.state.bots && this.state.bots.map(b => <p key={i}>{i++}: &lt;{b.x},{b.y},{b.z}&gt; r={b.r}</p>)}
			</div>
			<div>
				{this.state.corners && this.state.corners.map(c => <p key={j}>{j++}: {c.x},{c.y},{c.z} count={c.count}, distance={c.distanceXYZ(0, 0, 0)}</p>)}
			</div>
		</div>;
	}
}