import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { AoC16 } from './AoC16';

class App extends Component {
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<p>Advent of Code - Day 16</p>
				</header>
				<AoC16 />
			</div>
		);
	}
}

export default App;
