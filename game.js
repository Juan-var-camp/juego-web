const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const liverImg = new Image();
liverImg.src = "assets/higado.png";

const toxinImg = new Image();
toxinImg.src = "assets/toxina.png";

let gameState = "start";
let startTime = 0;

const player = {
  x: 160,
  y: 340,
  width: 80,
  height: 60,
  speed: 7
};

let obstacles = [];
let obstacleSpeed = 2;
let spawnRate = 70;
let frame = 0;
let score = 0;

function spawnObstacle() {
  obstacles.push({
    x: Math.random() * (canvas.width - 40),
    y: -40,
    width: 40,
    height: 40
  });
}

let keys = {};
let secretCodeSequence = [];
const secretCode = ["w", "i", "n"];

window.addEventListener("keydown", e => {
  keys[e.key] = true;
  
  // Pa ganar rapido WIN
  secretCodeSequence.push(e.key.toLowerCase());
  if (secretCodeSequence.length > 3) {
    secretCodeSequence.shift();
  }
  
  // Verificar si se ingresó la combinación
  if (secretCodeSequence.join("") === secretCode.join("") && gameState === "playing") {
    gameState = "win";
  }
});
window.addEventListener("keyup", e => keys[e.key] = false);

function collide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawPlayer() {
  ctx.drawImage(liverImg, player.x, player.y, player.width, player.height);
}

function drawObstacles() {
  obstacles.forEach(o =>
    ctx.drawImage(toxinImg, o.x, o.y, o.width, o.height)
  );
}

function drawText(text) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function updateTime() {
  const elapsed = Math.floor((performance.now() - startTime) / 1000);
  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "left";
  ctx.fillText("⏱ Tiempo: " + elapsed + "s", 10, 25);
  ctx.fillText("🛡 Esquivados: " + score, 10, 50);
  
  // Aqui se ajusta la dificultad
  if (elapsed < 15) {
    // Primeros 15 segundos: chill
    obstacleSpeed = 2 + elapsed * 0.08;
    spawnRate = Math.max(45, 70 - elapsed * 0.5);
  } else {
    // Después de 15 segundos: Se puede ganar
    const difficultyPhase = elapsed - 15;
    obstacleSpeed = 2.8 + difficultyPhase * 0.25;  
    spawnRate = Math.max(25, 45 - difficultyPhase); 
  }
}

function loop() {
  requestAnimationFrame(loop);

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (gameState === "start") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Salva al Hígado", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = "18px Arial";
    ctx.fillText("Esquiva las cervezas durante 30 segundos", canvas.width / 2, canvas.height / 2 + 30);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffff00";
    ctx.fillText("Presiona ESPACIO para empezar", canvas.width / 2, canvas.height / 2 + 70);
  }

  if (gameState === "playing") {
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;
    
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    frame++;
    if (frame % spawnRate === 0) spawnObstacle();

    obstacles.forEach(o => o.y += obstacleSpeed);
    
    obstacles = obstacles.filter(o => {
      if (o.y > canvas.height) {
        score++;
        return false;
      }
      return true;
    });

    for (let o of obstacles) {
      if (collide(player, o)) gameState = "gameover";
    }
    
    if ((performance.now() - startTime) / 1000 > 30) {
      gameState = "win";
    }

    updateTime();
    drawPlayer();
    drawObstacles();
  }

  if (gameState === "win") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("¡GANASTE!", canvas.width / 2, canvas.height / 2 - 100);
    ctx.fillText("Has salvado el hígado", canvas.width / 2, canvas.height / 2 - 60);
    
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#ffff00";
    ctx.fillText("Ahora puedes saber quien soy:", canvas.width / 2, canvas.height / 2 - 15);
    
    ctx.font = "18px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Nicolle Perez tengo 18 años", canvas.width / 2, canvas.height / 2 + 15);
    ctx.fillText("De Cucuta", canvas.width / 2, canvas.height / 2 + 40);
    
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#ffff00";
    ctx.fillText("Cervezas esquivadas: " + score, canvas.width / 2, canvas.height / 2 + 75);
    
    ctx.fillStyle = "#00ff88";
    ctx.font = "16px Arial";
    ctx.fillText("Presiona ESPACIO para reintentar", canvas.width / 2, canvas.height / 2 + 110);
  }

  if (gameState === "gameover") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ff4444";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("¡Daño hepático crítico!", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = "18px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Sigue intentandolo para conocerme", canvas.width / 2, canvas.height / 2 - 15);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#ffff00";
    ctx.fillText("Cervezas esquivadas: " + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText("Presiona ESPACIO para reintentar", canvas.width / 2, canvas.height / 2 + 60);
  }
}

loop();

window.addEventListener("keydown", e => {
  if (e.key === " " && gameState !== "playing") {
    reset();
  }
});

function reset() {
  obstacles = [];
  frame = 0;
  score = 0;
  obstacleSpeed = 2;
  spawnRate = 70;
  startTime = performance.now();
  gameState = "playing";
}
