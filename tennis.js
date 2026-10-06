// ============================================
// 🎾 TENNIS (avec compte à rebours)
// ============================================
var tCanvas, tCtx, tW, tH;
var tSettings, tGame, tKeys, tPaddle1, tPaddle2, tBall;
var tParticles = [];
var tGameLoopId = null;

const tennisDiffSettings = {
    easy:   { ballSpeed: 6, paddleHeight: 130, paddleSpeed: 9,  aiReactivity: 0.035, aiMaxSpeedMult: 0.55, targetScore: 3 },
    normal: { ballSpeed: 8, paddleHeight: 100, paddleSpeed: 11, aiReactivity: 0.050, aiMaxSpeedMult: 0.65, targetScore: 5 },
    hard:   { ballSpeed: 10, paddleHeight: 80,  paddleSpeed: 13, aiReactivity: 0.075, aiMaxSpeedMult: 0.75, targetScore: 7 }
};

function initTennis() {
    tCanvas = document.getElementById('tennisCanvas');
    if (!tCanvas) {
        console.error('❌ Canvas Tennis introuvable !');
        return;
    }
    tCtx = tCanvas.getContext('2d');
    
    tSettings = tennisDiffSettings.normal;
    tGame = { score1: 0, score2: 0, running: false, gameOver: false, serving: true, server: 1 };
    tKeys = { q: false, a: false, ArrowUp: false, ArrowDown: false, p: false, l: false, Space: false };
    tPaddle1 = { x: 0, y: 0, width: 14, height: 100, speed: 11 };
    tPaddle2 = { x: 0, y: 0, width: 14, height: 100, speed: 11 };
    tBall = { x: 0, y: 0, vx: 0, vy: 0, radius: 8, speed: 8 };
    tParticles = [];
    
    tResize();
    console.log('✅ Tennis initialisé');
}

function tResize() {
    if (!tCanvas) return;
    tW = tCanvas.width = window.innerWidth;
    tH = tCanvas.height = window.innerHeight;
}

function tInit() {
    tResize();
    tGame.score1 = 0; tGame.score2 = 0;
    tGame.gameOver = false; tGame.serving = true; tGame.server = 1;
    tPaddle1.width = 14; tPaddle1.height = tSettings.paddleHeight;
    tPaddle1.x = 30; tPaddle1.y = tH / 2 - tPaddle1.height / 2;
    tPaddle1.speed = tSettings.paddleSpeed;
    tPaddle2.width = 14; tPaddle2.height = tSettings.paddleHeight;
    tPaddle2.x = tW - 30 - tPaddle2.width; tPaddle2.y = tH / 2 - tPaddle2.height / 2;
    tPaddle2.speed = tSettings.paddleSpeed;
    tBall.speed = tSettings.ballSpeed;
    tResetBall();
    tParticles = [];
    tUpdateHUD();
}

function tResetBall() {
    tBall.x = tW / 2; tBall.y = tH / 2;
    tBall.vx = 0; tBall.vy = 0; tGame.serving = true;
}

function tLaunchBall() {
    if (!tGame.serving) return;
    playShoot();
    tGame.serving = false;
    const dir = tGame.server === 1 ? 1 : -1;
    const angle = (Math.random() - 0.5) * 0.8;
    tBall.vx = Math.cos(angle) * tBall.speed * dir;
    tBall.vy = Math.sin(angle) * tBall.speed;
}

function tUpdateHUD() {
    const s1 = document.getElementById('tennisScore1');
    const s2 = document.getElementById('tennisScore2');
    const target = document.getElementById('tennisTarget');
    if (s1) s1.textContent = tGame.score1;
    if (s2) s2.textContent = tGame.score2;
    if (target) target.textContent = tSettings.targetScore;
}

function startTennisGame() {
    tSettings = tennisDiffSettings[difficulties.tennis];
    showView('tennisGameView');
    const gv = document.getElementById('tennisGameView');
    if (gv) gv.classList.add('active');
    tGame.running = false;
    tGame.gameOver = false;
    const go = document.getElementById('tennisGameOver');
    if (go) go.classList.remove('active');
    
    const controls = document.getElementById('tennisControls');
    if (controls) {
        if (tennisMode === '2p') {
            controls.innerHTML = `<span>Q/A</span> ou <span>↑/↓</span> J1 | <span>P/L</span> J2 | <span>ÉCHAP</span> QUITTER`;
        } else {
            controls.innerHTML = `<span>↑/↓</span> ou <span>Q/A</span> DÉPLACER | <span>ÉCHAP</span> QUITTER`;
        }
    }
    
    tResize();
    tInit();
    if (tGameLoopId) cancelAnimationFrame(tGameLoopId);
    tRenderLoop();
    
    showCountdown('tennis', () => {
        tLaunchBall();
        tGame.running = true;
    });
}

function quitToTennisMenu() {
    tGame.running = false;
    tGame.gameOver = false;
    if (tGameLoopId) cancelAnimationFrame(tGameLoopId);
    tGameLoopId = null;
    const go = document.getElementById('tennisGameOver');
    if (go) go.classList.remove('active');
    const gv = document.getElementById('tennisGameView');
    if (gv) gv.classList.remove('active');
    showView('tennisView');
}

function tUpdate() {
    if (!tGame.running) {
        if (tGame.serving) { tBall.x = tW / 2; tBall.y = tH / 2; }
        tMovePaddle1();
        if (tennisMode === '2p') tMovePaddle2(); else tMoveAI();
        return;
    }
    tMovePaddle1();
    if (tennisMode === '2p') tMovePaddle2(); else tMoveAI();
    
    const speed = Math.hypot(tBall.vx, tBall.vy);
    const steps = Math.max(1, Math.ceil(speed / 4));
    const stepX = tBall.vx / steps;
    const stepY = tBall.vy / steps;
    
    for (let s = 0; s < steps; s++) {
        tBall.x += stepX;
        tBall.y += stepY;
        if (tBall.y - tBall.radius < 0) { tBall.y = tBall.radius; tBall.vy = -tBall.vy; break; }
        if (tBall.y + tBall.radius > tH) { tBall.y = tH - tBall.radius; tBall.vy = -tBall.vy; break; }
        if (tBall.vx < 0 && tBall.x - tBall.radius <= tPaddle1.x + tPaddle1.width && tBall.x - tBall.radius >= tPaddle1.x - 20 && tBall.y + tBall.radius > tPaddle1.y && tBall.y - tBall.radius < tPaddle1.y + tPaddle1.height) {
            playBeep(660, 0.05);
            tBall.x = tPaddle1.x + tPaddle1.width + tBall.radius;
            const center = tPaddle1.y + tPaddle1.height / 2;
            const rel = (tBall.y - center) / (tPaddle1.height / 2);
            const clamped = Math.max(-0.95, Math.min(0.95, rel));
            const angle = clamped * (Math.PI / 3.5);
            const spd = Math.hypot(tBall.vx, tBall.vy) * 1.03;
            tBall.vx = Math.cos(angle) * spd;
            tBall.vy = Math.sin(angle) * spd;
            break;
        }
        if (tBall.vx > 0 && tBall.x + tBall.radius >= tPaddle2.x && tBall.x + tBall.radius <= tPaddle2.x + tPaddle2.width + 20 && tBall.y + tBall.radius > tPaddle2.y && tBall.y - tBall.radius < tPaddle2.y + tPaddle2.height) {
            playBeep(660, 0.05);
            tBall.x = tPaddle2.x - tBall.radius;
            const center = tPaddle2.y + tPaddle2.height / 2;
            const rel = (tBall.y - center) / (tPaddle2.height / 2);
            const clamped = Math.max(-0.95, Math.min(0.95, rel));
            const angle = clamped * (Math.PI / 3.5);
            const spd = Math.hypot(tBall.vx, tBall.vy) * 1.03;
            tBall.vx = -Math.cos(angle) * spd;
            tBall.vy = Math.sin(angle) * spd;
            break;
        }
    }
    if (tBall.x + tBall.radius < 0) tScorePoint(2);
    else if (tBall.x - tBall.radius > tW) tScorePoint(1);
    
    for (let i = tParticles.length - 1; i >= 0; i--) {
        const p = tParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96; p.life--;
        if (p.life <= 0) tParticles.splice(i, 1);
    }
}

function tMovePaddle1() {
    if (tKeys.q || tKeys.ArrowUp) tPaddle1.y -= tPaddle1.speed;
    if (tKeys.a || tKeys.ArrowDown) tPaddle1.y += tPaddle1.speed;
    if (tPaddle1.y < 0) tPaddle1.y = 0;
    if (tPaddle1.y + tPaddle1.height > tH) tPaddle1.y = tH - tPaddle1.height;
}

function tMovePaddle2() {
    if (tKeys.p) tPaddle2.y -= tPaddle2.speed;
    if (tKeys.l) tPaddle2.y += tPaddle2.speed;
    if (tPaddle2.y < 0) tPaddle2.y = 0;
    if (tPaddle2.y + tPaddle2.height > tH) tPaddle2.y = tH - tPaddle2.height;
}

function tMoveAI() {
    const targetY = tBall.y - tPaddle2.height / 2;
    const diff = targetY - tPaddle2.y;
    const errorMargin = (1 - tSettings.aiMaxSpeedMult) * 30;
    const error = (Math.random() - 0.5) * errorMargin;
    if (tBall.vx > 0) {
        tPaddle2.y += diff * tSettings.aiReactivity + error * 0.05;
    } else {
        const center = tH / 2 - tPaddle2.height / 2;
        tPaddle2.y += (center - tPaddle2.y) * 0.02;
    }
    const maxMove = tPaddle2.speed * tSettings.aiMaxSpeedMult;
    const move = tPaddle2.y - (tPaddle2._prevY || tPaddle2.y);
    if (Math.abs(move) > maxMove) tPaddle2.y = (tPaddle2._prevY || tPaddle2.y) + Math.sign(move) * maxMove;
    tPaddle2._prevY = tPaddle2.y;
    if (tPaddle2.y < 0) tPaddle2.y = 0;
    if (tPaddle2.y + tPaddle2.height > tH) tPaddle2.y = tH - tPaddle2.height;
}

function tScorePoint(player) {
    if (player === 1) tGame.score1++; else tGame.score2++;
    playPickup();
    tUpdateHUD();
    if (tGame.score1 >= tSettings.targetScore || tGame.score2 >= tSettings.targetScore) { tEndGame(); return; }
    tGame.server = player === 1 ? 2 : 1;
    tResetBall();
    tGame.running = false;
    
    setTimeout(() => {
        showCountdown('tennis', () => {
            tLaunchBall();
            tGame.running = true;
        });
    }, 500);
}

function tEndGame() {
    tGame.running = false;
    tGame.gameOver = true;
    playGameOver();
    
    const title = document.getElementById('tennisGameOverTitle');
    const winner = tGame.score1 >= tSettings.targetScore ? 1 : 2;
    if (title) {
        if (tennisMode === '2p') title.textContent = 'JOUEUR ' + winner + ' GAGNE !';
        else title.textContent = winner === 1 ? 'VICTOIRE !' : 'DÉFAITE...';
        if (winner === 1) title.classList.add('win');
        else title.classList.remove('win');
    }
    
    const isNewRecord = tennisMode === 'ai' && winner === 1 
        ? ((typeof updateRecord === 'function') ? updateRecord('tennis', (getBestScore('tennis') || 0) + 1) : false)
        : false;
    
    const fs = document.getElementById('tennisFinalScore');
    const bs = document.getElementById('tennisBestScore');
    const go = document.getElementById('tennisGameOver');
    if (fs) fs.textContent = tGame.score1 + ' - ' + tGame.score2;
    if (bs && typeof getBestScore === 'function') {
        bs.textContent = '🏆 VICTOIRES : ' + getBestScore('tennis');
    }
    if (go) go.classList.add('active');
    if (isNewRecord && typeof showNewRecordPopup === 'function') {
        setTimeout(() => showNewRecordPopup(getBestScore('tennis')), 800);
    }
}

function tDraw() {
    if (!tCtx) return;
    tCtx.fillStyle = '#0a0a1e';
    tCtx.fillRect(0, 0, tW, tH);
    tCtx.strokeStyle = 'rgba(0, 255, 255, 0.06)';
    tCtx.lineWidth = 1;
    for (let x = 0; x < tW; x += 40) { tCtx.beginPath(); tCtx.moveTo(x, 0); tCtx.lineTo(x, tH); tCtx.stroke(); }
    for (let y = 0; y < tH; y += 40) { tCtx.beginPath(); tCtx.moveTo(0, y); tCtx.lineTo(tW, y); tCtx.stroke(); }
    
    tCtx.save();
    tCtx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    tCtx.setLineDash([8, 8]);
    tCtx.beginPath(); tCtx.moveTo(tW / 2, 0); tCtx.lineTo(tW / 2, tH); tCtx.stroke();
    tCtx.restore();
    
    tCtx.save();
    tCtx.font = '48px "Press Start 2P"';
    tCtx.textAlign = 'center';
    tCtx.fillStyle = 'rgba(0, 255, 255, 0.15)';
    tCtx.shadowColor = '#00ffff'; tCtx.shadowBlur = 20;
    tCtx.fillText(tGame.score1, tW / 4, tH / 2 + 15);
    tCtx.fillStyle = 'rgba(255, 0, 255, 0.15)';
    tCtx.shadowColor = '#ff00ff';
    tCtx.fillText(tGame.score2, tW * 3 / 4, tH / 2 + 15);
    tCtx.restore();
    
    for (const p of tParticles) {
        const alpha = p.life / p.maxLife;
        tCtx.save();
        tCtx.globalAlpha = alpha;
        tCtx.shadowColor = p.color; tCtx.shadowBlur = 8;
        tCtx.fillStyle = p.color;
        const s = 2 + alpha * 2;
        tCtx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        tCtx.restore();
    }
    
    tCtx.save();
    tCtx.shadowColor = '#00ffff'; tCtx.shadowBlur = 15;
    tCtx.fillStyle = '#00ffff';
    tCtx.fillRect(tPaddle1.x, tPaddle1.y, tPaddle1.width, tPaddle1.height);
    tCtx.restore();
    
    tCtx.save();
    tCtx.shadowColor = '#ff00ff'; tCtx.shadowBlur = 15;
    tCtx.fillStyle = '#ff00ff';
    tCtx.fillRect(tPaddle2.x, tPaddle2.y, tPaddle2.width, tPaddle2.height);
    tCtx.restore();
    
    tCtx.save();
    tCtx.shadowColor = '#ffdd00'; tCtx.shadowBlur = 15;
    tCtx.fillStyle = '#ffdd00';
    tCtx.beginPath(); tCtx.arc(tBall.x, tBall.y, tBall.radius, 0, Math.PI * 2); tCtx.fill();
    tCtx.restore();
}

function tRenderLoop() {
    tUpdate();
    tDraw();
    tGameLoopId = requestAnimationFrame(tRenderLoop);
}