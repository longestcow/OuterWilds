let bodies = [];
let G = 2;
let timeStep = 1;
let sunMass = 100;
function setup() {
  createCanvas(800, 800, WEBGL);
  
  bodies.push(new Body(sunMass, createVector(0,0,0), createVector(0,0,0), color(253, 184, 19)));
  bodies.push(new Body(20, createVector(400,0,0), createVector(0,3,0), color(0,0,255)));
  bodies.push(new Body(5, createVector(200,0,0), createVector(0,3,0), color(0,255,0)));
}

function draw() {
  background(0,0,50);
  orbitControl(10,10,2);

  for (let body of bodies) 
    body.applyGravity();
  for (let body of bodies) 
    body.display();
  
}

class Body {
  constructor(mass, pos, vel, col) {
    this.mass = mass;
    this.pos = pos;
    this.vel = vel;
    this.col = col;
  }

  applyGravity() {
    if(this.mass===sunMass)return;
    for (let body of bodies) {
      if (body !== this) {
        let sqrDist = p5.Vector.sub(body.pos, this.pos).magSq();
        let forceDir = p5.Vector.sub(body.pos, this.pos).normalize();
        let force = p5.Vector.mult(forceDir, (G * this.mass * body.mass) / sqrDist);
        
        this.vel.add(force);
      }
    }
  }



  display() {
    this.pos.add(this.vel);
    push();
    if(this.mass!==sunMass)noStroke();
    fill(255);
    translate(this.pos.x, this.pos.y, this.pos.z);
    fill(this.col);
    sphere(this.mass);
    pop();
  }
}