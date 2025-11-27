// Whack-a-mole Game Script assets with Levels, Special Moles, and Dynamic Grid Adjustments
let score = 0;
let timeLeft = 30;
let moleTimer;
let gameTimer;
let activeMole = null;
let level = 1;
// Boss fight state
let bossActive = false;
let bossHP = 0;
const bossClicksRequired = 100; // clicks required to defeat boss
const bossFightTime = 15; // seconds for boss fight
let bossTimer;

// Function to get a random hole element and ensure no two holes overlap in size
function randomHole() {
    const holes = document.querySelectorAll(".hole");
    const randomIndex = Math.floor(Math.random() * holes.length);
    return holes[randomIndex];
}

// Function to show a mole in a random hole if no mole is currently active
function showMole() {
    // Do not show normal moles while boss fight is active
    if (bossActive) return;

    if (activeMole) {
        activeMole.remove();
    }

    const mole = document.createElement("div");

    // Randomly decide if this mole is a special mole
    const isSpecialMole = Math.random() < 0.2; // 20% chance for a special mole
    if (isSpecialMole) {
        mole.classList.add("special-mole");
        mole.onclick = hitSpecialMole; // Special mole click handler
    } else {
        mole.classList.add("mole");
        mole.onclick = hitMole; // Regular mole click handler
    }

    // Place mole in a random hole that is currently empty for random appearance
    const hole = randomHole();
    hole.appendChild(mole);
    activeMole = mole;
}

// Function to handle mole hit and update score
function hitMole() {
    score++;
    document.getElementById("score").textContent = score;
    activeMole.remove();
    activeMole = null;
}

// Function to handle special mole hit and update score
function hitSpecialMole() {
    score += 2; // Double points for special mole
    document.getElementById("score").textContent = score;
    activeMole.remove();
    activeMole = null;
}

function resetBossUI() {
    bossActive = false;
    bossHP = 0;
    const bossHPDisplay = document.getElementById("boss-hp");
    if (bossHPDisplay) bossHPDisplay.remove();
    const bossStyle = document.getElementById('boss-styles');
    if (bossStyle) bossStyle.remove();
}

function startGame() {
    clearInterval(moleTimer);
    clearInterval(gameTimer);

    resetBossUI();

    score = 0;
    timeLeft = 30;
    level = 1;
    document.getElementById("score").textContent = score;
    document.getElementById("time-left").textContent = timeLeft;
    document.getElementById("level").textContent = level;

    startLevel();
}

function startLevel() {
    document.getElementById("level").textContent = level;

    // Adjust the grid and add holes based on the level for increased difficulty
    adjustGridAndHoles(level);

    moleTimer = setInterval(showMole, Math.max(1100 - level * 60, 300)); // Decrease mole appearance time with levels
    gameTimer = setInterval(countdown, 1000); // Countdown timer for the level
}

// Function to adjust grid size and number of holes based on the current level, increasing as levels progress
function adjustGridAndHoles(level) {
    const gameBoard = document.getElementById("game-board"); // Assuming the game board has this ID
    gameBoard.innerHTML = ""; // Clear existing holes

    // Determine grid size based on level
    let gridSize;
    if (level < 3) {
        gridSize = 3; // 3x3 grid for levels 1 and 2
    } else if (level < 5) {
        gridSize = 4; // 4x4 grid for levels 3 and 4
    } else {
        gridSize = 5; // 5x5 grid for level 5 and beyond
    }

    // Set the grid layout dynamically
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    // Add the appropriate number of holes based on grid size and level
    const totalHoles = gridSize * gridSize;
    for (let i = 0; i < totalHoles; i++) {
        const hole = document.createElement("div");
        hole.classList.add("hole");
        gameBoard.appendChild(hole);
    }

    // Update mole size dynamically based on level
    updateMoleSize(level);
}

function updateMoleSize(level) {
    // Calculate mole size based on the level
    const baseMoleSize = 85; // Default mole size for level 1 
    const moleSize = Math.max(baseMoleSize - (level - 1) * 10, 50); // Decrease mole size as level increases, minimum size 40px to ensure visibility

    // Update mole size in CSS dynamically
    const moleStyle = document.createElement("style");
    moleStyle.innerHTML = `
        .mole, .special-mole {
            width: ${moleSize}px;
            height: ${moleSize}px;
            top: calc(50% - ${moleSize / 2}px);
            left: calc(50% - ${moleSize / 2}px);
        }
        /* Boss mole default sizing (will be injected when boss starts too) */
        .boss-mole {
            width: 140px;
            height: 140px;
            top: calc(50% - 70px);
            left: calc(50% - 70px);
        }
    `;
    document.head.appendChild(moleStyle);
}

// Countdown timer function to manage level time to reach zero and progress levels, eventually ending the game at level 5
function countdown() {
    timeLeft--;
    document.getElementById("time-left").textContent = timeLeft;

    if (timeLeft === 0) {
        clearInterval(moleTimer);
        clearInterval(gameTimer);

        if (level < 5) { // Example: 5 levels in total, can be adjusted as needed
            level++;
            timeLeft = 30;
            alert(`Level ${level - 1} Complete! Starting Level ${level}...`);
            startLevel();
        } else if (!bossActive) {
            // After completing level 5, start the boss fight
            startBossFight();
        } else {
            // Boss fight time ran out
            endGame(false);
        }
    }
}

// Start the boss fight: single large hole and a boss mole that requires multiple clicks
function startBossFight() {
    bossActive = true;
    bossHP = bossClicksRequired;

    // Clear existing board and timers
    clearInterval(moleTimer);
    clearInterval(gameTimer);
    if (activeMole) {
        activeMole.remove();
        activeMole = null;
    }

    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = "";

    // Make a single large hole that fills the board
    gameBoard.style.gridTemplateColumns = `repeat(2, 2fr)`;
    gameBoard.style.gridTemplateRows = `repeat(2, 2fr)`;

    const hole = document.createElement("div");
    hole.classList.add("hole", "boss-hole");
    // boss-hole should take full area; we'll add a boss mole inside
    gameBoard.appendChild(hole);

    // Create boss mole
    const boss = document.createElement("div");
    boss.classList.add("boss-mole");
    boss.onclick = hitBossMole;
    hole.appendChild(boss);
    activeMole = boss;

    // Update UI to show boss fight
    const levelEl = document.getElementById("level");
    if (levelEl) levelEl.textContent = "Boss";

    createOrUpdateBossHPDisplay();

    // Inject boss styles (if not present) to make boss visually larger
    const style = document.createElement("style");
    style.id = 'boss-styles';
    style.innerHTML = `
        .boss-hole { position: relative; width: 100%; height: 100%; }
        .boss-mole {
            position: absolute;
            cursor: pointer;
            background: url('449.webp') center/cover no-repeat;
            width: 70%;
            height: 70%;
            border-radius: 70%;
            background-color: #fff3caff;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    `;
    document.head.appendChild(style);

    // Start boss countdown
    timeLeft = bossFightTime;
    document.getElementById("time-left").textContent = timeLeft;
    gameTimer = setInterval(countdown, 1000);
}

function createOrUpdateBossHPDisplay() {
    let hpEl = document.getElementById("boss-hp");
    if (!hpEl) {
        hpEl = document.createElement("div");
        hpEl.id = "boss-hp";
        hpEl.style.fontWeight = 'bold';
        hpEl.style.margin = '6px 0';
        const board = document.getElementById("game-board");
        if (board && board.parentElement) {
            board.parentElement.insertBefore(hpEl, board);
        } else {
            document.body.insertBefore(hpEl, document.body.firstChild);
        }
    }
    hpEl.textContent = `Boss HP: ${bossHP}`;
}

function hitBossMole() {
    if (!bossActive) return;

    bossHP--;
    createOrUpdateBossHPDisplay();

    // Optional: add a little feedback animation by briefly changing opacity
    if (activeMole) {
        activeMole.style.opacity = '0.6';
        setTimeout(() => { if (activeMole) activeMole.style.opacity = '1'; }, 100);
    }

    if (bossHP <= 0) {
        // Boss defeated
        bossActive = false;
        clearInterval(gameTimer);
        if (activeMole) activeMole.remove();
        activeMole = null;
        const hpEl = document.getElementById("boss-hp");
        if (hpEl) hpEl.remove();

        // Reward the player for defeating the boss
        score += 50;
        document.getElementById("score").textContent = score;

        alert(`Boss defeated! Final Score: ${score}`);
        // End game (or you could restart)
        endGame(true);
    }
}

function endGame(victory) {
    clearInterval(moleTimer);
    clearInterval(gameTimer);
    if (activeMole) {
        activeMole.remove();
        activeMole = null;
    }
    bossActive = false;
    const levelEl = document.getElementById("level");
    if (levelEl) levelEl.textContent = victory ? 'Victory' : 'Game Over';
}










