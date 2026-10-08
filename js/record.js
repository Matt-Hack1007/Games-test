// ============================================
// 🏆 RECORDS + PARAMÈTRES + STATS
// ============================================

const GAME_INFO = {
    asteroids: { icon: '☄',  name: 'ASTEROÏDS' },
    paddle:    { icon: '🏓', name: 'PADDLE' },
    tennis:    { icon: '🎾', name: 'TENNIS' },
    invaders:  { icon: '👾', name: 'INVADERS' },
    snake:     { icon: '🐍', name: 'SNAKE' },
    tetris:    { icon: '🧱', name: 'TETRIS' },
    flappy:    { icon: '🐦', name: 'FLAPPY' },
    pacman:    { icon: '🟡', name: 'PAC-MAN' }
};

// ============================================
// 🎉 POPUP NOUVEAU RECORD
// ============================================
function showNewRecordPopup(score, gameId, difficulty) {
    const popup = document.getElementById('newRecordPopup');
    const scoreEl = document.getElementById('newRecordScore');
    if (!popup || !scoreEl) return;
    
    const diffLabel = difficulty ? ` (${difficulty.toUpperCase()})` : '';
    scoreEl.textContent = score + ' POINTS' + diffLabel;
    popup.classList.remove('active');
    void popup.offsetWidth;
    popup.classList.add('active');
    
    if (typeof playRecordFanfare === 'function') playRecordFanfare();
    setTimeout(() => popup.classList.remove('active'), 2500);
}

// ============================================
// 📋 ÉCRAN DES RECORDS
// ============================================
function showRecords() {
    const records = getRecords();
    const list = document.getElementById('recordsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    Object.keys(GAME_INFO).forEach(gameId => {
        const info = GAME_INFO[gameId];
        const gameRecords = records[gameId] || {};
        
        let easy = 0, normal = 0, hard = 0;
        if (typeof gameRecords === 'object') {
            easy = gameRecords.easy || 0;
            normal = gameRecords.normal || 0;
            hard = gameRecords.hard || 0;
        } else {
            normal = gameRecords || 0;
        }
        
        const item = document.createElement('div');
        item.className = 'record-item record-item-multi';
        item.innerHTML = `
            <div class="record-icon">${info.icon}</div>
            <div class="record-name">${info.name}</div>
            <div class="record-difficulties">
                <div class="record-diff">
                    <span class="diff-label easy">FACILE</span>
                    <span class="diff-score">${easy > 0 ? easy.toString().padStart(6, '0') : '---'}</span>
                </div>
                <div class="record-diff">
                    <span class="diff-label normal">NORMAL</span>
                    <span class="diff-score">${normal > 0 ? normal.toString().padStart(6, '0') : '---'}</span>
                </div>
                <div class="record-diff">
                    <span class="diff-label hard">DIFFICILE</span>
                    <span class="diff-score">${hard > 0 ? hard.toString().padStart(6, '0') : '---'}</span>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
    
    showView('recordsView');
}

function resetRecords() {
    if (confirm('🗑 EFFACER TOUS LES RECORDS ?\n\nLes achievements et sauvegardes seront conservés.')) {
        saveRecords({});
        if (typeof playBeep === 'function') playBeep(300, 0.2, 'sawtooth', 0.15);
        showRecords();
    }
}

// ============================================
// 📊 ÉCRAN DES STATISTIQUES
// ============================================
function showStats() {
    const stats = getStats();
    const profile = getProfile();
    const container = document.getElementById('statsContainer');
    if (!container) return;
    
    const totalMinutes = Math.floor(stats.totalPlaytime / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    let playtimeStr = '';
    if (totalHours > 0) playtimeStr = `${totalHours}h ${remainingMinutes}min`;
    else if (totalMinutes > 0) playtimeStr = `${totalMinutes}min`;
    else playtimeStr = '0min';
    
    let firstPlayStr = 'Jamais';
    if (stats.firstPlayDate) {
        const d = new Date(stats.firstPlayDate);
        firstPlayStr = d.toLocaleDateString('fr-FR');
    }
    
    let gamesList = '';
    Object.keys(GAME_INFO).forEach(gameId => {
        const count = stats.gamesPlayed[gameId] || 0;
        const info = GAME_INFO[gameId];
        gamesList += `
            <div style="display:flex;justify-content:space-between;padding:0.5rem 0;font-size:0.6rem;color:#00ffff;">
                <span>${info.icon} ${info.name}</span>
                <span style="color:#ffdd00;">${count} parties</span>
            </div>
        `;
    });
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">👤</div>
            <div class="stat-content">
                <div class="stat-label">PROFIL</div>
                <div class="stat-value">${profile.name}</div>
                <div class="stat-sub">Niveau ${profile.level} • ${profile.xp % 1000}/1000 XP</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🎮</div>
            <div class="stat-content">
                <div class="stat-label">PARTIES JOUÉES</div>
                <div class="stat-value">${stats.totalGames}</div>
                <div class="stat-sub">Depuis le ${firstPlayStr}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
                <div class="stat-label">TEMPS DE JEU</div>
                <div class="stat-value">${playtimeStr}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
                <div class="stat-label">SCORE TOTAL CUMULÉ</div>
                <div class="stat-value">${stats.totalScore.toLocaleString('fr-FR')}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
                <div class="stat-label">PARTIES PAR JEU</div>
                <div style="margin-top:0.5rem;">
                    ${gamesList}
                </div>
            </div>
        </div>
    `;
    
    showView('statsView');
}

// ============================================
// ⚙ PARAMÈTRES
// ============================================
function openSettings() {
    if (typeof playBeep === 'function') playBeep(600, 0.05);
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('active');
    
    const settings = getSettings();
    if (settings.volume !== undefined) {
        const slider = document.getElementById('volumeSlider');
        if (slider) slider.value = settings.volume * 100;
        masterVolume = settings.volume;
    }
}

function closeSettings() {
    if (typeof playBeep === 'function') playBeep(400, 0.05);
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.remove('active');
    
    const settings = getSettings();
    settings.volume = masterVolume;
    settings.sound = audioEnabled;
    settings.music = musicEnabled;
    saveSettings(settings);
}

function toggleBtn(btn) {
    btn.classList.toggle('off');
    btn.textContent = btn.classList.contains('off') ? 'OFF' : 'ON';
    
    const label = btn.previousElementSibling.textContent;
    if (label === 'SON') audioEnabled = !btn.classList.contains('off');
    else if (label === 'MUSIQUE') musicEnabled = !btn.classList.contains('off');
    if (typeof playBeep === 'function') playBeep(700, 0.05);
}

function toggleFullscreen(btn) {
    if (!document.fullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        btn.textContent = 'ON';
        btn.classList.remove('off');
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        btn.textContent = 'OFF';
        btn.classList.add('off');
    }
}

function resetAllDataConfirm(btn) {
    if (resetAllData()) {
        if (typeof playBeep === 'function') playBeep(200, 0.4, 'sawtooth', 0.2);
        alert('✅ Données effacées !\nLa page va se recharger.');
        location.reload();
    }
}

// ============================================
// 🎬 INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeSettings();
        });
    }
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function(e) {
            if (typeof setVolume === 'function') setVolume(this.value);
        });
    }
});