/**
 * Main game logic for HexGuessr
 */

// Current game state
let currentColor = '';
let score = 0;
let multiplayerMode = false;
let roomCode = '';
let players = [];
let currentRound = 0;
let totalRounds = 5;
let timerInterval;
let timeLeft = 60;
let gameStarted = false;
let playerName = '';
let playerGuesses = {};
let colorMap = 'full';

// DOM elements
const colorDisplay = document.getElementById('colorDisplay');
const hexInput = document.getElementById('hexInput');
const inputPreview = document.getElementById('inputPreview');
const submitGuess = document.getElementById('submitGuess');
const scoreDisplay = document.getElementById('scoreDisplay');
const resultMessage = document.getElementById('resultMessage');
const newColorBtn = document.getElementById('newColor');
const playSingleplayer = document.getElementById('playSingleplayer');
const playMultiplayer = document.getElementById('playMultiplayer');
const multiplayerTab = document.getElementById('multiplayerTab');
const multiplayerRoom = document.getElementById('multiplayerRoom');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const displayRoomCode = document.getElementById('displayRoomCode');
const playerList = document.getElementById('playerList');
const startGame = document.getElementById('startGame');
const leaveRoom = document.getElementById('leaveRoom');
const gameArea = document.getElementById('gameArea');
const multiplayerColorDisplay = document.getElementById('multiplayerColorDisplay');
const multiplayerHexInput = document.getElementById('multiplayerHexInput');
const multiplayerInputPreview = document.getElementById('multiplayerInputPreview');
const submitMultiplayerGuess = document.getElementById('submitMultiplayerGuess');
const gameTimer = document.getElementById('gameTimer');
const leaderboard = document.getElementById('leaderboard');
const leaderboardContent = document.getElementById('leaderboardContent');
const nextRound = document.getElementById('nextRound');
const createRoomBtn = document.getElementById('createRoom');
const joinRoomBtn = document.getElementById('joinRoom');
const playerNameInput = document.getElementById('playerName');
const joinPlayerNameInput = document.getElementById('joinPlayerName');
const roomCodeInput = document.getElementById('roomCode');
const colorMapSelect = document.getElementById('colorMapSelect');
const roundsSelect = document.getElementById('roundsSelect');

// Initialize the game
function initGame() {
    generateNewColor();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    submitGuess.addEventListener('click', checkGuess);
    newColorBtn.addEventListener('click', generateNewColor);
    hexInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') checkGuess();
        updateInputPreview();
    });
    hexInput.addEventListener('input', updateInputPreview);
    
    playSingleplayer.addEventListener('click', () => {
        multiplayerMode = false;
        multiplayerTab.style.display = 'none';
        multiplayerRoom.style.display = 'none';
        document.querySelector('.game-container').style.display = 'flex';
        score = 0;
        updateScoreDisplay();
        generateNewColor();
    });
    
    playMultiplayer.addEventListener('click', () => {
        multiplayerTab.style.display = 'block';
        document.querySelector('.game-container').style.display = 'none';
    });
    
    createRoomBtn.addEventListener('click', createRoom);
    joinRoomBtn.addEventListener('click', joinRoom);
    startGame.addEventListener('click', startMultiplayerGame);
    leaveRoom.addEventListener('click', leaveMultiplayerRoom);
    
    submitMultiplayerGuess.addEventListener('click', submitMultiplayerGuessHandler);
    multiplayerHexInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') submitMultiplayerGuessHandler();
        updateMultiplayerInputPreview();
    });
    multiplayerHexInput.addEventListener('input', updateMultiplayerInputPreview);
    
    nextRound.addEventListener('click', startNextRound);
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Generate a new random color
function generateNewColor() {
    if (multiplayerMode && gameStarted) return;
    
    // Generate color based on selected color map
    let r, g, b;
    switch(colorMap) {
        case 'monochrome':
            const gray = Math.floor(Math.random() * 256);
            r = g = b = gray;
            break;
        case 'pure':
            const hue = Math.floor(Math.random() * 6);
            const val = Math.floor(Math.random() * 256);
            r = hue === 0 || hue === 1 || hue === 5 ? 255 : 0;
            g = hue === 1 || hue === 2 || hue === 3 ? 255 : 0;
            b = hue === 3 || hue === 4 || hue === 5 ? 255 : 0;
            break;
        case 'pastel':
            r = Math.floor(Math.random() * 56) + 200;
            g = Math.floor(Math.random() * 56) + 200;
            b = Math.floor(Math.random() * 56) + 200;
            break;
        case 'dark':
            r = Math.floor(Math.random() * 128);
            g = Math.floor(Math.random() * 128);
            b = Math.floor(Math.random() * 128);
            break;
        default: // full spectrum
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 256);
    }
    
    currentColor = rgbToHex(r, g, b);
    if (multiplayerMode) {
        multiplayerColorDisplay.style.backgroundColor = currentColor;
    } else {
        colorDisplay.style.backgroundColor = currentColor;
    }
    hexInput.value = '';
    inputPreview.style.backgroundColor = '#FFFFFF';
    resultMessage.textContent = '';
}

// Convert RGB to Hex
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

// Update the input preview color
function updateInputPreview() {
    const value = hexInput.value;
    if (value.length === 7 && value.startsWith('#')) {
        inputPreview.style.backgroundColor = value;
    } else if (value.length === 6 && !value.startsWith('#')) {
        inputPreview.style.backgroundColor = '#' + value;
    } else {
        inputPreview.style.backgroundColor = '#FFFFFF';
    }
}

// Check the user's guess
function checkGuess() {
    let guess = hexInput.value.trim().toUpperCase();
    
    // Add # if missing
    if (!guess.startsWith('#')) {
        guess = '#' + guess;
    }
    
    // Validate hex format
    if (!/^#[0-9A-F]{6}$/i.test(guess)) {
        resultMessage.textContent = 'Please enter a valid hex code (e.g., #FFFFFF)';
        resultMessage.className = 'result-message incorrect';
        return;
    }
    
    // Calculate score using CIEDE2000
    const deltaE = ciede2000(currentColor, guess);
    const similarity = Math.max(0, 100 - deltaE * 2); // Scale deltaE to 0-100
    const points = Math.floor(similarity);
    score += points;
    
    // Display result
    resultMessage.innerHTML = `
        Your guess: <span style="color:${guess}">${guess}</span> <br>
        Actual color: <span style="color:${currentColor}">${currentColor}</span> <br>
        Accuracy: ${points}% (ΔE: ${deltaE.toFixed(2)})
    `;
    resultMessage.className = 'result-message';
    
    updateScoreDisplay();
}

// Update score display
function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// Multiplayer functions
function createRoom() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }
    
    colorMap = colorMapSelect.value;
    totalRounds = parseInt(roundsSelect.value);
    
    // Generate a random room code
    roomCode = generateRoomCode();
    
    // Add the host as the first player
    players = [{
        name: playerName,
        score: 0,
        isHost: true
    }];
    
    // Update UI
    multiplayerTab.style.display = 'none';
    multiplayerRoom.style.display = 'block';
    roomCodeDisplay.textContent = roomCode;
    displayRoomCode.textContent = roomCode;
    updatePlayerList();
    
    console.log(`Room created with code: ${roomCode}`);
}

function joinRoom() {
    playerName = joinPlayerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }
    
    roomCode = roomCodeInput.value.trim().toUpperCase();
    if (!roomCode || roomCode.length !== 6) {
        alert('Please enter a valid 6-character room code');
        return;
    }
    
    // Add player to the room
    players.push({
        name: playerName,
        score: 0,
        isHost: false
    });
    
    // Update UI
    multiplayerTab.style.display = 'none';
    multiplayerRoom.style.display = 'block';
    roomCodeDisplay.textContent = roomCode;
    displayRoomCode.textContent = roomCode;
    updatePlayerList();
    
    // Hide start game button for non-host players
    if (!players.find(p => p.name === playerName && p.isHost)) {
        startGame.style.display = 'none';
    }
    
    console.log(`Joined room: ${roomCode}`);
}

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function updatePlayerList() {
    playerList.innerHTML = '';
    players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-item';
        playerElement.innerHTML = `
            <span>${player.name}</span>
            ${player.isHost ? '<span class="host-badge">👑</span>' : ''}
        `;
        playerList.appendChild(playerElement);
    });
}

function startMultiplayerGame() {
    gameStarted = true;
    currentRound = 1;
    startGame.style.display = 'none';
    gameArea.style.display = 'block';
    
    // Generate first color
    generateNewColor();
    startTimer();
}

function startTimer() {
    timeLeft = 60;
    updateTimerDisplay();
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endRound();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    gameTimer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Change color when time is running low
    if (timeLeft <= 10) {
        gameTimer.style.color = 'var(--danger)';
    } else {
        gameTimer.style.color = 'var(--primary)';
    }
}

function submitMultiplayerGuessHandler() {
    let guess = multiplayerHexInput.value.trim().toUpperCase();
    
    // Add # if missing
    if (!guess.startsWith('#')) {
        guess = '#' + guess;
    }
    
    // Validate hex format
    if (!/^#[0-9A-F]{6}$/i.test(guess)) {
        alert('Please enter a valid hex code (e.g., #FFFFFF)');
        return;
    }
    
    // Store the player's guess
    playerGuesses[playerName] = guess;
    
    // Disable input
    multiplayerHexInput.disabled = true;
    submitMultiplayerGuess.disabled = true;
    
    console.log(`${playerName} guessed: ${guess}`);
    
    // Show confirmation
    const resultMessage = document.createElement('div');
    resultMessage.textContent = `Guess submitted: ${guess}`;
    resultMessage.style.marginTop = '1rem';
    resultMessage.style.color = 'var(--success)';
    gameArea.appendChild(resultMessage);
}

function endRound() {
    // Calculate scores
    calculateRoundScores();
    
    // Show leaderboard
    showLeaderboard();
    
    // Hide game area
    gameArea.style.display = 'none';
}

function calculateRoundScores() {
    // Calculate scores for all players
    for (const player of players) {
        const guess = playerGuesses[player.name] || '#000000';
        const deltaE = ciede2000(currentColor, guess);
        const similarity = Math.max(0, 100 - deltaE * 2);
        const points = Math.floor(similarity);
        player.score += points;
    }
    
    // Sort players by score
    players.sort((a, b) => b.score - a.score);
}

function showLeaderboard() {
    leaderboard.style.display = 'block';
    leaderboardContent.innerHTML = '';
    
    // Add header
    const header = document.createElement('div');
    header.className = 'leaderboard-item';
    header.innerHTML = `
        <div class="leaderboard-position">#</div>
        <div class="leaderboard-name">Player</div>
        <div class="leaderboard-score">Score</div>
    `;
    leaderboardContent.appendChild(header);
    
    // Add players
    players.forEach((player, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'leaderboard-item';
        playerElement.innerHTML = `
            <div class="leaderboard-position">${index + 1}</div>
            <div class="leaderboard-name">${player.name}</div>
            <div class="leaderboard-score">${player.score}</div>
        `;
        leaderboardContent.appendChild(playerElement);
    });
    
    // Show next round button if there are more rounds
    if (currentRound < totalRounds) {
        nextRound.style.display = 'block';
    } else {
        nextRound.style.display = 'none';
        const gameOver = document.createElement('div');
        gameOver.className = 'leaderboard-item';
        gameOver.innerHTML = '<div style="text-align: center; width: 100%; font-weight: bold;">Game Over!</div>';
        leaderboardContent.appendChild(gameOver);
    }
}

function startNextRound() {
    currentRound++;
    leaderboard.style.display = 'none';
    gameArea.style.display = 'block';
    
    // Reset input
    multiplayerHexInput.disabled = false;
    submitMultiplayerGuess.disabled = false;
    multiplayerHexInput.value = '';
    multiplayerInputPreview.style.backgroundColor = '#FFFFFF';
    
    // Generate new color
    generateNewColor();
    startTimer();
}

function leaveMultiplayerRoom() {
    multiplayerMode = false;
    multiplayerRoom.style.display = 'none';
    multiplayerTab.style.display = 'block';
    gameArea.style.display = 'none';
    leaderboard.style.display = 'none';
    
    // Reset game state
    gameStarted = false;
    currentRound = 0;
    players = [];
    playerGuesses = {};
    clearInterval(timerInterval);
}

function updateMultiplayerInputPreview() {
    const value = multiplayerHexInput.value;
    if (value.length === 7 && value.startsWith('#')) {
        multiplayerInputPreview.style.backgroundColor = value;
    } else if (value.length === 6 && !value.startsWith('#')) {
        multiplayerInputPreview.style.backgroundColor = '#' + value;
    } else {
        multiplayerInputPreview.style.backgroundColor = '#FFFFFF';
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);