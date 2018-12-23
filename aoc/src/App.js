import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';
import { AoC8 } from './solutions/AoC8';
import { AoC9 } from './solutions/AoC9';
import { AoC15 } from './solutions/AoC15';
import { AoC16 } from './solutions/AoC16';
import { AoC17 } from './solutions/AoC17';
import { AoC20 } from './solutions/AoC20';
import { AoC21 } from './solutions/AoC21';
import { AoC22 } from './solutions/AoC22';
import { AoC23 } from './solutions/AoC23';

class Solution {
	constructor(d,c) {
		this.day = d;
		this.component = c;
		this.next = this;
		this.prev = this;
	}

	insert(s) {
		s.next = this.next;
		s.prev = this;
		this.next.prev = s;
		this.next = s;
	}
}

class App extends Component {
	constructor(props) {
		super(props);
		
		var s = new Solution(8, AoC8);
		s.insert(new Solution(23, AoC23));
		s.insert(new Solution(22, AoC22));
		s.insert(new Solution(21, AoC21));
		s.insert(new Solution(20, AoC20));
		s.insert(new Solution(17, AoC17));
		s.insert(new Solution(16, AoC16));
		s.insert(new Solution(15, AoC15));
		s.insert(new Solution(9, AoC9));
		this.state = {solution: s.prev}
	}
	
	next() {
		this.setState({solution: this.state.solution.next});
	}

	prev() {
		this.setState({solution: this.state.solution.prev});
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<div className="button" onClick={e => this.prev()}>&lt;</div>
					<div className="spacer"/>
					<img src={logo} className="App-logo" alt="logo" />
					<p>Advent of code 2018 - Day {this.state.solution.day}</p>
					<div className="spacer"/>
					<div className="button" onClick={e => this.next()}>&gt;</div>
				</header>
				<this.state.solution.component />
			</div>
		);
	}
}

export default App;
