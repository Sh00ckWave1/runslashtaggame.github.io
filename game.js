// Get player keybinds from localStorage
let p1Keybinds = {
    up: localStorage.getItem('p1UpKeybind') || 'w',
    down: localStorage.getItem('p1DownKeybind') || 's',
    left: localStorage.getItem('p1LeftKeybind') || 'a',
    right: localStorage.getItem('p1RightKeybind') || 'd',
    speedBoost: localStorage.getItem('p1SpeedBoostKeybind') || 'q',
    superBoost: localStorage.getItem('p1SuperBoostKeybind') || 'e'
};

let p2Keybinds = {
    up: localStorage.getItem('p2UpKeybind') || 'i',
    down: localStorage.getItem('p2DownKeybind') || 'k',
    left: localStorage.getItem('p2LeftKeybind') || 'j',
    right: localStorage.getItem('p2RightKeybind') || 'l',
    speedBoost: localStorage.getItem('p2SpeedBoostKeybind') || 'u',
    superBoost: localStorage.getItem('p2SuperBoostKeybind') || 'o'
};

// Get player settings
let player1Color = localStorage.getItem('player1Color') || '#3b82f6';
let player2Color = localStorage.getItem('player2Color') || '#10b981';
let playerMode = localStorage.getItem('playerMode') || '1';

// Get theme from parent or localStorage
const htmlElement = document.documentElement;
const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);

// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 200; // Account for stats and shop

// Resize canvas on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 200;
});

// Game state
let coins = parseInt(localStorage.getItem('p1Coins') || '0'); // Player 1 coins
let coins2 = parseInt(localStorage.getItem('p2Coins') || '0'); // Player 2 coins
let gameTime = 0;
let gameStartTime = Date.now();
let speedMultiplier = 1.0;
let boostEndTime = 0;
let coinMultiplier = parseFloat(localStorage.getItem('p1CoinMultiplier') || '1.0'); // Player 1 coin multiplier
let coinMultiplier2 = parseFloat(localStorage.getItem('p2CoinMultiplier') || '1.0'); // Player 2 coin multiplier
let gameRunning = true;
let gameStarted = true;
let lastSpawnTime = Date.now();
let spawnInterval = 5000;
let coinsAtGameStart = coins; // Track coins at game start
let coins2AtGameStart = coins2; // Track player 2 coins at game start

// Player 1
const player = {
    x: canvas.width / 3,
    y: canvas.height / 2,
    radius: 15,
    speed: 5,
    color: player1Color
};

// Player 2 (only used in 2-player mode)
const player2 = {
    x: (canvas.width / 3) * 2,
    y: canvas.height / 2,
    radius: 15,
    speed: 5,
    color: player2Color
};

// Enemies array
let enemies = [];

// Obstacles array
let obstacles = [];
let lastObstacleSpawnTime = Date.now();
let obstacleSpawnInterval = 3000; // Spawn obstacle every 3 seconds after 10 seconds

// Function to create a new enemy
function createEnemy() {
    if (!canvas.width || !canvas.height) {
        canvas.width = window.innerWidth || 800;
        canvas.height = window.innerHeight - 200 || 600;
    }
    
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
        case 0: // Top
            x = Math.random() * canvas.width;
            y = -30;
            break;
        case 1: // Right
            x = canvas.width + 30;
            y = Math.random() * canvas.height;
            break;
        case 2: // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + 30;
            break;
        case 3: // Left
            x = -30;
            y = Math.random() * canvas.height;
            break;
    }
    
    return {
        x: x,
        y: y,
        size: 30,
        speed: 2,
        color: '#ef4444',
        spawnTime: Date.now() // For pulsing animation
    };
}

// Function to create a new obstacle
function createObstacle() {
    if (!canvas.width || !canvas.height) {
        canvas.width = window.innerWidth || 800;
        canvas.height = window.innerHeight - 200 || 600;
    }
    
    // Spawn obstacle at random position on screen
    const size = 40 + Math.random() * 30; // Random size between 40-70
    const x = Math.random() * (canvas.width - size) + size / 2;
    const y = Math.random() * (canvas.height - size) + size / 2;
    
    // Random shape type: 'circle', 'square', 'triangle'
    const shapes = ['circle', 'square', 'triangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    return {
        x: x,
        y: y,
        size: size,
        shape: shape,
        color: '#ef4444', // Red color same as enemies
        spawnTime: Date.now() // For pulsing animation
    };
}

// Keys pressed - Dynamic based on keybinds
const keys = {};

// Initialize keys object
function initializeKeys() {
    keys[p1Keybinds.up] = false;
    keys[p1Keybinds.down] = false;
    keys[p1Keybinds.left] = false;
    keys[p1Keybinds.right] = false;
    keys['ArrowUp'] = false;
    keys['ArrowDown'] = false;
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    if (playerMode === 'survive' || playerMode === 'vs') {
        keys[p2Keybinds.up] = false;
        keys[p2Keybinds.down] = false;
        keys[p2Keybinds.left] = false;
        keys[p2Keybinds.right] = false;
    }
}
initializeKeys();

// Event listeners for movement
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const arrowKey = e.key;
    
    // Check for Player 1 boost keybinds
    if (key === p1Keybinds.speedBoost.toLowerCase()) {
        e.preventDefault();
        triggerSpeedBoost();
        return;
    }
    if (key === p1Keybinds.superBoost.toLowerCase()) {
        e.preventDefault();
        triggerSuperBoost();
        return;
    }
    
    // Check for Player 2 boost keybinds (only in 2-player modes)
    if (playerMode === 'survive' || playerMode === 'vs') {
        if (key === p2Keybinds.speedBoost.toLowerCase()) {
            e.preventDefault();
            triggerSpeedBoost();
            return;
        }
        if (key === p2Keybinds.superBoost.toLowerCase()) {
            e.preventDefault();
            triggerSuperBoost();
            return;
        }
    }
    
    // Player 1 movement keys
    if (key === p1Keybinds.up.toLowerCase() || arrowKey === 'ArrowUp') {
        keys[p1Keybinds.up] = true;
        keys['ArrowUp'] = true;
        e.preventDefault();
    }
    if (key === p1Keybinds.down.toLowerCase() || arrowKey === 'ArrowDown') {
        keys[p1Keybinds.down] = true;
        keys['ArrowDown'] = true;
        e.preventDefault();
    }
    if (key === p1Keybinds.left.toLowerCase() || arrowKey === 'ArrowLeft') {
        keys[p1Keybinds.left] = true;
        keys['ArrowLeft'] = true;
        e.preventDefault();
    }
    if (key === p1Keybinds.right.toLowerCase() || arrowKey === 'ArrowRight') {
        keys[p1Keybinds.right] = true;
        keys['ArrowRight'] = true;
        e.preventDefault();
    }
    
    // Player 2 movement keys (only in 2-player modes)
    if (playerMode === 'survive' || playerMode === 'vs') {
        if (key === p2Keybinds.up.toLowerCase()) {
            keys[p2Keybinds.up] = true;
            e.preventDefault();
        }
        if (key === p2Keybinds.down.toLowerCase()) {
            keys[p2Keybinds.down] = true;
            e.preventDefault();
        }
        if (key === p2Keybinds.left.toLowerCase()) {
            keys[p2Keybinds.left] = true;
            e.preventDefault();
        }
        if (key === p2Keybinds.right.toLowerCase()) {
            keys[p2Keybinds.right] = true;
            e.preventDefault();
        }
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    const arrowKey = e.key;
    
    // Player 1 movement keys
    if (key === p1Keybinds.up.toLowerCase() || arrowKey === 'ArrowUp') {
        keys[p1Keybinds.up] = false;
        keys['ArrowUp'] = false;
        e.preventDefault();
    }
    if (key === p1Keybinds.down.toLowerCase() || arrowKey === 'ArrowDown') {
        keys[p1Keybinds.down] = false;
        keys['ArrowDown'] = false;
        e.preventDefault();
    }
    if (key === p1Keybinds.left.toLowerCase() || arrowKey === 'ArrowLeft') {
        keys[p1Keybinds.left] = false;
        keys['ArrowLeft'] = false;
        e.preventDefault();
    }
    if (key === p1Keybinds.right.toLowerCase() || arrowKey === 'ArrowRight') {
        keys[p1Keybinds.right] = false;
        keys['ArrowRight'] = false;
        e.preventDefault();
    }
    
    // Player 2 movement keys (only in 2-player modes)
    if (playerMode === 'survive' || playerMode === 'vs') {
        if (key === p2Keybinds.up.toLowerCase()) {
            keys[p2Keybinds.up] = false;
            e.preventDefault();
        }
        if (key === p2Keybinds.down.toLowerCase()) {
            keys[p2Keybinds.down] = false;
            e.preventDefault();
        }
        if (key === p2Keybinds.left.toLowerCase()) {
            keys[p2Keybinds.left] = false;
            e.preventDefault();
        }
        if (key === p2Keybinds.right.toLowerCase()) {
            keys[p2Keybinds.right] = false;
            e.preventDefault();
        }
    }
});

window.addEventListener('blur', () => {
    // Reset all keys
    Object.keys(keys).forEach(key => {
        keys[key] = false;
    });
});

function updatePlayer() {
    if (!gameRunning || !gameStarted) return;
    
    const currentSpeed = player.speed * speedMultiplier;
    
    // Player 1 movement (using custom keybinds)
    if ((keys[p1Keybinds.up] || keys['ArrowUp']) && player.y - currentSpeed > player.radius) {
        player.y -= currentSpeed;
    }
    if ((keys[p1Keybinds.down] || keys['ArrowDown']) && player.y + currentSpeed < canvas.height - player.radius) {
        player.y += currentSpeed;
    }
    if ((keys[p1Keybinds.left] || keys['ArrowLeft']) && player.x - currentSpeed > player.radius) {
        player.x -= currentSpeed;
    }
    if ((keys[p1Keybinds.right] || keys['ArrowRight']) && player.x + currentSpeed < canvas.width - player.radius) {
        player.x += currentSpeed;
    }
    
    // Player 2 movement (using custom keybinds) - only in 2-player modes
    if (playerMode === 'survive' || playerMode === 'vs') {
        if (keys[p2Keybinds.up] && player2.y - currentSpeed > player2.radius) {
            player2.y -= currentSpeed;
        }
        if (keys[p2Keybinds.down] && player2.y + currentSpeed < canvas.height - player2.radius) {
            player2.y += currentSpeed;
        }
        if (keys[p2Keybinds.left] && player2.x - currentSpeed > player2.radius) {
            player2.x -= currentSpeed;
        }
        if (keys[p2Keybinds.right] && player2.x + currentSpeed < canvas.width - player2.radius) {
            player2.x += currentSpeed;
        }
    }
}

function spawnEnemies() {
    const now = Date.now();
    const timeSinceLastSpawn = now - lastSpawnTime;
    const timeElapsed = Math.floor((now - gameStartTime) / 1000);
    spawnInterval = Math.max(1000, 5000 - (timeElapsed * 50));
    
    if (timeSinceLastSpawn >= spawnInterval) {
        enemies.push(createEnemy());
        lastSpawnTime = now;
    }
}

// Spawn obstacles after 10 seconds
function spawnObstacles() {
    const now = Date.now();
    const timeElapsed = Math.floor((now - gameStartTime) / 1000);
    
    // Only spawn obstacles after 10 seconds
    if (timeElapsed >= 10) {
        const timeSinceLastObstacle = now - lastObstacleSpawnTime;
        
        if (timeSinceLastObstacle >= obstacleSpawnInterval) {
            obstacles.push(createObstacle());
            lastObstacleSpawnTime = now;
        }
    }
}

function updateEnemies() {
    const timeElapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    // Enemy speed scaling: 15s = 1.5x, 25s = 2.5x, 35s = 3x
    let enemySpeedMultiplier = 1.0;
    if (timeElapsed >= 35) {
        enemySpeedMultiplier = 3.0;
    } else if (timeElapsed >= 25) {
        enemySpeedMultiplier = 2.5;
    } else if (timeElapsed >= 15) {
        enemySpeedMultiplier = 1.5;
    }
    
    enemies.forEach(enemy => {
        // In 2-player modes, enemies chase the closest player
        let targetX, targetY;
        if (playerMode === 'survive' || playerMode === 'vs') {
            const distToPlayer1 = Math.sqrt(Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2));
            const distToPlayer2 = Math.sqrt(Math.pow(player2.x - enemy.x, 2) + Math.pow(player2.y - enemy.y, 2));
            if (distToPlayer1 < distToPlayer2) {
                targetX = player.x;
                targetY = player.y;
            } else {
                targetX = player2.x;
                targetY = player2.y;
            }
        } else {
            targetX = player.x;
            targetY = player.y;
        }
        
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const currentEnemySpeed = enemy.speed * enemySpeedMultiplier;
            enemy.x += (dx / distance) * currentEnemySpeed;
            enemy.y += (dy / distance) * currentEnemySpeed;
        }
        
        enemy.x = Math.max(-enemy.size, Math.min(canvas.width + enemy.size, enemy.x));
        enemy.y = Math.max(-enemy.size, Math.min(canvas.height + enemy.size, enemy.y));
    });
}

function checkCollision(checkPlayer, checkPlayer2 = null) {
    const playersToCheck = checkPlayer2 ? [checkPlayer, checkPlayer2] : [checkPlayer];
    
    for (let currentPlayer of playersToCheck) {
        // Check collision with enemies
        for (let enemy of enemies) {
            const closestX = Math.max(enemy.x - enemy.size / 2, Math.min(currentPlayer.x, enemy.x + enemy.size / 2));
            const closestY = Math.max(enemy.y - enemy.size / 2, Math.min(currentPlayer.y, enemy.y + enemy.size / 2));
            
            const distanceToClosest = Math.sqrt(
                Math.pow(currentPlayer.x - closestX, 2) + Math.pow(currentPlayer.y - closestY, 2)
            );
            
            if (distanceToClosest < currentPlayer.radius) {
                return true;
            }
        }
        
        // Check collision with obstacles (handle different shapes)
        for (let obstacle of obstacles) {
            let distanceToClosest;
            
            if (obstacle.shape === 'circle') {
                const dx = currentPlayer.x - obstacle.x;
                const dy = currentPlayer.y - obstacle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                distanceToClosest = distance - (obstacle.size / 2);
            } else if (obstacle.shape === 'triangle') {
                const dx = currentPlayer.x - obstacle.x;
                const dy = currentPlayer.y - obstacle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                distanceToClosest = distance - (obstacle.size / 2);
            } else {
                const closestX = Math.max(obstacle.x - obstacle.size / 2, Math.min(currentPlayer.x, obstacle.x + obstacle.size / 2));
                const closestY = Math.max(obstacle.y - obstacle.size / 2, Math.min(currentPlayer.y, obstacle.y + obstacle.size / 2));
                distanceToClosest = Math.sqrt(
                    Math.pow(currentPlayer.x - closestX, 2) + Math.pow(currentPlayer.y - closestY, 2)
                );
            }
            
            if (distanceToClosest < currentPlayer.radius) {
                return true;
            }
        }
    }
    
    return false;
}

function updateCoins() {
    const currentTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const coinsEarnedThisSession = Math.floor(currentTime * coinMultiplier);
    coins = coinsAtGameStart + coinsEarnedThisSession;
    gameTime = currentTime;
    
    // Update player 2 coins if in 2-player mode
    if (playerMode === 'survive' || playerMode === 'vs') {
        const coins2EarnedThisSession = Math.floor(currentTime * coinMultiplier2);
        coins2 = coins2AtGameStart + coins2EarnedThisSession;
        localStorage.setItem('p2Coins', coins2.toString());
        document.getElementById('coins2').textContent = coins2;
    }
    
    // Save coins to localStorage continuously
    localStorage.setItem('p1Coins', coins.toString());
    // Update display
    document.getElementById('coins').textContent = coins;
}

function updateSpeedMultiplier() {
    const now = Date.now();
    if (now < boostEndTime) {
        // Boost is active
    } else {
        speedMultiplier = 1.0;
    }
}

function draw() {
    const isDark = htmlElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#2a2a2a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const now = Date.now();
    
    // Draw obstacles with pulsing effect
    obstacles.forEach(obstacle => {
        // Calculate pulse effect (0.8 to 1.0 scale)
        const pulseSpeed = 0.003; // Speed of pulse
        const pulseAmount = 0.2; // Amount of pulse (20%)
        const pulse = 0.8 + (Math.sin((now - obstacle.spawnTime) * pulseSpeed) * 0.5 + 0.5) * pulseAmount;
        const currentSize = obstacle.size * pulse;
        
        // Calculate pulsing color intensity
        const colorPulse = 0.7 + (Math.sin((now - obstacle.spawnTime) * pulseSpeed) * 0.5 + 0.5) * 0.3;
        const r = Math.floor(239 * colorPulse); // Red component
        const g = Math.floor(68 * colorPulse);  // Green component
        const b = Math.floor(68 * colorPulse);  // Blue component
        const pulseColor = `rgb(${r}, ${g}, ${b})`;
        
        ctx.fillStyle = pulseColor;
        ctx.save();
        ctx.translate(obstacle.x, obstacle.y);
        
        if (obstacle.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, currentSize / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (obstacle.shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(0, -currentSize / 2);
            ctx.lineTo(-currentSize / 2, currentSize / 2);
            ctx.lineTo(currentSize / 2, currentSize / 2);
            ctx.closePath();
            ctx.fill();
        } else {
            // Square
            ctx.fillRect(-currentSize / 2, -currentSize / 2, currentSize, currentSize);
        }
        
        ctx.restore();
    });
    
    // Draw enemies with pulsing effect
    enemies.forEach(enemy => {
        // Calculate pulse effect
        const pulseSpeed = 0.003;
        const pulseAmount = 0.2;
        const pulse = 0.8 + (Math.sin((now - enemy.spawnTime) * pulseSpeed) * 0.5 + 0.5) * pulseAmount;
        const currentSize = enemy.size * pulse;
        
        // Calculate pulsing color intensity
        const colorPulse = 0.7 + (Math.sin((now - enemy.spawnTime) * pulseSpeed) * 0.5 + 0.5) * 0.3;
        const r = Math.floor(239 * colorPulse);
        const g = Math.floor(68 * colorPulse);
        const b = Math.floor(68 * colorPulse);
        const pulseColor = `rgb(${r}, ${g}, ${b})`;
        
        ctx.fillStyle = pulseColor;
        ctx.fillRect(
            enemy.x - currentSize / 2,
            enemy.y - currentSize / 2,
            currentSize,
            currentSize
        );
    });
    
    // Draw player 1
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player 2 (only in 2-player modes)
    if (playerMode === 'survive' || playerMode === 'vs') {
        ctx.fillStyle = player2.color;
        ctx.beginPath();
        ctx.arc(player2.x, player2.y, player2.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const isDarkTheme = htmlElement.getAttribute('data-theme') === 'dark';
    
    if (speedMultiplier > 1.0) {
        if (now < boostEndTime) {
            const timeLeft = Math.ceil((boostEndTime - now) / 1000);
            ctx.fillStyle = isDarkTheme ? '#ffffff' : '#000000';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`BOOST: ${timeLeft}s`, canvas.width / 2, 40);
        }
    }
}

function triggerSpeedBoost() {
    if (coins >= 10 && gameRunning) {
        coins -= 10;
        coinsAtGameStart = coins; // Update base coins
        speedMultiplier = 2.0;
        boostEndTime = Date.now() + 15000;
        localStorage.setItem('p1Coins', coins.toString());
        document.getElementById('coins').textContent = coins;
    }
}

function triggerSuperBoost() {
    if (coins >= 25 && gameRunning) {
        coins -= 25;
        coinsAtGameStart = coins; // Update base coins
        speedMultiplier = 5.0;
        boostEndTime = Date.now() + 5000;
        localStorage.setItem('p1Coins', coins.toString());
        document.getElementById('coins').textContent = coins;
    }
}

function triggerCoinBoost(multiplier, cost, playerNum = 1) {
    const currentCoins = playerNum === 1 ? coins : coins2;
    const currentMultiplier = playerNum === 1 ? coinMultiplier : coinMultiplier2;
    
    if (currentCoins >= cost && gameRunning) {
        if (playerNum === 1) {
            coins -= cost;
            coinsAtGameStart = coins;
            coinMultiplier = multiplier;
            localStorage.setItem('p1Coins', coins.toString());
            localStorage.setItem('p1CoinMultiplier', coinMultiplier.toString());
            document.getElementById('coins').textContent = coins;
        } else {
            coins2 -= cost;
            coins2AtGameStart = coins2;
            coinMultiplier2 = multiplier;
            localStorage.setItem('p2Coins', coins2.toString());
            localStorage.setItem('p2CoinMultiplier', coinMultiplier2.toString());
            document.getElementById('coins2').textContent = coins2;
        }
        updateCoinBoostButtons();
    }
}

// Speed Boost button
document.getElementById('speedBoostBtn').addEventListener('click', triggerSpeedBoost);

// Super Boost button
document.getElementById('superBoostBtn').addEventListener('click', triggerSuperBoost);

// Coin Boost buttons - separate for each player
function updateCoinBoostButtons() {
    // Player 1 coin boost buttons
    document.getElementById('coinBoost1Btn').disabled = coins < 20 || coinMultiplier >= 1.5;
    document.getElementById('coinBoost2Btn').disabled = coins < 30 || coinMultiplier >= 2.5;
    document.getElementById('coinBoost3Btn').disabled = coins < 50 || coinMultiplier >= 3.5;
    document.getElementById('coinBoost4Btn').disabled = coins < 100 || coinMultiplier >= 4.0;
    
    // Player 2 coin boost buttons (only update if in 2-player mode)
    if (playerMode === 'survive' || playerMode === 'vs') {
        document.getElementById('coinBoost2_1Btn').disabled = coins2 < 20 || coinMultiplier2 >= 1.5;
        document.getElementById('coinBoost2_2Btn').disabled = coins2 < 30 || coinMultiplier2 >= 2.5;
        document.getElementById('coinBoost2_3Btn').disabled = coins2 < 50 || coinMultiplier2 >= 3.5;
        document.getElementById('coinBoost2_4Btn').disabled = coins2 < 100 || coinMultiplier2 >= 4.0;
    }
}

// Player 1 coin boost buttons
document.getElementById('coinBoost1Btn').addEventListener('click', () => triggerCoinBoost(1.5, 20, 1));
document.getElementById('coinBoost2Btn').addEventListener('click', () => triggerCoinBoost(2.5, 30, 1));
document.getElementById('coinBoost3Btn').addEventListener('click', () => triggerCoinBoost(3.5, 50, 1));
document.getElementById('coinBoost4Btn').addEventListener('click', () => triggerCoinBoost(4.0, 100, 1));

// Player 2 coin boost buttons
document.getElementById('coinBoost2_1Btn').addEventListener('click', () => triggerCoinBoost(1.5, 20, 2));
document.getElementById('coinBoost2_2Btn').addEventListener('click', () => triggerCoinBoost(2.5, 30, 2));
document.getElementById('coinBoost2_3Btn').addEventListener('click', () => triggerCoinBoost(3.5, 50, 2));
document.getElementById('coinBoost2_4Btn').addEventListener('click', () => triggerCoinBoost(4.0, 100, 2));

function updateShopButtons() {
    const speedBtn = document.getElementById('speedBoostBtn');
    const superBtn = document.getElementById('superBoostBtn');
    
    speedBtn.disabled = coins < 10 || !gameRunning;
    superBtn.disabled = coins < 25 || !gameRunning;
    
    // Update coin boost buttons (only visible in modal)
    updateCoinBoostButtons();
}

// Game Over Modal Functions
function showGameOverModal(title, message) {
    const modal = document.getElementById('gameOverModal');
    const titleElement = document.getElementById('gameOverTitle');
    const messageElement = document.getElementById('gameOverMessage');
    const player2CoinBoostSection = document.getElementById('player2CoinBoostSection');
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // Show/hide player 2 coin boost section based on game mode
    if (playerMode === 'survive' || playerMode === 'vs') {
        player2CoinBoostSection.style.display = 'block';
    } else {
        player2CoinBoostSection.style.display = 'none';
    }
    
    // Update coin boost buttons for both players
    updateCoinBoostButtons();
    
    modal.style.display = 'flex';
}

function hideGameOverModal() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'none';
}

// Restart button functionality
document.getElementById('restartBtn').addEventListener('click', () => {
    hideGameOverModal();
    resetGame();
    gameRunning = true;
    gameStarted = true;
    gameLoop();
});

// Menu button functionality
document.getElementById('menuBtn').addEventListener('click', () => {
    // Save coins before going back to menu
    localStorage.setItem('gameCoins', coins.toString());
    // Reset coins when going back to menu
    localStorage.removeItem('gameCoins');
    localStorage.removeItem('coinMultiplier');
    if (window.opener) {
        window.close();
    } else {
        window.location.href = 'index.html';
    }
});

function resetGame() {
    // Update keybinds from localStorage
    p1Keybinds = {
        up: localStorage.getItem('p1UpKeybind') || 'w',
        down: localStorage.getItem('p1DownKeybind') || 's',
        left: localStorage.getItem('p1LeftKeybind') || 'a',
        right: localStorage.getItem('p1RightKeybind') || 'd',
        speedBoost: localStorage.getItem('p1SpeedBoostKeybind') || 'q',
        superBoost: localStorage.getItem('p1SuperBoostKeybind') || 'e'
    };
    
    p2Keybinds = {
        up: localStorage.getItem('p2UpKeybind') || 'i',
        down: localStorage.getItem('p2DownKeybind') || 'k',
        left: localStorage.getItem('p2LeftKeybind') || 'j',
        right: localStorage.getItem('p2RightKeybind') || 'l',
        speedBoost: localStorage.getItem('p2SpeedBoostKeybind') || 'u',
        superBoost: localStorage.getItem('p2SuperBoostKeybind') || 'o'
    };
    
    // Update player colors from localStorage
    player1Color = localStorage.getItem('player1Color') || '#3b82f6';
    player2Color = localStorage.getItem('player2Color') || '#10b981';
    player.color = player1Color;
    player2.color = player2Color;
    
    // Update player mode
    playerMode = localStorage.getItem('playerMode') || '1';
    
    // Load coins and coin multiplier from localStorage
    coins = parseInt(localStorage.getItem('p1Coins') || '0');
    coins2 = parseInt(localStorage.getItem('p2Coins') || '0');
    coinMultiplier = parseFloat(localStorage.getItem('p1CoinMultiplier') || '1.0');
    coinMultiplier2 = parseFloat(localStorage.getItem('p2CoinMultiplier') || '1.0');
    coinsAtGameStart = coins; // Set base coins for this game session
    coins2AtGameStart = coins2; // Set base coins for player 2
    
    // Update UI based on player mode
    if (playerMode === 'survive' || playerMode === 'vs') {
        document.getElementById('coinsLabel').textContent = 'P1 Coins:';
        document.getElementById('player2CoinsStat').style.display = 'flex';
    } else {
        document.getElementById('coinsLabel').textContent = 'Coins:';
        document.getElementById('player2CoinsStat').style.display = 'none';
    }
    
    // Reinitialize keys
    initializeKeys();
    
    // Position players
    if (playerMode === 'survive' || playerMode === 'vs') {
        player.x = canvas.width / 3;
        player2.x = (canvas.width / 3) * 2;
    } else {
        player.x = canvas.width / 2;
    }
    player.y = canvas.height / 2;
    player2.y = canvas.height / 2;
    
    enemies = [];
    obstacles = [];
    enemies.push(createEnemy());
    gameStartTime = Date.now();
    lastSpawnTime = Date.now();
    lastObstacleSpawnTime = Date.now();
    spawnInterval = 5000;
    obstacleSpawnInterval = 3000;
    gameTime = 0;
    speedMultiplier = 1.0;
    boostEndTime = 0;
    gameRunning = true;
    
    // Update coin display
    document.getElementById('coins').textContent = coins;
    document.getElementById('coins2').textContent = coins2;
    
    // Update coin boost buttons
    updateCoinBoostButtons();
}

function gameLoop() {
    if (!gameRunning || !gameStarted) return;
    
    updatePlayer();
    spawnEnemies();
    spawnObstacles();
    updateEnemies();
    updateCoins();
    updateSpeedMultiplier();
    
    document.getElementById('time').textContent = `${gameTime}s`;
    document.getElementById('speed').textContent = `${speedMultiplier.toFixed(1)}x`;
    // Coins display is updated in updateCoins()
    
    // Check collision based on game mode
    const collisionPlayer1 = checkCollision(player);
    const collisionPlayer2 = (playerMode === 'survive' || playerMode === 'vs') ? checkCollision(player2) : false;
    
    if (playerMode === '1') {
        // 1 Player mode - single player dies
        if (collisionPlayer1) {
            gameRunning = false;
            gameStarted = false;
            const finalCoins = coins;
            const finalTime = gameTime;
            draw();
            setTimeout(() => {
                showGameOverModal('You Died!', `You survived ${finalTime} seconds and earned ${finalCoins} coins!`);
            }, 100);
            return;
        }
    } else if (playerMode === 'survive') {
        // Survive Together mode - if one dies, both are eliminated
        if (collisionPlayer1 || collisionPlayer2) {
            gameRunning = false;
            gameStarted = false;
            const finalCoins = coins;
            const finalTime = gameTime;
            draw();
            setTimeout(() => {
                showGameOverModal('Both Players Died!', `You survived ${finalTime} seconds and earned ${finalCoins} coins!`);
            }, 100);
            return;
        }
    } else if (playerMode === 'vs') {
        // VS mode - if one dies, the other wins
        if (collisionPlayer1 && !collisionPlayer2) {
            // Player 2 wins
            gameRunning = false;
            gameStarted = false;
            const finalCoins = coins;
            const finalTime = gameTime;
            draw();
            setTimeout(() => {
                showGameOverModal('Player 2 Wins!', `The game lasted ${finalTime} seconds. Both players earned ${finalCoins} coins!`);
            }, 100);
            return;
        } else if (collisionPlayer2 && !collisionPlayer1) {
            // Player 1 wins
            gameRunning = false;
            gameStarted = false;
            const finalCoins = coins;
            const finalTime = gameTime;
            draw();
            setTimeout(() => {
                showGameOverModal('Player 1 Wins!', `The game lasted ${finalTime} seconds. Both players earned ${finalCoins} coins!`);
            }, 100);
            return;
        } else if (collisionPlayer1 && collisionPlayer2) {
            // Both die at the same time - tie
            gameRunning = false;
            gameStarted = false;
            const finalCoins = coins;
            const finalTime = gameTime;
            draw();
            setTimeout(() => {
                showGameOverModal('Tie!', `Both players died at the same time! The game lasted ${finalTime} seconds. Both players earned ${finalCoins} coins!`);
            }, 100);
            return;
        }
    }
    
    draw();
    updateShopButtons();
    requestAnimationFrame(gameLoop);
}

// Listen for keybind updates from parent
window.addEventListener('storage', (e) => {
    if (e.key === 'speedBoostKeybind') {
        speedBoostKeybind = e.newValue || 'q';
    }
    if (e.key === 'superBoostKeybind') {
        superBoostKeybind = e.newValue || 'e';
    }
});

// Start game
resetGame();
hideGameOverModal(); // Ensure modal is hidden on start
gameLoop();

setInterval(() => {
    if (gameStarted) {
        updateShopButtons();
    }
}, 100);

