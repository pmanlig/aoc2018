import React from 'react';

class Constellation {
	constructor(pt) {
		this.coordinates = [];
		if (pt !== undefined) {
			this.coordinates.push(pt);
		}
	}

	canMerge(other) {
		if (this === other) return false;
		for (var i = 0; i < this.coordinates.length; i++) {
			for (var j = 0; j < other.coordinates.length; j++) {
				if (this.coordinates[i].distanceTo(other.coordinates[j]) < 4)
					return true;
			}
		}
		return false;
	}

	merge(other) {
		this.coordinates = this.coordinates.concat(other.coordinates);
	}
}

class Coordinate {
	constructor(x, y, z, t) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.t = t;
	}

	static fromText(txt) {
		txt = txt.split(",").map(t => t.trim());
		return new Coordinate(parseInt(txt[0], 10), parseInt(txt[1], 10), parseInt(txt[2], 10), parseInt(txt[3], 10));
	}

	distanceTo(o) {
		return Math.abs(this.x - o.x) + Math.abs(this.y - o.y) + Math.abs(this.z - o.z) + Math.abs(this.t - o.t);
	}
}

export class AoC25 extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		fetch("input25.txt")
			.then(res => res.text())
			.then(txt => {
				this.processInput(txt);
			});
	}

	processInput(txt) {
		var coordinates = txt.split('\n').map(t => t.trim()).map(c => Coordinate.fromText(c));
		var constellations = coordinates.map(c => new Constellation(c));
		this.setState({ coordinates: coordinates, constellations: constellations });
	}

	congeal() {
		var constellations = this.state.constellations;
		var l;
		var rem = x => x.remove !== true;
		do {
			l = constellations.length;
			var i;
			for (i = 0; i < constellations.length; i++) {
				for (var j = i + 1; j < constellations.length; j++) {
					var x = constellations[j];
					if (constellations[i].canMerge(x)) {
						constellations[i].merge(x);
						x.remove = true;
					}
				}
				constellations = constellations.filter(rem);
			}
		} while (l > constellations.length);
		this.setState({ constellations: constellations });
	}

	render() {
		var i = 0;
		return <div className="main">
			<div>
				{this.state.coordinates && <p>Coordinates: {this.state.coordinates.length}</p>}
				{this.state.coordinates && this.state.coordinates.map(c => <p key={"" + c.x + c.y + c.z + c.t}>{c.x},{c.y},{c.z},{c.t}</p>)}
			</div>
			<div>
				{this.state.constellations && <p>Constellations: {this.state.constellations.length}</p>}
				{this.state.constellations && this.state.constellations.map(c => <p key={i++}>Length: {c.coordinates.length}</p>)}
			</div>
			<div>
				<input type="button" value="Congeal" onClick={e => this.congeal()} />
			</div>
		</div>;
	}
}