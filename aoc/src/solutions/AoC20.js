import React from 'react';

const WALL = 0;
const OPEN = 1;
const DOOR_HORIZ = 2;
const DOOR_VERT = 3;
const NONE = 4;

const cellTypes = ["wall", "open", "open", "open", "open"];

class Room {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Grid {
    data = [
        [NONE, NONE, WALL, WALL, WALL],
        [NONE, NONE, WALL, OPEN, WALL],
        [WALL, WALL, WALL, DOOR_HORIZ, WALL],
        [WALL, OPEN, DOOR_VERT, OPEN, WALL],
        [WALL, WALL, WALL, WALL, WALL],
    ];

    constructor(rooms) {
			this.rooms = rooms; // Dummy
			this.current = new Room(0,0); // Dummy
    }
}

function Cell(props) {
    return <div className={"cell " + cellTypes[props.type]}>
        {props.type === DOOR_HORIZ && <div className="wallHoriz"></div>}
        {props.type === DOOR_HORIZ && <div className="doorHoriz"></div>}
        {props.type === DOOR_VERT && <div className="wallVert"></div>}
        {props.type === DOOR_VERT && <div className="doorVert"></div>}
    </div>;
}

function Row(props) {
    var col = 0;
    return <div className="row">
        {props.data.map(c => <Cell key={col++} type={c} />)}
    </div>;
}

function Map(props) {
    var row = 0;
    return <div className="column">
        <div className="grid">
            {props.grid.data.map(r => <Row key={row++} data={r} />)}
        </div>
    </div>;
}

export class AoC20 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        fetch("input20.txt")
            .then(res => res.text())
            .then(txt => {
                this.processInput(txt);
            });
    }

    processInput(txt) {
        txt = txt.split('^')[1];
        txt = txt.split('$')[0]
        var i = 0, x = 0, y = 0;
        while (i < txt.length) {
						i++;
						x=y; // Dummy
						y=x; // Dummy
        }
        this.setState({ grid: new Grid() });
    }

    render() {
        return <div className="main">
            <div>
                {this.state.grid && <Map grid={this.state.grid} />}
            </div>
            <div>
                <h3>Result:</h3>
            </div>
        </div>;
    }
}