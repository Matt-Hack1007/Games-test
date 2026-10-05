// ============================================
// 🏆 SYSTÈME DE RECORDS
// ============================================
const RECORDS_KEY = 'arcade_io_records_v6';

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

function loadRecords() {
    try {
        const data = localStorage.getItem(RECORDS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) { return {}; }
}

function saveRecords(records) {
    try { localStorage.setItem(RECORDS_KEY, JSON.stringify(records)); } catch (e) {}
}

function getBestScore(gameId) {
    const records = loadRecords();
    return records[gameId] || 0;
}

function updateRecord(gameId, score) {
    if (score <= 0) return false;
    const records = loadRecords();
    const current = records[gameId] || 0;
    if (score > current) {
        records[gameId] = score;
        saveRecords(records);
        return true;
    }
    return false;
}

function showNewRecordPopup(score) {
    const popup = document.getElementById('newRecordPopup');
    if (!popup) return;
    document.getElementById('newRecordScore').textContent = score + ' POINTS';
    popup.classList.remove('active');
    void popup.offsetWidth;
    popup.classList.add('active');
    playRecordFanfare();
    setTimeout(() => popup.classList.remove('active'), 2200);
}

function showRecords() {
    const records = loadRecords();
    const list = document.getElementById('recordsList');
    if (!list) return;
    list.innerHTML = '';
    Object.keys(GAME_INFO).forEach(gameId => {
        const info = GAME_INFO[gameId];
        const score = records[gameId] || 0;
        const item = document.createElement('div');
        item.className = 'record-item';
        item.innerHTML = `
            <div class="record-icon">${info.icon}</div>
            <div class="record-name">${info.name}</div>
            ${score > 0 
                ? `<div class="record-score">${score.toString().padStart(6, '0')}</div>` 
                : `<div class="record-empty">AUCUN</div>`}
        `;
        list.appendChild(item);
    });
    showView('recordsView');
}

function resetRecords() {
    if (confirm('🗑 EFFACER TOUS LES RECORDS ?')) {
        saveRecords({});
        playBeep(300, 0.2, 'sawtooth', 0.15);
        showRecords();
    }
}

// ============================================
// ⚙ PARAMÈTRES
// ============================================
function openSettings() { 
    playBeep(600, 0.05);
    document.getElementById('settingsModal').classList.add('active'); 
}

function closeSettings() { 
    playBeep(400, 0.05);
    document.getElementById('settingsModal').classList.remove('active'); 
}

function toggleBtn(btn) {
    btn.classList.toggle('off');
    btn.textContent = btn.classList.contains('off') ? 'OFF' : 'ON';
    const label = btn.previousElementSibling.textContent;
    if (label === 'SON') audioEnabled = !btn.classList.contains('off');
    else if (label === 'MUSIQUE') musicEnabled = !btn.classList.contains('off');
    playBeep(700, 0.05);
}

function toggleFullscreen(btn) {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        btn.textContent = 'ON';
        btn.classList.remove('off');
    } else {
        document.exitFullscreen();
        btn.textContent = 'OFF';
        btn.classList.add('off');
    }
}

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
            setVolume(this.value);
        });
    }
});
