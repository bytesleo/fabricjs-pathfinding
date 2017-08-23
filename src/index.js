import easystarjs from 'easystarjs';
import { fabric } from 'fabric';

// Map

const mapData = [
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1]
]

// Canvas
let canvas;

// Easystar
let easystar;

// selected
let selected;

// Size
let size = 30;

// Position
let position = {
    x: 0,
    y: 0,
    cx: 0,
    cy: 0,
}

// Possible tile types
const TILE_TYPES = {
    0: { name: 'Sea', color: 'lightBlue' },
    1: { name: 'Land', color: '#8bc34a' }
}

/**
  Init class
 */
class Init {

    constructor(ctx) {
        canvas = new fabric.Canvas(ctx, {
            hoverCursor: 'pointer',
            selection: true,
            selectionBorderColor: 'blue'
        });
        canvas.setWidth(mapData[0].length * size);
        canvas.setHeight(mapData.length * size);

        canvas.on({

            'mouse:up': (e) => {
                if (e.target) {
                    let to = e.target;
                    position.x = this.round(to.left);
                    position.y = this.round(to.top);

                    if (selected) {
                        position.cx = this.round(selected.left);
                        position.cy = this.round(selected.top);
                        if (position.x != position.cx || position.y != position.cy) {
                            new PathFinding().move();
                        }
                    }
                }
            },
            'object:selected': (e) => {
                selected = e.target;
            },
            'selection:cleared': (e) => {
            }
        })
    }

    draw() {
        new Map().draw();
    }

    round(val) {
        return Math.round(val / size);
    }

}

/**
  Tile class
 */
class Tile {

    constructor(size, type) {
        this.size = size
        this.type = type
    }

    draw(x, y) {
        // Store positions
        const xPos = x * this.size
        const yPos = y * this.size
        // Draw tile
        let character = new fabric.Rect({
            width: this.size, height: this.size, left: xPos, top: yPos, angle: 0,
            fill: this.type.color,
            strokeWidth: 0.1,
            stroke: '#333',
            selectable: false
        });
        canvas.add(character);
    }
}

/**
  Map class
 */
class Map {

    draw() {
        const numCols = mapData[0].length
        const numRows = mapData.length
        // Iterate through map data and draw each tile
        for (let y = 0; y < numRows; y++) {
            for (let x = 0; x < numCols; x++) {
                // Get tile ID from map data
                const tileId = mapData[y][x]
                // Use tile ID to determine tile type from TILE_TYPES (i.e. Sea or Land)
                const tileType = TILE_TYPES[tileId]
                // Create tile instance and draw to our canvas
                new Tile(size, tileType).draw(x, y)
            }
        }
    }
    
}

/**
  Map PathFinding
 */
class PathFinding {

    constructor() {
        easystar = new easystarjs.js();
        easystar.setGrid(mapData);
        easystar.setAcceptableTiles([1]);
    }

    point() {
        this.point = new fabric.Rect({
            width: size,
            height: size,
            left: 0,
            top: 0,
            fill: '#ff5722',
            strokeWidth: 0.1,
            stroke: '#333',
            lockMovementX: true,
            lockMovementY: true,
            transparentCorners: false,
            cornerStyle: 'circle',
            hasRotatingPoint: false,
            selectable: false
        });
        canvas.add(this.point);
        selected = this.point;
    }

    move() {
        // console.log(position);
        easystar.findPath(position.cx, position.cy, position.x, position.y, (path) => {
            // console.log(path);
            if (path) {
                (function loop(i) {
                    const promise = new Promise((resolve, reject) => {
                        selected.animate({ top: path[i].y * size, left: path[i].x * size }, {
                            duration: 150,
                            onChange: canvas.renderAll.bind(canvas),
                            onComplete: () => {
                                resolve();
                            },
                            easing: fabric.util.ease['easeOutCubic']
                        });
                    }).then(() => i >= path.length - 1 || loop(i + 1));
                })(0);
            } else {
                alert('Not posible :(');
            }
        });
        easystar.calculate();
    }

}

new Init('canvas').draw();
new PathFinding().point();