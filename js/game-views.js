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
        <div class="game-hud">
            ${hudHtml}
        </div>
        <button class="game-pause-btn" onclick="openPauseMenu('${gameId}')" title="Pause">
            <span class="game-pause-icon">⏸</span>
            <span class="game-pause-text">PAUSE</span>
        </button>
        
        <!-- MENU PAUSE (caché par défaut) -->
        <div class="pause-overlay" id="${gameId}PauseOverlay">
            <div class="pause-menu">
                <h2 class="pause-title">⏸ PAUSE</h2>
                <div class="pause-score">
                    SCORE : <span id="${gameId}PauseScore">0</span>
                </div>
                <div class="pause-buttons">
                    <button class="pause-btn pause-resume" onclick="resumeGame('${gameId}')">
                        <span class="pause-btn-icon">▶</span>
                        <span>REPRENDRE</span>
                    </button>
                    <button class="pause-btn pause-settings" onclick="pauseOpenSettings('${gameId}')">
                        <span class="pause-btn-icon">⚙</span>
                        <span>PARAMÈTRES</span>
                    </button>
                    <button class="pause-btn pause-save" onclick="pauseSaveGame('${gameId}')">
                        <span class="pause-btn-icon">💾</span>
                        <span>SAUVEGARDER</span>
                    </button>
                    <button class="pause-btn pause-quit" onclick="pauseQuitGame('${gameId}')">
                        <span class="pause-btn-icon">🚪</span>
                        <span>QUITTER</span>
                    </button>
                </div>
            </div>
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
        console.error('❌ gameViewsContainer manquant !');
        return;
    }
    
    createGameView('asteroids',
        { score: true, level: true, lives: true },
        `<span>↑</span> PROPULSION | <span>← →</span> ROTATION | <span>ESPACE</span> TIR | <span>↓</span> HYPERESPACE`
    );
    
    createGameView('paddle',
        { score: true, level: true, lives: true },
        `<span>← →</span> DÉPLACER | <span>ESPACE</span> LANCER`
    );
    
    // TENNIS - HUD spécial
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
        <button class="game-pause-btn" onclick="openPauseMenu('tennis')" title="Pause">
            <span class="game-pause-icon">⏸</span>
            <span class="game-pause-text">PAUSE</span>
        </button>
        
        <div class="pause-overlay" id="tennisPauseOverlay">
            <div class="pause-menu">
                <h2 class="pause-title">⏸ PAUSE</h2>
                <div class="pause-score">
                    SCORE : <span id="tennisPauseScore">0 - 0</span>
                </div>
                <div class="pause-buttons">
                    <button class="pause-btn pause-resume" onclick="resumeGame('tennis')">
                        <span class="pause-btn-icon">▶</span>
                        <span>REPRENDRE</span>
                    </button>
                    <button class="pause-btn pause-settings" onclick="pauseOpenSettings('tennis')">
                        <span class="pause-btn-icon">⚙</span>
                        <span>PARAMÈTRES</span>
                    </button>
                    <button class="pause-btn pause-save" onclick="pauseSaveGame('tennis')">
                        <span class="pause-btn-icon">💾</span>
                        <span>SAUVEGARDER</span>
                    </button>
                    <button class="pause-btn pause-quit" onclick="pauseQuitGame('tennis')">
                        <span class="pause-btn-icon">🚪</span>
                        <span>QUITTER</span>
                    </button>
                </div>
            </div>
        </div>
        
        <div class="game-controls" id="tennisControls">
            <span>Q/A</span> ou <span>↑/↓</span> J1 | <span>P/L</span> J2
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
        `<span>← →</span> DÉPLACER | <span>ESPACE</span> TIRER`
    );
    
    createGameView('snake',
        { score: true, level: true, lives: true, livesText: 'LONGUEUR' },
        `<span>← ↑ → ↓</span> DIRECTION | <span>ESPACE</span> PAUSE`
    );
    
    createGameView('tetris',
        { score: true, level: true, lives: true, livesText: 'LIGNES' },
        `<span>← →</span> DÉPLACER | <span>↑</span> ROTATION | <span>↓</span> DESCENDRE | <span>ESPACE</span> CHUTE`
    );
    
    createGameView('flappy',
        { score: true, level: true, lives: true, livesText: 'MEILLEUR' },
        `<span>ESPACE</span> ou <span>CLIC</span> VOLER`
    );
    
    createGameView('pacman',
        { score: true, level: true, lives: true },
        `<span>← ↑ → ↓</span> DIRECTION | <span>ESPACE</span> PAUSE`
    );
}

// ============================================
// ⏸ MENU PAUSE
// ============================================

// Mapping jeu → fonction de pause et jeu
function getGamePauseFunctions(gameId) {
    const map = {
        asteroids: {
            pause: () => { if (typeof aGame !== 'undefined' && aGame) aGame.paused = true; },
            resume: () => { if (typeof aGame !== 'undefined' && aGame) aGame.paused = false; }
        },
        paddle: {
            pause: () => { if (typeof pGame !== 'undefined' && pGame) pGame.paused = true; },
            resume: () => { if (typeof pGame !== 'undefined' && pGame) pGame.paused = false; }
        },
        tennis: {
            pause: () => { if (typeof tGame !== 'undefined' && tGame) tGame.paused = true; },
            resume: () => { if (typeof tGame !== 'undefined' && tGame) tGame.paused = false; }
        },
        invaders: {
            pause: () => { if (typeof iGame !== 'undefined' && iGame) iGame.paused = true; },
            resume: () => { if (typeof iGame !== 'undefined' && iGame) iGame.paused = false; }
        },
        snake: {
            pause: () => { if (typeof sGame !== 'undefined' && sGame) sGame.paused = true; },
            resume: () => { if (typeof sGame !== 'undefined' && sGame) sGame.paused = false; }
        },
        tetris: {
            pause: () => { if (typeof teGame !== 'undefined' && teGame) teGame.paused = true; },
            resume: () => { if (typeof teGame !== 'undefined' && teGame) teGame.paused = false; }
        },
        flappy: {
            pause: () => { if (typeof fGame !== 'undefined' && fGame) fGame.paused = true; },
            resume: () => { if (typeof fGame !== 'undefined' && fGame) fGame.paused = false; }
        },
        pacman: {
            pause: () => { if (typeof pacGame !== 'undefined' && pacGame) pacGame.paused = true; },
            resume: () => { if (typeof pacGame !== 'undefined' && pacGame) pacGame.paused = false; }
        }
    };
    return map[gameId] || { pause: () => {}, resume: () => {} };
}

// Obtenir le score actuel du jeu
function getGameCurrentScore(gameId) {
    switch (gameId) {
        case 'asteroids': return (typeof aGame !== 'undefined' && aGame) ? aGame.score : 0;
        case 'paddle': return (typeof pGame !== 'undefined' && pGame) ? pGame.score : 0;
        case 'tennis': return (typeof tGame !== 'undefined' && tGame) ? tGame.score1 + ' - ' + tGame.score2 : '0 - 0';
        case 'invaders': return (typeof iGame !== 'undefined' && iGame) ? iGame.score : 0;
        case 'snake': return (typeof sGame !== 'undefined' && sGame) ? sGame.score : 0;
        case 'tetris': return (typeof teGame !== 'undefined' && teGame) ? teGame.score : 0;
        case 'flappy': return (typeof fGame !== 'undefined' && fGame) ? fGame.score : 0;
        case 'pacman': return (typeof pacGame !== 'undefined' && pacGame) ? pacGame.score : 0;
        default: return 0;
    }
}

// Ouvrir le menu pause
function openPauseMenu(gameId) {
    // Pause du jeu
    const fns = getGamePauseFunctions(gameId);
    fns.pause();
    
    // Mettre à jour le score affiché
    const scoreEl = document.getElementById(`${gameId}PauseScore`);
    if (scoreEl) scoreEl.textContent = getGameCurrentScore(gameId);
    
    // Afficher l'overlay
    const overlay = document.getElementById(`${gameId}PauseOverlay`);
    if (overlay) overlay.classList.add('active');
    
    // Son
    if (typeof playBeep === 'function') playBeep(500, 0.1, 'square', 0.15);
    if (typeof vibrate === 'function') vibrate(30);
}

// Reprendre le jeu
function resumeGame(gameId) {
    const fns = getGamePauseFunctions(gameId);
    fns.resume();
    
    const overlay = document.getElementById(`${gameId}PauseOverlay`);
    if (overlay) overlay.classList.remove('active');
    
    if (typeof playBeep === 'function') playBeep(700, 0.1, 'square', 0.15);
}

// Ouvrir les paramètres depuis le menu pause
function pauseOpenSettings(gameId) {
    if (typeof openSettings === 'function') openSettings();
}

// Sauvegarder la partie manuellement
function pauseSaveGame(gameId) {
    const saved = saveCurrentGameState(gameId);
    
    // Message de confirmation
    if (saved) {
        if (typeof playRecordFanfare === 'function') playRecordFanfare();
        showPauseToast(gameId, '✅ PARTIE SAUVEGARDÉE !');
    } else {
        if (typeof playBeep === 'function') playBeep(300, 0.2, 'sawtooth', 0.15);
        showPauseToast(gameId, '⚠️ RIEN À SAUVEGARDER');
    }
}

// Toast temporaire
function showPauseToast(gameId, message) {
    const overlay = document.getElementById(`${gameId}PauseOverlay`);
    if (!overlay) return;
    
    let toast = overlay.querySelector('.pause-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'pause-toast';
        overlay.querySelector('.pause-menu').appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Quitter depuis le menu pause
function pauseQuitGame(gameId) {
    // Fermer le menu pause
    const overlay = document.getElementById(`${gameId}PauseOverlay`);
    if (overlay) overlay.classList.remove('active');
    
    // Reprendre le jeu (pour que quitToMenu fonctionne correctement)
    const fns = getGamePauseFunctions(gameId);
    fns.resume();
    
    // Appeler quitToMenu
    quitToMenu(gameId);
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

// ============================================
// 🚪 SORTIE DE JEU
// ============================================
function quitToMenu(gameId) {
    const gameState = getGameState(gameId);
    
    // Sauvegarder si score > 0
    if (gameState.isPlaying && gameState.score > 0) {
        saveCurrentGameState(gameId);
    }
    
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
// 🎮 ÉTAT DE CHAQUE JEU
// ============================================
function getGameState(gameId) {
    switch (gameId) {
        case 'asteroids':
            return { isPlaying: typeof aGame !== 'undefined' && aGame && aGame.running && !aGame.gameOver, score: (typeof aGame !== 'undefined' && aGame) ? aGame.score : 0 };
        case 'paddle':
            return { isPlaying: typeof pGame !== 'undefined' && pGame && pGame.running && !pGame.gameOver, score: (typeof pGame !== 'undefined' && pGame) ? pGame.score : 0 };
        case 'tennis':
            return { isPlaying: typeof tGame !== 'undefined' && tGame && tGame.running && !tGame.gameOver, score: (typeof tGame !== 'undefined' && tGame) ? tGame.score1 : 0 };
        case 'invaders':
            return { isPlaying: typeof iGame !== 'undefined' && iGame && iGame.running && !iGame.gameOver, score: (typeof iGame !== 'undefined' && iGame) ? iGame.score : 0 };
        case 'snake':
            return { isPlaying: typeof sGame !== 'undefined' && sGame && sGame.running && !sGame.gameOver, score: (typeof sGame !== 'undefined' && sGame) ? sGame.score : 0 };
        case 'tetris':
            return { isPlaying: typeof teGame !== 'undefined' && teGame && teGame.running && !teGame.gameOver, score: (typeof teGame !== 'undefined' && teGame) ? teGame.score : 0 };
        case 'flappy':
            return { isPlaying: typeof fGame !== 'undefined' && fGame && fGame.running && !fGame.gameOver, score: (typeof fGame !== 'undefined' && fGame) ? fGame.score : 0 };
        case 'pacman':
            return { isPlaying: typeof pacGame !== 'undefined' && pacGame && pacGame.running && !pacGame.gameOver, score: (typeof pacGame !== 'undefined' && pacGame) ? pacGame.score : 0 };
        default:
            return { isPlaying: false, score: 0 };
    }
}

// Sauvegarder l'état actuel du jeu
// Retourne true si quelque chose a été sauvegardé
function saveCurrentGameState(gameId) {
    try {
        switch (gameId) {
            case 'asteroids':
                if (typeof aGame !== 'undefined' && aGame && aGame.score > 0) {
                    saveGameState('asteroids', { score: aGame.score, lives: aGame.lives, level: aGame.level });
                    return true;
                }
                return false;
            case 'paddle':
                if (typeof pGame !== 'undefined' && pGame && pGame.score > 0) {
                    saveGameState('paddle', { score: pGame.score, lives: pGame.lives, level: pGame.level });
                    return true;
                }
                return false;
            case 'invaders':
                if (typeof iGame !== 'undefined' && iGame && iGame.score > 0) {
                    saveGameState('invaders', { score: iGame.score, lives: iGame.lives, level: iGame.level });
                    return true;
                }
                return false;
            case 'snake':
                if (typeof sGame !== 'undefined' && sGame && sGame.score > 0) {
                    saveGameState('snake', { 
                        score: sGame.score, 
                        level: sGame.level, 
                        snake: typeof sSnake !== 'undefined' ? sSnake.map(s => ({ x: s.x, y: s.y })) : []
                    });
                    return true;
                }
                return false;
            case 'tetris':
                if (typeof teGame !== 'undefined' && teGame && teGame.score > 0) {
                    saveGameState('tetris', { score: teGame.score, level: teGame.level, lines: teGame.lines });
                    return true;
                }
                return false;
            case 'flappy':
                if (typeof fGame !== 'undefined' && fGame && fGame.score > 0) {
                    saveGameState('flappy', { score: fGame.score, level: fGame.level });
                    return true;
                }
                return false;
            case 'pacman':
                if (typeof pacGame !== 'undefined' && pacGame && pacGame.score > 0) {
                    saveGameState('pacman', { score: pacGame.score, lives: pacGame.lives, level: pacGame.level });
                    return true;
                }
                return false;
            case 'tennis':
                // Tennis : pas de sauvegarde de partie en cours (match trop court)
                return false;
        }
        return false;
    } catch (e) {
        console.warn('Erreur sauvegarde:', e);
        return false;
    }
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