// ============================================
// ☄ ASTEROIDS
// ============================================
let aCanvas, aCtx, aW, aH;
let aSettings, aGame, aKeys, aShip;
let aAsteroids, aBullets, aParticles;
let aGameLoopId = null;

const asteroidsDiffSettings = {
    easy:   { asteroidCount: 3, asteroidSpeed: 0.8, maxBullets: 5, lives: 5 },
    normal: { asteroidCount: 4, asteroidSpeed: 1.2, maxBullets: 4, lives: 3 },
    hard:   { asteroidCount: 6, asteroidSpeed: 1.8, maxBullets: 3, lives: 2 }
};

function initAsteroids() {
    aCanvas = document.getElementById('asteroidsCanvas');
    if (!aCanvas) return;
    aCtx = aCanvas.getContext('2d');
    
    aSettings = asteroidsDiffSettings.normal;
    aGame = { score: 0, lives: 3, level: 1, running: false, gameOver: false };
    aKeys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false };
    aShip = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI/2, radius: 14, thrusting: false, invulnerable: 0, hyperCooldown: 0 };
    aAsteroids = []; aBullets = []; aParticles = [];
    
    aResize();
}

function aResize() {
    if (!aCanvas) return;
    aW = aCanvas.width = window.innerWidth;
    aH = aCanvas.height = window.innerHeight;
}

function aCreateAsteroid(x, y, size = 3) {
    const radius = size === 3 ? 55 : size === 2 ? 35 : 20;
    const speed = (0.5 + Math.random()) * aSettings.asteroidSpeed * (size === 3 ? 0.8 : size === 2 ? 1.2 : 1.6);
    const angle = Math.random() * Math.PI * 2;
    const points = [];
    const numPoints = 8 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numPoints; i++) {
        const a = (i / numPoints) * Math.PI * 2;
        points.push({ angle: a, radius: radius * (0.75 + Math.random() * 0.4) });
    }
    return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size, radius, points, rotation: 0, rotationSpeed: (Math.random() - 0.5) * 0.04 };
}

function aSpawnWave(count) {
    for (let i = 0; i < count; i++) {
        let x, y;
        do { x = Math.random() * aW; y = Math.random() * aH; }
        while (Math.hypot(x - aShip.x, y - aShip.y) < 250);
        aAsteroids.push(aCreateAsteroid(x, y, 3));
    }
}

function aInit() {
    aResize();
    aShip.x = aW / 2; aShip.y = aH / 2;
    aShip.vx = 0; aShip.vy = 0;
    aShip.angle = -Math.PI / 2;
    aShip.invulnerable = 120; aShip.hyperCooldown = 0;
    aAsteroids = []; aBullets = []; aParticles = [];
    aGame.score = 0; aGame.lives = aSettings.lives;
    aGame.level = 1; aGame.gameOver = false;
    aUpdateHUD();
    aSpawnWave(aSettings.asteroidCount);
}

function aUpdateHUD() {
    document.getElementById('asteroidsScore').textContent = aGame.score;
    document.getElementById('asteroidsLevel').textContent = aGame.level;
    document.getElementById('asteroidsLives').textContent = '♥'.repeat(Math.max(0, aGame.lives));
}

function startAsteroidsGame() {
    aSettings = asteroidsDiffSettings[difficulties.asteroids];
    showView('asteroidsGameView');
    document.getElementById('asteroidsGameView').classList.add('active');
    aGame.running = false; aGame.gameOver = false;
    document.getElementById('asteroidsStartMsg').classList.add('active');
    document.getElementById('asteroidsGameOver').classList.remove('active');
    aResize(); aInit();
    if (aGameLoopId) cancelAnimationFrame(aGameLoopId);
    aRenderLoop();
}

function aStartGame() {
    document.getElementById('asteroidsStartMsg').classList.remove('active');
    aInit();
    aGame.running = true;
    playBeep(880, 0.1);
}

function quitToAsteroidsMenu() {
    aGame.running = false; aGame.gameOver = false;
    stopThrustSound();
    if (aGameLoopId) cancelAnimationFrame(aGameLoopId);
    aGameLoopId = null;
    document.getElementById('asteroidsStartMsg').classList.remove('active');
    document.getElementById('asteroidsGameOver').classList.remove('active');
    document.getElementById('asteroidsGameView').classList.remove('active');
    showView('asteroidsView');
}

function aHyperSpace() {
    if (aShip.hyperCooldown > 0) return;
    aShip.x = 100 + Math.random() * (aW - 200);
    aShip.y = 100 + Math.random() * (aH - 200);
    aShip.vx = 0; aShip.vy = 0;
    aShip.hyperCooldown = 60; aShip.invulnerable = 30;
    playBeep(1200, 0.15, 'sine', 0.1);
}

function aShoot() {
    if (aBullets.length >= aSettings.maxBullets) return;
    playShoot();
    aBullets.push({
        x: aShip.x + Math.cos(aShip.angle) * aShip.radius,
        y: aShip.y + Math.sin(aShip.angle) * aShip.radius,
        vx: Math.cos(aShip.angle) * 8 + aShip.vx * 0.5,
        vy: Math.sin(aShip.angle) * 8 + aShip.vy * 0.5,
        life: 60
    });
}

function aExplodeAsteroid(a) {
    playExplosion();
    for (let i = 0; i < 8; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 1 + Math.random() * 3;
        aParticles.push({ x: a.x, y: a.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 30, maxLife: 30, color: '#ff00ff' });
    }
    aGame.score += { 3: 20, 2: 50, 1: 100 }[a.size];
    if (a.size > 1) for (let i = 0; i < 2; i++) aAsteroids.push(aCreateAsteroid(a.x, a.y, a.size - 1));
    aUpdateHUD();
}

function aCheckCollisions() {
    for (let i = aBullets.length - 1; i >= 0; i--) {
        const b = aBullets[i];
        for (let j = aAsteroids.length - 1; j >= 0; j--) {
            const a = aAsteroids[j];
            if (Math.hypot(b.x - a.x, b.y - a.y) < a.radius) {
                aBullets.splice(i, 1); aAsteroids.splice(j, 1);
                aExplodeAsteroid(a);
                break;
            }
        }
    }
    if (aShip.invulnerable <= 0) {
        for (let i = aAsteroids.length - 1; i >= 0; i--) {
            const a = aAsteroids[i];
            if (Math.hypot(aShip.x - a.x, aShip.y - a.y) < a.radius + aShip.radius * 0.6) {
                aDestroyShip(); break;
            }
        }
    }
}

function aDestroyShip() {
    playExplosion();
    for (let i = 0; i < 15; i++) {
        const ang = Math.random() * Math.PI * 2;
        aParticles.push({ x: aShip.x, y: aShip.y, vx: Math.cos(ang) * 3, vy: Math.sin(ang) * 3, life: 45, maxLife: 45, color: i % 2 === 0 ? '#00ffff' : '#ff00ff' });
    }
    aGame.lives--; aUpdateHUD();
    if (aGame.lives <= 0) aEndGame();
    else {
        aShip.x = aW / 2; aShip.y = aH / 2;
        aShip.vx = 0; aShip.vy = 0;
        aShip.angle = -Math.PI / 2;
        aShip.invulnerable = 120;
    }
}

function aEndGame() {
    aGame.running = false; aGame.gameOver = true;
    stopThrustSound();
    playGameOver();
    const isNewRecord = updateRecord('asteroids', aGame.score);
    document.getElementById('asteroidsFinalScore').textContent = aGame.score;
    document.getElementById('asteroidsBestScore').textContent = '🏆 RECORD : ' + getBestScore('asteroids');
    document.getElementById('asteroidsGameOver').classList.add('active');
    if (isNewRecord) setTimeout(() => showNewRecordPopup(aGame.score), 800);
}

function aUpdate() {
    if (!aGame.running) return;
    if (aShip.hyperCooldown > 0) aShip.hyperCooldown--;
    if (aShip.invulnerable > 0) aShip.invulnerable--;
    if (aKeys.ArrowLeft) aShip.angle -= 0.06;
    if (aKeys.ArrowRight) aShip.angle += 0.06;
    aShip.thrusting = aKeys.ArrowUp;
    if (aShip.thrusting) {
        startThrustSound();
        aShip.vx += Math.cos(aShip.angle) * 0.15;
        aShip.vy += Math.sin(aShip.angle) * 0.15;
        if (Math.random() < 0.6) {
            const back = aShip.angle + Math.PI;
            aParticles.push({
                x: aShip.x + Math.cos(back) * aShip.radius,
                y: aShip.y + Math.sin(back) * aShip.radius,
                vx: Math.cos(back) * 2 + (Math.random() - 0.5),
                vy: Math.sin(back) * 2 + (Math.random() - 0.5),
                life: 15, maxLife: 15,
                color: Math.random() < 0.5 ? '#00ffff' : '#ffdd00'
            });
        }
    } else {
        stopThrustSound();
    }
    if (aKeys.Space && !aShip._prevShoot) aShoot();
    aShip._prevShoot = aKeys.Space;
    aShip.vx *= 0.992; aShip.vy *= 0.992;
    aShip.x += aShip.vx; aShip.y += aShip.vy;
    if (aShip.x < -aShip.radius) aShip.x = aW + aShip.radius;
    if (aShip.x > aW + aShip.radius) aShip.x = -aShip.radius;
    if (aShip.y < -aShip.radius) aShip.y = aH + aShip.radius;
    if (aShip.y > aH + aShip.radius) aShip.y = -aShip.radius;
    for (let i = aBullets.length - 1; i >= 0; i--) {
        const b = aBullets[i];
        b.x += b.vx; b.y += b.vy; b.life--;
        if (b.x < 0) b.x = aW; if (b.x > aW) b.x = 0;
        if (b.y < 0) b.y = aH; if (b.y > aH) b.y = 0;
        if (b.life <= 0) aBullets.splice(i, 1);
    }
    for (const a of aAsteroids) {
        a.x += a.vx; a.y += a.vy; a.rotation += a.rotationSpeed;
        if (a.x < -a.radius) a.x = aW + a.radius;
        if (a.x > aW + a.radius) a.x = -a.radius;
        if (a.y < -a.radius) a.y = aH + a.radius;
        if (a.y > aH + a.radius) a.y = -a.radius;
    }
    for (let i = aParticles.length - 1; i >= 0; i--) {
        const p = aParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.97; p.vy *= 0.97; p.life--;
        if (p.life <= 0) aParticles.splice(i, 1);
    }
    if (aAsteroids.length === 0) {
        aGame.level++;
        aShip.invulnerable = 90;
        aSpawnWave(aSettings.asteroidCount + Math.floor(aGame.level / 2));
        aUpdateHUD();
        playPickup();
    }
    aCheckCollisions();
}

function aDrawShip() {
    if (aShip.invulnerable > 0 && Math.floor(aShip.invulnerable / 6) % 2 === 0) return;
    aCtx.save();
    aCtx.translate(aShip.x, aShip.y);
    aCtx.rotate(aShip.angle);
    aCtx.shadowColor = '#00ffff'; aCtx.shadowBlur = 12;
    aCtx.strokeStyle = '#00ffff'; aCtx.lineWidth = 2;
    aCtx.lineJoin = 'miter';
    aCtx.beginPath();
    aCtx.moveTo(aShip.radius, 0);
    aCtx.lineTo(-aShip.radius * 0.7, -aShip.radius * 0.7);
    aCtx.lineTo(-aShip.radius * 0.5, 0);
    aCtx.lineTo(-aShip.radius * 0.7, aShip.radius * 0.7);
    aCtx.closePath(); aCtx.stroke();
    if (aShip.thrusting && Math.random() > 0.3) {
        aCtx.beginPath();
        aCtx.moveTo(-aShip.radius * 0.5, -3);
        aCtx.lineTo(-aShip.radius * 1.4 - Math.random() * 8, 0);
        aCtx.lineTo(-aShip.radius * 0.5, 3);
        aCtx.strokeStyle = '#ffdd00'; aCtx.shadowColor = '#ffdd00'; aCtx.stroke();
    }
    aCtx.restore();
}

function aDrawAsteroids() {
    for (const a of aAsteroids) {
        aCtx.save();
        aCtx.translate(a.x, a.y); aCtx.rotate(a.rotation);
        aCtx.shadowColor = '#ff00ff'; aCtx.shadowBlur = 12;
        aCtx.strokeStyle = '#ff00ff'; aCtx.lineWidth = 2;
        aCtx.lineJoin = 'miter';
        aCtx.beginPath();
        for (let i = 0; i < a.points.length; i++) {
            const p = a.points[i];
            const x = Math.cos(p.angle) * p.radius;
            const y = Math.sin(p.angle) * p.radius;
            if (i === 0) aCtx.moveTo(x, y); else aCtx.lineTo(x, y);
        }
        aCtx.closePath(); aCtx.stroke();
        aCtx.restore();
    }
}

function aDrawBullets() {
    aCtx.save();
    aCtx.shadowColor = '#ffdd00'; aCtx.shadowBlur = 10;
    aCtx.fillStyle = '#ffdd00';
    for (const b of aBullets) {
        aCtx.beginPath(); aCtx.arc(b.x, b.y, 2.5, 0, Math.PI * 2); aCtx.fill();
    }
    aCtx.restore();
}

function aDrawParticles() {
    for (const p of aParticles) {
        const alpha = p.life / p.maxLife;
        aCtx.save();
        aCtx.globalAlpha = alpha;
        aCtx.shadowColor = p.color; aCtx.shadowBlur = 8;
        aCtx.fillStyle = p.color;
        const s = 2 + alpha * 2;
        aCtx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        aCtx.restore();
    }
}

function aRender() {
    if (!aCtx) return;
    aCtx.fillStyle = '#0a0a1e';
    aCtx.fillRect(0, 0, aW, aH);
    aCtx.strokeStyle = 'rgba(0, 255, 255, 0.06)';
    aCtx.lineWidth = 1;
    for (let x = 0; x < aW; x += 40) { aCtx.beginPath(); aCtx.moveTo(x, 0); aCtx.lineTo(x, aH); aCtx.stroke(); }
    for (let y = 0; y < aH; y += 40) { aCtx.beginPath(); aCtx.moveTo(0, y); aCtx.lineTo(aW, y); aCtx.stroke(); }
    if (!aGame.running && !aGame.gameOver) return;
    aDrawParticles(); aDrawAsteroids(); aDrawBullets(); aDrawShip();
}

function aRenderLoop() {
    aUpdate();
    aRender();
    aGameLoopId = requestAnimationFrame(aRenderLoop);
}