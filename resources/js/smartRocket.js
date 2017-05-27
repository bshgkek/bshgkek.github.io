var canvasWidth = 400;
var canvasHeight = 300;

var rocketHeight = 35;
var rocketWidth = 10;
var maxForce = 0.2;

var population;
var popsize = 30;
var lifespan = 400;
var dnaIndex = 0;
var lifeP;

var mutationRate = 0.01;

var target;
var targetHeight = 10;
var targetWidth = 10;

var obstacleX = 100;
var obstacleY = 150;
var obstacleWidth = canvasWidth/2;
var obstacleHeight = 10;



function setup() {
	createCanvas(canvasWidth, canvasHeight);
	population = new Population();
	lifeP = createP();
	maxFitnessP = createP();
	avgFitnessP = createP();
	maxFitnessP.html("Max Fitness: ");
	avgFitnessP.html("Average Fitness: ");
	target = createVector(canvasWidth/2,50);
}

function draw() {
	background(0);
	population.run();
	lifeP.html(dnaIndex)
	dnaIndex++;

	if (dnaIndex === lifespan) {
		population.evaulate();
		population.selection();
		dnaIndex = 0;
	}

	fill(255);
	rect(obstacleX,obstacleY,obstacleWidth,obstacleHeight)
	ellipse(target.x, target.y, targetWidth, targetHeight);
}

function Rocket(dna) {
	this.position = createVector(canvasWidth/2,canvasHeight);
	this.velocity = createVector();
	this.acceleration = createVector();
	this.dna = dna || new DNA();
	this.fitness;
	this.completed = false;
	this.crashed = false;
	this.applyForce = function(force) {
		this.acceleration.add(force);
	};

	this.update = function() {
		var d = dist(this.position.x, this.position.y, target.x, target.y);
		if (d < 10) {
			this.completed = true;
			this.position = target.copy();
		}

		if(this.position.x > obstacleX && this.position.x < obstacleX + obstacleWidth && 
			this.position.y > obstacleY && this.position.y < obstacleY + obstacleHeight) {
			this.crashed = true;
		}

		if(this.position.x > canvasWidth || this.position.x < 0 || this.position.y > canvasHeight || this.position.y < 0) {
			this.crashed = true;
		}

		this.applyForce(this.dna.genes[dnaIndex]);
		if (!this.completed && !this.crashed){
			this.velocity.add(this.acceleration);
			this.position.add(this.velocity);
			this.acceleration.mult(0);
			this.velocity.limit(4);
		}
	}

	this.show = function() {
		push();
		noStroke();
		fill(255,150);
		translate(this.position.x, this.position.y);
		rotate(this.velocity.heading());
		rectMode(CENTER);
		rect(0,0,rocketHeight,rocketWidth);
		pop();
	}

	this.calcFitness = function() {
		var d = dist(this.position.x, this.position.y, target.x, target.y);
		this.fitness = map(d, 0, canvasWidth, canvasWidth, 0);
		if(this.completed) {
			this.fitness *= 10;
		}
		if(this.crashed) {
			this.fitness /= 10;
		}
		return this.fitness;
	}
}

function Population() {
	this.rockets = [];
	this.popsize = popsize;

	this.matingPool = [];

	for (var i = 0; i < this.popsize; i++) {
		this.rockets[i] = new Rocket();
	}

	this.run = function() {
		for (var i = 0; i < this.popsize; i++) {
			this.rockets[i].update();
			this.rockets[i].show();
		}
	}

	this.evaulate = function() {
		var maxFit = 0;
		var avgFitness = 0;
		for (var i = 0; i < this.popsize; i++) {
			avgFitness += this.rockets[i].calcFitness();
			if (this.rockets[i].fitness > maxFit){
				maxFit = this.rockets[i].fitness;
			}
		}
		avgFitness /= this.popsize;
		maxFitnessP.html("Max Fitness: " + maxFit);
		avgFitnessP.html("Average Fitness: " + avgFitness);

		// createP(maxFit);
		for (var i = 0; i < this.popsize; i++) {
			// normalize fitness values
			this.rockets[i].fitness /= maxFit;
		}

		this.matingPool = [];

		for (var i = 0; i < this.popsize; i++) {
			var n = this.rockets[i].fitness * 100;
			for (var j = 0; j < n; j++) {
				this.matingPool.push(this.rockets[i]);
			}
		}
	}

	this.selection = function() {
		var newRockets = [];
		for (var i = 0; i < this.rockets.length; i++) {
			var mom = random(this.matingPool);
			var dad = random(this.matingPool);
			var childDna = mom.dna.crossover(dad.dna);
			childDna.mutation();
			newRockets[i] = new Rocket(childDna)
		}
		this.rockets = newRockets;
	}
}

function DNA(genes) {
	if (genes) {
		this.genes = genes;
	} else {
		this.genes = [];
		for (var i = 0; i < lifespan; i++) {
			this.genes[i] = p5.Vector.random2D();
			this.genes[i].setMag(maxForce);
		}
	}

	this.crossover = function(partner) {
		var newGenes = [];
		var mid = floor(random(this.genes.length));
		for (var i = 0; i < this.genes.length; i++) {
		 	if (i > 0){
		 		newGenes[i] = this.genes[i];
		 	} else {
		 		newGenes[i] = partner.genes[i];
		 	}
		} 
		return new DNA(newGenes);
	}

	this.mutation = function() {
		for (var i = 0; i < this.genes.length; i++) {
			if (random(1) < mutationRate){
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxForce);
			}	
		} 
	}
}