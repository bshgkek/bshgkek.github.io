'use-strict';

const debug = false;

const canvasWidth = 400;
const canvasHeight = 300;
const rocketHeight = 35;
const rocketWidth = 10;

let target;
const targetHeight = 10;
const targetWidth = 10;

const maxForce = 0.2;

let level = 1;
let gameLevel;

let incLearn = true;
let incLearnRate = 10;
let incLearnGen = 5;

let mutationRate = 0.01;

let lifespan = 50;
let populationSize = 100;
let dnaIndex = 0;
let population;

const maxLifespan = level === 1 ? 400 : 600;
let gameLifeSpan;

const obstacleX = 100;
const obstacleY = 150;
const obstacle1X = 0;
const obstacle1Y = canvasHeight - 75;
const obstacle2X = canvasWidth - canvasWidth * 0.75;
const obstacle2Y = canvasHeight - 200;
const obstacle1Width = canvasWidth * 0.5;
const obstacle2Width = canvasWidth * 0.75;
const obstacleHeight = 10;

addEventListeners();

function setup() {
	let cvs = createCanvas(canvasWidth, canvasHeight);
	cvs.parent('sketch');
	population = new Population();
	gameLevel = level;
	gameLifeSpan = maxLifespan;
	dnaIndex = 0;
	dnaIndexP = createP();
	lifespanP = createP();
	generationP = createP();
	maxFitnessP = createP();
	avgFitnessP = createP();
	fastestP = createP();
	generationP.html('Generation: 1');
	lifespanP.html('Lifespan: ' + lifespan);
	maxFitnessP.html('Max Fitness: 0');
	avgFitnessP.html('Average Fitness: 0');
	fastestP.html('Fastest Finish: 0');
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

class Population {
	constructor() {
		this.populationSize = populationSize;
		this.rockets = [];
		this.lifespan = lifespan;
		this.generation = 1;
		this.incLearn = incLearn;
		this.incLearnRate = incLearnRate;
		this.incLearnGen = incLearnGen;
		this.lifespan = lifespan;
		this.mutationRate = mutationRate;
		for (var i = 0; i < this.populationSize; i++) {
			this.rockets[i] = new Rocket();
		}
		if (debug) {
			console.log('population created with', populationSize, 'rockets');
		}
	}

	run() {
		let finished = 0;
		let oldLifespan = this.lifespan;
		for (var i = 0; i < this.populationSize; i++) {
			finished += this.rockets[i].update() ? 1 : 0;
			this.rockets[i].show();
		}
		dnaIndex++;
		if (dnaIndex === this.lifespan || finished === this.populationSize) {
			this.generation += 1;
			generationP.html('Generation: ' + this.generation);
			if (this.incLearn && this.generation % this.incLearnGen === 0) {
				this.lifespan =
					oldLifespan < gameLifeSpan ? oldLifespan + this.incLearnRate : gameLifeSpan;
				lifespanP.html('Lifespan: ' + this.lifespan);
				if (debug) {
					console.log('----generation', this.generation);
					console.log('updating lifespan from', oldLifespan, 'to', this.lifespan);
				}
			}
			this.evaulate();
			this.selection();
			dnaIndex = 0;
		}
	}

	evaulate() {
		this.matingPool = [];
		let rockets = this.rockets;
		let maxFitness = 0;
		let avgFitness = 0;
		let bestRocket;
		let rocket;
		let fitness;
		let normalizedFitness;

		for (rocket of rockets) {
			fitness = rocket.calcFitness();
			avgFitness += fitness;
			if (fitness > maxFitness) {
				bestRocket = rocket;
				maxFitness = fitness;
			}
		}

		this.bestRocket = bestRocket;
		this.bestRocket.isBest = true;
		if (this.bestRocket.completeIndex) {
			fastestP.html('Fastest finish: ' + this.bestRocket.completeIndex);
		}

		avgFitness /= this.populationSize;
		maxFitnessP.html('Max Fitness: ' + Math.round(maxFitness * 100) / 100);
		avgFitnessP.html('Average Fitness: ' + Math.round(avgFitness * 100) / 100);

		for (rocket of rockets) {
			normalizedFitness = rocket.fitness / maxFitness * 100;
			for (let i = 0; i < normalizedFitness; i++) {
				this.matingPool.push(rocket);
			}
		}
		if (debug) {
			console.log(this.matingPool.length, 'rockets added to mating pool');
		}
	}

	selection() {
		const matingPool = this.matingPool;
		const incLearn = this.incLearn;
		let bestRocketDNA = this.bestRocket.dna;
		let bestRocket;
		let newRockets = [];
		let mom;
		let dad;
		let childDna;

		if (incLearn) {
			bestRocketDNA.addIncrementalGenes();
		}

		bestRocket = new Rocket(bestRocketDNA);
		bestRocket.isBest = true;

		for (var i = 0; i < this.populationSize - 1; i++) {
			mom = random(matingPool);
			dad = random(matingPool);
			childDna = mom.dna.crossover(dad.dna);
			childDna.mutate(this.mutationRate);
			if (incLearn) {
				childDna.addIncrementalGenes();
			}
			newRockets[i] = new Rocket(childDna);
		}
		this.rockets = newRockets;
		this.rockets.push(bestRocket);
	}
}

class Rocket {
	constructor(dna) {
		this.dna = dna || new DNA();
		this.position = createVector(canvasWidth / 2, canvasHeight);
		this.velocity = createVector();
		this.acceleration = createVector();
		this.completeIndex = 0;
		this.crashIndex = 0;
		this.fitness;
		this.applyForce = force => {
			this.acceleration.add(force);
		};
	}

	update() {
		var d = dist(this.position.x, this.position.y, target.x, target.y);
		if (d < 10) {
			this.completeIndex = dnaIndex;
			this.position = target.copy();
		}

		if (!this.crashIndex) {
			if (
				// rocket hit outer wall
				this.position.x > canvasWidth ||
				this.position.x < 0 ||
				this.position.y > canvasHeight ||
				this.position.y < 0 ||
				// rocket hit obstacle
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
	}
	show() {
		push();
		noStroke();
		if (this.isBest) {
			fill(0, 255, 0, 150);
		} else {
			fill(255, 150);
		}
		translate(this.position.x, this.position.y);
		rotate(this.velocity.heading());
		rectMode(CENTER);
		rect(0, 0, rocketHeight, rocketWidth);
		pop();
	}
	calcFitness() {
		const { x, y } = this.position;
		const toGoal = dist(x, y, target.x, target.y);
		const fromStart = dist(x, y, canvasWidth / 2, canvasHeight);
		const invToGoal = map(toGoal, 0, canvasWidth, canvasWidth, 0);
		const invHeight = map(y, 0, canvasHeight, canvasHeight, 0);
		let fitness = invToGoal * 6 + invHeight * 3 + fromStart * 2;
		const completeIndex = this.completeIndex;

		if (completeIndex) {
			fitness *= 10 + completeIndex * 3;
		}
		if (this.crashIndex) {
			fitness /= 10;
		}
		this.fitness = fitness;
		return fitness;
	}
}

class DNA {
	constructor(genes) {
		this.genes = genes || [];

		if (!this.genes.length) {
			for (var i = 0; i < lifespan; i++) {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxForce);
			}
		}
	}
	crossover(mate) {
		const genes = this.genes;
		let newGenes = [];
		let mid = floor(random(genes.length));

		genes.forEach((gene, index) => {
			newGenes[index] = index > mid ? this.genes[index] : mate.genes[index];
		});
		return new DNA(newGenes);
	}

	mutate(rate) {
		let gene;
		let count = 0;
		this.genes = this.genes.map(oldGene => {
			if (random(1) < rate) {
				gene = p5.Vector.random2D();
				gene.setMag(maxForce);
				return gene;
			} else {
				return oldGene;
			}
		});
	}

	addIncrementalGenes() {
		let genes = this.genes;
		const numGenes = this.genes.length;
		const missingGenes = population.lifespan - numGenes;
		if (missingGenes > 0) {
			for (let i = numGenes; i < numGenes + missingGenes; i++) {
				genes[i] = p5.Vector.random2D();
				genes[i].setMag(maxForce);
			}
		}
	}
}

function addEventListeners() {
	document.getElementById('start').addEventListener('click', function(e) {
		dnaIndexP.remove();
		lifespanP.remove();
		generationP.remove();
		maxFitnessP.remove();
		avgFitnessP.remove();
		fastestP.remove();
		setup();
	});
}
