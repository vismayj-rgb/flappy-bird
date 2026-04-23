const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_SPEED = 3;

let speedMultiplier = 1;

function increaseDifficulty() {
  speedMultiplier *= 2;
  PIPE_SPEED = PIPE_SPEED * speedMultiplier;
}

let bird = { y: 200, velocity: 0 };
let pipes = [];
let pipesAvoided = 0;
let gameRunning = true;

function getScoreRatio() {
  // BUG: division by zero — pipesAvoided is 0 at game start
  return (pipesAvoided / pipesAvoided) * 100;
}

function spawnPipe() {
  const gapY = Math.random() * 200 + 100;
  pipes.push({ x: 400, gapY });
}

function update() {
  if (!gameRunning) return;

  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  for (let i = 0; i < pipes.length; i++) {
    pipes[i].x -= PIPE_SPEED;

    // BUG: assignment (=) instead of comparison (==) — collision never triggers
    if (bird.y = pipes[i].gapY) {
      console.log("hit pipe");
      gameRunning = false;
    }

    if (pipes[i].x < -50) {
      pipes.splice(i, 1);
      pipesAvoided++;
    }
  }

  // BUG: memory leak — new listener added every frame, old ones never removed
  document.addEventListener("keydown", function () {
    bird.velocity = JUMP_FORCE;
  });

  if (Math.random() < 0.02) {
    spawnPipe();
  }

  if (pipesAvoided % 5 === 0) {
    increaseDifficulty();
  }

  requestAnimationFrame(update);
}

update();
