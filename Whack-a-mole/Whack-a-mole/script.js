let score = 0;
let timeLeft = 40;
let moleTimer;
let gameTimer;
let activeMole = null;
let level = 1; // Add a level variable

function randomHole() {
    const holes = document.querySelectorAll(".hole");
    const randomIndex = Math.floor(Math.random() * holes.length);
    return holes[randomIndex];
}

function showMole() {
    if (activeMole) {
        activeMole.remove();
    }

    const mole = document.createElement("div");
    mole.classList.add("mole");
    mole.onclick = hitMole;

    const hole = randomHole();
    hole.appendChild(mole);
    activeMole = mole;
}

function hitMole() {
    score++;
    document.getElementById("score").textContent = score;
    activeMole.remove();
    activeMole = null;
}

function startGame() {
    score = 0;
    timeLeft = 40;
    level = 1; // Reset level when starting a new game
    document.getElementById("score").textContent = score;
    document.getElementById("time-left").textContent = timeLeft;
    document.getElementById("level").textContent = level; // Display the level

    moleTimer = setInterval(showMole, 700);
    gameTimer = setInterval(countdown, 1000);
}

function countdown() {
    timeLeft--;
    document.getElementById("time-left").textContent = timeLeft;

    if (timeLeft === 0) {
        clearInterval(moleTimer);
        clearInterval(gameTimer);
        nextLevel(); // Move to the next level
    }
}

function nextLevel() {
    level++; // Increment the level
    timeLeft = 40; // Reset time for the new level
    document.getElementById("level").textContent = level; // Update level display

    // Adjust mole speed based on level (e.g., faster moles)
    const moleSpeed = Math.max(200, 700 - level * 100); // Minimum speed is 200ms
    moleTimer = setInterval(showMole, moleSpeed);
    gameTimer = setInterval(countdown, 1000);
}
