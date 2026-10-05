// ============================================
// 🏓 PADDLE (corrigé + tactile)
// ============================================
var pCanvas, pCtx, pW, pH;
var pSettings, pGame, pKeys, pPaddle, pBall;
var pBricks = [], pParticles = [], pPowerUps = [], pBallMulti = [];
var pPaddleWideTimer = 0, pPaddleSlowTimer = 0;
var pGameLoopId = null;

const paddleDiffSettings = {
    easy:   { ballSpeed: 5, paddleWidth: 160, lives: 5, rows: 4 },
    normal: { ballSpeed: 7, paddleWidth: 130, lives: 3, rows: 5 },
    hard:   { ballSpeed: 9, paddleWidth: 100, lives: 2, rows: 6 }
};

const P_BRICK_COLS = 10, P_BRICK_PADDING = 8, P_BRICK_TOP = 80, P_BRICK_H = 28;
const P_ROW_COLORS = ['#ff3366', '#ff00ff', '#00ffff', '#00ff88', '#ffdd00', '#ff8800'];
const P_POWERUP_CHANCE = 0.18;
const P_POWERUP_TYPES = {
    WIDE:   { color: '#00ff88', label: 'W' },
    MULTI:  { color: '#ff00ff', label: 'M' },
    SLOW:   { color: '#00ffff', label: 'S' },
    LIFE:   { color: '#ff3366', label: '♥' }
};

function initPaddle() {
    pCanvas = document.getElementById('paddleCanvas');
    if (!pCanvas) {
        console.error('❌ Canvas Paddle introuvable !');
        return;
    }
    pCtx = pCanvas.getContext('2d');
    
    pSettings = paddleDiffSettings.normal;
    pGame = { score: 0, lives: 3, level: 1, running: false, gameOver: false };
    pKeys = { ArrowLeft: false, ArrowRight: false, Space: false };
    pPaddle = { x: 0, y: 0, width: 130, height: 16, speed: 10, baseWidth: 130 };
    pBall = { x: 0, y: 0, vx: 0, vy: 0, radius: 8, speed: 7, stuck: true, baseSpeed: 7 };
    pBricks = []; pParticles = []; pPowerUps = []; pBallMulti = [];
    pPaddleWideTimer = 0; pPaddleSlowTimer = 0;
    
    pResize();
    console.log('✅ Paddle initialisé');
}

function pResize() {
    if (!pCanvas) return;
    pW = pCanvas.width = window.innerWidth;
    pH = pCanvas.height = window.innerHeight;
}

function pInit() {
    pResize();
    pGame.score = 0; pGame.lives = pSettings.lives;
    pGame.level = 1; pGame.gameOver = false;
    pPaddle.baseWidth = pSettings.paddleWidth;
    pPaddle.width = pPaddle.baseWidth;
    pPaddle.x = pW / 2 - pPaddle.width / 2;
    pPaddle.y = pH - 60;
    pBall.baseSpeed = pSettings.ballSpeed;
    pBall.speed = pSettings.ballSpeed;
    pResetBall();
    pParticles = []; pPowerUps = []; pBallMulti = [];
    pPaddleWideTimer = 0; pPaddleSlowTimer = 0;
    pCreateBricks();
    pUpdateHUD();
}

function pResetBall() {
    pBall.x = pW / 2; pBall.y = pPaddle.y - pBall.radius - 2;
    pBall.vx = 0; pBall.vy = 0; pBall.stuck = true;
}

function pLaunchBall() {
    if (!pBall.stuck) return;
    playShoot();
    pBall.stuck = false;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    pBall.vx = Math.cos(angle) * pBall.speed;
    pBall.vy = Math.sin(angle) * pBall.speed;
}

function pCreateBricks() {
    pBricks = [];
    const rows = pSettings.rows;
    const totalPad = P_BRICK_PADDING * (P_BRICK_COLS + 1);
    const bw = (pW - totalPad) / P_BRICK_COLS;
    
    const custom = (paddleMode === 'custom' && typeof loadCustomLevel === 'function') ? loadCustomLevel() : null;
    
    if (custom) {
        const editorRows = custom.length;
        const editorCols = custom[0].length;
        const bw2 = (pW - totalPad) / editorCols;
        const cellH = 28;
        for (let r = 0; r < editorRows; r++) {
            for (let c = 0; c < editorCols; c++) {
                if (custom[r][c] >= 0) {
                    pBricks.push({
                        x: P_BRICK_PADDING + c * (bw2 + P_BRICK_PADDING),
                        y: P_BRICK_TOP + r * (cellH + P_BRICK_PADDING),
                        width: bw2, height: cellH,
                        color: (typeof EDITOR_COLORS !== 'undefined') ? EDITOR_COLORS[custom[r][c]] : '#ff3366',
                        points: (editorRows - r) * 10,
                        alive: true
                    });
                }
            }
        }
    } else {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < P_BRICK_COLS; c++) {
                pBricks.push({
                    x: P_BRICK_PADDING + c * (bw + P_BRICK_PADDING),
                    y: P_BRICK_TOP + r * (P_BRICK_H + P_BRICK_PADDING),
                    width: bw, height: P_BRICK_H,
                    color: P_ROW_COLORS[r % P_ROW_COLORS.length],
                    points: (rows - r) * 10, alive: true
                });
            }
        }
    }
}

function pUpdateHUD() {
    const scoreEl = document.getElementById('paddleScore');
    const levelEl = document.getElementById('paddleLevel');
    const livesEl = document.getElementById('paddleLives');
    if (scoreEl) scoreEl.textContent = pGame.score;
    if (levelEl) levelEl.textContent = pGame.level;
    if (livesEl) livesEl.textContent = '♥'.repeat(Math.max(0, pGame.lives));
}

function startPaddleGame() {
    pSettings = paddleDiffSettings[difficulties.paddle];
    showView('paddleGameView');
    const gv = document.getElementById('paddleGameView');
    if (gv) gv.classList.add('active');
    pGame.running = false;
    pGame.gameOver = false;
    const msg = document.getElementById('paddleStartMsg');
    if (msg) msg.classList.add('active');
    const go = document.getElementById('paddleGameOver');
    if (go) go.classList.remove('active');
    const got = document.getElementById('paddleGameOverTitle');
    if (got) got.classList.remove('win');
    pResize();
    pInit();
    if (pGameLoopId) cancelAnimationFrame(pGameLoopId);
    pRenderLoop();
}

function pStartGame() {
    const msg = document.getElementById('paddleStartMsg');
    if (msg) msg.classList.remove('active');
    if (!pBall.stuck) return;
    pLaunchBall();
    pGame.running = true;
}

function quitToPaddleMenu() {
    pGame.running = false;
    pGame.gameOver = false;
    if (pGameLoopId) cancelAnimationFrame(pGameLoopId);
    pGameLoopId = null;
    const msg = document.getElementById('paddleStartMsg');
    if (msg) msg.classList.remove('active');
    const go = document.getElementById('paddleGameOver');
    if (go) go.classList.remove('active');
    const gv = document.getElementById('paddleGameView');
    if (gv) gv.classList.remove('active');
    showView('paddleView');
}

function pUpdate() {
    if (!pGame.running) {
        pMovePaddle();
        if (pBall.stuck) { pBall.x = pPaddle.x + pPaddle.width / 2; pBall.y = pPaddle.y - pBall.radius - 2; }
        return;
    }
    pMovePaddle();
    pBall.x += pBall.vx; pBall.y += pBall.vy;
    if (pBall.x - pBall.radius < 0) { pBall.x = pBall.radius; pBall.vx = -pBall.vx; }
    if (pBall.x + pBall.radius > pW) { pBall.x = pW - pBall.radius; pBall.vx = -pBall.vx; }
    if (pBall.y - pBall.radius < 0) { pBall.y = pBall.radius; pBall.vy = -pBall.vy; }
    
    if (pBall.vy > 0 && pBall.y + pBall.radius >= pPaddle.y && pBall.y - pBall.radius <= pPaddle.y + pPaddle.height && pBall.x >= pPaddle.x && pBall.x <= pPaddle.x + pPaddle.width) {
        pBall.y = pPaddle.y - pBall.radius;
        const hitPos = (pBall.x - (pPaddle.x + pPaddle.width / 2)) / (pPaddle.width / 2);
        const angle = hitPos * (Math.PI / 3);
        const speed = Math.hypot(pBall.vx, pBall.vy);
        pBall.vx = Math.sin(angle) * speed;
        pBall.vy = -Math.cos(angle) * speed;
        playBeep(440, 0.05, 'square', 0.08);
    }
    if (pBall.y - pBall.radius > pH) pLoseLife();
    
    for (const b of pBricks) {
        if (!b.alive) continue;
        if (pBall.x + pBall.radius > b.x && pBall.x - pBall.radius < b.x + b.width &&
            pBall.y + pBall.radius > b.y && pBall.y - pBall.radius < b.y + b.height) {
            const oL = (pBall.x + pBall.radius) - b.x;
            const oR = (b.x + b.width) - (pBall.x - pBall.radius);
            const oT = (pBall.y + pBall.radius) - b.y;
            const oB = (b.y + b.height) - (pBall.y - pBall.radius);
            const mX = Math.min(oL, oR);
            const mY = Math.min(oT, oB);
            if (mX < mY) { pBall.vx = -pBall.vx; pBall.x += pBall.vx > 0 ? mX : -mX; }
            else { pBall.vy = -pBall.vy; pBall.y += pBall.vy > 0 ? mY : -mY; }
            b.alive = false;
            pGame.score += b.points;
            pUpdateHUD();
            playBeep(660, 0.06, 'square', 0.1);
            
            if (Math.random() < P_POWERUP_CHANCE) {
                const types = Object.keys(P_POWERUP_TYPES);
                const type = types[Math.floor(Math.random() * types.length)];
                pPowerUps.push({
                    x: b.x + b.width / 2,
                    y: b.y + b.height / 2,
                    vy: 2.5,
                    type: type,
                    ...P_POWERUP_TYPES[type]
                });
            }
            
            for (let i = 0; i < 8; i++) {
                pParticles.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 25, maxLife: 25, color: b.color });
            }
            pBall.vx *= 1.01; pBall.vy *= 1.01;
            break;
        }
    }
    
    pUpdatePowerUps();
    pUpdateMultiBalls();
    
    for (let i = pParticles.length - 1; i >= 0; i--) {
        const p = pParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96; p.life--;
        if (p.life <= 0) pParticles.splice(i, 1);
    }
    if (pBricks.filter(b => b.alive).length === 0) pNextLevel();
}

function pMovePaddle() {
    if (pKeys.ArrowLeft) pPaddle.x -= pPaddle.speed;
    if (pKeys.ArrowRight) pPaddle.x += pPaddle.speed;
    if (pPaddle.x < 0) pPaddle.x = 0;
    if (pPaddle.x + pPaddle.width > pW) pPaddle.x = pW - pPaddle.width;
}

function applyPowerUp(powerUp) {
    playPickup();
    switch (powerUp.type) {
        case 'WIDE':
            pPaddle.width = pPaddle.baseWidth * 1.6;
            if (pPaddle.x + pPaddle.width > pW) pPaddle.x = pW - pPaddle.width;
            pPaddleWideTimer = 600;
            break;
        case 'MULTI':
            for (let i = 0; i < 2; i++) {
                pBallMulti.push({
                    x: pBall.x, y: pBall.y,
                    vx: Math.cos((i - 0.5) * 1) * pBall.speed,
                    vy: -Math.abs(Math.sin((i - 0.5) * 1) * pBall.speed),
                    radius: pBall.radius
                });
            }
            break;
        case 'SLOW':
            pBall.speed = pBall.baseSpeed * 0.7;
            pPaddleSlowTimer = 400;
            break;
        case 'LIFE':
            pGame.lives++;
            pUpdateHUD();
            break;
    }
}

function pUpdatePowerUps() {
    for (let i = pPowerUps.length - 1; i >= 0; i--) {
        const pu = pPowerUps[i];
        pu.y += pu.vy;
        if (pu.y + 12 > pPaddle.y && pu.y - 12 < pPaddle.y + pPaddle.height &&
            pu.x > pPaddle.x && pu.x < pPaddle.x + pPaddle.width) {
            applyPowerUp(pu);
            pPowerUps.splice(i, 1);
            continue;
        }
        if (pu.y > pH) pPowerUps.splice(i, 1);
    }
    if (pPaddleWideTimer > 0) {
        pPaddleWideTimer--;
        if (pPaddleWideTimer === 0) {
            pPaddle.width = pPaddle.baseWidth;
            if (pPaddle.x + pPaddle.width > pW) pPaddle.x = pW - pPaddle.width;
        }
    }
    if (pPaddleSlowTimer > 0) {
        pPaddleSlowTimer--;
        if (pPaddleSlowTimer === 0) pBall.speed = pBall.baseSpeed;
    }
}

function pUpdateMultiBalls() {
    for (let i = pBallMulti.length - 1; i >= 0; i--) {
        const b = pBallMulti[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x - b.radius < 0) { b.x = b.radius; b.vx = -b.vx; }
        if (b.x + b.radius > pW) { b.x = pW - b.radius; b.vx = -b.vx; }
        if (b.y - b.radius < 0) { b.y = b.radius; b.vy = -b.vy; }
        if (b.vy > 0 && b.y + b.radius >= pPaddle.y && b.y - b.radius <= pPaddle.y + pPaddle.height &&
            b.x >= pPaddle.x && b.x <= pPaddle.x + pPaddle.width) {
            b.y = pPaddle.y - b.radius;
            const hitPos = (b.x - (pPaddle.x + pPaddle.width / 2)) / (pPaddle.width / 2);
            const angle = hitPos * (Math.PI / 3);
            const speed = Math.hypot(b.vx, b.vy);
            b.vx = Math.sin(angle) * speed;
            b.vy = -Math.cos(angle) * speed;
        }
        for (const brick of pBricks) {
            if (!brick.alive) continue;
            if (b.x + b.radius > brick.x && b.x - b.radius < brick.x + brick.width &&
                b.y + b.radius > brick.y && b.y - b.radius < brick.y + brick.height) {
                const oL = (b.x + b.radius) - brick.x;
                const oR = (brick.x + brick.width) - (b.x - b.radius);
                const oT = (b.y + b.radius) - brick.y;
                const oB = (brick.y + brick.height) - (b.y - b.radius);
                const mX = Math.min(oL, oR);
                const mY = Math.min(oT, oB);
                if (mX < mY) { b.vx = -b.vx; b.x += b.vx > 0 ? mX : -mX; }
                else { b.vy = -b.vy; b.y += b.vy > 0 ? mY : -mY; }
                brick.alive = false;
                pGame.score += brick.points;
                pUpdateHUD();
                playBeep(660, 0.06, 'square', 0.1);
                break;
            }
        }
        if (b.y - b.radius > pH) pBallMulti.splice(i, 1);
    }
}

function pLoseLife() {
    pGame.lives--; pUpdateHUD();
    if (pGame.lives <= 0) pEndGame();
    else {
        pResetBall();
        pGame.running = false;
        const msg = document.getElementById('paddleStartMsg');
        if (msg) msg.classList.add('active');
    }
}

function pNextLevel() {
    pGame.level++;
    pGame.score += 100;
    pUpdateHUD();
    pSettings.rows = Math.min(pSettings.rows + 1, 7);
    pCreateBricks(); pResetBall();
    playPickup();
    pGame.running = false;
    const msg = document.getElementById('paddleStartMsg');
    if (msg) msg.classList.add('active');
}

function pEndGame() {
    pGame.running = false;
    pGame.gameOver = true;
    playGameOver();
    
    const isNewRecord = (typeof updateRecord === 'function') ? updateRecord('paddle', pGame.score) : false;
    const fs = document.getElementById('paddleFinalScore');
    const bs = document.getElementById('paddleBestScore');
    const go = document.getElementById('paddleGameOver');
    if (fs) fs.textContent = pGame.score;
    if (bs && typeof getBestScore === 'function') {
        bs.textContent = '🏆 RECORD : ' + getBestScore('paddle');
    }
    if (go) go.classList.add('active');
    if (isNewRecord && typeof showNewRecordPopup === 'function') {
        setTimeout(() => showNewRecordPopup(pGame.score), 800);
    }
}

function pDraw() {
    if (!pCtx) return;
    pCtx.fillStyle = '#0a0a1e';
    pCtx.fillRect(0, 0, pW, pH);
    pCtx.strokeStyle = 'rgba(0, 255, 255, 0.06)';
    pCtx.lineWidth = 1;
    for (let x = 0; x < pW; x += 40) { pCtx.beginPath(); pCtx.moveTo(x, 0); pCtx.lineTo(x, pH); pCtx.stroke(); }
    for (let y = 0; y < pH; y += 40) { pCtx.beginPath(); pCtx.moveTo(0, y); pCtx.lineTo(pW, y); pCtx.stroke(); }
    
    for (const p of pParticles) {
        const alpha = p.life / p.maxLife;
        pCtx.save();
        pCtx.globalAlpha = alpha;
        pCtx.shadowColor = p.color; pCtx.shadowBlur = 8;
        pCtx.fillStyle = p.color;
        const s = 2 + alpha * 3;
        pCtx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        pCtx.restore();
    }
    
    for (const b of pBricks) {
        if (!b.alive) continue;
        pCtx.save();
        pCtx.shadowColor = b.color; pCtx.shadowBlur = 10;
        pCtx.fillStyle = b.color;
        pCtx.fillRect(b.x, b.y, b.width, b.height);
        pCtx.restore();
    }
    
    for (const pu of pPowerUps) {
        pCtx.save();
        pCtx.shadowColor = pu.color; pCtx.shadowBlur = 15;
        pCtx.fillStyle = pu.color;
        pCtx.fillRect(pu.x - 12, pu.y - 12, 24, 24);
        pCtx.fillStyle = '#0a0a1e';
        pCtx.font = 'bold 14px "Press Start 2P"';
        pCtx.textAlign = 'center';
        pCtx.textBaseline = 'middle';
        pCtx.fillText(pu.label, pu.x, pu.y + 2);
        pCtx.restore();
    }
    
    for (const b of pBallMulti) {
        pCtx.save();
        pCtx.shadowColor = '#ffdd00'; pCtx.shadowBlur = 12;
        pCtx.fillStyle = '#ffdd00';
        pCtx.beginPath(); pCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); pCtx.fill();
        pCtx.restore();
    }
    
    pCtx.save();
    pCtx.shadowColor = '#00ffff'; pCtx.shadowBlur = 15;
    pCtx.fillStyle = '#00ffff';
    pCtx.fillRect(pPaddle.x, pPaddle.y, pPaddle.width, pPaddle.height);
    pCtx.restore();
    
    pCtx.save();
    pCtx.shadowColor = '#ffdd00'; pCtx.shadowBlur = 15;
    pCtx.fillStyle = '#ffdd00';
    pCtx.beginPath(); pCtx.arc(pBall.x, pBall.y, pBall.radius, 0, Math.PI * 2); pCtx.fill();
    pCtx.restore();
}

function pRenderLoop() {
    pUpdate();
    pDraw();
    pGameLoopId = requestAnimationFrame(pRenderLoop);
}