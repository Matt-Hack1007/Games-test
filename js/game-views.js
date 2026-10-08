// ============================================
// 🎮 VUES DE JEU
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
        <div class="game-hud">${hudHtml}</div>
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
        console.error('❌ gameViewsContainer manquant !');
        return;
    }
    
    createGameView('asteroids',
        { score: true, level: true, lives: true },
        `<span>↑</span> PROPULSION | <span>← →</span> ROTATION | <span>ESPACE</span> TIR | <span>↓</span> HYPERESPACE | <span>ÉCHAP</span> QUITTER`
    );
    
    createGameView('paddle',
        { score: true, level: true, lives: true },
        `<span>← →</span> DÉPLACER | <span>ESPACE</span> LANCER | <span>ÉCHAP</span> QUITTER`
    );
    
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
            <span>Q/A</span> ou <span>↑/↓</span> J1 | <span>P/L</span> J2 | <span>ÉCHAP</span> QUITTER
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
    
    createGameView('invaders',
        { score: true, level: true, lives: true, levelText: 'VAGUE' },
        `<span>← →</span> DÉPLACER | <span>ESPACE</span> TIRER | <span>ÉCHAP</span> QUITTER`
    );
    
    createGameView('snake',
        { score: true, level: true, lives: true, livesText: 'LONGUEUR' },
        `<span>← ↑ → ↓</span> DIRECTION | <span>ESPACE</span> PAUSE | <span>ÉCHAP</span> QUITTER`
    );
    
    createGameView('tetris',
        { score: true, level: true, lives: true, livesText: 'LIGNES' },
        `<span>← →</span> DÉPLACER | <span>↑</span> ROTATION | <span>↓</span> DESCENDRE | <span>ESPACE</span> CHUTE | <span>ÉCHAP</span> QUITTER`
    );
    
    createGameView('flappy',
        { score: true, level: true, lives: true, livesText: 'MEILLEUR' },
        `<span>ESPACE</span> ou <span>CLIC</span> VOLER | <span>ÉCHAP</span> QUITTER`
    );
    
    createGameView('pacman',
        { score: true, level: true, lives: true },
        `<span>← ↑ → ↓</span> DIRECTION | <span>ESPACE</span> PAUSE | <span>ÉCHAP</span> QUITTER`
    );
}

// ============================================
// 🏅 ÉCRAN ACHIEVEMENTS
// ============================================
function showAchievements() {
    const list = document.getElementById('achievementsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    const categories = {
        general: '🌟 GÉNÉRAUX',
        asteroids: '☄️ ASTEROIDS',
        paddle: '🏓 PADDLE',
        tennis: '🎾 TENNIS',
        invaders: '👾 INVADERS',
        snake: '🐍 SNAKE',
        tetris: '🧱 TETRIS',
        flappy: '🐦 FLAPPY',
        pacman: '🟡 PAC-MAN',
        secret: '🎭 SECRETS'
    };
    
    const unlocked = getUnlockedAchievements();
    const progress = getAchievementProgress();
    
    const header = document.createElement('div');
    header.className = 'achievements-header';
    header.innerHTML = `
        <div class="achievements-progress">
            <div class="progress-text">${progress.done} / ${progress.total} DÉBLOQUÉS</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.percent}%"></div>
            </div>
            <div class="progress-percent">${progress.percent}%</div>
        </div>
    `;
    list.appendChild(header);
    
    Object.keys(categories).forEach(catId => {
        const achievements = getAchievementsByCategory(catId);
        if (achievements.length === 0) return;
        
        const catTitle = document.createElement('div');
        catTitle.className = 'achievements-category';
        catTitle.textContent = categories[catId];
        list.appendChild(catTitle);
        
        const grid = document.createElement('div');
        grid.className = 'achievements-grid';
        
        achievements.forEach(a => {
            const isUnlocked = unlocked[a.id] === true;
            const item = document.createElement('div');
            item.className = 'achievement-item' + (isUnlocked ? ' unlocked' : ' locked');
            item.innerHTML = `
                <div class="achievement-item-icon">${isUnlocked ? a.icon : '🔒'}</div>
                <div class="achievement-item-content">
                    <div class="achievement-item-name">${isUnlocked ? a.name : '???'}</div>
                    <div class="achievement-item-desc">${a.desc}</div>
                    <div class="achievement-item-xp">+${a.xp} XP</div>
                </div>
            `;
            grid.appendChild(item);
        });
        
        list.appendChild(grid);
    });
    
    showView('achievementsView');
}

// ============================================
// 🎯 LANCEUR
// ============================================
function startGame(gameId) {
    // Vérifier sauvegarde
    if (hasGameState(gameId)) {
        const save = loadGameState(gameId);
        const resume = confirm(
            '💾 PARTIE EN COURS DÉTECTÉE\n\n' +
            `Score : ${save.score || 0}\n` +
            `Niveau : ${save.level || 1}\n\n` +
            'REPRENDRE la partie ?\n(Annuler = nouvelle partie)'
        );
        
        if (!resume) {
            deleteGameState(gameId);
        }
    }
    
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
    deleteGameState(gameId);
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
// ⏱ COMPTE À REBOURS
// ============================================
function showCountdown(gameId, callback) {
    const el = document.getElementById(`${gameId}Countdown`);
    if (!el) {
        if (callback) callback();
        return;
    }
    
    el.classList.add('active');
    el.classList.remove('pop');
    
    let count = 3;
    el.textContent = count;
    void el.offsetWidth;
    el.classList.add('pop');
    if (typeof playBeep === 'function') playBeep(400, 0.15, 'square', 0.15);
    if (typeof vibrate === 'function') vibrate(30);
    
    const interval = setInterval(() => {
        count--;
        
        if (count > 0) {
            el.textContent = count;
            el.classList.remove('pop');
            void el.offsetWidth;
            el.classList.add('pop');
            if (typeof playBeep === 'function') playBeep(400, 0.15, 'square', 0.15);
            if (typeof vibrate === 'function') vibrate(30);
        } else if (count === 0) {
            el.textContent = 'GO !';
            el.classList.remove('pop');
            void el.offsetWidth;
            el.classList.add('pop');
            if (typeof playBeep === 'function') playBeep(800, 0.3, 'square', 0.2);
            if (typeof vibrate === 'function') vibrate(60);
        } else {
            clearInterval(interval);
            el.classList.remove('active');
            el.classList.remove('pop');
            if (callback) callback();
        }
    }, 800);
}