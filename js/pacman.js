// ============================================
// 🟡 PAC-MAN
// ============================================
var pacCanvas, pacCtx, pacW, pacH, pacGridSize, pacOffsetX, pacOffsetY;
var pacCurrentSettings, pacGame, pacPlayer;
var pacGhosts = [], pacDots = [];
var pacSuperTimer = 0, pacParticles = [];
var pacGameLoopId = null, pacLastFrame = 0, pacDeathAnim = 0;

const PACMAN_MAZE = [
    "1111111111111111111",
    "1222222222122222221",
    "1211121112121112121",
    "1311121112121113121",
    "1211121112121112121",
    "1222222222222222221",
    "1211121211112121221",
    "1211121222222121221",
    "1222221244442122221",
    "1111121211112121111",
    "0000121222222121000",
    "1111121211112121111",
    "1222222222222222221",
    "1211121112121112121",
    "1311222222222223121",
    "1211121112121112121",
    "1222222222222222221",
    "1111111111111111111"
];

const PACMAN_COLS = PACMAN_MAZE[0].length;
const PACMAN_ROWS = PACMAN_MAZE.length;

const pacSettings = {
    easy:   { pacSpeed: 0.08, ghostSpeed: 0.055, superDuration: 400, ghostCount: 3 },
    normal: { pacSpeed: 0.10, ghostSpeed: 0.070, superDuration: 300, ghostCount: 4 },
    hard:   { pacSpeed: 0.13, ghostSpeed: 0.090, superDuration: 200, ghostCount: 4 }
};

const DIR_UP    = { x: 0, y: -1 };
const DIR_DOWN  = { x: 0, y: 1 };
const DIR_LEFT  = { x: -1, y: 0 };
const DIR_RIGHT = { x: 1, y: 0 };
const DIR_NONE  = { x: 0, y: 0 };

function initPacman() {
    pacCanvas = document.getElementById('pacmanCanvas');
    if (!pacCanvas) {
        console.error('❌ Canvas Pac-Man introuvable !');
        return;
    }
    pacCtx = pacCanvas.getContext('2d');
    pacCurrentSettings = pacSettings.normal;
    pacGame = { score: 0, lives: 3, level: 1, running: false, gameOver: false, paused: false };
    pacPlayer = {
        x: 9, y: 13,
        dir: { x: 0, y: 0 },
        nextDir: { x: 0, y: 0 },
        speed: 0.10,
        mouthPhase: 0
    };
    pacGhosts = []; pacDots = [];
    pacSuperTimer = 0; pacParticles = [];
    pacDeathAnim = 0;
    pacResize();
    if (typeof onResize === 'function') {
        onResize(() => {
            if (pacCanvas && document.getElementById('pacmanGameView')?.classList.contains('active')) {
                pacResize();
            }
        });
    }
    console.log('✅ Pac-Man initialisé');
}

function pacResize() {
    if (!pacCanvas) return;
    let w, h;
    if (typeof resizeCanvas === 'function') {
        const size = resizeCanvas(pacCanvas, pacCtx);
        w = size.width;
        h = size.height;
    } else {
        w = pacCanvas.width = window.visualViewport?.width || window.innerWidth;
        h = pacCanvas.height = window.visualViewport?.height || window.innerHeight;
    }
    pacW = w;
    pacH = h;
    pacGridSize = Math.min(
        Math.floor(pacW / (PACMAN_COLS + 0.5)),
        Math.floor(pacH / (PACMAN_ROWS + 0.5))
    );
    pacOffsetX = (pacW - PACMAN_COLS * pacGridSize) / 2;
    pacOffsetY = (pacH - PACMAN_ROWS * pacGridSize) / 2;
}

function pacCellAt(col, row) {
    if (row < 0 || row >= PACMAN_ROWS) return '1';
    if (col < 0 || col >= PACMAN_COLS) return '0';
    return PACMAN_MAZE[row][col];
}

function pacIsPassable(col, row) {
    const cell = pacCellAt(col, row);
    return cell !== '1' && cell !== '4';
}

function pacInit() {
    pacResize();
    pacGame.score = 0;
    pacGame.lives = 3;
    pacGame.level = 1;
    pacGame.gameOver = false;
    pacGame.paused = false;
    pacSuperTimer = 0;
    pacParticles = [];
    pacGhosts = [];
    pacDeathAnim = 0;
    pacCurrentSettings = pacSettings[difficulties.pacman];
    pacPlayer.x = 9;
    pacPlayer.y = 13;
    pacPlayer.dir = { x: 0, y: 0 };
    pacPlayer.nextDir = { x: 0, y: 0 };
    pacPlayer.speed = pacCurrentSettings.pacSpeed;
    pacPlayer.mouthPhase = 0;
    pacDots = [];
    for (let r = 0; r < PACMAN_ROWS; r++) {
        for (let c = 0; c < PACMAN_COLS; c++) {
            const cell = PACMAN_MAZE[r][c];
            if (cell === '2') pacDots.push({ col: c, row: r, type: 'dot', eaten: false });
            else if (cell === '3') pacDots.push({ col: c, row: r, type: 'super', eaten: false });
        }
    }
    const ghostSetups = [
        { col: 9, row: 8, homeCol: 9, homeRow: 8, dir: { x: 0, y: -1 }, color: '#ff0000', exitDelay: 0 },
        { col: 8, row: 8, homeCol: 8, homeRow: 8, dir: { x: 0, y: -1 }, color: '#ffb8ff', exitDelay: 180 },
        { col: 10, row: 8, homeCol: 10, homeRow: 8, dir: { x: 0, y: -1 }, color: '#00ffff', exitDelay: 360 },
        { col: 9, row: 7, homeCol: 9, homeRow: 7, dir: { x: 0, y: -1 }, color: '#ffb852', exitDelay: 540 }
    ];
    for (let i = 0; i < pacCurrentSettings.ghostCount; i++) {
        const setup = ghostSetups[i];
        pacGhosts.push({
            x: setup.col,
            y: setup.row,
            homeCol: setup.homeCol,
            homeRow: setup.homeRow,
            dir: { ...setup.dir },
            color: setup.color,
            state: 'waiting',
            speed: pacCurrentSettings.ghostSpeed,
            exitDelay: setup.exitDelay
        });
    }
    pacUpdateHUD();
}

function pacUpdateHUD() {
    const scoreEl = document.getElementById('pacmanScore');
    const levelEl = document.getElementById('pacmanLevel');
    const livesEl = document.getElementById('pacmanLives');
    if (scoreEl) scoreEl.textContent = pacGame.score;
    if (levelEl) levelEl.textContent = pacGame.level;
    if (livesEl) livesEl.textContent = '♥'.repeat(Math.max(0, pacGame.lives));
}

function pacIsAligned(x, y) {
    return Math.abs(x - Math.round(x)) < 0.05 && Math.abs(y - Math.round(y)) < 0.05;
}

function pacMoveEntity(entity, speed, chooseDirFn) {
    const cx = Math.round(entity.x);
    const cy = Math.round(entity.y);
    if (pacIsAligned(entity.x, entity.y)) {
        entity.x = cx;
        entity.y = cy;
        if (chooseDirFn) {
            const newDir = chooseDirFn(cx, cy, entity.dir);
            if (newDir && (newDir.x !== 0 || newDir.y !== 0)) {
                if (pacIsPassable(cx + newDir.x, cy + newDir.y)) {
                    entity.dir = { ...newDir };
                }
            }
        }
        if (entity.dir.x !== 0 || entity.dir.y !== 0) {
            if (!pacIsPassable(cx + entity.dir.x, cy + entity.dir.y)) {
                entity.dir = { x: 0, y: 0 };
                return;
            }
        }
    }
    if (entity.dir.x !== 0 || entity.dir.y !== 0) {
        const step = speed;
        let nx = entity.x + entity.dir.x * step;
        let ny = entity.y + entity.dir.y * step;
        const nxCell = Math.round(nx);
        const nyCell = Math.round(ny);
        if (entity.dir.x > 0 && Math.round(entity.x) < nxCell && nx >= nxCell) nx = nxCell;
        else if (entity.dir.x < 0 && Math.round(entity.x) > nxCell && nx <= nxCell) nx = nxCell;
        if (entity.dir.y > 0 && Math.round(entity.y) < nyCell && ny >= nyCell) ny = nyCell;
        else if (entity.dir.y < 0 && Math.round(entity.y) > nyCell && ny <= nyCell) ny = nyCell;
        entity.x = nx;
        entity.y = ny;
        if (entity.x < -0.5) entity.x = PACMAN_COLS - 0.5;
        if (entity.x > PACMAN_COLS - 0.5) entity.x = -0.5;
    }
}

function pacMovePlayer(dt) {
    const speed = pacPlayer.speed * dt;
    pacMoveEntity(
        pacPlayer,
        speed,
        (cx, cy, currentDir) => {
            if (pacPlayer.nextDir.x !== 0 || pacPlayer.nextDir.y !== 0) {
                const d = pacPlayer.nextDir;
                if (pacIsPassable(cx + d.x, cy + d.y)) {
                    pacPlayer.nextDir = { x: 0, y: 0 };
                    return d;
                }
            }
            return null;
        }
    );
    pacPlayer.mouthPhase += 0.15;
}

function pacMoveGhosts(dt) {
    for (const ghost of pacGhosts) {
        if (ghost.exitDelay > 0) {
            ghost.exitDelay -= dt;
            if (ghost.exitDelay <= 0) ghost.state = 'normal';
        }
        if (ghost.state === 'waiting') {
            const baseY = ghost.homeRow;
            const offset = Math.sin(performance.now() / 200 + ghost.homeCol) * 0.15;
            ghost.y = baseY + offset;
            continue;
        }
        if (ghost.state === 'eaten') {
            const dx = ghost.homeCol - ghost.x;
            const dy = ghost.homeRow - ghost.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 0.2) {
                ghost.x = ghost.homeCol;
                ghost.y = ghost.homeRow;
                ghost.dir = { x: 0, y: -1 };
                ghost.state = 'waiting';
                ghost.exitDelay = 60;
            } else {
                ghost.x += (dx / dist) * 0.15 * dt;
                ghost.y += (dy / dist) * 0.15 * dt;
            }
            continue;
        }
        const speedMult = ghost.state === 'frightened' ? 0.55 : 1;
        const speed = ghost.speed * speedMult * dt;
        pacMoveEntity(
            ghost,
            speed,
            (cx, cy, currentDir) => {
                const dirs = [DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT];
                const possible = [];
                for (const d of dirs) {
                    const isReverse = (d.x === -currentDir.x && d.y === -currentDir.y);
                    if (isReverse && (currentDir.x !== 0 || currentDir.y !== 0)) continue;
                    if (pacIsPassable(cx + d.x, cy + d.y)) possible.push(d);
                }
                if (possible.length === 0) {
                    if (currentDir.x !== 0 || currentDir.y !== 0) {
                        return { x: -currentDir.x, y: -currentDir.y };
                    }
                    return dirs[Math.floor(Math.random() * dirs.length)];
                }
                if (ghost.state === 'frightened') {
                    let bestDist = -Infinity;
                    let chosen = possible[0];
                    for (const d of possible) {
                        const nx = cx + d.x;
                        const ny = cy + d.y;
                        const dist = Math.hypot(nx - pacPlayer.x, ny - pacPlayer.y);
                        if (dist > bestDist) { bestDist = dist; chosen = d; }
                    }
                    return chosen;
                } else {
                    let bestDist = Infinity;
                    let chosen = possible[0];
                    for (const d of possible) {
                        const nx = cx + d.x;
                        const ny = cy + d.y;
                        const dist = Math.hypot(nx - pacPlayer.x, ny - pacPlayer.y);
                        if (dist < bestDist) { bestDist = dist; chosen = d; }
                    }
                    if (Math.random() < 0.12 && possible.length > 1) {
                        chosen = possible[Math.floor(Math.random() * possible.length)];
                    }
                    return chosen;
                }
            }
        );
    }
}

function pacCheckCollisions() {
    const pcol = Math.round(pacPlayer.x);
    const prow = Math.round(pacPlayer.y);
    for (const dot of pacDots) {
        if (dot.eaten) continue;
        if (dot.col === pcol && dot.row === prow) {
            dot.eaten = true;
            if (dot.type === 'super') {
                pacGame.score += 50;
                pacSuperTimer = pacCurrentSettings.superDuration;
                playBeep(1200, 0.2, 'square', 0.15);
                for (const g of pacGhosts) {
                    if (g.state !== 'eaten' && g.state !== 'waiting') {
                        g.state = 'frightened';
                        g.dir = { x: -g.dir.x, y: -g.dir.y };
                    }
                }
            } else {
                pacGame.score += 10;
                playBeep(900, 0.03, 'square', 0.06);
            }
            pacUpdateHUD();
        }
    }
    for (const ghost of pacGhosts) {
        if (ghost.state === 'eaten' || ghost.state === 'waiting') continue;
        const dist = Math.hypot(ghost.x - pacPlayer.x, ghost.y - pacPlayer.y);
        if (dist < 0.7) {
            if (ghost.state === 'frightened') {
                ghost.state = 'eaten';
                pacGame.score += 200;
                pacUpdateHUD();
                playPickup();
                for (let i = 0; i < 12; i++) {
                    pacParticles.push({
                        x: (ghost.x * pacGridSize + pacOffsetX + pacGridSize / 2),
                        y: (ghost.y * pacGridSize + pacOffsetY + pacGridSize / 2),
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        life: 30, maxLife: 30,
                        color: ghost.color
                    });
                }
            } else {
                pacLoseLife();
                return;
            }
        }
    }
    if (pacDots.every(d => d.eaten)) pacNextLevel();
}

function pacLoseLife() {
    playExplosion();
    pacDeathAnim = 1;
    pacGame.lives--;
    pacUpdateHUD();
    if (pacGame.lives <= 0) {
        setTimeout(() => pacEndGame(), 500);
    } else {
        setTimeout(() => {
            pacPlayer.x = 9;
            pacPlayer.y = 13;
            pacPlayer.dir = DIR_NONE;
            pacPlayer.nextDir = DIR_NONE;
            pacDeathAnim = 0;
            const ghostSetups = [
                { col: 9,  row: 8, homeCol: 9,  homeRow: 8, dir: { x: 0, y: -1 }, exitDelay: 0 },
                { col: 8,  row: 8, homeCol: 8,  homeRow: 8, dir: { x: 0, y: -1 }, exitDelay: 180 },
                { col: 10, row: 8, homeCol: 10, homeRow: 8, dir: { x: 0, y: -1 }, exitDelay: 360 },
                { col: 9,  row: 7, homeCol: 9,  homeRow: 7, dir: { x: 0, y: -1 }, exitDelay: 540 }
            ];
            for (let i = 0; i < pacGhosts.length; i++) {
                const setup = ghostSetups[i];
                pacGhosts[i].x = setup.col;
                pacGhosts[i].y = setup.row;
                pacGhosts[i].homeCol = setup.homeCol;
                pacGhosts[i].homeRow = setup.homeRow;
                pacGhosts[i].dir = { ...setup.dir };
                pacGhosts[i].state = 'waiting';
                pacGhosts[i].exitDelay = setup.exitDelay;
            }
            pacSuperTimer = 0;
            showCountdown('pacman', () => {
                pacGame.running = true;
            });
        }, 800);
    }
}

function pacNextLevel() {
    pacGame.level++;
    pacGame.score += 500;
    pacUpdateHUD();
    playRecordFanfare();
    setTimeout(() => {
        const savedLevel = pacGame.level;
        pacInit();
        pacGame.level = savedLevel;
        pacUpdateHUD();
        showCountdown('pacman', () => {
            pacGame.running = true;
        });
    }, 500);
}

function pacEndGame() {
    pacGame.running = false;
    pacGame.gameOver = true;
    playGameOver();
    const isNewRecord = (typeof updateRecord === 'function') ? updateRecord('pacman', pacGame.score) : false;
    const fs = document.getElementById('pacmanFinalScore');
    const bs = document.getElementById('pacmanBestScore');
    const go = document.getElementById('pacmanGameOver');
    if (fs) fs.textContent = pacGame.score;
    if (bs && typeof getBestScore === 'function') bs.textContent = '🏆 RECORD : ' + getBestScore('pacman');
    if (go) go.classList.add('active');
    if (isNewRecord && typeof showNewRecordPopup === 'function') setTimeout(() => showNewRecordPopup(pacGame.score), 800);
}

function startPacmanGame() {
    pacCurrentSettings = pacSettings[difficulties.pacman];
    showView('pacmanGameView');
    const gv = document.getElementById('pacmanGameView');
    if (gv) gv.classList.add('active');
    pacGame.running = false;
    pacGame.gameOver = false;
    const go = document.getElementById('pacmanGameOver');
    if (go) go.classList.remove('active');
    setTimeout(() => {
        pacResize();
        pacInit();
        if (pacGameLoopId) cancelAnimationFrame(pacGameLoopId);
        pacLastFrame = performance.now();
        pacRenderLoop();
        showCountdown('pacman', () => {
            pacGame.running = true;
        });
    }, 50);
}

function quitToPacmanMenu() {
    pacGame.running = false;
    pacGame.gameOver = false;
    if (pacGameLoopId) cancelAnimationFrame(pacGameLoopId);
    pacGameLoopId = null;
    const go = document.getElementById('pacmanGameOver');
    if (go) go.classList.remove('active');
    const gv = document.getElementById('pacmanGameView');
    if (gv) gv.classList.remove('active');
    showView('pacmanView');
}

function pacUpdate(dt) {
    if (!pacGame.running || pacGame.paused) return;
    if (pacDeathAnim > 0) {
        pacDeathAnim = Math.max(0, pacDeathAnim - 0.02);
        return;
    }
    pacMovePlayer(dt);
    pacMoveGhosts(dt);
    pacCheckCollisions();
    if (pacSuperTimer > 0) {
        pacSuperTimer--;
        if (pacSuperTimer === 0) {
            for (const g of pacGhosts) {
                if (g.state === 'frightened') g.state = 'normal';
            }
        }
    }
    for (let i = pacParticles.length - 1; i >= 0; i--) {
        const p = pacParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        p.life--;
        if (p.life <= 0) pacParticles.splice(i, 1);
    }
}

function pacDrawMaze() {
    for (let r = 0; r < PACMAN_ROWS; r++) {
        for (let c = 0; c < PACMAN_COLS; c++) {
            const cell = PACMAN_MAZE[r][c];
            const x = c * pacGridSize + pacOffsetX;
            const y = r * pacGridSize + pacOffsetY;
            if (cell === '1') {
                pacCtx.fillStyle = '#2121ff';
                pacCtx.fillRect(x + 2, y + 2, pacGridSize - 4, pacGridSize - 4);
                pacCtx.fillStyle = '#5588ff';
                pacCtx.fillRect(x + 2, y + 2, pacGridSize - 4, 2);
                pacCtx.fillRect(x + 2, y + 2, 2, pacGridSize - 4);
            } else if (cell === '4') {
                pacCtx.fillStyle = '#ff88ff';
                pacCtx.fillRect(x, y + pacGridSize / 2 - 2, pacGridSize, 4);
            }
        }
    }
}

function pacDrawDots() {
    for (const dot of pacDots) {
        if (dot.eaten) continue;
        const x = dot.col * pacGridSize + pacOffsetX + pacGridSize / 2;
        const y = dot.row * pacGridSize + pacOffsetY + pacGridSize / 2;
        pacCtx.save();
        if (dot.type === 'super') {
            pacCtx.fillStyle = '#ffdd00';
            pacCtx.shadowColor = '#ffdd00';
            pacCtx.shadowBlur = 12;
            pacCtx.beginPath();
            pacCtx.arc(x, y, pacGridSize * 0.22, 0, Math.PI * 2);
            pacCtx.fill();
        } else {
            pacCtx.fillStyle = '#ffdd00';
            pacCtx.shadowColor = '#ffdd00';
            pacCtx.shadowBlur = 4;
            pacCtx.beginPath();
            pacCtx.arc(x, y, pacGridSize * 0.1, 0, Math.PI * 2);
            pacCtx.fill();
        }
        pacCtx.restore();
    }
}

function pacDrawPlayer() {
    const px = pacPlayer.x * pacGridSize + pacOffsetX + pacGridSize / 2;
    const py = pacPlayer.y * pacGridSize + pacOffsetY + pacGridSize / 2;
    const radius = pacGridSize * 0.42;
    pacCtx.save();
    pacCtx.translate(px, py);
    let angle = 0;
    if (pacPlayer.dir.x > 0) angle = 0;
    else if (pacPlayer.dir.x < 0) angle = Math.PI;
    else if (pacPlayer.dir.y > 0) angle = Math.PI / 2;
    else if (pacPlayer.dir.y < 0) angle = -Math.PI / 2;
    pacCtx.rotate(angle);
    const mouthOpen = (Math.sin(pacPlayer.mouthPhase) + 1) * 0.15 + 0.05;
    pacCtx.shadowColor = '#ffdd00';
    pacCtx.shadowBlur = 15;
    pacCtx.fillStyle = '#ffdd00';
    pacCtx.beginPath();
    pacCtx.moveTo(0, 0);
    pacCtx.arc(0, 0, radius, mouthOpen * Math.PI, (2 - mouthOpen) * Math.PI);
    pacCtx.closePath();
    pacCtx.fill();
    pacCtx.restore();
}

function pacDrawGhosts() {
    for (const ghost of pacGhosts) {
        const px = ghost.x * pacGridSize + pacOffsetX + pacGridSize / 2;
        const py = ghost.y * pacGridSize + pacOffsetY + pacGridSize / 2;
        const size = pacGridSize * 0.38;
        pacCtx.save();
        pacCtx.translate(px, py);
        if (ghost.state === 'waiting') pacCtx.globalAlpha = 0.5;
        let bodyColor = ghost.color;
        if (ghost.state === 'frightened') {
            bodyColor = pacSuperTimer < 100 && Math.floor(pacSuperTimer / 10) % 2 === 0 ? '#ffffff' : '#2121ff';
        }
        pacCtx.shadowColor = bodyColor;
        pacCtx.shadowBlur = 12;
        pacCtx.fillStyle = bodyColor;
        pacCtx.beginPath();
        pacCtx.arc(0, -size * 0.2, size, Math.PI, 0, false);
        pacCtx.lineTo(size, size * 0.8);
        pacCtx.lineTo(size * 0.66, size * 0.5);
        pacCtx.lineTo(size * 0.33, size * 0.8);
        pacCtx.lineTo(0, size * 0.5);
        pacCtx.lineTo(-size * 0.33, size * 0.8);
        pacCtx.lineTo(-size * 0.66, size * 0.5);
        pacCtx.lineTo(-size, size * 0.8);
        pacCtx.closePath();
        pacCtx.fill();
        if (ghost.state !== 'frightened') {
            pacCtx.fillStyle = '#ffffff';
            pacCtx.shadowBlur = 0;
            pacCtx.beginPath();
            pacCtx.arc(-size * 0.35, -size * 0.3, size * 0.3, 0, Math.PI * 2);
            pacCtx.fill();
            pacCtx.beginPath();
            pacCtx.arc(size * 0.35, -size * 0.3, size * 0.3, 0, Math.PI * 2);
            pacCtx.fill();
            pacCtx.fillStyle = '#000000';
            const pupilOffsetX = ghost.dir.x * 2;
            const pupilOffsetY = ghost.dir.y * 2;
            pacCtx.beginPath();
            pacCtx.arc(-size * 0.35 + pupilOffsetX, -size * 0.3 + pupilOffsetY, size * 0.15, 0, Math.PI * 2);
            pacCtx.fill();
            pacCtx.beginPath();
            pacCtx.arc(size * 0.35 + pupilOffsetX, -size * 0.3 + pupilOffsetY, size * 0.15, 0, Math.PI * 2);
            pacCtx.fill();
        }
        pacCtx.restore();
    }
}

function pacDrawParticles() {
    for (const p of pacParticles) {
        const alpha = p.life / p.maxLife;
        pacCtx.save();
        pacCtx.globalAlpha = alpha;
        pacCtx.shadowColor = p.color;
        pacCtx.shadowBlur = 8;
        pacCtx.fillStyle = p.color;
        const s = 2 + alpha * 3;
        pacCtx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        pacCtx.restore();
    }
}

function pacDraw() {
    if (!pacCtx) return;
    pacCtx.fillStyle = '#0a0a1e';
    pacCtx.fillRect(0, 0, pacW, pacH);
    pacDrawMaze();
    pacDrawDots();
    pacDrawParticles();
    if (pacDeathAnim > 0) {
        const px = pacPlayer.x * pacGridSize + pacOffsetX + pacGridSize / 2;
        const py = pacPlayer.y * pacGridSize + pacOffsetY + pacGridSize / 2;
        const radius = pacGridSize * 0.42 * pacDeathAnim;
        pacCtx.save();
        pacCtx.shadowColor = '#ffdd00';
        pacCtx.shadowBlur = 15;
        pacCtx.fillStyle = '#ffdd00';
        pacCtx.beginPath();
        pacCtx.arc(px, py, radius, 0, Math.PI * 2);
        pacCtx.fill();
        pacCtx.restore();
    } else {
        pacDrawPlayer();
    }
    pacDrawGhosts();
    if (pacSuperTimer > 0) {
        pacCtx.save();
        pacCtx.fillStyle = `rgba(0, 100, 255, ${Math.min(0.15, pacSuperTimer / 2000)})`;
        pacCtx.fillRect(0, 0, pacW, pacH);
        pacCtx.restore();
    }
    if (pacGame.paused && pacGame.running) {
        pacCtx.save();
        pacCtx.fillStyle = 'rgba(10, 10, 30, 0.7)';
        pacCtx.fillRect(0, 0, pacW, pacH);
        pacCtx.fillStyle = '#00ffff';
        pacCtx.font = '48px "Press Start 2P"';
        pacCtx.textAlign = 'center';
        pacCtx.shadowColor = '#00ffff'; pacCtx.shadowBlur = 20;
        pacCtx.fillText('PAUSE', pacW / 2, pacH / 2);
        pacCtx.restore();
    }
}

function pacRenderLoop() {
    const now = performance.now();
    const dt = Math.min(2, (now - pacLastFrame) / 16.67);
    pacLastFrame = now;
    pacUpdate(dt);
    pacDraw();
    pacGameLoopId = requestAnimationFrame(pacRenderLoop);
}