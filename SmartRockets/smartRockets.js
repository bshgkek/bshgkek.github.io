var canvasWidth = 400;
var canvasHeight = 300;

var level = 1;
var gameLevel;

var incLearn = true;
var incLearnRate = 10;
var incLearnGen = 5;

var rocketHeight = 35;
var rocketWidth = 10;
var maxForce = 0.2;

var population;
var popsize = 100;
var incLearnlifespan = 50;
var lifespan = incLearn ? incLearnlifespan : maxLifespan;
var maxLifespan = level === 1 ? 400 : 600;
var gameLifeSpan;
var dnaIndex = 0;
var lifeP;

var mutationRate = 0.01;

var target;
var targetHeight = 10;
var targetWidth = 10;

var obstacleX = 100;
var obstacleY = 150;
var obstacle1X = 0;
var obstacle1Y = canvasHeight - 75;
var obstacle2X = canvasWidth - canvasWidth * 0.75;
var obstacle2Y = canvasHeight - 200;
var obstacle1Width = canvasWidth * 0.5;
var obstacle2Width = canvasWidth * 0.75;
var obstacleHeight = 10;

var generation;
addEventListeners();

function setup() {
	let cvs = createCanvas(canvasWidth, canvasHeight);
	cvs.parent('sketch');
	// reset generation and dna index incase game restarting form start button
	generation = 1;
	dnaIndex = 0;
	population = new Population();
	dnaIndexP = createP();
	lifespanP = createP();
	generationP = createP();
	maxFitnessP = createP();
	avgFitnessP = createP();
	gameLevel = level;
	gameLifeSpan = maxLifespan;
	generationP.html('Generation:' + generation);
	lifespanP.html('Lifespan: ' + lifespan);
	maxFitnessP.html('Max Fitness: 0');
	avgFitnessP.html('Average Fitness: 0');
	target = createVector(canvasWidth / 2, 50);
}

function draw() {
	background(0);
	population.run();
	dnaIndexP.html('DNA Index: ' + dnaIndex);

	fill(255);
	if (gameLevel === 1) {
		rect(obstacleX, obstacleY, obstacle1Width, obstacleHeight);
	} else if (gameLevel === 2) {
		rect(obstacle1X, obstacle1Y, obstacle2Width, obstacleHeight);
		rect(obstacle2X, obstacle2Y, obstacle2Width, obstacleHeight);
	}
	ellipse(target.x, target.y, targetWidth, targetHeight);
}

function mousePressed(e) {
	const x = e.offsetX;
	const y = e.offsetY;
	if (x < canvasWidth && y < canvasHeight) {
		var toGoal = dist(x, y, target.x, target.y);
		var fromStart = dist(x, y, canvasWidth / 2, canvasHeight);
		var invToGoal = map(toGoal, 0, canvasWidth, canvasWidth, 0);
		var invHeight = map(y, 0, canvasHeight, canvasHeight, 0);
		var fitness = invToGoal * 6 + invHeight * 3 + fromStart * 2;
		console.log('estimated fitness:', fitness);
	}
}

function Rocket(dna) {
	this.position = createVector(canvasWidth / 2, canvasHeight);
	this.velocity = createVector();
	this.acceleration = createVector();
	this.dna = dna || new DNA();
	this.fitness;
	this.completeIndex = 0;
	this.crashIndex = 0;
	this.applyForce = function(force) {
		this.acceleration.add(force);
	};

	this.update = function() {
		var d = dist(this.position.x, this.position.y, target.x, target.y);
		if (d < 10) {
			this.completeIndex = dnaIndex;
			this.position = target.copy();
		}

		// rocket hit obstacle
		if (!this.crashIndex) {
			if (
				this.position.x > canvasWidth ||
				this.position.x < 0 ||
				this.position.y > canvasHeight ||
				this.position.y < 0 ||
				(gameLevel === 1 &&
					this.position.x > obstacleX &&
					this.position.x < obstacleX + obstacle1Width &&
					this.position.y > obstacleY &&
					this.position.y < obstacleY + obstacleHeight) ||
				(gameLevel === 2 &&
					((this.position.x > obstacle1X &&
						this.position.x < obstacle1X + obstacle2Width &&
						this.position.y > obstacle1Y &&
						this.position.y < obstacle1Y + obstacleHeight) ||
						(this.position.x > obstacle2X &&
							this.position.x < obstacle2X + obstacle2Width &&
							this.position.y > obstacle2Y &&
							this.position.y < obstacle2Y + obstacleHeight)))
			) {
				this.crashIndex = dnaIndex;
			}
		}

		this.applyForce(this.dna.genes[dnaIndex]);
		if (!this.completeIndex && !this.crashIndex) {
			this.velocity.add(this.acceleration);
			this.position.add(this.velocity);
			this.acceleration.mult(0);
			this.velocity.limit(4);
		}
		return this.crashIndex || this.completeIndex;
	};

	this.show = function() {
		push();
		noStroke();
		fill(255, 150);
		translate(this.position.x, this.position.y);
		rotate(this.velocity.heading());
		rectMode(CENTER);
		rect(0, 0, rocketHeight, rocketWidth);
		pop();
	};

	this.calcFitness = function() {
		const { x, y } = this.position;
		const toGoal = dist(x, y, target.x, target.y);
		const fromStart = dist(x, y, canvasWidth / 2, canvasHeight);
		const invToGoal = map(toGoal, 0, canvasWidth, canvasWidth, 0);
		const invHeight = map(y, 0, canvasHeight, canvasHeight, 0);
		this.fitness = invToGoal * 6 + invHeight * 3 + fromStart * 2;

		if (this.completeIndex) {
			this.fitness *= 10;
		}
		if (this.crashIndex) {
			this.fitness /= 10;
		}

		return this.fitness;
	};
}

function Population() {
	this.rockets = [];
	this.popsize = popsize;
	this.matingPool = [];
	// these are set here so changing them from the drop downs doesnt change them mid run
	// must hit start for a new population to be created
	this.incLearn = incLearn;
	this.incLearnRate = incLearnRate;
	this.incLearnGen = incLearnGen;
	this.lifespan = lifespan;
	this.mutationRate = mutationRate;
	this.finished = 0;
	for (var i = 0; i < this.popsize; i++) {
		this.rockets[i] = new Rocket();
	}

	this.run = function() {
		let finished = 0;
		for (var i = 0; i < this.popsize; i++) {
			this.rockets[i].show();
			if (this.rockets[i].update()) {
				finished += 1;
			}
		}

		dnaIndex++;
		if (dnaIndex === this.lifespan || finished === this.popsize) {
			generation++;
			generationP.html('Generation: ' + generation);
			if (generation % this.incLearnGen === 0) {
				if (this.incLearn) {
					this.lifespan =
						this.lifespan < gameLifeSpan
							? this.lifespan + this.incLearnRate
							: gameLifeSpan;
					lifespanP.html('Lifespan: ' + this.lifespan);
				}
			}
			this.evaulate();
			this.selection();
			dnaIndex = 0;
		}
	};

	this.evaulate = function() {
		var maxFit = 0;
		var avgFitness = 0;
		var bestRocket;
		for (var i = 0; i < this.popsize; i++) {
			avgFitness += this.rockets[i].calcFitness();
			if (this.rockets[i].fitness > maxFit) {
				bestRocket = this.rockets[i];
				maxFit = this.rockets[i].fitness;
			}
		}
		avgFitness /= this.popsize;
		maxFitnessP.html('Max Fitness: ' + Math.round(maxFit * 100) / 100);
		avgFitnessP.html('Average Fitness: ' + Math.round(avgFitness * 100) / 100);

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
	};

	this.selection = function() {
		var newRockets = [];
		for (var i = 0; i < this.rockets.length; i++) {
			var mom = random(this.matingPool);
			var dad = random(this.matingPool);
			var childDna = mom.dna.crossover(dad.dna);
			childDna.mutate(this.mutationRate);
			if (population.incLearn) {
				childDna.addIncrementalGenes();
			}
			newRockets[i] = new Rocket(childDna);
		}
		this.rockets = newRockets;
	};
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
			if (i > 0) {
				newGenes[i] = this.genes[i];
			} else {
				newGenes[i] = partner.genes[i];
			}
		}
		return new DNA(newGenes);
	};

	this.mutate = function(rate) {
		for (var i = 0; i < this.genes.length; i++) {
			if (random(1) < rate) {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxForce);
			}
		}
	};

	this.addIncrementalGenes = function() {
		const numGenes = this.genes.length;
		const missingGenes = population.lifespan - numGenes;
		if (missingGenes > 0) {
			for (let i = numGenes; i < numGenes + missingGenes; i++) {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxForce);
			}
		}
	};
}

function addEventListeners() {
	document.getElementById('incLearn').addEventListener('change', function(e) {
		const choice = e.target.value === 'Yes';
		if (choice) {
			incLearn = true;
			lifespan = incLearnlifespan;
			document.getElementById('incLearn2').style.display = 'block';
			document.getElementById('incLearn3').style.display = 'block';
		} else {
			incLearn = false;
			lifespan = maxLifespan;
			document.getElementById('incLearn2').style.display = 'none';
			document.getElementById('incLearn3').style.display = 'none';
		}
	});
	document.getElementById('popSize').addEventListener('change', function(e) {
		popsize = parseInt(e.target.value);
	});
	document.getElementById('mutationRate').addEventListener('change', function(e) {
		mutationRate = parseInt(e.target.value) / 100;
	});
	document.getElementById('incLearnRate').addEventListener('change', function(e) {
		incLearnRate = parseInt(e.target.value);
	});
	document.getElementById('incLearnGen').addEventListener('change', function(e) {
		incLearnGen = parseInt(e.target.value);
	});
	document.getElementById('level').addEventListener('change', function(e) {
		level = parseInt(e.target.value);
	});
	document.getElementById('start').addEventListener('click', function(e) {
		dnaIndexP.remove();
		lifespanP.remove();
		generationP.remove();
		maxFitnessP.remove();
		avgFitnessP.remove();
		setup();
	});
}
