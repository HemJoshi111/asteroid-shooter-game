const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const messageBox = document.getElementById('message-box');
const messageTitle = document.getElementById('message-title');
const messageScore = document.getElementById('message-score');
const restartButton = document.getElementById('restart-button');
const survivalTipButton = document.getElementById('survival-tip-button');
const survivalTipEl = document.getElementById('survival-tip');

// Grab the start screen elements
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');

let ship, asteroids, bullets, keys, score, lives, level, gameOver;
const SHIP_SIZE = 30;
const SHIP_THRUST = 5;
const FRICTION = 0.7;
const TURN_SPEED = 360; // deg per sec
const BULLET_SPEED = 500; // pixels per sec
const ASTEROID_NUM = 1;
const ASTEROID_SPEED = 50;
const ASTEROID_SIZE = 100;
const ASTEROID_VERTICES = 10; // number of vertices
const ASTEROID_JAG = 0.4; // jaggedness
const SHOW_BOUNDING_BOX = false; // for debugging
const SHIP_INVINCIBILITY_DUR = 3; // seconds
const SHIP_BLINK_DUR = 0.1; // seconds

// Set canvas size
function setCanvasSize() {
    const maxWidth = 800;
    const maxHeight = 600;
    const windowWidth = window.innerWidth * 0.9;
    const windowHeight = window.innerHeight * 0.7;

    canvas.width = Math.min(maxWidth, windowWidth);
    canvas.height = Math.min(maxHeight, windowHeight);
}

// Game setup
function newGame() {
    score = 0;
    lives = 3;
    level = 0;
    gameOver = false;
    updateUI();
    newLevel();
    // Start the game loop only when newGame is called
    requestAnimationFrame(update);
}

function newLevel() {
    ship = newShip();
    createAsteroidBelt();
}

// Create player ship
function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI, // angle in radians, convert 90 deg to rad
        rot: 0,
        thrusting: false,
        thrust: { x: 0, y: 0 },
        // Track raw input states for smart controls
        upInput: false,
        downInput: false,
        canShoot: true,
        dead: false,
        explodeTime: 0,
        blinkNum: Math.ceil(SHIP_INVINCIBILITY_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR * 60)
    };
}

// Handle ship shooting
function shootLaser() {
    if (ship.canShoot && bullets.length < 10) {
        bullets.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: BULLET_SPEED * Math.cos(ship.a) / 60, // 60 fps
            yv: -BULLET_SPEED * Math.sin(ship.a) / 60,
            dist: 0,
            maxDist: 0.6 * canvas.width
        });
    }
    ship.canShoot = false;
    setTimeout(() => {
        if (ship) ship.canShoot = true;
    }, 200); // 0.2 second cooldown
}

// Create asteroids
function createAsteroidBelt() {
    asteroids = [];
    let x, y;
    for (let i = 0; i < ASTEROID_NUM + level; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROID_SIZE * 2 + ship.r);
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 2)));
    }
}

function newAsteroid(x, y, r) {
    const lvlMult = 1 + 0.1 * level;
    const roid = {
        x: x,
        y: y,
        xv: Math.random() * ASTEROID_SPEED * lvlMult / 60 * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ASTEROID_SPEED * lvlMult / 60 * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ASTEROID_VERTICES + 1) + ASTEROID_VERTICES / 2),
        offs: []
    };

    for (let i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG);
    }
    return roid;
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function update(deltaTime) {
    if (gameOver) return;

    // Logic for Smart Thrust controls based on orientation
    // Normalize angle to 0 - 2PI (0 to 360 degrees)
    let angle = ship.a % (Math.PI * 2);
    if (angle < 0) angle += Math.PI * 2;

    // Define Zones based on radians
    // Up/Right Zone: [0 to 135 deg] OR [315 to 360 deg]
    const boundary1 = 3 * Math.PI / 4; // 135 degrees
    const boundary2 = 7 * Math.PI / 4; // 315 degrees

    // Check orientation
    const isUpRight = (angle >= 0 && angle < boundary1) || (angle >= boundary2);
    const isDownLeft = (angle >= boundary1 && angle < boundary2);

    // Apply thrust based on input and orientation
    if (ship.upInput && isUpRight) {
        ship.thrusting = true;
    } else if (ship.downInput && isDownLeft) {
        ship.thrusting = true;
    } else {
        ship.thrusting = false;
    }

    const blinkOn = ship.blinkNum % 2 == 0;
    const exploding = ship.explodeTime > 0;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / 60;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / 60;

        if (!exploding && blinkOn) {
            ctx.fillStyle = 'red';
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = SHIP_SIZE / 10;
            ctx.beginPath();
            ctx.moveTo(
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
            );
            ctx.lineTo(
                ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
                ship.y + ship.r * 6 / 3 * Math.sin(ship.a)
            );
            ctx.lineTo(
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / 60;
        ship.thrust.y -= FRICTION * ship.thrust.y / 60;
    }

    if (!exploding) {
        if (blinkOn) {
            drawShip(ship.x, ship.y, ship.a);
        }

        if (ship.blinkNum > 0) {
            ship.blinkTime--;
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * 60);
                ship.blinkNum--;
            }
        }
    } else {
        ctx.fillStyle = 'darkred'; ctx.beginPath(); ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false); ctx.fill();
        ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false); ctx.fill();
        ctx.fillStyle = 'orange'; ctx.beginPath(); ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false); ctx.fill();
        ctx.fillStyle = 'yellow'; ctx.beginPath(); ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false); ctx.fill();
        ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false); ctx.fill();
    }

    for (let i = 0; i < bullets.length; i++) {
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(bullets[i].x, bullets[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
        ctx.fill();
    }

    let ax, ay, ar, lx, ly;
    for (let i = asteroids.length - 1; i >= 0; i--) {
        ax = asteroids[i].x; ay = asteroids[i].y; ar = asteroids[i].r;
        for (let j = bullets.length - 1; j >= 0; j--) {
            lx = bullets[j].x; ly = bullets[j].y;
            if (distBetweenPoints(ax, ay, lx, ly) < ar) {
                bullets.splice(j, 1);
                destroyAsteroid(i);
                break;
            }
        }
    }

    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = SHIP_SIZE / 20;
    let x, y, r, a, vert, offs;
    for (let i = 0; i < asteroids.length; i++) {
        x = asteroids[i].x; y = asteroids[i].y; r = asteroids[i].r; a = asteroids[i].a; vert = asteroids[i].vert; offs = asteroids[i].offs;
        ctx.beginPath();
        ctx.moveTo(x + r * offs[0] * Math.cos(a), y + r * offs[0] * Math.sin(a));
        for (let j = 1; j < vert; j++) {
            ctx.lineTo(x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert), y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert));
        }
        ctx.closePath();
        ctx.stroke();
    }

    if (!exploding) {
        if (ship.blinkNum == 0) {
            for (let i = 0; i < asteroids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }
        ship.a += ship.rot;
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    } else {
        ship.explodeTime--;
        if (ship.explodeTime == 0) {
            lives--;
            updateUI();
            if (lives == 0) {
                endGame();
            } else {
                ship = newShip();
            }
        }
    }

    if (ship.x < 0 - ship.r) ship.x = canvas.width + ship.r;
    else if (ship.x > canvas.width + ship.r) ship.x = 0 - ship.r;
    if (ship.y < 0 - ship.r) ship.y = canvas.height + ship.r;
    else if (ship.y > canvas.height + ship.r) ship.y = 0 - ship.r;

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].dist += Math.sqrt(Math.pow(bullets[i].xv, 2) + Math.pow(bullets[i].yv, 2));
        if (bullets[i].dist > bullets[i].maxDist) {
            bullets.splice(i, 1);
            continue;
        }
        bullets[i].x += bullets[i].xv;
        bullets[i].y += bullets[i].yv;
        if (bullets[i].x < 0) bullets[i].x = canvas.width;
        else if (bullets[i].x > canvas.width) bullets[i].x = 0;
        if (bullets[i].y < 0) bullets[i].y = canvas.height;
        else if (bullets[i].y > canvas.height) bullets[i].y = 0;
    }

    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;
        if (asteroids[i].x < 0 - asteroids[i].r) asteroids[i].x = canvas.width + asteroids[i].r;
        else if (asteroids[i].x > canvas.width + asteroids[i].r) asteroids[i].x = 0 - asteroids[i].r;
        if (asteroids[i].y < 0 - asteroids[i].r) asteroids[i].y = canvas.height + asteroids[i].r;
        else if (asteroids[i].y > canvas.height + asteroids[i].r) asteroids[i].y = 0 - asteroids[i].r;
    }

    if (asteroids.length == 0) {
        level++;
        newLevel();
    }

    requestAnimationFrame(update);
}

function drawShip(x, y, a) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(x + 4 / 3 * ship.r * Math.cos(a), y - 4 / 3 * ship.r * Math.sin(a));
    ctx.lineTo(x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)), y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a)));
    ctx.lineTo(x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)), y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a)));
    ctx.closePath();
    ctx.stroke();

    // Add a red dot at the nose to show shooting direction
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(
        x + 4 / 3 * ship.r * Math.cos(a),
        y - 4 / 3 * ship.r * Math.sin(a),
        SHIP_SIZE / 10, 0, Math.PI * 2, false
    );
    ctx.fill();
}

function explodeShip() {
    ship.explodeTime = Math.ceil(0.3 * 60); // 0.3 sec
}

function destroyAsteroid(index) {
    let x = asteroids[index].x;
    let y = asteroids[index].y;
    let r = asteroids[index].r;

    if (r == Math.ceil(ASTEROID_SIZE / 2)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 4)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 4)));
        score += 20;
    } else if (r == Math.ceil(ASTEROID_SIZE / 4)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 8)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 8)));
        score += 50;
    } else {
        score += 100;
    }

    updateUI();
    asteroids.splice(index, 1);
}

function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
}

function endGame() {
    gameOver = true;
    ship.dead = true;
    messageTitle.textContent = "GAME OVER";
    messageScore.textContent = `FINAL SCORE: ${score}`;
    messageBox.classList.remove('hidden');
    survivalTipEl.textContent = '';
    survivalTipButton.textContent = '✨ GET SURVIVAL TIP';
    survivalTipButton.disabled = false;
}

async function getSurvivalTip() {
    survivalTipButton.disabled = true;
    survivalTipButton.textContent = 'ANALYZING FAILURE...';
    survivalTipEl.textContent = '';

    const apiKey = ""; // This will be provided by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const systemPrompt = "You are a witty, retro-arcade game AI from the 1980s. The player just lost a game of Asteroid Shooter. Your job is to give them a single, short, clever, and funny survival tip for their next attempt. The tip should be encouraging but also slightly sarcastic. Keep it under 25 words and deliver it with classic arcade flair.";
    const userQuery = `My final score was ${score} and I reached level ${level}. Give me a unique tip.`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            })
        });

        if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const tip = candidate.content.parts[0].text;
            survivalTipEl.textContent = `"${tip}"`;
        } else {
            survivalTipEl.textContent = 'AI core malfunctioning. Just... try to dodge better next time.';
        }

    } catch (error) {
        console.error("Error fetching survival tip:", error);
        survivalTipEl.textContent = 'Transmission error from mothership. Advice unavailable.';
    } finally {
        survivalTipButton.disabled = false;
        survivalTipButton.textContent = '✨ GET ANOTHER TIP';
    }
}

function keyDown(/** @type {KeyboardEvent} */ ev) {
    if (ship.dead || gameOver) return;
    switch (ev.keyCode) {
        case 32: shootLaser(); break; // space
        case 37: ship.rot = TURN_SPEED / 180 * Math.PI / 60; break; // left
        case 38: ship.upInput = true; break; // up
        case 39: ship.rot = -TURN_SPEED / 180 * Math.PI / 60; break; // right
        case 40: ship.downInput = true; break; // down
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
    if (ship.dead || gameOver) return;
    switch (ev.keyCode) {
        case 37: ship.rot = 0; break; // left
        case 38: ship.upInput = false; break; // up
        case 39: ship.rot = 0; break; // right
        case 40: ship.downInput = false; break; // down
    }
}

window.addEventListener('resize', setCanvasSize);
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
restartButton.addEventListener('click', () => {
    messageBox.classList.add('hidden');
    survivalTipEl.textContent = '';
    newGame();
});
survivalTipButton.addEventListener('click', getSurvivalTip);

// Add event listener for start button
startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden'); // Hide the start screen
    newGame(); // Start the game loop
});

// Initialize
setCanvasSize();
bullets = [];
