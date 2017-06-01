function Cell(x,y) {
	this.x = x;
	this.y = y;
	// heuristic
	this.h = 0;
	// travel distance
	this.g = 0;
	// g + h
	this.f = 0;
	this.previous = undefined;
	this.neighbors = [];
	this.wall = false;

	if(random(1) < percentWall/100){
		this.wall = true;
	}
}

Cell.prototype.show = function(color) {
	fill(color);
	if(this.wall) fill(0);
	noStroke();
	rect(this.x * cellWidth,this.y * cellHeight, cellWidth-1,cellHeight-1)
};

Cell.prototype.addNeighbors = function(grid) {
	this.neighbors = [];
	if(this.y < cols - 1) this.neighbors.push(grid[this.y+1][this.x]);
	if(this.y > 0) this.neighbors.push(grid[this.y-1][this.x]);
	if(this.x < rows - 1) this.neighbors.push(grid[this.y][this.x+1]);
	if(this.x > 0) this.neighbors.push(grid[this.y][this.x-1]);
	if(diagonals){
		if(this.x > 0 && this.y > 0) this.neighbors.push(grid[this.y-1][this.x-1]);
		if(this.x < cols - 1 && this.y > 0) this.neighbors.push(grid[this.y-1][this.x+1]);
		if(this.x > 0 && this.y < rows - 1) this.neighbors.push(grid[this.y+1][this.x-1]);
		if(this.x < cols - 1 && this.y < rows - 1) this.neighbors.push(grid[this.y+1][this.x+1]);
	}
};