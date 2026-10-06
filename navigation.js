// ============================================
// 🧭 NAVIGATION
// ============================================
const difficulties = {
    asteroids: 'normal', paddle: 'normal', tennis: 'normal',
    invaders: 'normal', snake: 'normal', tetris: 'normal', 
    flappy: 'normal', pacman: 'normal'
};
let tennisMode = 'ai';
let paddleMode = 'random';

let spaceAnimationLoop, brickAnimationLoop, invadersAnimationLoop, 
    snakeAnimationLoop, tetrisAnimationLoop, flappyAnimationLoop, pacmanAnimationLoop;

const SHIP_SVG = `<svg viewBox="0 0 40 30"><path d="M 2 15 L 38 15 L 20 2 L 2 15 Z" /></svg>`;
const ASTEROID_SVG = `<svg viewBox="0 0 50 50"><path d="M 25 2 L 38 8 L 46 20 L 42 35 L 30 46 L 15 48 L 4 38 L 2 22 L 10 8 Z" /></svg>`;
const ASTEROID_SVG_SMALL = `<svg viewBox="0 0 50 50"><path d="M 25 4 L 35 12 L 40 25 L 30 40 L 18 42 L 8 32 L 10 15 Z" /></svg>`;
const INVADER_A = `<svg viewBox="0 0 11 8"><path d="M 2 0 L 3 0 L 3 1 L 2 1 Z M 8 0 L 9 0 L 9 1 L 8 1 Z M 1 2 L 10 2 L 10 3 L 1 3 Z M 0 3 L 1 3 L 1 4 L 0 4 Z M 3 3 L 8 3 L 8 4 L 3 4 Z M 10 3 L 11 3 L 11 4 L 10 4 Z M 0 4 L 1 4 L 1 5 L 0 5 Z M 3 4 L 4 4 L 4 5 L 3 5 Z M 7 4 L 8 4 L 8 5 L 7 5 Z M 10 4 L 11 4 L 11 5 L 10 5 Z M 1 5 L 10 5 L 10 6 L 1 6 Z M 2 6 L 3 6 L 3 7 L 2 7 Z M 8 6 L 9 6 L 9 7 L 8 7 Z M 3 7 L 4 7 L 4 8 L 3 8 Z M 7 7 L 8 7 L 8 8 L 7 8 Z"/></svg>`;
const INVADER_B = `<svg viewBox="0 0 11 8"><path d="M 4 0 L 7 0 L 7 1 L 4 1 Z M 3 1 L 8 1 L 8 2 L 3 2 Z M 2 2 L 9 2 L 9 3 L 2 3 Z M 1 3 L 4 3 L 4 4 L 1 4 Z M 7 3 L 10 3 L 10 4 L 7 4 Z M 0 4 L 11 4 L 11 5 L 0 5 Z M 0 5 L 2 5 L 2 6 L 0 6 Z M 4 5 L 7 5 L 7 6 L 4 6 Z M 9 5 L 11 5 L 11 6 L 9 6 Z M 2 6 L 3 6 L 3 7 L 2 7 Z M 5 6 L 6 6 L 6 7 L 5 7 Z M 8 6 L 9 6 L 9 7 L 8 7 Z"/></svg>`;
const INVADER_C = `<svg viewBox="0 0 8 8"><path d="M 3 0 L 5 0 L 5 1 L 3 1 Z M 2 1 L 6 1 L 6 2 L 2 2 Z M 1 2 L 7 2 L 7 3 L 1 3 Z M 0 3 L 2 3 L 2 4 L 0 4 Z M 3 3 L 5 3 L 5 4 L 3 4 Z M 6 3 L 8 3 L 8 4 L 6 4 Z M 0 4 L 1 4 L 1 5 L 0 5 Z M 3 4 L 5 4 L 5 5 L 3 5 Z M 7 4 L 8 4 L 8 5 L 7 5 Z M 1 5 L 2 5 L 2 6 L 1 6 Z M 6 5 L 7 5 L 7 6 L 6 6 Z"/></svg>`;
const PLAYER_SHIP = `<svg viewBox="0 0 13 8"><path d="M 6 0 L 7 0 L 7 1 L 6 1 Z M 5 1 L 8 1 L 8 2 L 5 2 Z M 4 2 L 9 2 L 9 3 L 4 3 Z M 3 3 L 10 3 L 10 4 L 3 4 Z M 0 4 L 13 4 L 13 5 L 0 5 Z M 0 5 L 1 5 L 1 6 L 0 6 Z M 12 5 L 13 5 L 13 6 L 12 6 Z"/></svg>`;

function showView(viewId) {
    document.querySelectorAll('.container .view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    stopAllMenuAnimations();
    const menuViews = {
        'asteroidsView': startSpaceAnimation,
        'paddleView': startBrickAnimation,
        'tennisView': startTennisAnimation,
        'invadersView': startInvadersAnimation,
        'snakeView': startSnakeAnimation,
        'tetrisView': startTetrisAnimation,
        'flappyView': startFlappyAnimation,
        'pacmanView': startPacmanAnimation
    };
    if (menuViews[viewId]) menuViews[viewId]();
    const isGameView = viewId.endsWith('GameView');
    document.getElementById('mainContainer').style.display = isGameView ? 'none' : 'block';
    playBeep(600, 0.05, 'square', 0.08);
}

function showGames() { showView('gamesView'); }
function showMenu() { showView('menuView'); }
function backToGames() { showView('gamesView'); }

function launchGame(gameId) {
    difficulties[gameId] = 'normal';
    document.querySelectorAll(`[data-game="${gameId}"]`).forEach(btn => btn.classList.remove('selected'));
    const btns = document.querySelectorAll(`[data-game="${gameId}"]`);
    if (btns[1]) btns[1].classList.add('selected');
    if (gameId === 'tennis') {
        tennisMode = 'ai';
        document.querySelectorAll('[data-mode="tennis"]').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('[data-mode="tennis"]')[0].classList.add('selected');
    }
    if (gameId === 'paddle') {
        paddleMode = 'random';
        document.querySelectorAll('[data-mode="paddle"]').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('[data-mode="paddle"]')[0].classList.add('selected');
    }
    showView(gameId + 'View');
}

function selectDiff(btn, gameId, level) {
    document.querySelectorAll(`[data-game="${gameId}"]`).forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    difficulties[gameId] = level;
}

function selectTennisMode(btn, mode) {
    document.querySelectorAll('[data-mode="tennis"]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    tennisMode = mode;
}

function selectPaddleMode(btn, mode) {
    document.querySelectorAll('[data-mode="paddle"]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    paddleMode = mode;
}

function toggleRubrique(headerEl) {
    const rubrique = headerEl.parentElement;
    const wasOpen = rubrique.classList.contains('open');
    rubrique.classList.toggle('open', !wasOpen);
    playBeep(wasOpen ? 400 : 700, 0.05, 'square', 0.08);
    if (!wasOpen) {
        setTimeout(() => {
            rubrique.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }
}

function stopAllMenuAnimations() {
    if (spaceAnimationLoop) { clearInterval(spaceAnimationLoop); spaceAnimationLoop = null; }
    if (brickAnimationLoop) { clearInterval(brickAnimationLoop); brickAnimationLoop = null; }
    if (invadersAnimationLoop) { clearInterval(invadersAnimationLoop); invadersAnimationLoop = null; }
    if (snakeAnimationLoop) { clearInterval(snakeAnimationLoop); snakeAnimationLoop = null; }
    if (tetrisAnimationLoop) { clearInterval(tetrisAnimationLoop); tetrisAnimationLoop = null; }
    if (flappyAnimationLoop) { clearInterval(flappyAnimationLoop); flappyAnimationLoop = null; }
    if (pacmanAnimationLoop) { clearInterval(pacmanAnimationLoop); pacmanAnimationLoop = null; }
}

// ============================================
// 🎬 ANIMATIONS DES MENUS
// ============================================

function startSpaceAnimation() {
    const scene = document.getElementById('spaceScene');
    if (!scene) return;
    scene.innerHTML = '';
    const ship = document.createElement('div');
    ship.className = 'spaceship';
    ship.innerHTML = SHIP_SVG;
    scene.appendChild(ship);
    spaceAnimationLoop = setInterval(() => spawnAsteroid(scene), 2200);
    spawnAsteroid(scene);
}

function spawnAsteroid(scene) {
    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid';
    const isSmall = Math.random() < 0.4;
    if (isSmall) {
        asteroid.style.width = '30px';
        asteroid.style.height = '30px';
        asteroid.innerHTML = ASTEROID_SVG_SMALL;
    } else {
        asteroid.innerHTML = ASTEROID_SVG;
    }
    asteroid.style.top = (10 + Math.random() * 60) + '%';
    asteroid.style.right = '-100px';
    scene.appendChild(asteroid);
    let pos = -100;
    const speed = 1.5 + Math.random() * 1.5;
    const animate = () => {
        pos += speed;
        asteroid.style.right = (-100 + pos) + 'px';
        if (pos < window.innerWidth + 100) requestAnimationFrame(animate);
        else asteroid.remove();
    };
    requestAnimationFrame(animate);
    setTimeout(() => {
        if (!asteroid.parentNode) return;
        const rect = asteroid.getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect();
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.top = (rect.top - sceneRect.top) + 'px';
        explosion.style.left = (rect.left - sceneRect.left) + 'px';
        scene.appendChild(explosion);
        asteroid.style.opacity = '0';
        setTimeout(() => asteroid.remove(), 100);
        setTimeout(() => explosion.remove(), 700);
    }, 800 + Math.random() * 800);
}

function startBrickAnimation() {
    const scene = document.getElementById('brickScene');
    if (!scene) return;
    scene.innerHTML = '';
    const paddle = document.createElement('div');
    paddle.className = 'anim-paddle';
    scene.appendChild(paddle);
    const ball = document.createElement('div');
    ball.className = 'anim-ball';
    scene.appendChild(ball);
    const colors = ['#ff00ff', '#00ffff', '#00ff88', '#ffdd00', '#ff3366'];
    const positions = [
        { top: '10%', left: '15%', delay: '0s' },
        { top: '8%', left: '40%', delay: '0.5s' },
        { top: '12%', left: '65%', delay: '1s' },
        { top: '15%', left: '85%', delay: '1.5s' },
        { top: '22%', left: '25%', delay: '0.3s' },
        { top: '20%', left: '55%', delay: '0.8s' }
    ];
    positions.forEach((p, i) => {
        const brick = document.createElement('div');
        brick.className = 'anim-brick';
        brick.style.top = p.top;
        brick.style.left = p.left;
        brick.style.background = colors[i % colors.length];
        brick.style.boxShadow = `0 0 8px ${colors[i % colors.length]}`;
        brick.style.animationDelay = p.delay;
        scene.appendChild(brick);
    });
}

function startTennisAnimation() {
    const scene = document.getElementById('tennisScene');
    if (!scene) return;
    scene.innerHTML = '';
    const net = document.createElement('div');
    net.className = 'tennis-net-menu';
    scene.appendChild(net);
    const p1 = document.createElement('div');
    p1.className = 'tennis-paddle';
    scene.appendChild(p1);
    const p2 = document.createElement('div');
    p2.className = 'tennis-paddle right';
    scene.appendChild(p2);
    const ball = document.createElement('div');
    ball.className = 'tennis-ball-menu';
    scene.appendChild(ball);
}

function startInvadersAnimation() {
    const scene = document.getElementById('invadersScene');
    if (!scene) return;
    scene.innerHTML = '';
    const player = document.createElement('div');
    player.className = 'menu-player-ship';
    player.innerHTML = PLAYER_SHIP;
    scene.appendChild(player);
    const invaderTypes = [INVADER_A, INVADER_B, INVADER_C];
    const rows = [
        { top: '12%', type: 0, count: 6 },
        { top: '20%', type: 1, count: 6 },
        { top: '28%', type: 2, count: 6 }
    ];
    rows.forEach(row => {
        for (let i = 0; i < row.count; i++) {
            const inv = document.createElement('div');
            inv.className = 'menu-invader';
            inv.innerHTML = invaderTypes[row.type];
            inv.style.top = row.top;
            inv.style.left = (10 + i * 14) + '%';
            inv.style.animationDelay = (i * 0.1) + 's';
            if (row.type === 1) inv.style.filter = 'drop-shadow(0 0 6px #ff00ff)';
            if (row.type === 2) inv.style.filter = 'drop-shadow(0 0 6px #00ff88)';
            scene.appendChild(inv);
        }
    });
    invadersAnimationLoop = setInterval(() => {
        const laser = document.createElement('div');
        laser.className = 'menu-laser';
        laser.style.left = (30 + Math.random() * 40) + '%';
        scene.appendChild(laser);
        setTimeout(() => laser.remove(), 2000);
    }, 400);
}

function startSnakeAnimation() {
    const scene = document.getElementById('snakeScene');
    if (!scene) return;
    scene.innerHTML = '';
    const positions = [
        { left: '30%', top: '45%', delay: '0s' },
        { left: '35%', top: '45%', delay: '0.1s' },
        { left: '40%', top: '45%', delay: '0.2s' },
        { left: '45%', top: '40%', delay: '0.3s' },
        { left: '50%', top: '35%', delay: '0.4s' },
        { left: '55%', top: '35%', delay: '0.5s' },
        { left: '60%', top: '40%', delay: '0.6s' }
    ];
    positions.forEach(p => {
        const seg = document.createElement('div');
        seg.className = 'menu-snake-segment';
        seg.style.left = p.left;
        seg.style.top = p.top;
        seg.style.animationDelay = p.delay;
        scene.appendChild(seg);
    });
    const apple = document.createElement('div');
    apple.className = 'menu-apple';
    apple.style.left = '72%';
    apple.style.top = '45%';
    scene.appendChild(apple);
}

function startTetrisAnimation() {
    const scene = document.getElementById('tetrisScene');
    if (!scene) return;
    scene.innerHTML = '';
    const colors = ['#ff00ff', '#00ffff', '#00ff88', '#ffdd00', '#ff3366', '#ff8800', '#8800ff'];
    tetrisAnimationLoop = setInterval(() => {
        const block = document.createElement('div');
        block.className = 'menu-tetris-block';
        block.style.left = Math.floor(Math.random() * 15) * 6 + 5 + '%';
        block.style.background = colors[Math.floor(Math.random() * colors.length)];
        block.style.boxShadow = `0 0 8px ${block.style.background}`;
        block.style.animationDuration = (2 + Math.random() * 2) + 's';
        scene.appendChild(block);
        setTimeout(() => block.remove(), 4000);
    }, 500);
}

function startFlappyAnimation() {
    const scene = document.getElementById('flappyScene');
    if (!scene) return;
    scene.innerHTML = '';
    const bird = document.createElement('div');
    bird.className = 'menu-flappy-bird';
    bird.style.left = '20%';
    bird.style.top = '45%';
    scene.appendChild(bird);
    const pipes = [
        { top: '0', height: '35%', delay: '0s' },
        { bottom: '0', height: '35%', delay: '0s' },
        { top: '0', height: '25%', delay: '2s' },
        { bottom: '0', height: '45%', delay: '2s' }
    ];
    pipes.forEach(p => {
        const pipe = document.createElement('div');
        pipe.className = 'menu-flappy-pipe';
        if (p.top) pipe.style.top = p.top;
        if (p.bottom) pipe.style.bottom = p.bottom;
        pipe.style.height = p.height;
        pipe.style.animationDelay = p.delay;
        scene.appendChild(pipe);
    });
}

function startPacmanAnimation() {
    const scene = document.getElementById('pacmanScene');
    if (!scene) return;
    scene.innerHTML = '';
    
    const pacman = document.createElement('div');
    pacman.className = 'menu-pacman';
    scene.appendChild(pacman);
    
    const ghostColors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
    const ghostPositions = [
        { left: '25%', top: '20%', delay: '0s' },
        { left: '45%', top: '15%', delay: '0.3s' },
        { left: '65%', top: '20%', delay: '0.6s' },
        { left: '85%', top: '15%', delay: '0.9s' }
    ];
    ghostPositions.forEach((pos, i) => {
        const ghost = document.createElement('div');
        ghost.className = 'menu-ghost';
        ghost.style.left = pos.left;
        ghost.style.top = pos.top;
        ghost.style.background = ghostColors[i];
        ghost.style.color = ghostColors[i];
        ghost.style.animationDelay = pos.delay;
        scene.appendChild(ghost);
    });
    
    pacmanAnimationLoop = setInterval(() => {
        const dot = document.createElement('div');
        dot.className = 'menu-dot';
        dot.style.left = (20 + Math.random() * 60) + '%';
        dot.style.top = (35 + Math.random() * 40) + '%';
        scene.appendChild(dot);
        setTimeout(() => dot.remove(), 1500);
    }, 300);
}

// ============================================
// ⭐ ÉTOILES DE FOND
// ============================================
function generateStars() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = (Math.random() * 2) + 's';
        const size = Math.random() < 0.7 ? 2 : 3;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        starsContainer.appendChild(star);
    }
}