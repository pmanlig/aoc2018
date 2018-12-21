import React from 'react';

export class AoC21 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        fetch("input21.txt")
            .then(res => res.text())
            .then(txt => {
                this.processInput(txt);
            });
    }

    processInput(txt) {
        this.setState({});
    }

    render() {
        return <p>Day 21</p>;
    }
}