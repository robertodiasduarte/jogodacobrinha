// Configuração do Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tamanho de cada célula do grid
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Variáveis do jogo
let snake = [
    { x: 10, y: 10 }
];
let velocityX = 0;
let velocityY = 0;
let foodX = 15;
let foodY = 15;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let gameSpeed = 100;
let isPaused = false;
let gameStarted = false;

// Elementos do DOM
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Atualizar display do recorde
highScoreElement.textContent = highScore;

// Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

// Controles do teclado
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    if (!gameStarted) return;

    switch(e.key) {
        case 'ArrowUp':
            if (velocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case 'ArrowDown':
            if (velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
        case 'ArrowLeft':
            if (velocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case 'ArrowRight':
            if (velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
            }
            break;
        case ' ':
            togglePause();
            break;
    }
}

function startGame() {
    // Resetar jogo
    snake = [{ x: 10, y: 10 }];
    velocityX = 0;
    velocityY = 0;
    score = 0;
    gameSpeed = 100;
    isPaused = false;
    gameStarted = true;

    scoreElement.textContent = score;
    startBtn.textContent = 'Reiniciar';
    pauseBtn.disabled = false;

    // Gerar primeira comida
    generateFood();

    // Iniciar loop do jogo
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, gameSpeed);
}

function togglePause() {
    if (!gameStarted) return;

    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Continuar' : 'Pausar';

    if (isPaused) {
        clearInterval(gameLoop);
    } else {
        gameLoop = setInterval(updateGame, gameSpeed);
    }
}

function updateGame() {
    if (isPaused) return;

    // Não atualizar se a cobra ainda não começou a se mover
    if (velocityX === 0 && velocityY === 0) return;

    // Mover a cobra
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };

    // Verificar colisão com paredes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Verificar colisão consigo mesma
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // Adicionar nova cabeça
    snake.unshift(head);

    // Verificar se comeu a comida
    if (head.x === foodX && head.y === foodY) {
        score++;
        scoreElement.textContent = score;

        // Atualizar recorde
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        // Aumentar velocidade a cada 5 pontos
        if (score % 5 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameLoop);
            gameLoop = setInterval(updateGame, gameSpeed);
        }

        generateFood();
    } else {
        // Remover cauda
        snake.pop();
    }

    // Desenhar jogo
    draw();
}

function generateFood() {
    // Gerar comida em posição aleatória que não esteja na cobra
    do {
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
    } while (snake.some(segment => segment.x === foodX && segment.y === foodY));
}

function draw() {
    // Limpar canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar grid
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Desenhar cobra
    snake.forEach((segment, index) => {
        // Cabeça é mais clara
        if (index === 0) {
            ctx.fillStyle = '#4CAF50';
        } else {
            ctx.fillStyle = '#45a049';
        }

        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );

        // Adicionar brilho na cabeça
        if (index === 0) {
            ctx.fillStyle = '#81C784';
            ctx.fillRect(
                segment.x * gridSize + 4,
                segment.y * gridSize + 4,
                gridSize / 2,
                gridSize / 2
            );
        }
    });

    // Desenhar comida
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(
        foodX * gridSize + gridSize / 2,
        foodY * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Adicionar brilho na comida
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        foodX * gridSize + gridSize / 2 - 3,
        foodY * gridSize + gridSize / 2 - 3,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    pauseBtn.disabled = true;
    startBtn.textContent = 'Jogar Novamente';

    // Desenhar mensagem de game over
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '20px Arial';
    ctx.fillText(`Pontuação: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

    if (score === highScore && score > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.fillText('NOVO RECORDE!', canvas.width / 2, canvas.height / 2 + 50);
    }
}

// Desenhar tela inicial
draw();
ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = '#4CAF50';
ctx.font = 'bold 30px Arial';
ctx.textAlign = 'center';
ctx.fillText('Jogo da Cobrinha', canvas.width / 2, canvas.height / 2 - 20);

ctx.fillStyle = '#fff';
ctx.font = '16px Arial';
ctx.fillText('Clique em "Iniciar Jogo" para começar', canvas.width / 2, canvas.height / 2 + 20);
