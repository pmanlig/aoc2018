import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { AoC17 } from './AoC17';

export default class App extends Component {
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<p>Advent of code 2018 - day 17</p>
				</header>
				<AoC17 />
			</div>
		);
	}
}

