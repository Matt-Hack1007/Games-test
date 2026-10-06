// ============================================
// 🐍 SNAKE
// ============================================
var sCanvas, sCtx, sW, sH, sGridSize = 24, sCols, sRows;
var sSettings, sGame, sKeys;
var sSnake = [], sDir, sNextDir, sApple;
var sLastTick = 0;
var sGameLoopId = null;
var sAppleEatenAnim = 0;

const snakeDiffSettings = {
    easy:   { tickRate: 200, startLength: 3 },
    normal: { tickRate: 140, startLength: 4 },
    hard:   { tickRate: 90,  startLength: 5 }
};

function initSnake() {
    sCanvas = document.getElementById('snakeCanvas');
    if (!sCanvas) {
        console.error('❌ Canvas Snake introuvable !');
        return;
    }
    sCtx = sCanvas.getContext('2d');
    sSettings = snakeDiffSettings.normal;
    sGame = { score: 0, level: 1, running: false, gameOver: false, paused: false };
    sKeys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, Space: false };
    sDir = { x: 1, y: 0 };
    sNextDir = { x: 1, y: 0 };
    sApple = { x: 0, y: 0 };
    sSnake = [];
    sResize();
    if (typeof onResize === 'function') {
        onResize(() => {
            if (sCanvas && document.getElementById('snakeGameView')?.classList.contains('active')) {
                sResize();
                if (sSnake.length > 0) {
                    // Repositionner le serpent au centre
                    const centerX = Math.floor(sCols / 2);
                    const centerY = Math.floor(sRows / 2);
                    for (let i = 0; i < sSnake.length; i++) {
                        sSnake[i].x = centerX - i;
                        sSnake[i].y = centerY;
                    }
                }
            }
        });
    }
    console.log('✅ Snake initialisé');
}

function sResize() {
    if (!sCanvas) return;
    let w, h;
    if (typeof resizeCanvas === 'function') {
        const size = resizeCanvas(sCanvas, sCtx);
        w = size.width;
        h = size.height;
    } else {
        w = sCanvas.width = window.visualViewport?.width || window.innerWidth;
        h = sCanvas.height = window.visualViewport?.height || window.innerHeight;
    }
    sW = w;
    sH = h;
    const targetCols = (w < 500) ? 15 : 20;
    sGridSize = Math.floor(w / targetCols);
    sCols = Math.floor(sW / sGridSize);
    sRows = Math.floor(sH / sGridSize);
}

function sInit() {
    sResize();
    sGame.score = 0;
    sGame.level = 1;
    sGame.gameOver = false;
    sGame.paused = false;
    sSnake = [];
    const startX = Math.floor(sCols / 2);
    const startY = Math.floor(sRows / 2);
    for (let i = 0; i < sSettings.startLength; i++) {
        sSnake.push({ x: startX - i, y: startY });
    }
    sDir = { x: 1, y: 0 };
    sNextDir = { x: 1, y: 0 };
    sSpawnApple();
    sLastTick = performance.now();
    sAppleEatenAnim = 0;
    sUpdateHUD();
}

function sSpawnApple() {
    let attempts = 0;
    do {
        sApple.x = Math.floor(Math.random() * sCols);
        sApple.y = Math.floor(Math.random() * sRows);
        attempts++;
    } while (sSnake.some(s => s.x === sApple.x && s.y === sApple.y) && attempts < 100);
}

function sUpdateHUD() {
    const scoreEl = document.getElementById('snakeScore');
    const levelEl = document.getElementById('snakeLevel');
    const lenEl = document.getElementById('snakeLives');
    if (scoreEl) scoreEl.textContent = sGame.score;
    if (levelEl) levelEl.textContent = sGame.level;
    if (lenEl) lenEl.textContent = sSnake.length;
}

function startSnakeGame() {
    sSettings = snakeDiffSettings[difficulties.snake];
    showView('snakeGameView');
    const gv = document.getElementById('snakeGameView');
    if (gv) gv.classList.add('active');
    sGame.running = false;
    sGame.gameOver = false;
    sGame.paused = false;
    const go = document.getElementById('snakeGameOver');
    if (go) go.classList.remove('active');
    setTimeout(() => {
        sResize();
        sInit();
        if (sGameLoopId) cancelAnimationFrame(sGameLoopId);
        sRenderLoop();
        showCountdown('snake', () => {
            sGame.running = true;
        });
    }, 50);
}

function quitToSnakeMenu() {
    sGame.running = false;
    sGame.gameOver = false;
    if (sGameLoopId) cancelAnimationFrame(sGameLoopId);
    sGameLoopId = null;
    const go = document.getElementById('snakeGameOver');
    if (go) go.classList.remove('active');
    const gv = document.getElementById('snakeGameView');
    if (gv) gv.classList.remove('active');
    showView('snakeView');
}

function sTick() {
    sDir = { ...sNextDir };
    const head = { x: sSnake[0].x + sDir.x, y: sSnake[0].y + sDir.y };
    if (head.x < 0) head.x = sCols - 1;
    if (head.x >= sCols) head.x = 0;
    if (head.y < 0) head.y = sRows - 1;
    if (head.y >= sRows) head.y = 0;
    for (let i = 0; i < sSnake.length; i++) {
        if (sSnake[i].x === head.x && sSnake[i].y === head.y) { sEndGame(); return; }
    }
    sSnake.unshift(head);
    if (head.x === sApple.x && head.y === sApple.y) {
        sGame.score += 10;
        if (sGame.score % 50 === 0) sGame.level++;
        sAppleEatenAnim = 1;
        sSpawnApple();
        sUpdateHUD();
        playPickup();
    } else {
        sSnake.pop();
    }
}

function sEndGame() {
    sGame.running = false;
    sGame.gameOver = true;
    playExplosion();
    setTimeout(playGameOver, 300);
    const isNewRecord = (typeof updateRecord === 'function') ? updateRecord('snake', sGame.score) : false;
    const fs = document.getElementById('snakeFinalScore');
    const bs = document.getElementById('snakeBestScore');
    const go = document.getElementById('snakeGameOver');
    if (fs) fs.textContent = sGame.score;
    if (bs && typeof getBestScore === 'function') bs.textContent = '🏆 RECORD : ' + getBestScore('snake');
    if (go) go.classList.add('active');
    if (isNewRecord && typeof showNewRecordPopup === 'function') setTimeout(() => showNewRecordPopup(sGame.score), 1200);
}

function sUpdate() {
    if (!sGame.running || sGame.paused) return;
    const now = performance.now();
    const interval = sSettings.tickRate - Math.min(sGame.level * 5, 60);
    if (now - sLastTick >= interval) {
        sTick();
        sLastTick = now;
    }
    if (sAppleEatenAnim > 0) sAppleEatenAnim = Math.max(0, sAppleEatenAnim - 0.05);
}

function sDraw() {
    if (!sCtx) return;
    sCtx.fillStyle = '#0a0a1e';
    sCtx.fillRect(0, 0, sW, sH);
    sCtx.strokeStyle = 'rgba(0, 255, 255, 0.06)';
    sCtx.lineWidth = 1;
    for (let i = 0; i <= sCols; i++) {
        sCtx.beginPath(); sCtx.moveTo(i * sGridSize, 0); sCtx.lineTo(i * sGridSize, sH); sCtx.stroke();
    }
    for (let i = 0; i <= sRows; i++) {
        sCtx.beginPath(); sCtx.moveTo(0, i * sGridSize); sCtx.lineTo(sW, i * sGridSize); sCtx.stroke();
    }
    
    if (sSnake.length === 0) return;
    
    const ax = sApple.x * sGridSize;
    const ay = sApple.y * sGridSize;
    const ps = sGridSize / 9;
    const pulse = sAppleEatenAnim * 0.3;
    const applePattern = ["000330000","003323000","022222200","011111100","114111110","111111110","011111110","001111100"];
    const appleColors = { '1': '#cc0000', '2': '#ff3333', '3': '#8B4513', '4': '#ff6666', '0': null };
    sCtx.save();
    sCtx.shadowColor = '#ff0000'; sCtx.shadowBlur = 12;
    for (let r = 0; r < applePattern.length; r++) {
        for (let c = 0; c < applePattern[r].length; c++) {
            const ch = applePattern[r][c];
            if (ch === '0') continue;
            const color = appleColors[ch];
            if (!color) continue;
            sCtx.fillStyle = color;
            sCtx.fillRect(ax + c * ps + 0.5, ay + r * ps + 0.5, ps * 0.9 + pulse, ps * 0.9 + pulse);
        }
    }
    sCtx.restore();
    
    for (let i = sSnake.length - 1; i >= 0; i--) {
        const seg = sSnake[i];
        const isHead = i === 0;
        const isTail = i === sSnake.length - 1;
        const bx = seg.x * sGridSize;
        const by = seg.y * sGridSize;
        const t = i / Math.max(1, sSnake.length - 1);
        let baseColor, darkColor;
        if (isHead) { baseColor = '#66ff99'; darkColor = '#00aa44'; }
        else {
            const g = Math.floor(220 - t * 100);
            const r = Math.floor(0 + t * 10);
            baseColor = `rgb(${r}, ${g}, 80)`;
            darkColor = `rgb(${Math.floor(0 + t * 10)}, ${Math.floor(140 - t * 60)}, 50)`;
        }
        sCtx.save();
        sCtx.shadowColor = isHead ? '#00ffff' : '#00ff88';
        sCtx.shadowBlur = isHead ? 12 : 5;
        sCtx.fillStyle = baseColor;
        sCtx.fillRect(bx + 2, by + 2, sGridSize - 4, sGridSize - 4);
        sCtx.fillStyle = darkColor;
        sCtx.fillRect(bx + 2, by + 2, sGridSize - 4, 2);
        sCtx.fillRect(bx + 2, by + sGridSize - 4, sGridSize - 4, 2);
        sCtx.fillRect(bx + 2, by + 2, 2, sGridSize - 4);
        sCtx.fillRect(bx + sGridSize - 4, by + 2, 2, sGridSize - 4);
        sCtx.restore();
        if (isHead) {
            const dir = sDir;
            const eyeSize = 4;
            const pupilSize = 2;
            let e1X, e1Y, e2X, e2Y;
            if (dir.x === 1) { e1X = bx + sGridSize - 8; e1Y = by + 5; e2X = bx + sGridSize - 8; e2Y = by + sGridSize - 9; }
            else if (dir.x === -1) { e1X = bx + 4; e1Y = by + 5; e2X = bx + 4; e2Y = by + sGridSize - 9; }
            else if (dir.y === -1) { e1X = bx + 5; e1Y = by + 4; e2X = bx + sGridSize - 9; e2Y = by + 4; }
            else { e1X = bx + 5; e1Y = by + sGridSize - 8; e2X = bx + sGridSize - 9; e2Y = by + sGridSize - 8; }
            sCtx.fillStyle = '#ffffff';
            sCtx.fillRect(e1X, e1Y, eyeSize, eyeSize);
            sCtx.fillRect(e2X, e2Y, eyeSize, eyeSize);
            sCtx.fillStyle = '#000000';
            if (dir.x === 1) { sCtx.fillRect(e1X + 2, e1Y + 1, pupilSize, pupilSize); sCtx.fillRect(e2X + 2, e2Y + 1, pupilSize, pupilSize); }
            else if (dir.x === -1) { sCtx.fillRect(e1X, e1Y + 1, pupilSize, pupilSize); sCtx.fillRect(e2X, e2Y + 1, pupilSize, pupilSize); }
            else if (dir.y === -1) { sCtx.fillRect(e1X + 1, e1Y, pupilSize, pupilSize); sCtx.fillRect(e2X + 1, e2Y, pupilSize, pupilSize); }
            else { sCtx.fillRect(e1X + 1, e1Y + 2, pupilSize, pupilSize); sCtx.fillRect(e2X + 1, e2Y + 2, pupilSize, pupilSize); }
        }
    }
    
    if (sGame.paused && sGame.running) {
        sCtx.save();
        sCtx.fillStyle = 'rgba(10, 10, 30, 0.7)';
        sCtx.fillRect(0, 0, sW, sH);
        sCtx.fillStyle = '#00ffff';
        sCtx.font = '48px "Press Start 2P"';
        sCtx.textAlign = 'center';
        sCtx.shadowColor = '#00ffff'; sCtx.shadowBlur = 20;
        sCtx.fillText('PAUSE', sW / 2, sH / 2);
        sCtx.restore();
    }
}

function sRenderLoop() {
    sUpdate();
    sDraw();
    sGameLoopId = requestAnimationFrame(sRenderLoop);
}