const unit = 5;
const height = 500;
const baby = 5;
const maxCircles = 400;
 let circles;
let links;
let paused = false;
let stepCount;
let diedLonely;
let diedOverloaded;
let diedOld;

function setup(){
  createCanvas(800, height + 80);
  resetWorld();
}

function resetWorld(){
  circles =[];
  links = [];
  stepCount = 0;
  diedLonely = 0;
  diedOverloaded = 0;
  diedOld = 0;

  for(let i = 0; i < 50; i++){
    addCircleRandom();
  }
}

function addCircle(x,y,r){
  const c = {x: x, y: y, r: r, cr: 0, cg: 0, cb: 0, count: 0, age: 0, life: random(50,100), dead: false };
// cという円の中心座標、色、寿命などを規定する箱データでc.x,c.cbなどで呼び出して中身は後から決める

let sumR = 0;
let sumG = 0; 
let sumB = 0;
let n = 0;
const neighbors = [];

for(let i = 0; i < circles.length; i++){
  const o = circles[i];　
  const d = dist(c.x, c.y, o.x, o.y);
  // i番目の円の要素をoとおいてc.x同様に円の要素の具体値を考えられる。cは新たな円。oは既存の縁のどれか。dは円c,oの中心距離
  const rmax = max(c.r, o.r)
  const near = 2 * rmax * unit;
  const far = 3 * rmax * unit;
  const exfar = 4 * rmax * unit;

  if(d < near || (d < far && random(0,1) < 0.5) || (d < exfar && random(0,1) < 0.3)){
    links.push({a: c, b: o});
    sumR += o.cr;
    sumG += o.cg;
    sumB += o.cb;
    n++;
    neighbors.push(o);
  }
}

  const rndR = random(0,255);
  const rndG = random(0,255);
  const rndB = random(0,255);

  if(n === 0){
    c.cr = rndR;
    c.cg = rndG;
    c.cb = rndB;
  } else{
    c.cr = ((sumR / n) + rndR) / 2;
    c.cg = ((sumG / n) + rndG) / 2;
    c.cb = ((sumB / n) + rndB) / 2;
  }

for(let i = 0; i < neighbors.length; i++){
  const o = neighbors[i];
  o.cr = (o.cr + c.cr) / 2;
  o.cg = (o.cg + c.cg) / 2;
  o.cb = (o.cb + c.cb) / 2;
} 
  circles.push(c);
}

function isFree(x,y,r){
  for(let i = 0; i < circles.length; i++){
    const o = circles[i];
    if(dist(x, y, o.x, o.y) < (r + o.r) * unit){
      return false;
    }
  }
  return true;
}

function addCircleRandom(){
  const r = floor(random(1,11));
  for(let t = 0; t < 30; t++){
    const x = random(0, width);
    const y = random(0, height);
    if(isFree(x, y, r)){
      addCircle(x, y, r);
    }
  }
}

function draw(){
  background(25);

  if(!paused && frameCount % 12 === 0){
    // 毎秒60回の描画を5回の描画にして人間に合わせて1秒に5ステップにする
    stepWorld();
  }
  drawLinks();
  drawCircles();
  drawInfo();
}

function stepWorld(){
  stepCount++;

  for(let i = 0; i < circles.length; i++){
    circles[i].count = 0;
  }
  for(let i = 0; i < links.length; i++){
  links[i].a.count++;
  links[i].b.count++;
  }

  for(let i = 0; i < circles.length; i++){
    const c = circles[i];
    c.age++;
    const old = (c.age > c.life);
    const lonely = (c.age > baby && c.count < 0.6 * c.r);
    const overloaded = (c.count > 2 * c.r);
    if(old){
      c.dead = true;
      diedOld++;
    } else if(lonely){
      c.dead = true;
      diedLonely++;
    } else if(overloaded){
      c.dead = true;
      diedOverloaded++;
    }
  }

  removeDead();

  const n = random(0, 2);
  for(let k = 0; k < n; k++){
    if(circles.length < maxCircles){
      addCircleRandom();
    }
  }
}

function removeDead(){
  const aliveCircles = [];
  for(let i = 0; i < circles.length; i++){
    if(!circles[i].dead){
      aliveCircles.push(circles[i]);
    }
  }
  circles = aliveCircles;

  const aliveLinks = [];
  for(let i = 0; i < links.length; i++){
    const l = links[i];
    if(!l.a.dead && !l.b.dead){
      aliveLinks.push(l);
    }
  }
  links = aliveLinks;
}

function drawLinks(){
 stroke(200,90);
 strokeWeight(2);
 for(let i = 0; i < links.length; i++){
  const l = links[i];
  line(l.a.x, l.a.y, l.b.x, l.b.y);
 }
}

function drawCircles(){
  for(let i = 0; i < circles.length; i++){
    const c = circles[i];
    fill(c.cr, c.cg, c.cb);
    if(c.age <= baby){
      stroke(255);
      strokeWeight(2);
    } else{
      noStroke();
    }
    ellipse(c.x, c.y, c.r * unit * 2);
  }
}

function drawInfo(){
  push();
  noStroke();
  fill(220);
  textSize(13);
  const y0 = height + 22;
  text("ステップ: " + stepCount + "　円の数: " + circles.lemgth + "繋がり: " + links.length, 10, y0);
  text("消滅 - 孤立: " + diedOld + " つながりすぎ: " + diedOverloaded + " 寿命: " + diedOld, 10, y0 + 22);
  text("左クリック:消す スペース:停止 r:やり直し", 10, y0 + 44);
  if(paused){
    fill(255, 200, 0);
    text("停止中", 720, y0);
  }
  pop();
}

function mousePressed(){
  for(let i = 0; i < circles.length; i++){
    const c = circles[i];
    if(dist(mouseX, mouseY, c.x, c.y) < c.r * unit){
      c.dead = true;
      removeDead();
      return;
    }
  }
}

function keyPressed(){
  if(key === ' '){
    paused = !paused;
  }
  if(key === 'r'){
    resetWorld();
  }
  return false;
}
