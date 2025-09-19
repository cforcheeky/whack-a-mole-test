let score = 0;
let timeLeft = 30;
let moleTimer;
let gameTimer;
let activeMole = null;

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
    timeLeft = 30;
    document.getElementById("score").textContent = score;
    document.getElementById("time-left").textContent = timeLeft;

    moleTimer = setInterval(showMole, 700);
    gameTimer = setInterval(countdown, 1000);
}

function countdown() {
    timeLeft--;
    document.getElementById("time-left").textContent = timeLeft;

    if (timeLeft === 0) {
        clearInterval(moleTimer);
        clearInterval(gameTimer);
        alert(`Game Over! Final Score: ${score}`);
    }
}
