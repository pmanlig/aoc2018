import React from 'react';

class Input {
	parts = [];

	constructor(input) {
		if (input)
			this.parts = input.split("\n");
	}
}

export class AoC8b extends React.Component {
	state = {input:""};

	constructor(props) {
		super(props);
		fetch("input4.txt")
			.then(res => res.text())
			.then(txt => this.setState({input: txt}));
	}

	readInput(e) {
		this.setState({input: e.target.value});
	}
	
	render() {
		var i = new Input(this.state.input);
		return <div className="content">
			<h1>Advent of Code 8b</h1>
			<p>Input:<br/>
				<textarea value={this.state.input} onChange={e => this.readInput(e)} />
			</p>
			<p>Words: {i.parts.length}</p>
		</div>;
	}
}