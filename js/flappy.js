// ============================================
// 🐦 FLAPPY
// ============================================
let fCanvas, fCtx, fW, fH;
let fSettings, fGame, fKeys, fBird;
let fPipes = [], fParticles = [];
let fGroundOffset = 0;
let fGameLoopId = null;

const flappyDiffSettings = {
    easy:   { gravity: 0.4,  jumpForce: -7, pipeGap: 240, pipeSpacing: 480, pipeSpeed: 3 },
    normal: { gravity: 0.55, jumpForce: -8, pipeGap: 200, pipeSpacing: 400, pipeSpeed: 4 },
    hard:   { gravity: 0.7,  jumpForce: -9, pipeGap: 170, pipeSpacing: 340, pipeSpeed: 5 }
};

function initFlappy() {
    fCanvas = document.getElementById('flappyCanvas');
    if (!fCanvas) return;
    fCtx = fCanvas.getContext('2d');
    
    fSettings = flappyDiffSettings.normal;
    fGame = { score: 0, level: 1, best: 0, running: false, gameOver: false };
    fKeys = { Space: false };
    fBird = { x: 0, y: 0, vy: 0, width: 34, height: 24, rotation: 0 };
    fPipes = []; fParticles = [];
    fGroundOffset = 0;
    
    fResize();
}

function fResize() {
    if (!fCanvas) return;
    fW = fCanvas.width = window.innerWidth;
    fH = fCanvas.height = window.innerHeight;
}

function fInit() {
    fResize();
    fGame.score = 0;
    fGame.level = 1;
    fGame.gameOver = false;
    fGame.best = getBestScore('flappy');
    fBird.x = fW * 0.25;
    fBird.y = fH / 2;
    fBird.vy = 0;
    fBird.rotation = 0;
    fPipes = [];
    fParticles = [];
    fGroundOffset = 0;
    fSpawnPipe(fW);
    fSpawnPipe(fW + fSettings.pipeSpacing);
    fUpdateHUD();
}

function fSpawnPipe(x) {
    const minTop = 60;
    const maxTop = fH - fSettings.pipeGap - 100;
    const topHeight = minTop + Math.random() * (maxTop - minTop);
    fPipes.push({
        x: x,
        topHeight: topHeight,
        bottomY: topHeight + fSettings.pipeGap,
        width: 70,
        passed: false
    });
}

function fUpdateHUD() {
    document.getElementById('flappyScore').textContent = fGame.score;
    document.getElementById('flappyLevel').textContent = fGame.level;
    document.getElementById('flappyLives').textContent = fGame.best;
}

function startFlappyGame() {
    fSettings = flappyDiffSettings[difficulties.flappy];
    showView('flappyGameView');
    document.getElementById('flappyGameView').classList.add('active');
    fGame.running = false; fGame.gameOver = false;
    document.getElementById('flappyStartMsg').classList.add('active');
    document.getElementById('flappyGameOver').classList.remove('active');
    fResize(); fInit();
    if (fGameLoopId) cancelAnimationFrame(fGameLoopId);
    fRenderLoop();
}

function fStartGame() {
    document.getElementById('flappyStartMsg').classList.remove('active');
    fInit();
    fGame.running = true;
    fJump();
}

function quitToFlappyMenu() {
    fGame.running = false; fGame.gameOver = false;
    if (fGameLoopId) cancelAnimationFrame(fGameLoopId);
    fGameLoopId = null;
    document.getElementById('flappyStartMsg').classList.remove('active');
    document.getElementById('flappyGameOver').classList.remove('active');
    document.getElementById('flappyGameView').classList.remove('active');
    showView('flappyView');
}

function fJump() {
    if (!fGame.running) return;
    fBird.vy = fSettings.jumpForce;
    playBeep(880, 0.05, 'square', 0.08);
    for (let i = 0; i < 4; i++) {
        fParticles.push({
            x: fBird.x + fBird.width / 2,
            y: fBird.y + fBird.height,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3,
            life: 20, maxLife: 20,
            color: Math.random() < 0.5 ? '#ffdd00' : '#ff8800'
        });
    }
}

function fUpdate() {
    if (!fGame.running) {
        fGroundOffset = (fGroundOffset + 2) % 40;
        return;
    }
    fBird.vy += fSettings.gravity;
    fBird.y += fBird.vy;
    fBird.rotation = Math.max(-0.5, Math.min(Math.PI / 2, fBird.vy * 0.08));
    fGroundOffset = (fGroundOffset + fSettings.pipeSpeed) % 40;
    if (fBird.y + fBird.height >= fH - 60) {
        fBird.y = fH - 60 - fBird.height;
        fEndGame();
        return;
    }
    if (fBird.y < 0) { fBird.y = 0; fBird.vy = 0; }
    for (let i = fPipes.length - 1; i >= 0; i--) {
        const p = fPipes[i];
        p.x -= fSettings.pipeSpeed;
        if (fBird.x + fBird.width > p.x && fBird.x < p.x + p.width) {
            if (fBird.y < p.topHeight || fBird.y + fBird.height > p.bottomY) {
                fEndGame();
                return;
            }
        }
        if (!p.passed && p.x + p.width < fBird.x) {
            p.passed = true;
            fGame.score++;
            if (fGame.score > fGame.best) fGame.best = fGame.score;
            if (fGame.score % 10 === 0) {
                fGame.level++;
                fSettings.pipeSpeed += 0.3;
            }
            fUpdateHUD();
            playPickup();
        }
        if (p.x + p.width < -50) fPipes.splice(i, 1);
    }
    const lastPipe = fPipes[fPipes.length - 1];
    if (lastPipe && lastPipe.x < fW - fSettings.pipeSpacing) fSpawnPipe(fW + 20);
    for (let i = fParticles.length - 1; i >= 0; i--) {
        const p = fParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.2;
        p.life--;
        if (p.life <= 0) fParticles.splice(i, 1);
    }
}

function fEndGame() {
    fGame.running = false;
    fGame.gameOver = true;
    playExplosion();
    setTimeout(playGameOver, 300);
    const isNewRecord = updateRecord('flappy', fGame.score);
    document.getElementById('flappyFinalScore').textContent = fGame.score;
    document.getElementById('flappyBestScore').textContent = '🏆 RECORD : ' + getBestScore('flappy');
    document.getElementById('flappyGameOver').classList.add('active');
    if (isNewRecord) setTimeout(() => showNewRecordPopup(fGame.score), 1200);
}

function fDraw() {
    if (!fCtx) return;
    const grad = fCtx.createLinearGradient(0, 0, 0, fH);
    grad.addColorStop(0, '#0a0a1e');
    grad.addColorStop(1, '#1a1a3e');
    fCtx.fillStyle = grad;
    fCtx.fillRect(0, 0, fW, fH);
    fCtx.strokeStyle = 'rgba(0, 255, 255, 0.06)';
    fCtx.lineWidth = 1;
    for (let x = 0; x < fW; x += 40) { fCtx.beginPath(); fCtx.moveTo(x, 0); fCtx.lineTo(x, fH); fCtx.stroke(); }
    for (let y = 0; y < fH; y += 40) { fCtx.beginPath(); fCtx.moveTo(0, y); fCtx.lineTo(fW, y); fCtx.stroke(); }
    for (const p of fPipes) {
        fCtx.save();
        fCtx.shadowColor = '#00ff88'; fCtx.shadowBlur = 12;
        fCtx.fillStyle = '#00ff88';
        fCtx.fillRect(p.x, 0, p.width, p.topHeight);
        fCtx.fillRect(p.x, p.bottomY, p.width, fH - p.bottomY);
        fCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        fCtx.fillRect(p.x + p.width - 8, 0, 8, p.topHeight);
        fCtx.fillRect(p.x + p.width - 8, p.bottomY, 8, fH - p.bottomY);
        fCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        fCtx.fillRect(p.x, 0, 6, p.topHeight);
        fCtx.fillRect(p.x, p.bottomY, 6, fH - p.bottomY);
        fCtx.restore();
    }
    fCtx.save();
    fCtx.fillStyle = '#1a1a3e';
    fCtx.fillRect(0, fH - 60, fW, 60);
    fCtx.strokeStyle = '#00ff88';
    fCtx.lineWidth = 3;
    fCtx.shadowColor = '#00ff88'; fCtx.shadowBlur = 10;
    fCtx.beginPath();
    fCtx.moveTo(0, fH - 60);
    fCtx.lineTo(fW, fH - 60);
    fCtx.stroke();
    fCtx.restore();
    for (const p of fParticles) {
        const alpha = p.life / p.maxLife;
        fCtx.save();
        fCtx.globalAlpha = alpha;
        fCtx.shadowColor = p.color; fCtx.shadowBlur = 8;
        fCtx.fillStyle = p.color;
        fCtx.fillRect(p.x - 2, p.y - 2, 4, 4);
        fCtx.restore();
    }
    if (!fGame.running && !fGame.gameOver) return;
    fCtx.save();
    fCtx.translate(fBird.x + fBird.width / 2, fBird.y + fBird.height / 2);
    fCtx.rotate(fBird.rotation);
    fCtx.shadowColor = '#ffdd00'; fCtx.shadowBlur = 15;
    fCtx.fillStyle = '#ffdd00';
    fCtx.fillRect(-fBird.width / 2, -fBird.height / 2, fBird.width, fBird.height);
    fCtx.fillStyle = '#0a0a1e';
    fCtx.fillRect(fBird.width / 2 - 10, -fBird.height / 2 + 4, 5, 5);
    fCtx.fillStyle = '#ffaa00';
    const wingOffset = Math.sin(performance.now() / 100) * 3;
    fCtx.fillRect(-fBird.width / 2 + 4, -2 + wingOffset, 14, 6);
    fCtx.restore();
}

function fRenderLoop() {
    fUpdate();
    fDraw();
    fGameLoopId = requestAnimationFrame(fRenderLoop);
}