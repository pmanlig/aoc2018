import React from 'react';

class Army {
	constructor(side, number, hp, damage, initiative, type, immune, weak) {
		this.side = side;
		this.number = number;
		this.hp = hp;
		this.damage = damage;
		this.initiative = initiative;
		this.type = type;
		this.immune = immune;
		this.weak = weak;
	}

	static fromTxt(txt, side) {
		var number = parseInt(txt.split("units each with")[0], 10);
		var hp = parseInt(txt.split("units each with")[1].split("hit points")[0], 10);
		var damage = parseInt(txt.split("with an attack that does")[1], 10);
		var initiative = parseInt(txt.split("initiative")[1], 10);
		var type = txt.split(" damage")[0].split("attack that does ")[1].split(" ")[1];
		var immune = txt.split("immune to");
		var weak = txt.split("weak to");
		if (immune.length > 1) {
			immune = immune[1];
			if (immune.includes(";")) immune = immune.split(";")[0];
			if (immune.includes(")")) immune = immune.split(")")[0];
			immune = immune.split(",").map(i => i.trim());
		} else immune = [];
		if (weak.length > 1) {
			weak = weak[1];
			if (weak.includes(";")) weak = weak.split(";")[0];
			if (weak.includes(")")) weak = weak.split(")")[0];
			weak = weak.split(",").map(w => w.trim());
		} else weak = [];
		return new Army(side, number, hp, damage, initiative, type, immune, weak);
	}

	clone() {
		return new Army(this.side, this.number, this.hp, this.damage, this.initiative, this.type, this.immune, this.weak);
	}

	toString() {
		return this.power() + " power, " + this.number + " units, " + this.hp + " hp, " + this.damage + " " + this.type + " damage, " + this.initiative + " initiative, immunity: " + this.immune.join() + "; weakness: " + this.weak.join();
	}

	power() {
		return this.number * this.damage;
	}

	sort(b) {
		var s = b.power() - this.power();
		if (s === 0) s = b.initiative - this.initiative;
		return s;
	}

	weakTo(d) {
		return this.weak.includes(d);
	}

	immuneTo(d) {
		return this.immune.includes(d);
	}

	findTarget(armies) {
		var targets = armies.filter(a => a.side !== this.side && a.targeted === undefined && !a.immuneTo(this.type));
		var target = targets.find(a => a.weakTo(this.type));
		if (target === undefined && targets.length > 0) target = targets[0];
		if (target !== undefined) {
			this.target = target;
			target.targeted = this;
		}
	}

	attack() {
		if (this.target === undefined || this.number < 1) return;
		var dmg = this.power();
		if (this.target.weakTo(this.type)) dmg = dmg * 2;
		dmg = Math.floor(dmg / this.target.hp);
		this.target.number -= dmg;
	}
}

export class AoC24 extends React.Component {
	constructor(props) {
		super(props);
		this.state = { round: 0 }
		fetch("input24.txt")
			.then(res => res.text())
			.then(txt => {
				this.processInput(txt);
			});
	}

	processInput(txt) {
		txt = txt.split("Infection:");
		this.infection = txt[1].split('\n').map(l => l.trim()).filter(s => s !== "").map(a => Army.fromTxt(a, "infection")).sort((a, b) => a.sort(b));
		this.immune = txt[0].split("Immune System:")[1].split('\n').map(l => l.trim()).filter(s => s !== "").map(a => Army.fromTxt(a, "immunity")).sort((a, b) => a.sort(b));
		this.setState({ immune: this.immune, infection: this.infection });
	}

	fight(immune, infection) {
		var armies = immune.concat(infection);
		armies.sort((a, b) => a.sort(b));
		armies.forEach(a => a.target = undefined);
		armies.forEach(a => a.targeted = undefined);
		armies.forEach(a => a.findTarget(armies));
		armies.sort((a, b) => b.initiative - a.initiative);
		armies.forEach(a => a.attack());
	}

	startFight() {
		this.setState({ immune: this.immune.map(a => a.clone()), infection: this.infection.map(a => a.clone()) });
		var round = () => {
			this.fight(this.state.immune, this.state.infection);
			this.setState({ round: this.state.round + 1, immune: this.state.immune.filter(a => a.number > 0), infection: this.state.infection.filter(a => a.number > 0) });
			if (this.state.immune.length > 0 && this.state.infection.length > 0)
				window.setTimeout(round, 1);
		};
		window.setTimeout(round, 1);
	}

	count(immune, infection) {
		var c = 0;
		immune.forEach(a => c += a.number);
		infection.forEach(a => c += a.number);
		return c;
	}

	testBoost(boost) {
		var immune = this.immune.map(a => a.clone());
		immune.forEach(a => a.damage += boost);
		var infection = this.infection.map(a => a.clone());
		while (immune.length > 0 && infection.length > 0) {
			var c = this.count(immune, infection);
			this.fight(immune, infection);
			immune = immune.filter(a => a.number > 0);
			infection = infection.filter(a => a.number > 0);
			if (c === this.count(immune, infection)) break;
		}
		if (infection.length === 0 && immune.length > 0 && boost === this.state.minboost) {
			this.setState({ maxboost: boost });
			return;
		}

		var minboost = this.state.minboost, maxboost = this.state.maxboost, nextboost;
		if (immune.length > 0 && infection.length === 0) {
			maxboost = boost;
			nextboost = Math.floor((minboost + maxboost) / 2);
		} else {
			if (boost === maxboost) {
				maxboost = 2 * maxboost - minboost;
				nextboost = maxboost;
			} else {
				minboost = boost + 1;
				nextboost = Math.floor((minboost + maxboost) / 2);
			}
		}
		this.setState({ minboost: minboost, maxboost: maxboost });
		window.setTimeout(() => this.testBoost(nextboost), 1);
	}

	findBoost() {
		if (this.state.boost === undefined) this.setState({ minboost: 0, maxboost: 100 });
		window.setTimeout(() => this.testBoost(1000), 1);
	}

	render() {
		var i = 0;
		return <div className="main">
			<div>
				<h5>Round {this.state.round}</h5>
				<p>Immune system vs. Infection</p>
				<p>{this.state.immune && this.state.immune.length} - {this.state.infection && this.state.infection.length}</p>
				{this.state.immune && <p>{this.count(this.state.immune, this.state.infection)} units left</p>}
				{this.state.maxboost && <p>Boost: {this.state.minboost} - {this.state.maxboost}</p>}
				<p><input type="button" value="Fight" onClick={e => this.startFight()} /></p>
				<p><input type="button" value="Find boost" onClick={e => this.findBoost()} /></p>
			</div>
			<div>
				<h5>Immune system ({this.state.immune && this.state.immune.length + " armies"}):</h5>
				{this.state.immune && this.state.immune.map(a => <p key={i++}>{a.toString()}</p>)}
				<h5>Infection ({this.state.infection && this.state.infection.length + " armies"}):</h5>
				{this.state.infection && this.state.infection.map(a => <p key={i++}>{a.toString()}</p>)}
			</div>
		</div>;
	}
}