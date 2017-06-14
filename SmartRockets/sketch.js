var cW = 400;
var cH = 300;

var rocketHeight = 35;
var rocketWidth = 10;
var maxForce = 0.2;

var rocketStartX = cW/2;
var rocketStartY = cH;

var population;
var popsize = 50;
var lifespan = 600;
var dnaIndex = 0;
var lifeP;

var mutationRate = 0.01;

var target;
var targetHeight = 10;
var targetWidth = 10;

var obstacle1X = 0;
var obstacle1Y = cH-75;
var obstacle2X = cW-cW*0.75;
var obstacle2Y = cH-200;
var obstacleWidth = cW*0.75;
var obstacleHeight = 10;

var stopped = 0;
var generation = 1;
var bestRocket = null;
var bestGenRocket = null;
var topFitness = 0;

function setup() {

	createCanvas(cW, cH);
	population = new Population();
	lifeP = createP();
	topFitnessP = createP();
	maxFitnessP = createP();
	avgFitnessP = createP();
	generationP = createP();
	avgFitnessP.html("Average Fitness: 0");
	topFitnessP.html("Max Fitness: " + topFitness);
	maxFitnessP.html("Max Generation Fitness: 0");
	target = createVector(cW/2,50);
}

function draw() {
	background(0);
	population.run();
	lifeP.html("Frame: " + dnaIndex);
	generationP.html("Generation: " + generation);
	dnaIndex++;
	if (dnaIndex === lifespan) {
		population.evaulate();
		population.selection();
		dnaIndex = 0;
		stopped = 0;
		generation += 1;
	}

	if (stopped === popsize) {
		population.evaulate();
		population.selection();
		dnaIndex = 0;
		stopped = 0;
		generation += 1;
	}

	fill(255);
	rect(obstacle1X,obstacle1Y,obstacleWidth,obstacleHeight)
	rect(obstacle2X,obstacle2Y,obstacleWidth,obstacleHeight)
	ellipse(target.x, target.y, targetWidth, targetHeight);
}

function Rocket(dna) {
	this.position = createVector(rocketStartX,rocketStartY);
	this.velocity = createVector();
	this.acceleration = createVector();
	this.dna = dna || new DNA();
	this.fitness;
	this.completed = 0;
	this.crashed = false;
	this.deathIndex = 0;
	this.applyForce = function(force) {
		this.acceleration.add(force);
	};

	this.update = function() {
		var d = dist(this.position.x, this.position.y, target.x, target.y);
		if(!this.completed){
			if (d < 10) {
				// console.log('1');
				stopped += 1;
				this.completed = dnaIndex;
				this.position = target.copy();
			}
		}
		if(!this.crashed) {
			if(this.position.x > obstacle1X && this.position.x < obstacle1X + obstacleWidth && 
				this.position.y > obstacle1Y && this.position.y < obstacle1Y + obstacleHeight) {
				this.deathIndex = dnaIndex;
				this.crashed = true;
				stopped += 1;
			}

			if(this.position.x > obstacle2X && this.position.x < obstacle2X + obstacleWidth && 
				this.position.y > obstacle2Y && this.position.y < obstacle2Y + obstacleHeight) {
				this.crashed = true;
				this.deathIndex = dnaIndex;
				stopped += 1;
			}
	
			if(this.position.x > cW || this.position.x < 0 || this.position.y > cH 	|| this.position.y < 0) {
				this.crashed = true;
				this.deathIndex = dnaIndex;
				// console.log('3');
				stopped += 1;
			}
		}

		this.applyForce(this.dna.genes[dnaIndex]);
		if (!this.completed && !this.crashed){
			this.velocity.add(this.acceleration);
			this.position.add(this.velocity);
			this.acceleration.mult(0);
			this.velocity.limit(4);
		}
	}

	this.show = function(x) {
		if(x === 1) {
			push();
			noStroke();
			fill(0,255,0,150);
			translate(this.position.x, this.position.y);
			rotate(this.velocity.heading());
			rectMode(CENTER);
			rect(0,0,rocketHeight,rocketWidth);
			pop();
		} else if(x === 2) {
			push();
			noStroke();
			fill(0,0,255,150);
			translate(this.position.x, this.position.y);
			rotate(this.velocity.heading());
			rectMode(CENTER);
			rect(0,0,rocketHeight,rocketWidth);
			pop();
		}

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
		this.fitness = map(d, 0, cW, cW, 0) * 3;
		console.log("this.fitness: ", this.fitness);
		
		var traveled = this.deathIndex;
		var fromStart = dist(this.position.x, this.position.y, rocketStartX, rocketStartY);
		console.log("traveled: ", traveled);
		console.log("fromStart: ", fromStart);
		console.log("cH-this.position.y: ", cH-this.position.y);
		this.fitness += (fromStart/* * 2*/) + (traveled/* * 2*/) + (cH-this.position.y) * 2; 
		// this.fitness += ;
		console.log("this.fitness: ", this.fitness);


		if(this.completed) {
			this.fitness *= 10;
			this.fitness *= lifespan - this.completed;
		}
		if(this.crashed) {
			this.fitness /= 25;
		}
		this.fitness *= this.fitness; 
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
		if(bestRocket){
			bestRocket.update();
			bestRocket.show(1);
		}	
		if(bestGenRocket){
			bestGenRocket.update();
			bestGenRocket.show(2);
		}
	}

	this.evaulate = function() {
		var maxFit = 0;
		var avgFitness = 0;
		for (var i = 0; i < this.popsize; i++) {
			avgFitness += this.rockets[i].calcFitness();
			if (this.rockets[i].fitness > maxFit){
				maxFit = this.rockets[i].fitness;
				bestGenRocket = this.rockets[i];
				if(maxFit > topFitness) {
					console.log('setting best rocket with fitness',maxFit);
					topFitness = maxFit;
					bestRocket = this.rockets[i];
				}
			}
		}

		avgFitness /= this.popsize;
		topFitnessP.html("Max Fitness: " + topFitness);
		maxFitnessP.html("Max Generation Fitness: " + maxFit);
		avgFitnessP.html("Average Fitness: " + avgFitness);

		// normalize fitness values
		for (var i = 0; i < this.popsize; i++) {
			// console.log("changing fitness: ", this.rockets[i].fitness, "to: ",this.rockets[i].fitness / maxFit);
			this.rockets[i].fitness /= maxFit;
		}

		this.matingPool = [];

		for (var i = 0; i < this.popsize; i++) {
			var n = this.rockets[i].fitness * 100;
			for (var j = 0; j < n; j++) {
				this.matingPool.push(this.rockets[i]);
			}
		}
		// add overall best rocket to gene pool
		if(bestRocket){
			for (var j = 0; j < 100; j++) {
				this.matingPool.push(bestRocket);
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