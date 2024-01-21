let bodies = [];
let G = 0.5;
let showOrbit = false;
let stars = [];

//https://www.solarsystemscope.com/textures/
let starsT, milkywayT, sunT, twin1T, twin2T, earthT;
function preload(){
  sunT = loadImage("textures//sun.jpg");
  twin1T = loadImage("textures//twin1.jpg");
  twin2T = loadImage("textures//twin2.jpg");
  earthT = loadImage("textures//earth.jpg");
  starsT = loadImage("textures//stars.jpg");
  milkywayT = loadImage("textures//milkyway.jpg");
}

function setup() {
  createCanvas(800, 800, WEBGL);

  bodies.push(new Body(6400, createVector(0, 0, 0), createVector(0, 0, 0), sunT, 1000, true));
  bodies.push(new Body(100, createVector(2000, 0, 0), createVector(0, 16, 0), twin1T, 50));
  bodies.push(new Body(100, createVector(2200, 0, 0), createVector(0, 9, 0), twin2T, 50));
  camera(0, 0, 6000);

  if (showOrbit) {
    for (let i = 0; i < 5000; i++) {
      for (let body of bodies)
        body.applyGravity();
      for (let body of bodies) {
        body.pos.add(body.vel);
        if (!body.sun)
          body.orbit.push(body.pos.copy());
      }
    }
    for (let body of bodies) {
      body.pos = body.tpos.copy();
      body.vel = body.tvel.copy();
    }
  }

  frameRate(40);
}

function draw() {
  background(0,0,50);
  orbitControl(6, 10, 2);

  for (let body of bodies)
    body.applyGravity();
  for (let body of bodies)
    body.display();
}

class Body {
  constructor(mass, pos, vel, texture, size = mass, sun = false) {
    this.mass = mass;
    this.pos = pos; this.tpos = pos.copy();
    this.vel = vel; this.tvel = vel.copy();
    this.texture = texture;
    this.size = size;
    this.orbit = [];
    this.sun = sun;
  }

  applyGravity() {
    if (this.sun) return; // ignore the sun
    for (let body of bodies) {//https://www.britannica.com/science/Newtons-law-of-gravitation
      if (body !== this) {
        let sqrDist = p5.Vector.sub(body.pos, this.pos).magSq();
        let forceDir = p5.Vector.sub(body.pos, this.pos).normalize();
        let force = p5.Vector.mult(forceDir, (G * this.mass * body.mass) / sqrDist);

        this.vel.add(force);
      }
    }
  }

  display() {
    this.pos.add(this.vel);//apply velocity

    if (showOrbit && !this.sun) {
      noFill();
      stroke(255);
      strokeWeight(5);
      beginShape();
      for (let p of this.orbit)
        vertex(p.x, p.y, p.z);
      endShape();
    }

    push();
    noStroke();
    translate(this.pos.x, this.pos.y, this.pos.z);
    texture(this.texture);
    sphere(this.size);
    pop();
  }
}
