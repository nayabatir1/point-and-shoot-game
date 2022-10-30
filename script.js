/** @type {HTMLCanvasElement} */

const canvas = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");
const ctx = canvas.getContext("2d");
const ctx2 = canvas2.getContext("2d");
canvas.height = canvas2.height = innerHeight;
canvas.width = canvas2.width = innerWidth;
ctx.font = "50px Arial";
const timeInerval = 700;
let time = 0;
let score = 0;
let gameOver = false;

let ravens = [];
let explosions = [];

class Raven {
  constructor() {
    this.width = 271;
    this.height = 194;
    this.ratio = Math.random() * 0.4 + 0.3;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.distanceX = -1 * (Math.random() * 5 + 3);
    this.distanceY = Math.random() * 5 - 2.5;
    this.directionY = -1;
    this.isRedundant = false;
    this.image = new Image();
    this.image.src = "./image/raven.png";
    this.frame = 0;
    this.totalFrames = 6;
    this.randomColor = `${Math.floor(Math.random() * 255)},${Math.floor(
      Math.random() * 255
    )},${Math.floor(Math.random() * 255)}`;
  }

  update() {
    this.x += this.distanceX;
    this.y += this.distanceY * this.directionY;

    if (this.y <= 0) this.directionY = 1;
    else if (this.y + this.height * this.ratio > canvas.height)
      this.directionY = -1;

    if (this.frame === this.totalFrames) this.frame = 0;

    if (this.x < -this.width * this.ratio) {
      this.isRedundant = true;
    }
  }

  draw() {
    ctx2.fillStyle = `rgb(${this.randomColor})`;
    ctx2.fillRect(
      this.x,
      this.y,
      this.width * this.ratio,
      this.height * this.ratio
    );
    ctx.drawImage(
      this.image,
      this.frame++ * this.width,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width * this.ratio,
      this.height * this.ratio
    );
  }
}

class Explosion {
  constructor(x, y, ratio) {
    this.image = new Image();
    this.image.src = "./image/boom.png";
    this.width = 200;
    this.height = 179;
    this.ratio = ratio;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.totalFrames = 5;
    this.sound = new Audio();
    this.sound.src = "./sound/boom.wav";
    this.sound.volume = 0.25;
    this.counter = 0;
  }

  update() {
    if (!this.frame) this.sound.play();
    this.counter++;
    if (this.counter % 10 === 0) this.frame++;
  }

  draw() {
    console.log("here");
    ctx.drawImage(
      this.image,
      this.frame * this.width,
      0,
      this.width,
      this.height,
      this.x - (this.width * this.ratio) / 2,
      this.y - (this.height * this.ratio) / 2,
      this.width * this.ratio,
      this.height * this.ratio
    );
  }
}

function drawGameOver() {
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText(
    "GAME OVER, your score is " + score,
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.fillStyle = "white";
  ctx.fillText(
    "GAME OVER, your score is " + score,
    canvas.width / 2 + 3,
    canvas.height / 2 + 3
  );
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 50, 75);
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 53, 78);
}

function animate(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx2.clearRect(0, 0, canvas.width, canvas.height);

  if (t - time > timeInerval) {
    ravens.push(new Raven());
    ravens.sort((a, b) => a.ratio - b.ratio);
    time = t;
  }

  drawScore();

  [...ravens].forEach((r) => {
    r.update();
    r.draw();
  });

  [...explosions].forEach((e) => {
    e.update();
    e.draw();
  });

  const redundantRavens = ravens.filter((i) => i.isRedundant);
  ravens = ravens.filter((i) => !i.isRedundant);
  explosions = explosions.filter((i) => i.frame < i.totalFrames);

  // if (redundantRavens.length) gameOver = true;

  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}

animate(0);

window.addEventListener("click", (e) => {
  const pixColor = ctx2.getImageData(e.x, e.y, 1, 1);
  const len = ravens.length;
  ravens = ravens.filter(
    (r) => r.randomColor !== Object.values(pixColor.data).slice(0, 3).toString()
  );

  if (ravens.length !== len) {
    score++;
    explosions.push(new Explosion(e.x, e.y, 0.5));
    drawScore();
  }
});
