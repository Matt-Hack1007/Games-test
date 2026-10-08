// ============================================
// 🏅 SYSTÈME D'ACHIEVEMENTS
// ============================================

const ACHIEVEMENTS = {
    // ===== GÉNÉRAUX =====
    first_game: {
        id: 'first_game',
        name: 'PREMIER PAS',
        desc: 'Joue à ton premier jeu',
        icon: '🎮',
        xp: 10,
        category: 'general'
    },
    play_all_games: {
        id: 'play_all_games',
        name: 'EXPLORATEUR',
        desc: 'Joue à tous les 8 jeux au moins une fois',
        icon: '🗺️',
        xp: 100,
        category: 'general'
    },
    level_5: {
        id: 'level_5',
        name: 'APPRENTI',
        desc: 'Atteins le niveau 5',
        icon: '⭐',
        xp: 50,
        category: 'general'
    },
    level_10: {
        id: 'level_10',
        name: 'VÉTÉRAN',
        desc: 'Atteins le niveau 10',
        icon: '🌟',
        xp: 100,
        category: 'general'
    },
    
    // ===== ASTEROIDS =====
    asteroids_1000: {
        id: 'asteroids_1000',
        name: 'ROCK BUSTER',
        desc: 'Score de 1000+ à Asteroïds',
        icon: '☄️',
        xp: 20,
        category: 'asteroids'
    },
    asteroids_5000: {
        id: 'asteroids_5000',
        name: 'DESTRUCTEUR',
        desc: 'Score de 5000+ à Asteroïds',
        icon: '💥',
        xp: 50,
        category: 'asteroids'
    },
    asteroids_level3: {
        id: 'asteroids_level3',
        name: 'EXPLORATEUR SPATIAL',
        desc: 'Atteins le niveau 3 à Asteroïds',
        icon: '🚀',
        xp: 30,
        category: 'asteroids'
    },
    
    // ===== PADDLE =====
    paddle_1000: {
        id: 'paddle_1000',
        name: 'CASSEUR',
        desc: 'Score de 1000+ à Paddle',
        icon: '🧱',
        xp: 20,
        category: 'paddle'
    },
    paddle_all_bonus: {
        id: 'paddle_all_bonus',
        name: 'COLLECTIONNEUR',
        desc: 'Attrape les 4 types de bonus dans une partie',
        icon: '🎁',
        xp: 40,
        category: 'paddle'
    },
    paddle_perfect: {
        id: 'paddle_perfect',
        name: 'SANS FAUTE',
        desc: 'Termine un niveau sans perdre de vie',
        icon: '✨',
        xp: 50,
        category: 'paddle'
    },
    
    // ===== TENNIS =====
    tennis_win: {
        id: 'tennis_win',
        name: 'PREMIÈRE VICTOIRE',
        desc: 'Gagne un match de Tennis',
        icon: '🎾',
        xp: 20,
        category: 'tennis'
    },
    tennis_hard_win: {
        id: 'tennis_hard_win',
        name: 'CHAMPION',
        desc: 'Gagne en difficulté Difficile',
        icon: '🏆',
        xp: 60,
        category: 'tennis'
    },
    tennis_perfect: {
        id: 'tennis_perfect',
        name: 'SANS RÉPONSE',
        desc: 'Gagne 5-0 sans encaisser de point',
        icon: '💯',
        xp: 80,
        category: 'tennis'
    },
    
    // ===== INVADERS =====
    invaders_1000: {
        id: 'invaders_1000',
        name: 'DÉFENSEUR',
        desc: 'Score de 1000+ à Invaders',
        icon: '👾',
        xp: 20,
        category: 'invaders'
    },
    invaders_ufo: {
        id: 'invaders_ufo',
        name: 'CHASSEUR D\'OVNI',
        desc: 'Détruis un OVNI',
        icon: '🛸',
        xp: 30,
        category: 'invaders'
    },
    invaders_wave5: {
        id: 'invaders_wave5',
        name: 'RÉSISTANT',
        desc: 'Atteins la vague 5',
        icon: '🌊',
        xp: 40,
        category: 'invaders'
    },
    
    // ===== SNAKE =====
    snake_100: {
        id: 'snake_100',
        name: 'SERPENTEAU',
        desc: 'Score de 100+ à Snake',
        icon: '🐍',
        xp: 20,
        category: 'snake'
    },
    snake_500: {
        id: 'snake_500',
        name: 'ANACONDA',
        desc: 'Score de 500+ à Snake',
        icon: '🐲',
        xp: 50,
        category: 'snake'
    },
    snake_length20: {
        id: 'snake_length20',
        name: 'LONG SERPENT',
        desc: 'Atteins une longueur de 20',
        icon: '📏',
        xp: 40,
        category: 'snake'
    },
    
    // ===== TETRIS =====
    tetris_1line: {
        id: 'tetris_1line',
        name: 'PREMIÈRE LIGNE',
        desc: 'Fais ta première ligne',
        icon: '🧱',
        xp: 10,
        category: 'tetris'
    },
    tetris_4lines: {
        id: 'tetris_4lines',
        name: 'TETRIS !',
        desc: 'Fais un Tetris (4 lignes en une fois)',
        icon: '💎',
        xp: 50,
        category: 'tetris'
    },
    tetris_10lines: {
        id: 'tetris_10lines',
        name: 'EMPILEUR',
        desc: 'Fais 10 lignes en une partie',
        icon: '🏗️',
        xp: 30,
        category: 'tetris'
    },
    tetris_1000: {
        id: 'tetris_1000',
        name: 'MAÎTRE DU TETRIS',
        desc: 'Score de 1000+ à Tetris',
        icon: '👑',
        xp: 40,
        category: 'tetris'
    },
    
    // ===== FLAPPY =====
    flappy_10: {
        id: 'flappy_10',
        name: 'APPRENTI OISEAU',
        desc: 'Passe 10 tuyaux',
        icon: '🐦',
        xp: 20,
        category: 'flappy'
    },
    flappy_30: {
        id: 'flappy_30',
        name: 'AIGLE',
        desc: 'Passe 30 tuyaux',
        icon: '🦅',
        xp: 50,
        category: 'flappy'
    },
    flappy_50: {
        id: 'flappy_50',
        name: 'PHÉNIX',
        desc: 'Passe 50 tuyaux',
        icon: '🔥',
        xp: 100,
        category: 'flappy'
    },
    
    // ===== PAC-MAN =====
    pacman_1000: {
        id: 'pacman_1000',
        name: 'GOMME GOURMAND',
        desc: 'Score de 1000+ à Pac-Man',
        icon: '🟡',
        xp: 20,
        category: 'pacman'
    },
    pacman_ghost: {
        id: 'pacman_ghost',
        name: 'CHASSEUR DE FANTÔMES',
        desc: 'Mange un fantôme',
        icon: '👻',
        xp: 20,
        category: 'pacman'
    },
    pacman_4ghosts: {
        id: 'pacman_4ghosts',
        name: 'EXORCISTE',
        desc: 'Mange les 4 fantômes en une super gomme',
        icon: '🔮',
        xp: 80,
        category: 'pacman'
    },
    pacman_all_dots: {
        id: 'pacman_all_dots',
        name: 'NETTOYEUR',
        desc: 'Mange toutes les gommes d\'un niveau',
        icon: '🧹',
        xp: 60,
        category: 'pacman'
    },
    
    // ===== SECRETS =====
    night_owl: {
        id: 'night_owl',
        name: 'OISEAU DE NUIT',
        desc: 'Joue après 23h',
        icon: '🌙',
        xp: 20,
        category: 'secret'
    },
    early_bird: {
        id: 'early_bird',
        name: 'LÈVE-TÔT',
        desc: 'Joue avant 7h',
        icon: '🌅',
        xp: 20,
        category: 'secret'
    },
    marathon: {
        id: 'marathon',
        name: 'MARATHON',
        desc: 'Joue 30 minutes en une session',
        icon: '⏱️',
        xp: 50,
        category: 'secret'
    }
};

// ============================================
// 🔧 GESTION
// ============================================
function getUnlockedAchievements() {
    return storageRead(STORAGE_KEYS.ACHIEVEMENTS, {});
}

function isAchievementUnlocked(achievementId) {
    const unlocked = getUnlockedAchievements();
    return unlocked[achievementId] === true;
}

function unlockAchievement(achievementId) {
    if (isAchievementUnlocked(achievementId)) return false;
    
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) {
        console.warn('Achievement inconnu:', achievementId);
        return false;
    }
    
    const unlocked = getUnlockedAchievements();
    unlocked[achievementId] = true;
    storageWrite(STORAGE_KEYS.ACHIEVEMENTS, unlocked);
    
    const leveledUp = addXP(achievement.xp);
    
    showAchievementNotification(achievement, leveledUp);
    
    if (typeof playRecordFanfare === 'function') {
        playRecordFanfare();
    }
    
    return true;
}

function getAchievementsByCategory(category) {
    return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
}

function getAchievementProgress() {
    const unlocked = getUnlockedAchievements();
    const total = Object.keys(ACHIEVEMENTS).length;
    const done = Object.keys(unlocked).filter(k => unlocked[k]).length;
    return { done, total, percent: Math.round(done / total * 100) };
}

// ============================================
// 🎉 NOTIFICATION
// ============================================
function showAchievementNotification(achievement, leveledUp = false) {
    const existing = document.getElementById('achievementNotification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'achievementNotification';
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
            <div class="achievement-label">🏅 SUCCÈS DÉBLOQUÉ !</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
            <div class="achievement-xp">+${achievement.xp} XP</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
    
    if (leveledUp) {
        setTimeout(() => {
            const profile = getProfile();
            const lvlNotification = document.createElement('div');
            lvlNotification.className = 'achievement-notification level-up';
            lvlNotification.innerHTML = `
                <div class="achievement-icon">⭐</div>
                <div class="achievement-content">
                    <div class="achievement-label">🎉 NIVEAU SUPÉRIEUR !</div>
                    <div class="achievement-name">NIVEAU ${profile.level}</div>
                    <div class="achievement-desc">Continue comme ça !</div>
                </div>
            `;
            document.body.appendChild(lvlNotification);
            setTimeout(() => lvlNotification.classList.add('show'), 100);
            setTimeout(() => {
                lvlNotification.classList.remove('show');
                setTimeout(() => lvlNotification.remove(), 500);
            }, 3000);
        }, 1000);
    }
}

// ============================================
// 🎯 TRIGGERS
// ============================================
function checkTimeBasedAchievements() {
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 2) unlockAchievement('night_owl');
    if (hour >= 5 && hour < 7) unlockAchievement('early_bird');
}

function checkGamePlayedAchievements() {
    unlockAchievement('first_game');
    
    const stats = getStats();
    const gamesPlayed = stats.gamesPlayed || {};
    const allGames = ['asteroids', 'paddle', 'tennis', 'invaders', 'snake', 'tetris', 'flappy', 'pacman'];
    const playedAll = allGames.every(g => gamesPlayed[g] > 0);
    if (playedAll) unlockAchievement('play_all_games');
    
    const profile = getProfile();
    if (profile.level >= 5) unlockAchievement('level_5');
    if (profile.level >= 10) unlockAchievement('level_10');
}

console.log('🏅 Système d\'achievements chargé (' + Object.keys(ACHIEVEMENTS).length + ' succès)');