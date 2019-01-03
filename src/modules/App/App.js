import React from 'react';
import FloorHelperForm from './FloorHelperForm.js';

class App extends React.Component  {
    Colors = [
        {name: 'aqua',          code: '#00ffff'},
        {name: 'azure',         code: '#f0ffff'},
        {name: 'beige',         code: '#f5f5dc'},
        {name: 'brown',         code: '#a52a2a'},
        {name: 'cyan',          code: '#00ffff'},
        {name: 'darkcyan',      code: '#008b8b'},
        {name: 'darkgrey',      code: '#a9a9a9'},
        {name: 'darkgreen',     code: '#006400'},
        {name: 'darkkhaki',     code: '#bdb76b'},
        {name: 'darkmagenta',   code: '#8b008b'},
        {name: 'darkolivegreen',code: '#556b2f'},
        {name: 'darkorange',    code: '#ff8c00'},
        {name: 'darkorchid',    code: '#9932cc'},
        {name: 'darkred',       code: '#8b0000'},
        {name: 'darksalmon',    code: '#e9967a'},
        {name: 'darkviolet',    code: '#9400d3'},
        {name: 'fuchsia',       code: '#ff00ff'},
        {name: 'gold',          code: '#ffd700'},
        {name: 'green',         code: '#008000'},
        {name: 'khaki',         code: '#f0e68c'},
        {name: 'lightblue',     code: '#add8e6'},
        {name: 'lightcyan',     code: '#e0ffff'},
        {name: 'lightgreen',    code: '#90ee90'},
        {name: 'lightgrey',     code: '#d3d3d3'},
        {name: 'lightpink',     code: '#ffb6c1'},
        {name: 'lightyellow',   code: '#ffffe0'},
        {name: 'lime',          code: '#00ff00'},
        {name: 'magenta',       code: '#ff00ff'},
        {name: 'maroon',        code: '#800000'},
        {name: 'olive',         code: '#808000'},
        {name: 'orange',        code: '#ffa500'},
        {name: 'pink',          code: '#ffc0cb'},
        {name: 'purple',        code: '#800080'},
        {name: 'violet',        code: '#800080'},
        {name: 'red',           code: '#ff0000'},
        {name: 'silver',        code: '#c0c0c0'},
        {name: 'white',         code: '#ffffff'},
        {name: 'yellow',        code: '#ffff00'}
    ]

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    constructor(props) {
        super(props);
        this.onChange          = this.onChange.bind(this);
        this.onZoom            = this.onZoom.bind(this);
        this.onDirectionChange = this.onDirectionChange.bind(this);
        this.resolution        = 10;
        this.planks            = [];
        this.types             = [];
        this.totalCuts         = 0;
        this.state             = {
            room_w:         10,
            room_h:         10,
            plank_w:        54.25,
            plank_h:        7.5,
            wall_gap:       0.25,
            min_end_plank:  12,
            joint_distance: 6,
            canvas_w:       500,
            canvas_h:       500,
            direction:      'left',
            waste:          0
        };
    }

    drawRoom() {
        // Draw the room, start at 0,0 and draw a box to w/h converted to inches from feet (*=12)
        this.drawBox({x: 0, y: 0}, {x: this.state.room_w*12, y: this.state.room_h*12});
    }

    clearCanvas() {
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBox(topLeft, btmRight, color, label, fillColor) {
        // Get the context
        var context = this.canvas.getContext('2d');

        // Fill first if there is a fillColor
        if (fillColor) {
            context.fillStyle = fillColor;
            context.fillRect(topLeft.x * this.resolution + 1, topLeft.y * this.resolution + 1, (btmRight.x - topLeft.x) * this.resolution - 1, (btmRight.y - topLeft.y) * this.resolution - 1);
            context.fillStyle = 'black';
        }
        
        // Draw the box
        context.beginPath();
        context.moveTo(topLeft.x *this.resolution, topLeft.y *this.resolution);
        context.lineTo(btmRight.x*this.resolution, topLeft.y *this.resolution);
        context.lineTo(btmRight.x*this.resolution, btmRight.y*this.resolution);
        context.lineTo(topLeft.x *this.resolution, btmRight.y*this.resolution);
        context.lineTo(topLeft.x *this.resolution, topLeft.y *this.resolution);

        // Add label
        if (label) {
            context.font      = '30px Arial';
            var textSize = context.measureText(label);
            var midY     = topLeft.y + Math.abs(topLeft.y - btmRight.y)/2;
            var midX     = topLeft.x + Math.abs(topLeft.x - btmRight.x)/2;
            context.fillText(label, midX * this.resolution - textSize.width/2 , midY * this.resolution + 7);
        }

        // Stroke it
        context.strokeStyle = color ? color : 'black';
        context.lineWidth   = 3;
        context.stroke();
    }

    createPlanks() {
        var w  = this.state.plank_w*1;
        var h  = this.state.plank_h*1;
        var wg = this.state.wall_gap*1;
        var rw = this.state.room_w*12 - wg;
        var rh = this.state.room_h*12 - wg;
        var ep = this.state.min_end_plank*1;

        // Avoid that infinite for loop
        if (w <= 0 || h <= 0 || rw <= 0 || rh <= 0 || ep >= w) {return;}

        // Clear planks
        this.planks = [];

        var xCarryOver    = wg; // End of a row the left over to be used on the next row
        var plankCt       = 1;
        var totalWaste    = 0;
        this.totalCuts    = 0;
        this.currentColor = 0;
        this.types        = [{color: this.Colors[this.currentColor++].code, length: this.state.plank_w, direction: 'middle'}];

        // Depending on direction
        if (this.state.direction == 'left') {
            for (let y = wg; y <= rh; y+=h) {
                for (let x = wg; x <= rw; x+=w) {
                    if (xCarryOver != wg) {
                        // Check to see if the carryover is greater than the min end plank
                        if (xCarryOver >= ep) {
                            this.planks.push({id: plankCt++, row: y, column: x, topLeft: {x: x, y: y}, btmRight: {x: xCarryOver, y: y+h}});
                            x          = xCarryOver;
                            xCarryOver = wg;
                        }
                        else { // If it's not, you gotta scrap it and start from 0
                            plankCt++;
                            totalWaste += xCarryOver - wg;
                            xCarryOver = wg;
                        }
                    }
                    if (x + w > rw) {
                        // Check to see if the end plank is greater than the min end plank
                        if (rw - x >= ep) {
                            this.planks.push({id: plankCt, row: y, column: x, topLeft: {x: x, y: y}, btmRight: {x: rw, y: y+h}});
                            xCarryOver = w - (rw - x) + wg;
                            this.totalCuts++;
                        }
                        else { // If it's not, you gotta cut the first end piece shorter
                            // Remove all planks from this row besides the first plank
                            // Find out how much the end plank needs to get it to the min end plank
                            // Remove that amount from the first plank
                            // Reset this row x = first plank's new length
                            let proper    = [];
                            let newLength = ep - (rw - x);
                            for (let ct = 0; ct < this.planks.length; ct++) {
                                if (this.planks[ct].row != y) {
                                    proper.push(this.planks[ct]);
                                }
                                else {
                                    if (this.planks[ct].column == wg) {
                                        let newX = this.planks[ct].btmRight.x - newLength;
                                        
                                        // If the new plank is too short just get rid of it
                                        if (newX < ep) {
                                            totalWaste += this.planks[ct].btmRight.x - this.planks[ct].topLeft.x;
                                            x = wg - w;
                                            plankCt = this.planks[ct].id + 1;
                                        }
                                        else {
                                            this.planks[ct].btmRight.x = newX;
                                            plankCt = this.planks[ct].id + 1;
                                            totalWaste += newLength;
                                            x = this.planks[ct].btmRight.x - w;
                                            proper.push(this.planks[ct]);
                                        }
                                    }
                                }
                            }
                            this.planks = proper;
                            this.totalCuts++;
                        }
                    }
                    else {
                        this.planks.push({id: plankCt++, row: y, column: x, topLeft: {x: x, y: y}, btmRight: {x: x+w, y: y+h}});
                    }
                }
            }
        }
        else {
            for (let y = wg; y <= rh; y+=h) {
                for (let x = rw; x >= wg; x-=w) {
                    if (xCarryOver != wg) {
                        // Check to see if the carryover is greater than the min end plank
                        if (xCarryOver >= ep) {
                            this.planks.push({id: plankCt++, row: y, column: x, topLeft: {x: rw - xCarryOver - wg, y: y}, btmRight: {x: rw, y: y+h}});
                            x          = x - wg - xCarryOver;
                            xCarryOver = wg;
                        }
                        else { // If it's not, you gotta scrap it and start from 0
                            plankCt++;
                            totalWaste += xCarryOver + wg;
                            xCarryOver = wg;
                        }
                    }
                    if (x - w < 0) {
                        // Check to see if the end plank is at the room edge
                        if (x >= ep) {
                            this.planks.push({id: plankCt, row: y, column: x, topLeft: {x: wg, y: y}, btmRight: {x: x, y: y+h}});
                            xCarryOver = w - x;
                            this.totalCuts++;
                        }
                        else { // If it's not, you gotta cut the first end piece shorter
                            // Remove all planks from this row besides the first plank
                            // Find out how much the end plank needs to get it to the min end plank
                            // Remove that amount from the first plank
                            // Reset this row x = first plank's new length
                            let proper    = [];
                            let newLength = ep - x + wg;
                            for (let ct = 0; ct < this.planks.length; ct++) {
                                if (this.planks[ct].row != y) {
                                    proper.push(this.planks[ct]);
                                }
                                else {
                                    if (this.planks[ct].column == rw) {
                                        let newX = this.planks[ct].topLeft.x + newLength;
                                        
                                        // If the new plank is too short just get rid of it
                                        if (rw - newX < ep) {
                                            totalWaste += this.planks[ct].btmRight.x - this.planks[ct].topLeft.x;
                                            x = rw + w;
                                            plankCt = this.planks[ct].id + 1;
                                        }
                                        else {
                                            this.planks[ct].topLeft.x = newX;
                                            plankCt = this.planks[ct].id + 1;
                                            totalWaste += newLength;
                                            x = this.planks[ct].topLeft.x + w;
                                            proper.push(this.planks[ct]);
                                        }
                                    }
                                }
                            }
                            this.planks = proper;
                            this.totalCuts++;
                        }
                    }
                    else {
                        this.planks.push({id: plankCt++, row: y, column: x, topLeft: {x: x-w, y: y}, btmRight: {x: x, y: y+h}});
                    }
                }
            }
            // IDK Math hard man total waste comes up short for some reason
            if (xCarryOver != wg) {xCarryOver += wg*2;}
        }

        // Might be some leftover scrap
        if (xCarryOver != wg) {totalWaste += xCarryOver - wg;}

        this.setLabels();
        var currState   = this.state;
        currState.waste = totalWaste;
        this.setState(currState);
    }

    setLabels() {
        for (var ct = 0; ct < this.planks.length; ct++) {
            var plank = this.planks[ct];
            // Find the plank type, length, and set label
            plank.length    = plank.btmRight.x - plank.topLeft.x;
            plank.direction = (plank.topLeft.x == this.state.wall_gap) ? 'left' : 'right';
            for (var ct2 = 0; ct2 < this.types.length; ct2++) {
                if (this.types[ct2].direction == plank.direction && this.types[ct2].length == plank.length) {plank.type = this.types[ct2];}
            }

            // New category
            if (!plank.type) {
                var color = (this.currentColor == this.Colors.length - 1) ? this.getRandomColor() : this.Colors[this.currentColor++].code;
                this.types.push({color: color, length: plank.length, direction: plank.direction});
                plank.type = this.types[this.types.length - 1];
            }

            plank.label  = plank.length + '" #' + plank.id;
        }
    }

    removePlanksByRow(row) {
        var proper = [];
        for (var ct = 0; ct < this.planks.length; ct++) {
            if (this.planks[ct].row != row) {proper.push(this.planks[ct]);}
        }
        this.planks = proper;
    }

    drawPlanks() {
        if (!this.planks.length) {return;}

        // Clear canvas
        this.clearCanvas();

        // Loop through planks and draw them
        for (let ct = 0; ct < this.planks.length; ct++) {
            this.drawBox(this.planks[ct].topLeft, this.planks[ct].btmRight, null, this.planks[ct].label, this.planks[ct].type.color);
        }
    }

    getFullPlanksCt() {
        var count = 0;
        for (let ct = 0; ct < this.planks.length; ct++) {
            var length = this.planks[ct].btmRight.x - this.planks[ct].topLeft.x;
            if (length == this.state.plank_w) {count++;}
        }

        return count;
    }

    componentDidMount() {
        this.createPlanks();
        this.drawPlanks();
        this.drawRoom();
    }

    onDirectionChange(evt) {
        var currState = this.state;
        var dir       = 'left';
        if (evt.target.innerText == 'Right to Left') {dir = 'right';}
        currState.direction = dir;
        this.setState(currState, () => {
            this.createPlanks();
            this.drawPlanks();
            this.drawRoom();
        });
    }

    onZoom(evt) {
        var currState  = this.state;
        if (evt.target.name == 'plus') {currState.canvas_h *= 1.25;  currState.canvas_w *= 1.25;  }
        else                           {currState.canvas_h *= 0.75;currState.canvas_w *= 0.75;}
        
        this.setState(currState);
    }

    onChange(evt) {
        var currState = this.state;
        currState[evt.target.name] = evt.target.value;
        this.setState(currState, () => {
            this.createPlanks();
            this.drawPlanks();
            this.drawRoom();
        });
    }

    render() {
        return (
            <div className='app-container'>
                <div style={{display: 'inline-block'}}>
                    <FloorHelperForm values={this.state} onChange={this.onChange} onZoom={this.onZoom} onDirectionChange={this.onDirectionChange}/>
                </div>
                <div style={{marginLeft: '15px', display: 'inline-block', position: 'absolute'}}>
                    <h5>Statistics</h5>
                    <label style={{marginLeft: '15px', fontWeight: 'bold', marginRight: '5px'}}>Waste:</label>{this.state.waste}&quot;<br/>
                    <label style={{marginLeft: '15px', fontWeight: 'bold', marginRight: '5px'}}>Total Planks:</label>{this.planks.length}<br/>
                    <label style={{marginLeft: '15px', fontWeight: 'bold', marginRight: '5px'}}>Full Planks:</label>{this.getFullPlanksCt()}<br/>
                    <label style={{marginLeft: '15px', fontWeight: 'bold', marginRight: '5px'}}>Total Cuts:</label>{this.totalCuts}
                </div>
                <canvas style={{height: this.state.canvas_h+'px', width: this.state.canvas_w+'px', padding: '15px', display: 'block'}} ref={(ref) => (this.canvas = ref)} width={this.state.room_w*12*this.resolution} height={this.state.room_h*12*this.resolution} />
            </div>
        );
    }
}

export default App;