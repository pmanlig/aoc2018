import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { AoC15 } from './AoC15';

class App extends Component {
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<p>Advent of code 2018 - day 15</p>
				</header>
				<AoC15 />
			</div>
		);
	}
}

export default App;
