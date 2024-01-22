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

  bodies.push(new Body(5000, createVector(0, 0, 0), createVector(0, 0, 0), sunT, color(253, 120, 19), 500, true));
  bodies.push(new Body(50, createVector(1000, 0, 0), createVector(0, 13, 0), twin1T, color(255,0,0), 35));
  bodies.push(new Body(50, createVector(1150, 0, 0), createVector(0, 9, 0), twin2T, color(0,0,255), 35));
  // bodies.push(new Body(50, createVector(1800, 0, 0), createVector(0, 8.15, 0), earthT, color(0,255,0),150));
  // bodies.push(new Body(1000, createVector(7000, 0, 0), createVector(0, 32,0), earthT, color(255, 192, 203),600));
  camera(0, 0, 3000);

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

  //stars
  for(let i = 0; i<1000; i++){
    let theta = random(180);
    let phi = random(360);
    let pos = createVector(
      4000 * sin(theta) * cos(phi),
      4000 * cos(theta),
      4000 * sin(theta) * sin(phi),
    )
    stars.push([pos, random(150,250)]);
  }

  frameRate(30);
  
}

function draw() {
  background(0,0,50);
  orbitControl(5, 5);
  ambientLight(50, 50, 50);
  pointLight(255,250,240,0,0,0);
  for (let body of bodies)
    body.applyGravity();
  for (let body of bodies)
    body.display();

  drawStars();

}

function drawStars(){
  strokeWeight(2);
  beginShape(POINTS);
  for(let star of stars){
    stroke(star[1]);
    vertex(star[0].x,star[0].y,star[0].z);
  }
  endShape();
}

class Body {
  constructor(mass, pos, vel, texture, col, size = mass, sun = false) {
    this.mass = mass;
    this.pos = pos; this.tpos = pos.copy();
    this.vel = vel; this.tvel = vel.copy();
    this.texture = texture;
    this.size = size;
    this.col = col;
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
      stroke(this.col);
      strokeWeight(5);
      beginShape();
      for (let p of this.orbit)
        vertex(p.x, p.y, p.z);
      endShape();
    }
    push();
    noStroke();
    translate(this.pos.x, this.pos.y, this.pos.z);
    if(this.sun){
      emissiveMaterial(this.col);
      texture(this.texture);}
    else {emissiveMaterial(0);
      fill(this.col);}
    sphere(this.size);
    pop();
  }
}
