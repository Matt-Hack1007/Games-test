// ============================================
// 👾 INVADERS
// ============================================
var iCanvas, iCtx, iW, iH;
var iSettings, iGame, iKeys, iPlayer;
var iInvaders = [], iBullets = [], iInvaderBullets = [], iParticles = [];
var iDirection = 1, iSpeedMult = 1, iShootCooldown = 0;
var iUfo = null, iUfoTimer = 0;
var iGameLoopId = null;

const invadersDiffSettings = {
    easy:   { rows: 3, cols: 8, moveSpeed: 0.5, fireRate: 0.004, playerSpeed: 7, bulletSpeed: 10, lives: 5 },
    normal: { rows: 4, cols: 10, moveSpeed: 0.8, fireRate: 0.008, playerSpeed: 6, bulletSpeed: 12, lives: 3 },
    hard:   { rows: 5, cols: 11, moveSpeed: 1.2, fireRate: 0.014, playerSpeed: 5, bulletSpeed: 14, lives: 2 }
};

const INVADER_A_PAT = ["00100000100","00010001000","00111111100","01101110110","11111111111","10111111101","10100000101","00011011000"];
const INVADER_B_PAT = ["00011111000","00111111100","01111111110","11100100111","11111111111","00111011100","00100100100","01100000110"];
const INVADER_C_PAT = ["00011000","00111100","01111110","11011011","11111111","00100100","01011010","10100101"];

function initInvaders() {
    iCanvas = document.getElementById('invadersCanvas');
    if (!iCanvas) {
        console.error('❌ Canvas Invaders introuvable !');
        return;
    }
    iCtx = iCanvas.getContext('2d');
    iSettings = invadersDiffSettings.normal;
    iGame = { score: 0, lives: 3, level: 1, running: false, gameOver: false };
    iKeys = { ArrowLeft: false, ArrowRight: false, Space: false };
    iPlayer = { x: 0, y: 0, width: 40, height: 24, speed: 6 };
    iInvaders = []; iBullets = []; iInvaderBullets = []; iParticles = [];
    iDirection = 1; iSpeedMult = 1; iShootCooldown = 0;
    iUfo = null; iUfoTimer = 0;
    iResize();
    if (typeof onResize === 'function') {
        onResize(() => {
            if (iCanvas && document.getElementById('invadersGameView')?.classList.contains('active')) {
                iResize();
                if (iPlayer) {
                    iPlayer.x = iW / 2 - iPlayer.width / 2;
                    iPlayer.y = iH - 80;
                }
            }
        });
    }
    console.log('✅ Invaders initialisé');
}

function iResize() {
    if (!iCanvas) return;
    if (typeof resizeCanvas === 'function') {
        const size = resizeCanvas(iCanvas, iCtx);
        iW = size.width;
        iH = size.height;
    } else {
        iW = iCanvas.width = window.visualViewport?.width || window.innerWidth;
        iH = iCanvas.height = window.visualViewport?.height || window.innerHeight;
    }
}

function iInit() {
    iResize();
    iGame.score = 0;
    iGame.lives = iSettings.lives;
    iGame.level = 1;
    iGame.gameOver = false;
    iPlayer.width = 40; iPlayer.height = 24;
    iPlayer.speed = iSettings.playerSpeed;
    iPlayer.x = iW / 2 - iPlayer.width / 2;
    iPlayer.y = iH - 80;
    iInvaders = []; iBullets = []; iInvaderBullets = []; iParticles = [];
    iDirection = 1; iSpeedMult = 1; iShootCooldown = 0;
    iUfo = null; iUfoTimer = 0;
    iSpawnInvaders();
    iUpdateHUD();
}

function iSpawnInvaders() {
    iInvaders = [];
    const rows = iSettings.rows, cols = iSettings.cols;
    const cw = 50, ch = 44;
    const sx = (iW - cols * cw) / 2;
    const sy = Math.max(60, iH * 0.1);
    for (let r = 0; r < rows; r++) {
        let type = r < 1 ? 0 : r < 3 ? 1 : 2;
        const pat = type === 0 ? INVADER_A_PAT : type === 1 ? INVADER_B_PAT : INVADER_C_PAT;
        const color = type === 0 ? '#00ffff' : type === 1 ? '#ff00ff' : '#00ff88';
        const points = type === 0 ? 10 : type === 1 ? 20 : 30;
        for (let c = 0; c < cols; c++) {
            iInvaders.push({ x: sx + c * cw, y: sy + r * ch, width: 33, height: 24, pattern: pat, color, points, row: r, col: c, alive: true });
        }
    }
}

function iUpdateHUD() {
    const scoreEl = document.getElementById('invadersScore');
    const levelEl = document.getElementById('invadersLevel');
    const livesEl = document.getElementById('invadersLives');
    if (scoreEl) scoreEl.textContent = iGame.score;
    if (levelEl) levelEl.textContent = iGame.level;
    if (livesEl) livesEl.textContent = '♥'.repeat(Math.max(0, iGame.lives));
}

function startInvadersGame() {
    iSettings = invadersDiffSettings[difficulties.invaders];
    showView('invadersGameView');
    const gv = document.getElementById('invadersGameView');
    if (gv) gv.classList.add('active');
    iGame.running = false;
    iGame.gameOver = false;
    const go = document.getElementById('invadersGameOver');
    if (go) go.classList.remove('active');
    setTimeout(() => {
        iResize();
        iInit();
        if (iGameLoopId) cancelAnimationFrame(iGameLoopId);
        iRenderLoop();
        showCountdown('invaders', () => {
            iGame.running = true;
        });
    }, 50);
}

function quitToInvadersMenu() {
    iGame.running = false;
    iGame.gameOver = false;
    if (iGameLoopId) cancelAnimationFrame(iGameLoopId);
    iGameLoopId = null;
    const go = document.getElementById('invadersGameOver');
    if (go) go.classList.remove('active');
    const gv = document.getElementById('invadersGameView');
    if (gv) gv.classList.remove('active');
    showView('invadersView');
}

function iShoot() {
    if (iShootCooldown > 0) return;
    if (!iGame.running) return;
    iShootCooldown = 12;
    playShoot();
    iBullets.push({ x: iPlayer.x + iPlayer.width / 2, y: iPlayer.y, vy: -iSettings.bulletSpeed });
}

function iUpdate() {
    if (!iGame.running) return;
    if (iShootCooldown > 0) iShootCooldown--;
    if (iKeys.ArrowLeft) iPlayer.x -= iPlayer.speed;
    if (iKeys.ArrowRight) iPlayer.x += iPlayer.speed;
    if (iPlayer.x < 0) iPlayer.x = 0;
    if (iPlayer.x + iPlayer.width > iW) iPlayer.x = iW - iPlayer.width;
    if (iKeys.Space) iShoot();
    const alive = iInvaders.filter(v => v.alive);
    if (alive.length === 0) {
        iGame.level++;
        iSpeedMult = 1 + (iGame.level - 1) * 0.15;
        iSpawnInvaders();
        iDirection = 1;
        iUpdateHUD();
        playPickup();
        return;
    }
    const factor = iSpeedMult * (1 + (iSettings.rows * iSettings.cols - alive.length) * 0.02);
    let moveX = iDirection * iSettings.moveSpeed * factor;
    let hitEdge = false;
    for (const inv of alive) {
        if (iDirection > 0 && inv.x + inv.width + moveX > iW - 20) { hitEdge = true; break; }
        if (iDirection < 0 && inv.x + moveX < 20) { hitEdge = true; break; }
    }
    if (hitEdge) {
        iDirection *= -1;
        for (const inv of alive) inv.y += 20;
    } else {
        for (const inv of alive) inv.x += moveX;
    }
    for (const inv of alive) {
        if (Math.random() < iSettings.fireRate) {
            const col = alive.filter(v => v.col === inv.col);
            const bottom = col.reduce((a, b) => a.y > b.y ? a : b);
            if (bottom === inv) iInvaderBullets.push({ x: inv.x + inv.width / 2, y: inv.y + inv.height, vy: iSettings.bulletSpeed * 0.5 });
        }
    }
    iUfoTimer++;
    if (!iUfo && iUfoTimer > 300 && Math.random() < 0.005) {
        const fromLeft = Math.random() < 0.5;
        iUfo = {
            x: fromLeft ? -50 : iW + 50,
            y: 60,
            vx: fromLeft ? 2.5 : -2.5,
            width: 45, height: 20,
            points: [50, 100, 150, 300][Math.floor(Math.random() * 4)]
        };
        playBeep(1200, 0.15, 'sine', 0.12);
    }
    if (iUfo) {
        iUfo.x += iUfo.vx;
        if (iUfo.x < -100 || iUfo.x > iW + 100) iUfo = null;
        for (let i = iBullets.length - 1; i >= 0; i--) {
            const b = iBullets[i];
            if (b.x > iUfo.x && b.x < iUfo.x + iUfo.width && b.y > iUfo.y && b.y < iUfo.y + iUfo.height) {
                iBullets.splice(i, 1);
                iGame.score += iUfo.points;
                iUpdateHUD();
                playExplosion();
                playPickup();
                for (let j = 0; j < 25; j++) {
                    const a = Math.random() * Math.PI * 2;
                    const sp = 2 + Math.random() * 5;
                    iParticles.push({
                        x: iUfo.x + iUfo.width / 2,
                        y: iUfo.y + iUfo.height / 2,
                        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                        life: 40, maxLife: 40,
                        color: j % 2 === 0 ? '#ffdd00' : '#ff8800'
                    });
                }
                iUfo = null;
                break;
            }
        }
    }
    for (let i = iBullets.length - 1; i >= 0; i--) {
        const b = iBullets[i];
        b.y += b.vy;
        if (b.y < -20) { iBullets.splice(i, 1); continue; }
        for (const inv of alive) {
            if (b.x > inv.x && b.x < inv.x + inv.width && b.y > inv.y && b.y < inv.y + inv.height) {
                inv.alive = false;
                iGame.score += inv.points;
                iUpdateHUD();
                playExplosion();
                for (let j = 0; j < 8; j++) {
                    iParticles.push({ x: inv.x + inv.width / 2, y: inv.y + inv.height / 2, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 25, maxLife: 25, color: inv.color });
                }
                iBullets.splice(i, 1);
                break;
            }
        }
    }
    for (let i = iInvaderBullets.length - 1; i >= 0; i--) {
        const b = iInvaderBullets[i];
        b.y += b.vy;
        if (b.y > iH + 20) { iInvaderBullets.splice(i, 1); continue; }
        if (b.x > iPlayer.x && b.x < iPlayer.x + iPlayer.width && b.y > iPlayer.y && b.y < iPlayer.y + iPlayer.height) {
            iInvaderBullets.splice(i, 1);
            iDestroyPlayer();
            return;
        }
    }
    for (const inv of alive) {
        if (inv.y + inv.height >= iPlayer.y) { iDestroyPlayer(); return; }
    }
    for (let i = iParticles.length - 1; i >= 0; i--) {
        const p = iParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96; p.life--;
        if (p.life <= 0) iParticles.splice(i, 1);
    }
}

function iDestroyPlayer() {
    playExplosion();
    for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2;
        iParticles.push({ x: iPlayer.x + iPlayer.width / 2, y: iPlayer.y + iPlayer.height / 2, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4, life: 40, maxLife: 40, color: i % 2 === 0 ? '#00ff88' : '#ffdd00' });
    }
    iGame.lives--;
    iUpdateHUD();
    if (iGame.lives <= 0) iEndGame();
    else {
        iPlayer.x = iW / 2 - iPlayer.width / 2;
        iPlayer.y = iH - 80;
        iBullets = []; iInvaderBullets = [];
    }
}

function iEndGame() {
    iGame.running = false;
    iGame.gameOver = true;
    playGameOver();
    const isNewRecord = (typeof updateRecord === 'function') ? updateRecord('invaders', iGame.score) : false;
    const fs = document.getElementById('invadersFinalScore');
    const bs = document.getElementById('invadersBestScore');
    const go = document.getElementById('invadersGameOver');
    if (fs) fs.textContent = iGame.score;
    if (bs && typeof getBestScore === 'function') bs.textContent = '🏆 RECORD : ' + getBestScore('invaders');
    if (go) go.classList.add('active');
    if (isNewRecord && typeof showNewRecordPopup === 'function') setTimeout(() => showNewRecordPopup(iGame.score), 800);
}

function iDrawPattern(pattern, x, y, size, color) {
    iCtx.fillStyle = color;
    for (let r = 0; r < pattern.length; r++) {
        for (let c = 0; c < pattern[r].length; c++) {
            if (pattern[r][c] === '1') iCtx.fillRect(x + c * size, y + r * size, size, size);
        }
    }
}

function iDraw() {
    if (!iCtx) return;
    iCtx.fillStyle = '#0a0a1e';
    iCtx.fillRect(0, 0, iW, iH);
    iCtx.strokeStyle = 'rgba(0, 255, 255, 0.06)';
    for (let x = 0; x < iW; x += 40) { iCtx.beginPath(); iCtx.moveTo(x, 0); iCtx.lineTo(x, iH); iCtx.stroke(); }
    for (let y = 0; y < iH; y += 40) { iCtx.beginPath(); iCtx.moveTo(0, y); iCtx.lineTo(iW, y); iCtx.stroke(); }
    for (const p of iParticles) {
        const alpha = p.life / p.maxLife;
        iCtx.save();
        iCtx.globalAlpha = alpha;
        iCtx.shadowColor = p.color; iCtx.shadowBlur = 8;
        iCtx.fillStyle = p.color;
        const s = 2 + alpha * 3;
        iCtx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        iCtx.restore();
    }
    iCtx.save();
    iCtx.shadowColor = '#ffdd00'; iCtx.shadowBlur = 10;
    iCtx.fillStyle = '#ffdd00';
    for (const b of iBullets) iCtx.fillRect(b.x - 2, b.y - 8, 4, 12);
    iCtx.restore();
    iCtx.save();
    iCtx.shadowColor = '#ff3366'; iCtx.shadowBlur = 10;
    iCtx.fillStyle = '#ff3366';
    for (const b of iInvaderBullets) iCtx.fillRect(b.x - 2, b.y, 4, 12);
    iCtx.restore();
    for (const inv of iInvaders) {
        if (!inv.alive) continue;
        iCtx.save();
        iCtx.shadowColor = inv.color; iCtx.shadowBlur = 10;
        const px = 3;
        const pw = inv.pattern[0].length * px;
        const ph = inv.pattern.length * px;
        iDrawPattern(inv.pattern, inv.x + (inv.width - pw) / 2, inv.y + (inv.height - ph) / 2, px, inv.color);
        iCtx.restore();
    }
    if (iUfo) {
        iCtx.save();
        iCtx.shadowColor = '#ffdd00';
        iCtx.shadowBlur = 18;
        iCtx.fillStyle = '#ffdd00';
        const px = 3;
        const ufoPat = [
            "0001111110000","0011111111100","0111111111110",
            "1111111111111","0011100111000","0100010001000"
        ];
        for (let r = 0; r < ufoPat.length; r++) {
            for (let c = 0; c < ufoPat[r].length; c++) {
                if (ufoPat[r][c] === '1') {
                    iCtx.fillRect(iUfo.x + c * px, iUfo.y + r * px, px, px);
                }
            }
        }
        iCtx.restore();
        iCtx.save();
        iCtx.fillStyle = '#ffffff';
        iCtx.font = 'bold 14px "Press Start 2P"';
        iCtx.textAlign = 'center';
        iCtx.shadowColor = '#ffdd00';
        iCtx.shadowBlur = 10;
        iCtx.fillText(iUfo.points, iUfo.x + iUfo.width / 2, iUfo.y - 8);
        iCtx.restore();
    }
    iCtx.save();
    iCtx.shadowColor = '#00ff88'; iCtx.shadowBlur = 12;
    iCtx.fillStyle = '#00ff88';
    const bx = iPlayer.x, by = iPlayer.y;
    iCtx.fillRect(bx + 15, by, 10, 3);
    iCtx.fillRect(bx + 12, by + 3, 16, 3);
    iCtx.fillRect(bx + 9, by + 6, 22, 3);
    iCtx.fillRect(bx + 6, by + 9, 28, 3);
    iCtx.fillRect(bx, by + 12, 40, 3);
    iCtx.fillRect(bx, by + 15, 4, 3);
    iCtx.fillRect(bx + 36, by + 15, 4, 3);
    iCtx.restore();
}

function iRenderLoop() {
    iUpdate();
    iDraw();
    iGameLoopId = requestAnimationFrame(iRenderLoop);
}