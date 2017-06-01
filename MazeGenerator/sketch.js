var canvasWidth = canvasHeight = 400;
var cellWidth = cellHeight = 20;
var cols, rows;
var cells = [];
var current;
var stack = [];

function setup() {
	createCanvas(canvasWidth,canvasHeight)
	cols = canvasWidth/cellWidth;
	rows = canvasHeight/cellHeight;
	frameRate(20);
	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			var cell = new Cell(x,y);		
			cells.push(cell);
		}
	}
	current = cells[0];
}

function draw() {
	background(51);
	for (var i = 0; i < cells.length; i++) {
		cells[i].show();
	}
	current.visited = true;
	current.highlight();
	var next = current.checkNeighbors();
	if(next) {
		next.visited = true;
		stack.push(current);
		removeWalls(current,next);
		current = next;
	} else if (stack.length > 0) {
		current = stack.pop();
	}
}

function index(x,y) {
	if(x < 0 || y < 0 || x > cols - 1 || y > rows - 1) {
		return -1;
	}
	return x + y * cols;
}


function removeWalls(a,b) {
	var x = a.x - b.x;
	var y = a.y - b.y;
	if (x === 1){
		// a to the right of b
		a.walls[3] = false;
		b.walls[1] = false;
	} else if (x === -1) {
		// a to the left of b
		a.walls[1] = false;
		b.walls[3] = false;
	}
	if (y === 1){
		// a under b
		a.walls[0] = false;
		b.walls[2] = false;
	} else if (y === -1) {
		// a on top of b
		a.walls[2] = false;
		b.walls[0] = false;
	}

}