// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Seeking "vehicle" follows the mouse position

// Implements Craig Reynold's autonomous steering behaviors
// One vehicle "seeks"
// See: http://www.red3d.com/cwr/

const cH = 600;
const cW = 800;


const foodCount = 40;
const poisonCount = 20;

const percentNewFood = 20;
const percentNewPoison = 1;

const fWidth = fHeight = 6;
const pWidth = pHeight = 6;

const vCount = 50;
const vSize = 4;
const vMaxSpeed = 5;
const vMaxForce = 0.2;
const vHpStart = 1;
const vHpDegen = 0.01;
const vGoodHpInc = 0.3;
const vBadHpDec = -0.75;

const mutationRate = 2;
const vPercRdmCopy = 0.5;

var debug = false;


var vehicles = [];
var food = [];
var poison = [];



function setup() {
  	var cvs = createCanvas(cW,cH);
	cvs.parent('sketch');
  	v = new Vehicle(cW/2, cH/2);
  	for (var i = 0; i < vCount; i++) {
		let x = random(cW);
		let y = random(cH);
		vehicles.push(new Vehicle(x,y))
  	}
  	for (var i = 0; i < foodCount; i++) {
  		let x = random(cW);
  		let y = random(cH);
  		food.push(createVector(x,y))
  	}
  	for (var i = 0; i < poisonCount; i++) {
  		let x = random(cW);
  		let y = random(cH);
  		poison.push(createVector(x,y))
  	}

  	document.getElementById('debug').addEventListener('click', function(e) {
  		console.log(e);
		debug = document.getElementById('debug').checked;
	});
}

function mouseDragged() {
	console.log('lll');
	vehicles.push(new Vehicle(mouseX,mouseY));
}

function draw() {
  	background(51);
	
  	if (random(1) < percentNewFood/100) {
  		let x = random(cW);
  		let y = random(cH);
  		food.push(createVector(x,y))
  	}
 	if (random(1) < percentNewPoison/100) {
  		let x = random(cW);
  		let y = random(cH);
  		poison.push(createVector(x,y))
  	}
  	var target = createVector(mouseX, mouseY);
	
  	// Draw an ellipse at the mouse position
  	// fill(127);
  	// stroke(200);
  	// strokeWeight(2);
  	// ellipse(target.x, target.y, 48, 48);
	
  	for (var i = 0; i < food.length; i++) {
  		fill(0,255,0);
  		noStroke();
  		ellipse(food[i].x, food[i].y, fWidth, fHeight);
  	}
  	for (var i = 0; i < poison.length; i++) {
  		fill(255,0,0);
  		noStroke();
  		ellipse(poison[i].x, poison[i].y, pWidth, pHeight);
  	}

  	// Call the appropriate steering behaviors for our agents
  	for (var i = vehicles.length - 1; i >= 0; i--) {
  		vehicles[i].boundries();
  		vehicles[i].behaviors(food, poison);
  		vehicles[i].update();
  		vehicles[i].display();

		var newVehicle = vehicles[i].clone();
  		if(newVehicle) vehicles.push(newVehicle);

  		if(vehicles[i].isDead()) {
  			let x = vehicles[i].position.x;
  			let y = vehicles[i].position.y;
  			food.push(createVector(x,y));
  			vehicles.splice(i,1);
  		}
 	}
}

