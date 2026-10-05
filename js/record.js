// ============================================
// 🏆 SYSTÈME DE RECORDS + PARAMÈTRES
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

// ============================================
// 💾 CHARGEMENT / SAUVEGARDE
// ============================================
function loadRecords() {
    try {
        const data = localStorage.getItem(RECORDS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function saveRecords(records) {
    try {
        localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (e) {
        console.warn('Impossible de sauvegarder les records');
    }
}

// ============================================
// 🎯 API RECORDS
// ============================================
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

// ============================================
// 🎉 POPUP NOUVEAU RECORD
// ============================================
function showNewRecordPopup(score) {
    const popup = document.getElementById('newRecordPopup');
    const scoreEl = document.getElementById('newRecordScore');
    if (!popup || !scoreEl) return;
    
    scoreEl.textContent = score + ' POINTS';
    popup.classList.remove('active');
    void popup.offsetWidth; // Force le reflow
    popup.classList.add('active');
    
    playRecordFanfare();
    setTimeout(() => popup.classList.remove('active'), 2200);
}

// ============================================
// 📋 ÉCRAN DES RECORDS
// ============================================
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
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('active');
}

function closeSettings() {
    playBeep(400, 0.05);
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.remove('active');
}

function toggleBtn(btn) {
    btn.classList.toggle('off');
    btn.textContent = btn.classList.contains('off') ? 'OFF' : 'ON';
    
    const label = btn.previousElementSibling.textContent;
    if (label === 'SON') {
        audioEnabled = !btn.classList.contains('off');
    } else if (label === 'MUSIQUE') {
        musicEnabled = !btn.classList.contains('off');
    }
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

// ============================================
// 🎬 INITIALISATION (au chargement de la page)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Fermer la modale en cliquant en dehors
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeSettings();
        });
    }
    
    // Slider de volume
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function(e) {
            setVolume(this.value);
        });
    }
    
    // Fermer avec Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeSettings();
        }
    });
});
