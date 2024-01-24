let bodies = [];
let G = 1;
let showOrbit;
let stars = [];
let uiOptions = []; 

//https://www.solarsystemscope.com/textures/
let sunT;
function preload(){
  sunT = loadImage("textures//sun.jpg");
}

function setup() {
  createCanvas(800, 800, WEBGL);
  makeUi();

  makePlanets();
  camera(0, 0, 6000);

  //stars https://mathworld.wolfram.com/SpherePointPicking.html
  for(let i = 0; i<1000; i++){
    let theta = 2 * Math.PI * Math.random();
    let phi = Math.acos(2 * Math.random() - 1);
    let pos = createVector(
      9000 * Math.sin(phi) * Math.cos(theta),
      9000 * Math.sin(phi) * Math.sin(theta),
      9000 * Math.cos(phi));
    stars.push(pos);
  }
  perspective(PI/3.0, width/height, 0.01, 20000); //increase clipping max
  
}

function draw() {
  background(0,0,50);
  orbitControl(5, 5);
  ambientLight(50, 50, 50);
  for (let body of bodies)
    body.applyGravity();
  for (let body of bodies){
    body.display();
    if(body.sun) pointLight(255,250,240,body.pos.x,body.pos.y,body.pos.z);
  }


  drawStars();

}

function drawStars(){
  strokeWeight(2);
  stroke(color(200,255,255,160));
  beginShape(POINTS);
  for(let star of stars)
    vertex(star.x,star.y,star.z);
  
  endShape();
}

function makeUi(){
  let def = [ //default values - mass, issun, pos, velocity, color, size
    [6400, true, [0,0,0], [0,0,0], color(253,120,19), 500],
    [50, false, [1000,0,0], [0,20.3,0], color(255,0,0), 45],
    [50, false, [1150,0,0], [0,14.3,0], color(0,0,255), 45],
    [10, false, [2100,0,0], [0,5.55,0], color(0,255,0), 150],
    [10, false, [3200,0,0], [0,4.48,0], color(255, 192, 203), 200],
    [10, false, [4500,0,0], [0,3.75,0], color(0,255,255), 400] 
  ];
  let i = 0;

  for(let j of def){
    let massText = createP("Mass: ");massText.position(820, 1+i*120);
    let mass = createInput(j[0]+"");mass.size(30);mass.position(870,17+i*120);

    let sunQText = createP("Sun? "); sunQText.position(920, 1+i*120);
    let sunQ = createCheckbox("",j[1]); sunQ.position(955, 17+i*120);

    let positionText = createP("Position: ");positionText.position(820,25+i*120);
    let px = createInput(j[2][0]+""); px.size(25); px.position(880,42+i*120); 
    let py = createInput(j[2][1]+""); py.size(25); py.position(915,42+i*120); 
    let pz = createInput(j[2][2]+""); pz.size(25); pz.position(950,42+i*120); 

    let velocityText = createP("Velocity: ");velocityText.position(1000,25+i*120);
    let vx = createInput(j[3][0]+""); vx.size(25); vx.position(1060,42+i*120); 
    let vy = createInput(j[3][1]+""); vy.size(25); vy.position(1095,42+i*120); 
    let vz = createInput(j[3][2]+""); vz.size(25); vz.position(1130,42+i*120); 

    let colorText = createP("Color: ");colorText.position(820,52+i*120);
    let colorPicker = createColorPicker(j[4]);colorPicker.position(870, 66+i*120);
    
    let dSizeText = createP("Display Size: ");dSizeText.position(940,52+i*120);
    let dSize = createInput(j[5]+"");dSize.size(30);dSize.position(1030,68+i*120);
    uiOptions.push([mass,[px,py,pz],[vx,vy,vz],colorPicker,dSize,sunQ]);
    i++;
  }

  let showOrbitText = createP("Show Orbit: "); showOrbitText.position(820, 760);
  showOrbit = createCheckbox("",false); showOrbit.position(900,776);
  let showOrbitTip = createP("<--- takes a big hit on performance, keep it disabled when not in use");
  showOrbitTip.position(930,760);

  let updateChanges = createButton("Update Changes"); updateChanges.size(350);
  updateChanges.position(820, 720);
  updateChanges.mouseClicked(makePlanets);
}
function makePlanets(){
  bodies=[];
  for(let i of uiOptions){
    bodies.push(new Body(
      float(i[0].value()), 
      createVector(float(i[1][0].value()), float(i[1][1].value()), float(i[1][2].value())), 
      createVector(float(i[2][0].value()), float(i[2][1].value()), float(i[2][2].value())), 
      i[3].color(), 
      float(i[4].value()), 
      i[5].checked()
    ));
  }

  calculateOrbits();

}

function calculateOrbits(){
    for (let i = 0; i < 10000; i++) {
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


class Body {
  constructor(mass, pos, vel, col, size, sun = false) {
    this.mass = mass;
    this.pos = pos.copy(); this.tpos = pos.copy();
    this.vel = vel.copy(); this.tvel = vel.copy();
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

    if (showOrbit.checked() && !this.sun) {
      noFill();
      stroke(this.col);
      strokeWeight(1);
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
      texture(sunT);
    }
    else {
      emissiveMaterial(0);
      fill(this.col);
    }
    sphere(this.size);
    pop();
  }
}
