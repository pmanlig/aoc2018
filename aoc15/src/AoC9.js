import React from 'react';

class Input {
	parts = [];
	index = 0;

	constructor(input, sep) {
		if (input)
			this.parts = input.split(sep);
	}

	read() {
		return this.parts[this.index++];
	}
}

class Node {
	next = this;
	prev = this;
	
	constructor(value) {
		this.value = value;
	}
}

class Marbles {
	scores=[];
	
	constructor(numPlayers, lastMarble) {
		for (var i=0; i<numPlayers; i++) this.scores[i]=0;
		this.play(numPlayers, lastMarble);
	}

	winner() {
		var win=0;
		var max=0;
		for (var i=0; i<this.scores.length; i++) {
			if (this.scores[i]>max) {
				max=this.scores[i];
				win=i;
			}
		}

		return win+1;
	}

	score() {
		var max=0;
		for (var i=0; i<this.scores.length; i++) {
			if (this.scores[i]>max) {
				max=this.scores[i];
			}
		}

		return max;
	}

	play(players, last) {
		var o=new Node(0);
		var c = o;
		for (var i=1; i<(last*100)+1; i++) {
			if (i%23===0) {
				var p=(i-1)%players;
				var r = c.prev.prev.prev.prev.prev.prev.prev;
				this.scores[p]+=i+r.value;
				// console.log(i + ": Score: " + i + " + " + r.value);
				r.prev.next = r.next;
				r.next.prev = r.prev;
				c = r.next;
			} else {
				var n=new Node(i);
				n.next = c.next.next;
				n.prev = c.next.next.prev;
				c.next.next.prev = n;
				c.next.next = n;
				c = n;
				/*
				n=o;
				var s = i + ": " + n.value + " ";
				while (n.next.value !== o.value) {
					s = s + n.next.value + " ";
					n = n.next;
				}
				console.log(s);
				*/
			}
		}
	}
}

export class AoC9 extends React.Component {
	state = { input: "" };

	constructor(props) {
		super(props);
		fetch("input9.txt")
			.then(res => res.text())
			.then(txt => this.setState({ input: txt }));
	}

	readInput(e) {
		this.setState({ input: e.target.value });
	}

	render() {
		var i = new Input(this.state.input, " ");
		var players = parseInt(i.read(), 10);
		for (var j=0; j<5; j++) i.read();
		var last = parseInt(i.read(), 10);
		var m = new Marbles(players, last);
		return <div className="content">
			<h1>Advent of Code 9</h1>
			<p>Input:<br />
				<textarea value={this.state.input} onChange={e => this.readInput(e)} />
			</p>
			<p>Words: {i.parts.length}</p>
			<p>Players: {players}</p>
			<p>LastMarble: {last}</p>
			<p>Winner: {m.winner()}</p>
			<p>Score: {m.score()}</p>
		</div>;
	}
}