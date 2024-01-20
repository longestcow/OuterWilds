let bodies = [];
let G = 1;
let sunMass = 5000;


function setup() {
  createCanvas(800, 800, WEBGL);
  
  bodies.push(new Body(sunMass, createVector(0,0,0), createVector(0,0,0), color(253, 184, 19), 500));
  bodies.push(new Body(100, createVector(2000,0,0), createVector(0,16,0), color(0,0,255)));
  bodies.push(new Body(200, createVector(3500,0,0), createVector(0,17.5,0), color(0,255,0)));
  camera(0,0,8000);

  for(let i = 0; i<10000; i++){
    for(let body of bodies)
      body.applyGravity();
    for(let body of bodies){
      body.pos.add(body.vel);
      if(body.mass!==sunMass)
        body.orbit.push(body.pos.copy());
    }
  }
  for(let body of bodies){//reset vars
    body.pos=body.tpos.copy();
    body.vel=body.tvel.copy();;
  }
  frameRate(24);
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
  constructor(mass, pos, vel, col, size=mass) {
    this.mass = mass;
    this.pos = pos; this.tpos=pos.copy();
    this.vel = vel; this.tvel=vel.copy();
    this.col = col;
    this.size=size;
    this.orbit=[];
  }

  applyGravity() {
    if(this.mass===sunMass)return; // ignore the sun
    for (let body of bodies) {
      if (body !== this) {
        let sqrDist = p5.Vector.sub(body.pos, this.pos).magSq(); //https://www.britannica.com/science/Newtons-law-of-gravitation
        let forceDir = p5.Vector.sub(body.pos, this.pos).normalize();
        let force = p5.Vector.mult(forceDir, (G * this.mass * body.mass) / sqrDist);
        
        this.vel.add(force);
      }
    }
  }

  display() {
    this.pos.add(this.vel);
    noFill();
    stroke(this.col);
    strokeWeight(5);
    beginShape();
    for (let p of this.orbit) 
      vertex(p.x, p.y, p.z);
    endShape();
    push();
    if(this.mass!==sunMass)noStroke();
    else stroke(0);
    translate(this.pos.x, this.pos.y, this.pos.z);
    fill(this.col);
    sphere(this.size);
    pop();
  }
}