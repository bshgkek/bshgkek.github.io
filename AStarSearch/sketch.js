var canvasWidth = canvasHeight = 600;
var cols = rows = 40;
var tmpCols = 40;
var tmpRows = 40;
var cellWidth = canvasWidth/cols;
var cellHeight = canvasHeight/rows;
var grid = [];
var openSet = [];
var closedSet = [];
var start, end;
var finalPath = [];
var percentWall = 30;

var diagonals = false;
var paused = true;
var pathCount;
var completed = false;

function setup() {
	var cvs = createCanvas(canvasWidth,canvasHeight);
	cvs.parent('sketch');
	pathCount = createP('').parent('sketch');

	addEventListeners();

	createGrid();
}

function draw() {
	background(0);
	if(!paused){
		if (openSet.length > 0){
			var winner = 0;
			for (var i = 0; i < openSet.length; i++) {
				if(openSet[i].f < openSet[winner].f) {
					winner = i;
				}
			}
			var current = openSet[winner];
	
			if(current === end){
			
				noLoop();
				completed = true;
				finalPath.push(grid[cols-1][rows-1]);
				paused = true;
				console.log('DONE!');
			}
	
			removeFromArray(openSet, current);
			closedSet.push(current);
	
			var neighbors = current.neighbors;
			// loop through neighbors
			for (var i = 0; i < neighbors.length; i++) {
				var neighbor = neighbors[i];
				// if neighbor not in closedset and its not a wall
				if (!closedSet.includes(neighbor) && !neighbor.wall) {
					// set temporary g value
					var tempg = current.g + 1;
					var newPath = false;
					// if neighbor already in open set
					if (openSet.includes(neighbor)){
						// if new g value less than old g value
						if (tempg < neighbor.g) {
							// set g value to new g, else nothing
							neighbor.g = tempg;
							newPath = true;
						}
					// if not in openset already, set g value and add to openset 
					} else {
							neighbor.g = tempg;
							openSet.push(neighbor);
							newPath = true;
					}
					if(newPath) {
						neighbor.h = heuristic(neighbor,end);
						neighbor.f = neighbor.g + neighbor.h;
						neighbor.previous = current;
					}
				}
			}
	
		} else {
			console.log('No solution.');
			noLoop();
			paused = true;
			// return;
		}

		// find the path
	
		finalPath = [];
		var temp = current;
		while (temp && temp.previous) {
			finalPath.push(temp.previous);
			temp = temp.previous;
		}
		pathCount.html('Final Path: ' + finalPath.length);

	}
	// color nodes not in set
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			grid[i][j].show(color(255));
		}
	}

	// color closed set nodes
	for (var i = 0; i < closedSet.length; i++) {
		closedSet[i].show(color(255,0,255));
	}
	// color open set nodes
	for (var i = 0; i < openSet.length; i++) {
		openSet[i].show(color(0,0,255));
	}
	// color finalpath
	for (var i = 0; i < finalPath.length; i++) {
		finalPath[i].show(color(255,255,0));
	}

	if (completed) grid[cols-1][rows-1].show(color(255,255,0));
}

function removeFromArray(arr,ele) {
	for (var i = arr.length - 1; i >= 0; i--) {
		if(arr[i] == ele) arr.splice(i,1);
	}
}

function heuristic(a,b) {
	return dist(a.x,a.y,b.x,b.y);
	// return abs(a.x-b.x) + abs(a.y-b.y);
}

function createGrid() {
	cellWidth = canvasWidth/cols
	cellHeight = canvasHeight/rows
	finalPath = [];
	openSet = [];
	closedSet = [];
	grid = [];
	for (var y = 0; y < rows; y++) {
		grid.push([])
		for (var x = 0; x < cols; x++) {
			grid[y].push(new Cell(x,y));
		}
	}
	addGridNeighbors();

	start = grid[0][0];
	end = grid[cols - 1][rows - 1];
	start.wall = false;
	end.wall = false;
	openSet.push(start);
	return grid;
}

function addGridNeighbors() {
	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			grid[y][x].addNeighbors(grid);
		}
	}
}

function addEventListeners() {
	document.getElementById('start').addEventListener('click', function(e) {
    	paused = false;
	});
	document.getElementById('newMap').addEventListener('click', function(e) {
    	paused = true;
    	rows = tmpRows;
    	cols = tmpCols;
    	createGrid();
    	loop();
    	completed = false;
    	pathCount.html('');
	});
	document.getElementById('diagonals').addEventListener('click', function(e) {
		diagonals = document.getElementById('diagonals').checked;
		if(paused){
			addGridNeighbors();
		}
	});

	document.getElementById('cellSize').addEventListener('change', function(e){
		var val = document.getElementById('cellSize').value;
		tmpRows = val;
		tmpCols = val;
	});
	document.getElementById('wallPct').addEventListener('change', function(e){
		var val = document.getElementById('wallPct').value.slice(0,-1);
		percentWall = parseInt(val);
	});
}