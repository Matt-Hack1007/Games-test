// ============================================
// 🧱 TETRIS (avec compte à rebours)
// ============================================
var teCanvas, teCtx, teW, teH, teGridSize = 30, teCols = 10, teRows = 20;
var teOffsetX = 0, teOffsetY = 0;
var teSettings, teGame, teKeys;
var teBoard = [], teCurrent = null, teNext = null;
var teLastFall = 0;
var teGameLoopId = null;
var teSpecialPatternShown = false;

const tetrisDiffSettings = {
    easy:   { fallSpeed: 800 },
    normal: { fallSpeed: 500 },
    hard:   { fallSpeed: 250 }
};

const TETROMINOES = {
    I: { shape: [[1,1,1,1]], color: '#00ffff' },
    O: { shape: [[1,1],[1,1]], color: '#ffdd00' },
    T: { shape: [[0,1,0],[1,1,1]], color: '#ff00ff' },
    S: { shape: [[0,1,1],[1,1,0]], color: '#00ff88' },
    Z: { shape: [[1,1,0],[0,1,1]], color: '#ff3366' },
    J: { shape: [[1,0,0],[1,1,1]], color: '#0088ff' },
    L: { shape: [[0,0,1],[1,1,1]], color: '#ff8800' }
};

const SPECIAL_PATTERNS = [
    { name: "COEUR", color: '#ff3366', rows: ["0100001000","1110011100","1111111110","1111111110","0111111100","0011111000","0001110000","0000100000"] },
    { name: "PYRAMIDE", color: '#ffdd00', rows: ["0000100000","0001110000","0011111000","0111111100","1111111110"] },
    { name: "ETOILE", color: '#00ffff', rows: ["0000100000","0001110000","1111111110","0111111100","0011111000","0011011000","0110001100"] }
];

function initTetris() {
    teCanvas = document.getElementById('tetrisCanvas');
    if (!teCanvas) {
        console.error('❌ Canvas Tetris introuvable !');
        return;
    }
    teCtx = teCanvas.getContext('2d');
    
    teSettings = tetrisDiffSettings.normal;
    teGame = { score: 0, level: 1, lines: 0, running: false, gameOver: false };
    teKeys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, Space: false };
    teBoard = [];
    
    teResize();
    console.log('✅ Tetris initialisé');
}

function teResize() {
    if (!teCanvas) return;
    teW = teCanvas.width = window.innerWidth;
    teH = teCanvas.height = window.innerHeight;
    teGridSize = Math.min(Math.floor(teH / (teRows + 2)), Math.floor(teW / (teCols + 4)));
    teOffsetX = (teW - teCols * teGridSize) / 2;
    teOffsetY = (teH - teRows * teGridSize) / 2;
}

function teCreatePiece() {
    const keys = Object.keys(TETROMINOES);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const t = TETROMINOES[key];
    return {
        shape: t.shape.map(row => [...row]),
        color: t.color,
        x: Math.floor((teCols - t.shape[0].length) / 2),
        y: 0
    };
}

function teInit() {
    teResize();
    teGame.score = 0;
    teGame.level = 1;
    teGame.lines = 0;
    teGame.gameOver = false;
    teBoard = [];
    for (let r = 0; r < teRows; r++) teBoard.push(new Array(teCols).fill(null));
    teCurrent = teCreatePiece();
    teNext = teCreatePiece();
    teLastFall = performance.now();
    teSpecialPatternShown = false;
    teUpdateHUD();
}

function teUpdateHUD() {
    const scoreEl = document.getElementById('tetrisScore');
    const levelEl = document.getElementById('tetrisLevel');
    const linesEl = document.getElementById('tetrisLives');
    if (scoreEl) scoreEl.textContent = teGame.score;
    if (levelEl) levelEl.textContent = teGame.level;
    if (linesEl) linesEl.textContent = teGame.lines;
}

function startTetrisGame() {
    teSettings = tetrisDiffSettings[difficulties.tetris];
    showView('tetrisGameView');
    const gv = document.getElementById('tetrisGameView');
    if (gv) gv.classList.add('active');
    teGame.running = false;
    teGame.gameOver = false;
    const go = document.getElementById('tetrisGameOver');
    if (go) go.classList.remove('active');
    teResize();
    teInit();
    if (teGameLoopId) cancelAnimationFrame(teGameLoopId);
    teRenderLoop();
    
    showCountdown('tetris', () => {
        teGame.running = true;
    });
}

function quitToTetrisMenu() {
    teGame.running = false;
    teGame.gameOver = false;
    if (teGameLoopId) cancelAnimationFrame(teGameLoopId);
    teGameLoopId = null;
    const go = document.getElementById('tetrisGameOver');
    if (go) go.classList.remove('active');
    const gv = document.getElementById('tetrisGameView');
    if (gv) gv.classList.remove('active');
    showView('tetrisView');
}

function teCollide(shape, x, y) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;
            const bx = x + c;
            const by = y + r;
            if (bx < 0 || bx >= teCols || by >= teRows) return true;
            if (by >= 0 && teBoard[by][bx]) return true;
        }
    }
    return false;
}

function teRotate() {
    const s = teCurrent.shape;
    const newShape = s[0].map((_, i) => s.map(row => row[i]).reverse());
    if (!teCollide(newShape, teCurrent.x, teCurrent.y)) {
        teCurrent.shape = newShape;
        playBeep(400, 0.04);
    }
}

function teDrop() {
    if (!teCollide(teCurrent.shape, teCurrent.x, teCurrent.y + 1)) {
        teCurrent.y++;
        return true;
    }
    teLockPiece();
    return false;
}

function teHardDrop() {
    while (!teCollide(teCurrent.shape, teCurrent.x, teCurrent.y + 1)) {
        teCurrent.y++;
        teGame.score += 1;
    }
    playBeep(300, 0.08);
    teLockPiece();
}

function teLockPiece() {
    for (let r = 0; r < teCurrent.shape.length; r++) {
        for (let c = 0; c < teCurrent.shape[r].length; c++) {
            if (teCurrent.shape[r][c]) {
                const y = teCurrent.y + r;
                const x = teCurrent.x + c;
                if (y < 0) { teEndGame(); return; }
                teBoard[y][x] = teCurrent.color;
            }
        }
    }
    playBeep(220, 0.05);
    teClearLines();
    teCurrent = teNext;
    teNext = teCreatePiece();
    if (teCollide(teCurrent.shape, teCurrent.x, teCurrent.y)) teEndGame();
}

function teClearLines() {
    let cleared = 0;
    for (let r = teRows - 1; r >= 0; r--) {
        if (teBoard[r].every(cell => cell)) {
            teBoard.splice(r, 1);
            teBoard.unshift(new Array(teCols).fill(null));
            cleared++;
            r++;
        }
    }
    if (cleared > 0) {
        teGame.lines += cleared;
        teGame.score += [0, 100, 300, 500, 800][cleared] * teGame.level;
        teGame.level = 1 + Math.floor(teGame.lines / 10);
        teUpdateHUD();
        playPickup();
        
        if (teGame.level > 0 && teGame.level % 5 === 0 && !teSpecialPatternShown) {
            const pattern = SPECIAL_PATTERNS[Math.floor(Math.random() * SPECIAL_PATTERNS.length)];
            const startRow = Math.floor((teRows - pattern.rows.length) / 2);
            for (let r = 0; r < pattern.rows.length; r++) {
                for (let c = 0; c < pattern.rows[r].length; c++) {
                    if (pattern.rows[r][c] === '1') {
                        const y = startRow + r;
                        const x = c;
                        if (y >= 0 && y < teRows && x >= 0 && x < teCols) {
                            teBoard[y][x] = pattern.color;
                        }
                    }
                }
            }
            teSpecialPatternShown = true;
        }
    }
}

function teEndGame() {
    teGame.running = false;
    teGame.gameOver = true;
    playGameOver();
    
    const isNewRecord = (typeof updateRecord === 'function') ? updateRecord('tetris', teGame.score) : false;
    const fs = document.getElementById('tetrisFinalScore');
    const bs = document.getElementById('tetrisBestScore');
    const go = document.getElementById('tetrisGameOver');
    if (fs) fs.textContent = teGame.score;
    if (bs && typeof getBestScore === 'function') {
        bs.textContent = '🏆 RECORD : ' + getBestScore('tetris');
    }
    if (go) go.classList.add('active');
    if (isNewRecord && typeof showNewRecordPopup === 'function') {
        setTimeout(() => showNewRecordPopup(teGame.score), 800);
    }
}

function teUpdate() {
    if (!teGame.running) return;
    const now = performance.now();
    const interval = Math.max(100, teSettings.fallSpeed - (teGame.level - 1) * 50);
    if (now - teLastFall >= interval) {
        teDrop();
        teLastFall = now;
    }
    if (teKeys.ArrowLeft) { if (!teCollide(teCurrent.shape, teCurrent.x - 1, teCurrent.y)) { teCurrent.x--; playBeep(300, 0.03); } teKeys.ArrowLeft = false; }
    if (teKeys.ArrowRight) { if (!teCollide(teCurrent.shape, teCurrent.x + 1, teCurrent.y)) { teCurrent.x++; playBeep(300, 0.03); } teKeys.ArrowRight = false; }
    if (teKeys.ArrowDown) { teDrop(); teKeys.ArrowDown = false; }
    if (teKeys.ArrowUp) { teRotate(); teKeys.ArrowUp = false; }
    if (teKeys.Space) { teHardDrop(); teKeys.Space = false; }
}

function teDraw() {
    if (!teCtx) return;
    teCtx.fillStyle = '#0a0a1e';
    teCtx.fillRect(0, 0, teW, teH);
    
    teCtx.save();
    teCtx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    teCtx.lineWidth = 2;
    teCtx.shadowColor = '#00ffff'; teCtx.shadowBlur = 10;
    teCtx.strokeRect(teOffsetX, teOffsetY, teCols * teGridSize, teRows * teGridSize);
    teCtx.restore();
    
    teCtx.strokeStyle = 'rgba(0, 255, 255, 0.06)';
    teCtx.lineWidth = 1;
    for (let i = 0; i <= teCols; i++) {
        teCtx.beginPath();
        teCtx.moveTo(teOffsetX + i * teGridSize, teOffsetY);
        teCtx.lineTo(teOffsetX + i * teGridSize, teOffsetY + teRows * teGridSize);
        teCtx.stroke();
    }
    for (let i = 0; i <= teRows; i++) {
        teCtx.beginPath();
        teCtx.moveTo(teOffsetX, teOffsetY + i * teGridSize);
        teCtx.lineTo(teOffsetX + teCols * teGridSize, teOffsetY + i * teGridSize);
        teCtx.stroke();
    }
    
    for (let r = 0; r < teRows; r++) {
        for (let c = 0; c < teCols; c++) {
            if (teBoard[r][c]) {
                teCtx.save();
                teCtx.shadowColor = teBoard[r][c]; teCtx.shadowBlur = 8;
                teCtx.fillStyle = teBoard[r][c];
                teCtx.fillRect(teOffsetX + c * teGridSize + 1, teOffsetY + r * teGridSize + 1, teGridSize - 2, teGridSize - 2);
                teCtx.restore();
            }
        }
    }
    
    if (teCurrent && teGame.running) {
        for (let r = 0; r < teCurrent.shape.length; r++) {
            for (let c = 0; c < teCurrent.shape[r].length; c++) {
                if (teCurrent.shape[r][c]) {
                    teCtx.save();
                    teCtx.shadowColor = teCurrent.color; teCtx.shadowBlur = 12;
                    teCtx.fillStyle = teCurrent.color;
                    teCtx.fillRect(teOffsetX + (teCurrent.x + c) * teGridSize + 1, teOffsetY + (teCurrent.y + r) * teGridSize + 1, teGridSize - 2, teGridSize - 2);
                    teCtx.restore();
                }
            }
        }
    }
}

function teRenderLoop() {
    teUpdate();
    teDraw();
    teGameLoopId = requestAnimationFrame(teRenderLoop);
}