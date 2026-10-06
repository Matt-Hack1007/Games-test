// ============================================
// 📱 CONTRÔLES TACTILES
// ============================================
var touchState = {
    up: false, down: false, left: false, right: false,
    action: false
};

function createTouchControls() {
    if (!IS_TOUCH) return;
    
    const container = document.createElement('div');
    container.id = 'touchControls';
    container.className = 'touch-controls';
    
    container.innerHTML = `
        <div class="touch-dpad">
            <button class="touch-btn touch-up" data-dir="up">▲</button>
            <button class="touch-btn touch-left" data-dir="left">◀</button>
            <button class="touch-btn touch-center" data-dir="action">⏺</button>
            <button class="touch-btn touch-right" data-dir="right">▶</button>
            <button class="touch-btn touch-down" data-dir="down">▼</button>
        </div>
    `;
    
    document.body.appendChild(container);
    
    setupTouchEvents();
    
    console.log('📱 Contrôles tactiles créés');
}

function setupTouchEvents() {
    const buttons = document.querySelectorAll('.touch-btn');
    
    buttons.forEach(btn => {
        const dir = btn.dataset.dir;
        
        const activate = (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.add('pressed');
            handleTouchAction(dir, true);
        };
        
        const deactivate = (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.remove('pressed');
            handleTouchAction(dir, false);
        };
        
        btn.addEventListener('touchstart', activate, { passive: false });
        btn.addEventListener('touchend', deactivate, { passive: false });
        btn.addEventListener('touchcancel', deactivate, { passive: false });
        
        btn.addEventListener('mousedown', activate);
        btn.addEventListener('mouseup', deactivate);
        btn.addEventListener('mouseleave', deactivate);
    });
    
    setupSwipeGestures();
}

// ============================================
// 🎯 ACTIONS D-PAD
// ============================================
function handleTouchAction(dir, pressed) {
    if (dir === 'action') touchState.action = pressed;
    else touchState[dir] = pressed;
    
    // 🟡 PAC-MAN
    if (document.getElementById('pacmanGameView')?.classList.contains('active')) {
        if (!pressed) return;
        if (dir === 'action') { pacGame.paused = !pacGame.paused; return; }
        if (dir === 'up')    pacPlayer.nextDir = { ...DIR_UP };
        if (dir === 'down')  pacPlayer.nextDir = { ...DIR_DOWN };
        if (dir === 'left')  pacPlayer.nextDir = { ...DIR_LEFT };
        if (dir === 'right') pacPlayer.nextDir = { ...DIR_RIGHT };
    }
    
    // 🐍 SNAKE
    else if (document.getElementById('snakeGameView')?.classList.contains('active')) {
        if (!pressed) return;
        if (dir === 'action') { sGame.paused = !sGame.paused; return; }
        if (dir === 'up'    && sDir.y !== 1)  sNextDir = { x: 0, y: -1 };
        if (dir === 'down'  && sDir.y !== -1) sNextDir = { x: 0, y: 1 };
        if (dir === 'left'  && sDir.x !== 1)  sNextDir = { x: -1, y: 0 };
        if (dir === 'right' && sDir.x !== -1) sNextDir = { x: 1, y: 0 };
    }
    
    // 🧱 TETRIS
    else if (document.getElementById('tetrisGameView')?.classList.contains('active')) {
        if (!pressed) return;
        if (!teGame.running) return;
        if (dir === 'up')    teRotate();
        if (dir === 'down')  teDrop();
        if (dir === 'left')  { if (!teCollide(teCurrent.shape, teCurrent.x - 1, teCurrent.y)) teCurrent.x--; }
        if (dir === 'right') { if (!teCollide(teCurrent.shape, teCurrent.x + 1, teCurrent.y)) teCurrent.x++; }
        if (dir === 'action') teHardDrop();
    }
    
    // 👾 INVADERS
    else if (document.getElementById('invadersGameView')?.classList.contains('active')) {
        if (!pressed && dir !== 'action') {
            if (dir === 'left')  iKeys.ArrowLeft = false;
            if (dir === 'right') iKeys.ArrowRight = false;
            return;
        }
        if (pressed && dir === 'action') {
            iShoot();
            return;
        }
        if (!iGame.running) return;
        if (dir === 'left')  iKeys.ArrowLeft = pressed;
        if (dir === 'right') iKeys.ArrowRight = pressed;
    }
    
    // ☄ ASTEROIDS
    else if (document.getElementById('asteroidsGameView')?.classList.contains('active')) {
        if (pressed && dir === 'action') {
            aShoot();
            return;
        }
        if (!aGame.running) return;
        if (dir === 'left')  aKeys.ArrowLeft = pressed;
        if (dir === 'right') aKeys.ArrowRight = pressed;
        if (dir === 'up')    aKeys.ArrowUp = pressed;
        if (dir === 'down' && pressed) aHyperSpace();
    }
    
    // 🏓 PADDLE
    else if (document.getElementById('paddleGameView')?.classList.contains('active')) {
        if (pressed && dir === 'action') return;
        if (!pGame.running) return;
        if (dir === 'left')  pKeys.ArrowLeft = pressed;
        if (dir === 'right') pKeys.ArrowRight = pressed;
    }
    
    // 🎾 TENNIS
    else if (document.getElementById('tennisGameView')?.classList.contains('active')) {
        if (pressed && dir === 'action') return;
        if (!tGame.running) return;
        if (dir === 'up')   tKeys.ArrowUp = pressed;
        if (dir === 'down') tKeys.ArrowDown = pressed;
    }
    
    // 🐦 FLAPPY
    else if (document.getElementById('flappyGameView')?.classList.contains('active')) {
        if (!pressed || dir !== 'action') return;
        if (fGame.running) fJump();
    }
}

// ============================================
// 👆 SWIPE
// ============================================
function setupSwipeGestures() {
    let startX = 0, startY = 0, startTime = 0;
    
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        const dt = Date.now() - startTime;
        
        if (dt > 500) return;
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
        
        let dir;
        if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx > 0 ? 'right' : 'left';
        } else {
            dir = dy > 0 ? 'down' : 'up';
        }
        
        handleTouchAction(dir, true);
        setTimeout(() => handleTouchAction(dir, false), 50);
    }, { passive: true });
}

// ============================================
// 🚀 INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    createTouchControls();
});