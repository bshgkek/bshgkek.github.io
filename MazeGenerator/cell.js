function Cell(x,y) {
	this.x = x;
	this.y = y;
	this.walls = [true,true,true,true];
	this.visited = false;
}

Cell.prototype.show = function() {
	var xpos = this.x * cellWidth;
	var ypos = this.y * cellHeight;
	stroke(255);
	// top line
	if(this.walls[0]) line(xpos,ypos,xpos+cellWidth,ypos);
	// right line
	if(this.walls[1]) line(xpos+cellWidth,ypos,xpos+cellWidth,ypos+cellWidth);
	// bottom line
	if(this.walls[2]) line(xpos+cellWidth,ypos+cellWidth,xpos,ypos+cellWidth);
	// left line
	if(this.walls[3]) line(xpos,ypos+cellWidth,xpos,ypos);


	if(this.visited) {
		noStroke();
		fill(255,0,255,100);
		rect(xpos,ypos,cellWidth,cellHeight);
	}
};

Cell.prototype.checkNeighbors = function() {
	var neighbors = [];
	var top    = cells[index(this.x,this.y-1)];
	var right  = cells[index(this.x+1,this.y)];
	var bottom = cells[index(this.x,this.y+1)];
	var left   = cells[index(this.x-1,this.y)];

	if(top && !top.visited) neighbors.push(top);
	if(right && !right.visited) neighbors.push(right);
	if(bottom && !bottom.visited) neighbors.push(bottom);
	if(left && !left.visited) neighbors.push(left);

	if(neighbors.length > 0) {
		var r = floor(random(0,neighbors.length))
		return neighbors[r];
	}
	return undefined;
};

Cell.prototype.highlight = function() {
	var xpos = this.x * cellWidth;
	var ypos = this.y * cellHeight;
	if(this.visited) {
		noStroke();
		fill(0,255,0,100);
		rect(xpos,ypos,cellWidth,cellHeight);
	}
};