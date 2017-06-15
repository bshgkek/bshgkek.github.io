function Vehicle(x,y,dna) {
	var mutate = false;

  	this.acceleration = createVector(0,0);
  	this.velocity = createVector(0,-2);
  	this.position = createVector(x,y);
  	this.r = vSize;
  	this.maxspeed = vMaxSpeed;
  	this.maxforce = vMaxForce;
  	this.hp = vHpStart;

  	if(dna !== undefined) mutate = true;

	this.dna = dna || [random(-2, 2), random(-2, 2), random(0, 100), random(0, 100)];

  	if(mutate){
  		if(random(1) < mutationRate/100) this.dna[0] += random(-0.3, 0.3);
  		if(random(1) < mutationRate/100) this.dna[1] += random(-0.3, 0.3);
  		if(random(1) < mutationRate/100) this.dna[2] += random(-20, 20);
  		if(random(1) < mutationRate/100) this.dna[3] += random(-20, 20);
  	}
}

Vehicle.prototype.update = function() {
	this.hp -= vHpDegen;

	// Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
};

Vehicle.prototype.applyForce = function(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
};

Vehicle.prototype.seek = function(target) {
	// A vector pointing from the location to the target
 	var desired = p5.Vector.sub(target,this.position);

    // Scale to maximum speed
    desired.setMag(this.maxspeed);

    // Steering = Desired minus velocity
    var steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);  // Limit to maximum steering force

    // this.applyForce(steer);
    return steer;
};

Vehicle.prototype.display = function() {
	// Draw a triangle rotated in the direction of velocity
    var angle = this.velocity.heading() + PI/2;

    push();
    translate(this.position.x,this.position.y);
    rotate(angle);

    if(debug){
	    strokeWeight(3);
	    stroke(0,255,0);
	    noFill()
	    line(0,0,0,-this.dna[0]*20);
	    ellipse(0,0,this.dna[2]*2);
	    strokeWeight(2);
	    stroke(255,0,0);
	    line(0,0,0,-this.dna[1]*20);
	    ellipse(0,0,this.dna[3]*2);
	}
    const r = color(255, 0, 0);
    const g = color(0, 255, 0);
    const b = color(0, 0, 255);
    const w = color(255);

    const bk = color(0);
    const clr = lerpColor(r,w,this.hp);
    fill(clr);
    stroke(clr);
    strokeWeight(1);
    beginShape();
    vertex(0, -this.r*2);
    vertex(-this.r, this.r*2);
    vertex(this.r, this.r*2);
    endShape(CLOSE);
    pop();

    
};

Vehicle.prototype.eat = function(list, hpChange, perception) {
	var record = Infinity;
	var closest = null;
	for (var i = list.length-1; i >= 0; i--) {
		const d = this.position.dist(list[i]);
		if(d < this.maxspeed) {
			list.splice(i,1);
			this.hp += hpChange;
		} else if (d < record && d < perception) {
			record = d;
			closest = list[i];
		}
	}
	if (closest != null) {
		return this.seek(closest);
	}

	return createVector(0,0);
};

Vehicle.prototype.behaviors = function(good, bad) {
	var steerG = this.eat(good, vGoodHpInc, this.dna[2]);
	var steerB = this.eat(bad, vBadHpDec, this.dna[3]);

	steerG.mult(this.dna[0])
	steerB.mult(this.dna[1])

	this.applyForce(steerG);
	this.applyForce(steerB);
};

Vehicle.prototype.isDead = function() {
	return (this.hp < 0)
};

 Vehicle.prototype.boundries = function() {
 	var d = 25;
    var desired = null;

    if (this.position.x < d) {
      desired = createVector(this.maxspeed, this.velocity.y);
    }
    else if (this.position.x > width -d) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < d) {
      desired = createVector(this.velocity.x, this.maxspeed);
    }
    else if (this.position.y > height-d) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxspeed);
      var steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
};

Vehicle.prototype.clone = function() {
	if(random(1) < vPercRdmCopy/100) return new Vehicle(this.position.x, this.position.y, this.dna);
	return null;
};
