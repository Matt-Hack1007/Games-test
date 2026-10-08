// ============================================
// 💾 SYSTÈME DE STOCKAGE CENTRALISÉ
// ============================================

const STORAGE_KEYS = {
    RECORDS: 'arcade_io_records_v7',
    SAVES: 'arcade_io_saves_v1',
    ACHIEVEMENTS: 'arcade_io_achievements_v1',
    STATS: 'arcade_io_stats_v1',
    SETTINGS: 'arcade_io_settings_v1',
    PROFILE: 'arcade_io_profile_v1'
};

// ============================================
// 🔧 FONCTIONS DE BASE
// ============================================
function storageRead(key, fallback = {}) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (e) {
        console.warn('Erreur lecture storage:', key, e);
        return fallback;
    }
}

function storageWrite(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.warn('Erreur écriture storage:', key, e);
        return false;
    }
}

function storageClear(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {}
}

// ============================================
// 🏆 RECORDS PAR JEU ET DIFFICULTÉ
// ============================================
function getRecords() {
    return storageRead(STORAGE_KEYS.RECORDS, {});
}

function saveRecords(records) {
    storageWrite(STORAGE_KEYS.RECORDS, records);
}

function getBestScore(gameId, difficulty = null) {
    const records = getRecords();
    const gameRecords = records[gameId];
    
    if (!gameRecords) return 0;
    
    if (typeof gameRecords === 'object') {
        if (difficulty) return gameRecords[difficulty] || 0;
        return Math.max(
            gameRecords.easy || 0,
            gameRecords.normal || 0,
            gameRecords.hard || 0
        );
    }
    
    return gameRecords || 0;
}

function updateRecord(gameId, score, difficulty = 'normal') {
    if (score <= 0) return false;
    
    const records = getRecords();
    
    if (!records[gameId] || typeof records[gameId] !== 'object') {
        records[gameId] = { easy: 0, normal: 0, hard: 0 };
    }
    
    const currentBest = records[gameId][difficulty] || 0;
    
    if (score > currentBest) {
        records[gameId][difficulty] = score;
        saveRecords(records);
        return true;
    }
    
    return false;
}

// ============================================
// 💾 SAUVEGARDE DE PROGRESSION
// ============================================
function saveGameState(gameId, state) {
    const saves = storageRead(STORAGE_KEYS.SAVES, {});
    saves[gameId] = {
        ...state,
        timestamp: Date.now(),
        version: 1
    };
    storageWrite(STORAGE_KEYS.SAVES, saves);
}

function loadGameState(gameId) {
    const saves = storageRead(STORAGE_KEYS.SAVES, {});
    const save = saves[gameId];
    
    if (!save) return null;
    
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (Date.now() - save.timestamp > ONE_DAY) {
        deleteGameState(gameId);
        return null;
    }
    
    return save;
}

function deleteGameState(gameId) {
    const saves = storageRead(STORAGE_KEYS.SAVES, {});
    delete saves[gameId];
    storageWrite(STORAGE_KEYS.SAVES, saves);
}

function hasGameState(gameId) {
    return loadGameState(gameId) !== null;
}

function getAllSaves() {
    return storageRead(STORAGE_KEYS.SAVES, {});
}

// ============================================
// 📊 STATISTIQUES
// ============================================
function getStats() {
    return storageRead(STORAGE_KEYS.STATS, {
        totalPlaytime: 0,
        totalGames: 0,
        gamesPlayed: {},
        totalScore: 0,
        firstPlayDate: null,
        lastPlayDate: null
    });
}

function saveStats(stats) {
    storageWrite(STORAGE_KEYS.STATS, stats);
}

function incrementStat(gameId, scoreDelta = 0, timeDelta = 0) {
    const stats = getStats();
    
    stats.totalGames++;
    stats.gamesPlayed[gameId] = (stats.gamesPlayed[gameId] || 0) + 1;
    stats.totalScore += scoreDelta;
    stats.totalPlaytime += timeDelta;
    stats.lastPlayDate = Date.now();
    
    if (!stats.firstPlayDate) {
        stats.firstPlayDate = Date.now();
    }
    
    saveStats(stats);
}

// ============================================
// 👤 PROFIL JOUEUR
// ============================================
function getProfile() {
    return storageRead(STORAGE_KEYS.PROFILE, {
        name: 'PLAYER',
        created: Date.now(),
        level: 1,
        xp: 0
    });
}

function saveProfile(profile) {
    storageWrite(STORAGE_KEYS.PROFILE, profile);
}

function addXP(amount) {
    const profile = getProfile();
    profile.xp += amount;
    
    const newLevel = Math.floor(profile.xp / 1000) + 1;
    const leveledUp = newLevel > profile.level;
    profile.level = newLevel;
    
    saveProfile(profile);
    return leveledUp;
}

// ============================================
// ⚙️ PARAMÈTRES
// ============================================
function getSettings() {
    return storageRead(STORAGE_KEYS.SETTINGS, {
        sound: true,
        music: true,
        volume: 0.3,
        theme: 'neon',
        hapticFeedback: true
    });
}

function saveSettings(settings) {
    storageWrite(STORAGE_KEYS.SETTINGS, settings);
}

// ============================================
// 🗑 RESET
// ============================================
function resetAllData() {
    if (!confirm('⚠️ EFFACER TOUTES LES DONNÉES ?\n\nRecords, succès, sauvegardes et statistiques seront supprimés.')) {
        return false;
    }
    Object.values(STORAGE_KEYS).forEach(key => storageClear(key));
    return true;
}

console.log('💾 Système de stockage chargé');