import React from 'react';

class Bot {
	constructor(txt) {
		var coordinates = txt.split("<")[1].split(">")[0].split(",").map(c => parseInt(c));
		this.x = coordinates[0];
		this.y = coordinates[1];
		this.z = coordinates[2];
		this.r = parseInt(txt.split("r=")[1]);
	}

	distance(other) {
		return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z);
	}
}

export class AoC23 extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		fetch("input23.txt")
			.then(res => res.text())
			.then(txt => {
				this.processInput(txt);
			});
	}

	processInput(txt) {
		var bots = txt.split('\n').map(s => new Bot(s.trim()));
		var strongest = bots[0];
		bots.forEach(b => { if (b.r > strongest.r) strongest = b; });
		strongest.strength = bots.filter(o => o.distance(strongest) <= strongest.r)
		this.setState({ loaded: true, bots: bots, strongest: strongest });
	}

	testDistance() {
		var a = new Bot("<0,0,0> r=4"), b=new Bot("<1,3,1> r=5"), c=new Bot("<-10,2,8> r=28");
		return a.distance(b) === 5 && a.distance(c) === 20;
	}

	render() {
		var i = 1;
		return <div className="main">
			<div>
				<p>{this.state.loaded ? "Done" : "Loading..."}</p>
				<p>Testing distance: {this.testDistance() ? "OK" : "FAIL"}</p>
				{this.state.bots && <p>Bots: {this.state.bots.length}</p>}
				{this.state.strongest && <p>Strongest: {this.state.strongest.strength.length}</p>}
				{this.state.bots && this.state.bots.map(b => <p key={i}>{i++}: &lt;{b.x},{b.y},{b.z}&gt; r={b.r}</p>)}
			</div>
		</div>;
	}
}