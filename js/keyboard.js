// ============================================
// ⌨️ CLAVIER GLOBAL
// ============================================
function handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    if (e.code === 'Space') e.preventDefault();
    
    const aA = document.getElementById('asteroidsGameView')?.classList.contains('active');
    const pA = document.getElementById('paddleGameView')?.classList.contains('active');
    const tA = document.getElementById('tennisGameView')?.classList.contains('active');
    const iA = document.getElementById('invadersGameView')?.classList.contains('active');
    const sA = document.getElementById('snakeGameView')?.classList.contains('active');
    const teA = document.getElementById('tetrisGameView')?.classList.contains('active');
    const fA = document.getElementById('flappyGameView')?.classList.contains('active');
    const pacA = document.getElementById('pacmanGameView')?.classList.contains('active');
    
    if (e.key === 'Escape') {
        if (aA) quitToAsteroidsMenu();
        else if (pA) quitToPaddleMenu();
        else if (tA) quitToTennisMenu();
        else if (iA) quitToInvadersMenu();
        else if (sA) quitToSnakeMenu();
        else if (teA) quitToTetrisMenu();
        else if (fA) quitToFlappyMenu();
        else if (pacA) quitToPacmanMenu();
        else closeSettings();
        return;
    }
    
    if (aA) {
        if (e.key in aKeys) aKeys[e.key] = true;
        if (e.code === 'Space') {
            aKeys.Space = true;
            if (!aGame.running && !aGame.gameOver) aStartGame();
        }
        if (e.key === 'ArrowDown' && aGame.running) aHyperSpace();
    }
    if (pA) {
        if (e.key in pKeys) pKeys[e.key] = true;
        if (e.code === 'Space') {
            pKeys.Space = true;
            if (!pGame.running && !pGame.gameOver && pBall.stuck) pStartGame();
        }
    }
    if (tA) {
        const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (k in tKeys) tKeys[k] = true;
        if (e.code === 'Space') {
            tKeys.Space = true;
            if (!tGame.running && !tGame.gameOver && tGame.serving) tStartGame();
        }
    }
    if (iA) {
        if (e.key in iKeys) iKeys[e.key] = true;
        if (e.code === 'Space') {
            iKeys.Space = true;
            if (!iGame.running && !iGame.gameOver) iStartGame();
        }
    }
    if (sA) {
        if (e.code === 'Space') {
            sKeys.Space = true;
            if (!sGame.running && !sGame.gameOver) sStartGame();
            else if (sGame.running) {
                sGame.paused = !sGame.paused;
                playBeep(sGame.paused ? 300 : 700, 0.05);
            }
            return;
        }
        if (e.key === 'ArrowUp' && sDir.y !== 1) sNextDir = { x: 0, y: -1 };
        if (e.key === 'ArrowDown' && sDir.y !== -1) sNextDir = { x: 0, y: 1 };
        if (e.key === 'ArrowLeft' && sDir.x !== 1) sNextDir = { x: -1, y: 0 };
        if (e.key === 'ArrowRight' && sDir.x !== -1) sNextDir = { x: 1, y: 0 };
    }
    if (teA) {
        if (e.key in teKeys) teKeys[e.key] = true;
        if (e.code === 'Space') {
            teKeys.Space = true;
            if (!teGame.running && !teGame.gameOver) teStartGame();
        }
    }
    if (fA) {
        if (e.code === 'Space') {
            fKeys.Space = true;
            if (!fGame.running && !fGame.gameOver) fStartGame();
            else if (fGame.running) fJump();
        }
    }
    if (pacA) {
        if (e.code === 'Space') {
            if (!pacGame.running && !pacGame.gameOver) pacStartGame();
            else if (pacGame.running) {
                pacGame.paused = !pacGame.paused;
                playBeep(pacGame.paused ? 300 : 700, 0.05);
            }
            return;
        }
        if (e.key === 'ArrowUp') pacPlayer.nextDir = { ...DIR_UP };
        if (e.key === 'ArrowDown') pacPlayer.nextDir = { ...DIR_DOWN };
        if (e.key === 'ArrowLeft') pacPlayer.nextDir = { ...DIR_LEFT };
        if (e.key === 'ArrowRight') pacPlayer.nextDir = { ...DIR_RIGHT };
    }
}

function handleKeyUp(e) {
    if (e.key in aKeys) aKeys[e.key] = false;
    if (e.key in pKeys) pKeys[e.key] = false;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k in tKeys) tKeys[k] = false;
    if (e.key in iKeys) iKeys[e.key] = false;
    if (e.key in teKeys) teKeys[e.key] = false;
    if (e.code === 'Space') { 
        aKeys.Space = false; pKeys.Space = false; tKeys.Space = false; 
        iKeys.Space = false; sKeys.Space = false; teKeys.Space = false; 
        fKeys.Space = false;
    }
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Clic pour Flappy
document.addEventListener('click', (e) => {
    const fA = document.getElementById('flappyGameView')?.classList.contains('active');
    if (fA) {
        if (!fGame.running && !fGame.gameOver) fStartGame();
        else if (fGame.running) fJump();
    }
});

// Resize
window.addEventListener('resize', () => {
    if (document.getElementById('asteroidsGameView')?.classList.contains('active')) aResize();
    if (document.getElementById('paddleGameView')?.classList.contains('active')) { pResize(); pPaddle.y = pH - 60; }
    if (document.getElementById('tennisGameView')?.classList.contains('active')) tResize();
    if (document.getElementById('invadersGameView')?.classList.contains('active')) iResize();
    if (document.getElementById('snakeGameView')?.classList.contains('active')) sResize();
    if (document.getElementById('tetrisGameView')?.classList.contains('active')) teResize();
    if (document.getElementById('flappyGameView')?.classList.contains('active')) fResize();
    if (document.getElementById('pacmanGameView')?.classList.contains('active')) pacResize();
});