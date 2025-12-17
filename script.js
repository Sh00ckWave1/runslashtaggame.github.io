// Dark Mode Toggle Functionality
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);
darkModeToggle.checked = currentTheme === 'dark';

// Toggle dark mode
darkModeToggle.addEventListener('change', function() {
    if (this.checked) {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// Player Color Management
const player1ColorPicker = document.getElementById('player1ColorPicker');
const player2ColorPicker = document.getElementById('player2ColorPicker');
let player1Color = localStorage.getItem('player1Color') || '#3b82f6';
let player2Color = localStorage.getItem('player2Color') || '#10b981';
player1ColorPicker.value = player1Color;
player2ColorPicker.value = player2Color;

player1ColorPicker.addEventListener('change', (e) => {
    player1Color = e.target.value;
    localStorage.setItem('player1Color', player1Color);
});

player2ColorPicker.addEventListener('change', (e) => {
    player2Color = e.target.value;
    localStorage.setItem('player2Color', player2Color);
});

// Player Mode Management
const onePlayerBtn = document.getElementById('onePlayerBtn');
const surviveTogetherBtn = document.getElementById('surviveTogetherBtn');
const vsBtn = document.getElementById('vsBtn');
const player2Settings = document.getElementById('player2Settings');
let playerMode = localStorage.getItem('playerMode') || '1';

// Set initial mode
function setModeButtons(mode) {
    onePlayerBtn.classList.remove('active');
    surviveTogetherBtn.classList.remove('active');
    vsBtn.classList.remove('active');
    
    if (mode === '1') {
        onePlayerBtn.classList.add('active');
        player2Settings.style.display = 'none';
        document.getElementById('displayPlayer2').style.display = 'none';
    } else if (mode === 'survive' || mode === 'vs') {
        if (mode === 'survive') {
            surviveTogetherBtn.classList.add('active');
        } else {
            vsBtn.classList.add('active');
        }
        player2Settings.style.display = 'block';
        document.getElementById('displayPlayer2').style.display = 'block';
    }
}

setModeButtons(playerMode);

onePlayerBtn.addEventListener('click', () => {
    playerMode = '1';
    localStorage.setItem('playerMode', '1');
    setModeButtons('1');
});

surviveTogetherBtn.addEventListener('click', () => {
    playerMode = 'survive';
    localStorage.setItem('playerMode', 'survive');
    setModeButtons('survive');
});

vsBtn.addEventListener('click', () => {
    playerMode = 'vs';
    localStorage.setItem('playerMode', 'vs');
    setModeButtons('vs');
});

// Keybind Management - Player 1
let p1Keybinds = {
    up: localStorage.getItem('p1UpKeybind') || 'w',
    down: localStorage.getItem('p1DownKeybind') || 's',
    left: localStorage.getItem('p1LeftKeybind') || 'a',
    right: localStorage.getItem('p1RightKeybind') || 'd',
    speedBoost: localStorage.getItem('p1SpeedBoostKeybind') || 'q',
    superBoost: localStorage.getItem('p1SuperBoostKeybind') || 'e'
};

// Keybind Management - Player 2
let p2Keybinds = {
    up: localStorage.getItem('p2UpKeybind') || 'i',
    down: localStorage.getItem('p2DownKeybind') || 'k',
    left: localStorage.getItem('p2LeftKeybind') || 'j',
    right: localStorage.getItem('p2RightKeybind') || 'l',
    speedBoost: localStorage.getItem('p2SpeedBoostKeybind') || 'u',
    superBoost: localStorage.getItem('p2SuperBoostKeybind') || 'o'
};

// Update keybind displays
function updateKeybindDisplays() {
    // Update button displays
    document.getElementById('p1UpKeybindDisplay').textContent = p1Keybinds.up.toUpperCase();
    document.getElementById('p1DownKeybindDisplay').textContent = p1Keybinds.down.toUpperCase();
    document.getElementById('p1LeftKeybindDisplay').textContent = p1Keybinds.left.toUpperCase();
    document.getElementById('p1RightKeybindDisplay').textContent = p1Keybinds.right.toUpperCase();
    document.getElementById('p1SpeedBoostKeybindDisplay').textContent = p1Keybinds.speedBoost.toUpperCase();
    document.getElementById('p1SuperBoostKeybindDisplay').textContent = p1Keybinds.superBoost.toUpperCase();
    
    document.getElementById('p2UpKeybindDisplay').textContent = p2Keybinds.up.toUpperCase();
    document.getElementById('p2DownKeybindDisplay').textContent = p2Keybinds.down.toUpperCase();
    document.getElementById('p2LeftKeybindDisplay').textContent = p2Keybinds.left.toUpperCase();
    document.getElementById('p2RightKeybindDisplay').textContent = p2Keybinds.right.toUpperCase();
    document.getElementById('p2SpeedBoostKeybindDisplay').textContent = p2Keybinds.speedBoost.toUpperCase();
    document.getElementById('p2SuperBoostKeybindDisplay').textContent = p2Keybinds.superBoost.toUpperCase();
    
    // Update current keybind display section
    document.getElementById('displayP1Up').textContent = p1Keybinds.up.toUpperCase();
    document.getElementById('displayP1Down').textContent = p1Keybinds.down.toUpperCase();
    document.getElementById('displayP1Left').textContent = p1Keybinds.left.toUpperCase();
    document.getElementById('displayP1Right').textContent = p1Keybinds.right.toUpperCase();
    document.getElementById('displayP1SpeedBoost').textContent = p1Keybinds.speedBoost.toUpperCase();
    document.getElementById('displayP1SuperBoost').textContent = p1Keybinds.superBoost.toUpperCase();
    
    document.getElementById('displayP2Up').textContent = p2Keybinds.up.toUpperCase();
    document.getElementById('displayP2Down').textContent = p2Keybinds.down.toUpperCase();
    document.getElementById('displayP2Left').textContent = p2Keybinds.left.toUpperCase();
    document.getElementById('displayP2Right').textContent = p2Keybinds.right.toUpperCase();
    document.getElementById('displayP2SpeedBoost').textContent = p2Keybinds.speedBoost.toUpperCase();
    document.getElementById('displayP2SuperBoost').textContent = p2Keybinds.superBoost.toUpperCase();
}

updateKeybindDisplays();

let listeningForKeybind = null;

// Player 1 keybind button handlers
document.getElementById('p1UpKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p1Up';
    const btn = document.getElementById('p1UpKeybindBtn');
    btn.innerHTML = '<span id="p1UpKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

document.getElementById('p1DownKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p1Down';
    const btn = document.getElementById('p1DownKeybindBtn');
    btn.innerHTML = '<span id="p1DownKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

document.getElementById('p1LeftKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p1Left';
    const btn = document.getElementById('p1LeftKeybindBtn');
    btn.innerHTML = '<span id="p1LeftKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

document.getElementById('p1RightKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p1Right';
    const btn = document.getElementById('p1RightKeybindBtn');
    btn.innerHTML = '<span id="p1RightKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

document.getElementById('p1SpeedBoostKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p1SpeedBoost';
    const btn = document.getElementById('p1SpeedBoostKeybindBtn');
    btn.innerHTML = '<span id="p1SpeedBoostKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

document.getElementById('p1SuperBoostKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p1SuperBoost';
    const btn = document.getElementById('p1SuperBoostKeybindBtn');
    btn.innerHTML = '<span id="p1SuperBoostKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

// Player 2 keybind button handlers
document.getElementById('p2UpKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p2Up';
    const btn = document.getElementById('p2UpKeybindBtn');
    btn.innerHTML = '<span id="p2UpKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

document.getElementById('p2DownKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p2Down';
    const btn = document.getElementById('p2DownKeybindBtn');
    btn.innerHTML = '<span id="p2DownKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

document.getElementById('p2LeftKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p2Left';
    const btn = document.getElementById('p2LeftKeybindBtn');
    btn.innerHTML = '<span id="p2LeftKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

document.getElementById('p2RightKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p2Right';
    const btn = document.getElementById('p2RightKeybindBtn');
    btn.innerHTML = '<span id="p2RightKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

document.getElementById('p2SpeedBoostKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p2SpeedBoost';
    const btn = document.getElementById('p2SpeedBoostKeybindBtn');
    btn.innerHTML = '<span id="p2SpeedBoostKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

document.getElementById('p2SuperBoostKeybindBtn').addEventListener('click', () => {
    listeningForKeybind = 'p2SuperBoost';
    const btn = document.getElementById('p2SuperBoostKeybindBtn');
    btn.innerHTML = '<span id="p2SuperBoostKeybindDisplay">Press any key...</span>';
    btn.style.opacity = '0.7';
});

// Listen for key presses to set keybinds
document.addEventListener('keydown', (e) => {
    if (listeningForKeybind) {
        e.preventDefault();
        const key = e.key.toLowerCase();
        
        if (listeningForKeybind === 'p1Up') {
            p1Keybinds.up = key;
            localStorage.setItem('p1UpKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p1UpKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p1Down') {
            p1Keybinds.down = key;
            localStorage.setItem('p1DownKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p1DownKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p1Left') {
            p1Keybinds.left = key;
            localStorage.setItem('p1LeftKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p1LeftKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p1Right') {
            p1Keybinds.right = key;
            localStorage.setItem('p1RightKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p1RightKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p1SpeedBoost') {
            p1Keybinds.speedBoost = key;
            localStorage.setItem('p1SpeedBoostKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p1SpeedBoostKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p1SuperBoost') {
            p1Keybinds.superBoost = key;
            localStorage.setItem('p1SuperBoostKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p1SuperBoostKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p2Up') {
            p2Keybinds.up = key;
            localStorage.setItem('p2UpKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p2UpKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p2Down') {
            p2Keybinds.down = key;
            localStorage.setItem('p2DownKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p2DownKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p2Left') {
            p2Keybinds.left = key;
            localStorage.setItem('p2LeftKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p2LeftKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p2Right') {
            p2Keybinds.right = key;
            localStorage.setItem('p2RightKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p2RightKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p2SpeedBoost') {
            p2Keybinds.speedBoost = key;
            localStorage.setItem('p2SpeedBoostKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p2SpeedBoostKeybindBtn').style.opacity = '1';
        } else if (listeningForKeybind === 'p2SuperBoost') {
            p2Keybinds.superBoost = key;
            localStorage.setItem('p2SuperBoostKeybind', key);
            updateKeybindDisplays();
            document.getElementById('p2SuperBoostKeybindBtn').style.opacity = '1';
        }
        
        listeningForKeybind = null;
    }
});

// Start button functionality
const startBtn = document.getElementById('startBtn');
let gameWindow = null;

startBtn.addEventListener('click', () => {
    if (!gameWindow || gameWindow.closed) {
        // Store current settings in localStorage
        localStorage.setItem('player1Color', player1Color);
        localStorage.setItem('player2Color', player2Color);
        localStorage.setItem('playerMode', playerMode.toString());
        
        // Store all keybinds
        Object.keys(p1Keybinds).forEach(key => {
            localStorage.setItem(`p1${key.charAt(0).toUpperCase() + key.slice(1)}Keybind`, p1Keybinds[key]);
        });
        Object.keys(p2Keybinds).forEach(key => {
            localStorage.setItem(`p2${key.charAt(0).toUpperCase() + key.slice(1)}Keybind`, p2Keybinds[key]);
        });
        
        // Open popup window
        gameWindow = window.open(
            'game.html',
            'ChaseTheEnemy',
            'width=1000,height=800,resizable=yes,scrollbars=no'
        );
    } else {
        // Focus existing window
        gameWindow.focus();
    }
});
