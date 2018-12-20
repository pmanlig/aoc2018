import React from 'react';

class Fact {
	constructor(input) {
		var before = input.shift();
		before = before.substring("Before: [".length, before.length - 1);
		this.before = before.split(", ").map(n => parseInt(n, 10));
		this.data = input.shift().split(" ").map(n => parseInt(n, 10));
		var after = input.shift();
		after = after.substring("After:  [".length, after.length - 1);
		this.after = after.split(", ").map(n => parseInt(n, 10));
	}
}

function addr(s, i) {
	s[i[3]] = s[i[1]] + s[i[2]];
}

function addi(s, i) {
	s[i[3]] = s[i[1]] + i[2];
}

function mulr(s, i) {
	s[i[3]] = s[i[1]] * s[i[2]];
}

function muli(s, i) {
	s[i[3]] = s[i[1]] * i[2];
}

function banr(s, i) {
	s[i[3]] = s[i[1]] & s[i[2]];
}

function bani(s, i) {
	s[i[3]] = s[i[1]] & i[2];
}

function borr(s, i) {
	s[i[3]] = s[i[1]] | s[i[2]];
}

function bori(s, i) {
	s[i[3]] = s[i[1]] | i[2];
}

function setr(s, i) {
	s[i[3]] = s[i[1]];
}

function seti(s, i) {
	s[i[3]] = i[1];
}

function gtir(s, i) {
	s[i[3]] = i[1] > s[i[2]] ? 1 : 0;
}

function gtri(s, i) {
	s[i[3]] = s[i[1]] > i[2] ? 1 : 0;
}

function gtrr(s, i) {
	s[i[3]] = s[i[1]] > s[i[2]] ? 1 : 0;
}

function eqir(s, i) {
	s[i[3]] = i[1] === s[i[2]] ? 1 : 0;
}

function eqri(s, i) {
	s[i[3]] = s[i[1]] === i[2] ? 1 : 0;
}

function eqrr(s, i) {
	s[i[3]] = s[i[1]] === s[i[2]] ? 1 : 0;
}

function codeName(o) {
	if (o === addr) return "addr";
	if (o === addi) return "addi";
	if (o === mulr) return "mulr";
	if (o === muli) return "muli";
	if (o === banr) return "banr";
	if (o === bani) return "bani";
	if (o === borr) return "borr";
	if (o === bori) return "bori";
	if (o === setr) return "setr";
	if (o === seti) return "seti";
	if (o === gtir) return "gtir";
	if (o === gtri) return "gtri";
	if (o === gtrr) return "gtrr";
	if (o === eqri) return "eqri";
	if (o === eqir) return "eqir";
	if (o === eqrr) return "eqrr";
	return "unknown";
}

export class AoC16 extends React.Component {
	state = { data: [] };
	opcodes = [addr, addi, mulr, muli, banr, bani, borr, bori, setr, seti, gtir, gtri, gtrr, eqir, eqri, eqrr];

	constructor(props) {
		super(props);
		fetch("input16.txt")
			.then(res => res.text())
			.then(txt => {
				var lines = txt.split("\n").map(l => l.trim()).filter(s => s !== undefined && s.length > 0);
				console.log(lines);
				var facts = this.parseFacts(lines);
				var program = this.loadProgram(lines);
				console.log("Setting state");
				this.setState({ input: txt, data: facts, program: program });
				window.setTimeout(() => this.runTests(facts), 1);
				window.setTimeout(() => this.detectOpcodes(facts), 1);
			});
	}

	parseFacts(lines) {
		var facts = [];
		while (lines.length > 0 && lines[0].startsWith("Before:")) {
			facts.push(new Fact(lines));
		}
		return facts;
	}

	loadProgram(lines) {
		var program = [];
		while (lines.length > 0) {
			program.push(lines.shift().split(" ").map(n => parseInt(n, 10)));
		}
		return program;
	}

	satisfies(fact, opcode) {
		var result = fact.before.concat([]);
		opcode(result, fact.data);
		return result[0] === fact.after[0] && result[1] === fact.after[1] && result[2] === fact.after[2] && result[3] === fact.after[3];
	}

	test(fact) {
		var ops = this.opcodes.filter(o => this.satisfies(fact, o));
		return ops.length > 2;
	}

	runTests(facts) {
		this.setState({ testResults: facts.filter(f => this.test(f)) });
	}

	detectOpcodes(facts) {
		var knownOps = [];
		facts.forEach(f => {
			if (knownOps.find(k => k.code === f.data[0]) === undefined) {
				var ops = this.opcodes.filter(o => this.satisfies(f, o));
				if (ops.length === 1) {
					knownOps.push({ code: f.data[0], exec: ops[0] });
					this.opcodes = this.opcodes.filter(o => o !== ops[0]);
				}
			}
		});
		knownOps.sort((a, b) => a.code - b.code);
		this.setState({ opcodes: knownOps });
		window.setTimeout(() => this.runProgram(knownOps),1);
	}

	factsRemaining() {
		return this.state.data.filter(f => this.state.opcodes.find(o => f.data[0] === o.code) === undefined).length;
	}

	runProgram(knownOps) {
		var registers = [0,0,0,0];
		this.state.program.forEach(l => {
			knownOps.find(o => o.code === l[0]).exec(registers,l);
		});
		this.setState({result: registers});
	}

	render() {
		return <div class="main" style={{ margin: 5, display: "flex", flexDirection: "row" }}>
			<div style={{ marginLeft: 10 }}>
				<h3>Facts:</h3>
				{this.state.data.map(f => <p>[{f.before.join()}] + [{f.data.join()}] = [{f.after.join()}]</p>)}
			</div>
			<div style={{ marginLeft: 20 }}>
				<h3>Program:</h3>
				{this.state.program && this.state.program.map(l => <p>{l.join(" ")}</p>)}
			</div>
			<div style={{ marginLeft: 20 }}>
				<h3>Results:</h3>
				{this.state.data.length > 0 ? <p>Number of facts: {this.state.data.length}</p> : <p>Waiting for input...</p>}
				{this.state.testResults ? <p>Satisfies >2 opcodes: {this.state.testResults.length}</p> : <p>Running tests...</p>}
				{this.state.opcodes ? <p>{this.state.opcodes.length} opcodes detected</p> : <p>Detecting opcodes...</p>}
				{this.state.opcodes && this.state.opcodes.map(o => <p>{o.code}: {codeName(o.exec)}</p>)}
				{this.state.opcodes && <p>{this.factsRemaining()} facts remaining</p>}
				{this.state.opcodes && <p>{this.opcodes.length} unknown opcodes remaining</p>}
				{this.state.program && <p>{this.state.program.length} instructions</p>}
				{this.state.result && <p>[{this.state.result.join()}]</p>}
			</div>
		</div>;
	}
}