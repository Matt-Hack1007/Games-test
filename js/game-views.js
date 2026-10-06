// ============================================
// 🎮 VUES DE JEU (générées dynamiquement)
// ============================================

function createGameView(gameId, hudConfig, controlsText) {
    const container = document.getElementById('gameViewsContainer');
    if (!container) {
        console.error('❌ gameViewsContainer introuvable !');
        return;
    }
    
    const view = document.createElement('div');
    view.className = 'game-view';
    view.id = `${gameId}GameView`;
    
    let hudHtml = '';
    if (hudConfig.score) hudHtml += `<div class="game-hud-score">SCORE : <span id="${gameId}Score">0</span></div>`;
    if (hudConfig.level) hudHtml += `<div class="game-hud-level">${hudConfig.levelText || 'NIVEAU'} <span id="${gameId}Level">1</span></div>`;
    if (hudConfig.lives) hudHtml += `<div class="game-hud-lives">${hudConfig.livesText || 'VIES'} : <span id="${gameId}Lives">♥♥♥</span></div>`;
    
    view.innerHTML = `
        <canvas id="${gameId}Canvas"></canvas>
        <div class="game-hud">
            ${hudHtml}
        </div>
        <div class="game-controls">${controlsText}</div>
        <div class="game-countdown" id="${gameId}Countdown"></div>
        <div class="game-over-overlay" id="${gameId}GameOver">
            <div class="game-over-title" id="${gameId}GameOverTitle">GAME OVER</div>
            <div class="game-over-score">SCORE FINAL : <span id="${gameId}FinalScore">0</span></div>
            <div class="game-over-best" id="${gameId}BestScore"></div>
            <div class="game-over-buttons">
                <button class="btn-start" onclick="restartGame('${gameId}')">REJOUER</button>
                <button class="btn-back" onclick="quitToMenu('${gameId}')">MENU</button>
            </div>
        </div>
    `;
    
    container.appendChild(view);
}

function createAllGameViews() {
    const container = document.getElementById('gameViewsContainer');
    if (!container) {
        console.error('❌ gameViewsContainer manquant dans le HTML !');
        return;
    }
    
    // ASTEROIDS
    createGameView('asteroids',
        { score: true, level: true, lives: true },
        `<span>↑</span> PROPULSION | <span>← →</span> ROTATION | <span>ESPACE</span> TIR | <span>↓</span> HYPERESPACE | <span>ÉCHAP</span> QUITTER`
    );
    
    // PADDLE
    createGameView('paddle',
        { score: true, level: true, lives: true },
        `<span>← →</span> DÉPLACER | <span>ESPACE</span> LANCER | <span>ÉCHAP</span> QUITTER`
    );
    
    // TENNIS (HUD spécial)
    const tennisView = document.createElement('div');
    tennisView.className = 'game-view';
    tennisView.id = 'tennisGameView';
    tennisView.innerHTML = `
        <canvas id="tennisCanvas"></canvas>
        <div class="game-hud">
            <div class="game-hud-score">J1 : <span id="tennisScore1">0</span></div>
            <div class="game-hud-level">PREMIER À <span id="tennisTarget">5</span></div>
            <div class="game-hud-lives">J2 : <span id="tennisScore2">0</span></div>
        </div>
        <div class="game-controls" id="tennisControls">
            <span>Q/A</span> ou <span>↑/↓</span> J1 | <span>P/L</span> J2 | <span>ESPACE</span> LANCER | <span>ÉCHAP</span> QUITTER
        </div>
        <div class="game-countdown" id="tennisCountdown"></div>
        <div class="game-over-overlay" id="tennisGameOver">
            <div class="game-over-title" id="tennisGameOverTitle">VICTOIRE !</div>
            <div class="game-over-score">SCORE : <span id="tennisFinalScore">0 - 0</span></div>
            <div class="game-over-best" id="tennisBestScore"></div>
            <div class="game-over-buttons">
                <button class="btn-start" onclick="restartGame('tennis')">REJOUER</button>
                <button class="btn-back" onclick="quitToMenu('tennis')">MENU</button>
            </div>
        </div>
    `;
    container.appendChild(tennisView);
    
    // INVADERS
    createGameView('invaders',
        { score: true, level: true, lives: true, levelText: 'VAGUE' },
        `<span>← →</span> DÉPLACER | <span>ESPACE</span> TIRER | <span>ÉCHAP</span> QUITTER`
    );
    
    // SNAKE
    createGameView('snake',
        { score: true, level: true, lives: true, livesText: 'LONGUEUR' },
        `<span>← ↑ → ↓</span> DIRECTION | <span>ESPACE</span> PAUSE | <span>ÉCHAP</span> QUITTER`
    );
    
    // TETRIS
    createGameView('tetris',
        { score: true, level: true, lives: true, livesText: 'LIGNES' },
        `<span>← →</span> DÉPLACER | <span>↑</span> ROTATION | <span>↓</span> DESCENDRE | <span>ESPACE</span> CHUTE | <span>ÉCHAP</span> QUITTER`
    );
    
    // FLAPPY
    createGameView('flappy',
        { score: true, level: true, lives: true, livesText: 'MEILLEUR' },
        `<span>ESPACE</span> ou <span>CLIC</span> VOLER | <span>ÉCHAP</span> QUITTER`
    );
    
    // PACMAN
    createGameView('pacman',
        { score: true, level: true, lives: true },
        `<span>← ↑ → ↓</span> DIRECTION | <span>ESPACE</span> PAUSE | <span>ÉCHAP</span> QUITTER`
    );
}

// ============================================
// 🎯 LANCEUR GLOBAL
// ============================================
function startGame(gameId) {
    switch (gameId) {
        case 'asteroids': startAsteroidsGame(); break;
        case 'paddle': startPaddleGame(); break;
        case 'tennis': startTennisGame(); break;
        case 'invaders': startInvadersGame(); break;
        case 'snake': startSnakeGame(); break;
        case 'tetris': startTetrisGame(); break;
        case 'flappy': startFlappyGame(); break;
        case 'pacman': startPacmanGame(); break;
    }
}

function restartGame(gameId) {
    const map = {
        asteroids: 'asteroidsGameOver',
        paddle: 'paddleGameOver',
        tennis: 'tennisGameOver',
        invaders: 'invadersGameOver',
        snake: 'snakeGameOver',
        tetris: 'tetrisGameOver',
        flappy: 'flappyGameOver',
        pacman: 'pacmanGameOver'
    };
    const el = document.getElementById(map[gameId]);
    if (el) el.classList.remove('active');
    startGame(gameId);
}

function quitToMenu(gameId) {
    const fnMap = {
        asteroids: quitToAsteroidsMenu,
        paddle: quitToPaddleMenu,
        tennis: quitToTennisMenu,
        invaders: quitToInvadersMenu,
        snake: quitToSnakeMenu,
        tetris: quitToTetrisMenu,
        flappy: quitToFlappyMenu,
        pacman: quitToPacmanMenu
    };
    if (fnMap[gameId]) fnMap[gameId]();
}

// ============================================
// ⏱ COMPTE À REBOURS (3, 2, 1, GO!)
// ============================================
function showCountdown(gameId, callback) {
    const el = document.getElementById(`${gameId}Countdown`);
    if (!el) {
        // Pas d'élément countdown → appeler directement
        if (callback) callback();
        return;
    }
    
    el.classList.add('active');
    
    let count = 3;
    el.textContent = count;
    playBeep(400, 0.15, 'square', 0.15);
    vibrate(30);
    
    const interval = setInterval(() => {
        count--;
        
        if (count > 0) {
            el.textContent = count;
            el.classList.remove('pop');
            void el.offsetWidth;
            el.classList.add('pop');
            playBeep(400, 0.15, 'square', 0.15);
            vibrate(30);
        } else if (count === 0) {
            el.textContent = 'GO !';
            el.classList.remove('pop');
            void el.offsetWidth;
            el.classList.add('pop');
            playBeep(800, 0.3, 'square', 0.2);
            vibrate(60);
        } else {
            clearInterval(interval);
            el.classList.remove('active');
            el.classList.remove('pop');
            if (callback) callback();
        }
    }, 800);
}

// Fonction vibrate (fallback si pas chargée)
if (typeof vibrate !== 'function') {
    window.vibrate = function(duration) {
        if (navigator.vibrate && typeof IS_TOUCH !== 'undefined' && IS_TOUCH) {
            try { navigator.vibrate(duration); } catch (e) {}
        }
    };
}