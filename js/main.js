// ============================================
// 🚀 INITIALISATION PRINCIPALE
// ============================================

// 1. Créer toutes les vues de jeu
createAllGameViews();

// 2. Initialiser chaque jeu
initAsteroids();
initPaddle();
initTennis();
initInvaders();
initSnake();
initTetris();
initFlappy();
initPacman();

// 3. Générer les étoiles
generateStars();

// 4. Charger les paramètres sauvegardés
const savedSettings = getSettings();
if (savedSettings.volume !== undefined) masterVolume = savedSettings.volume;
if (savedSettings.sound !== undefined) audioEnabled = savedSettings.sound;
if (savedSettings.music !== undefined) musicEnabled = savedSettings.music;

// 5. Vérifier les achievements de temps
setTimeout(() => {
    checkTimeBasedAchievements();
}, 1000);

// 6. Session pour l'achievement marathon
let sessionStartTime = Date.now();
setInterval(() => {
    const sessionMinutes = (Date.now() - sessionStartTime) / 1000 / 60;
    if (sessionMinutes >= 30) {
        unlockAchievement('marathon');
    }
}, 60000);

// 7. Mise à jour du profil
function updateProfileDisplay() {
    const profile = getProfile();
    const nameEl = document.getElementById('profileName');
    const levelEl = document.getElementById('profileLevel');
    const xpEl = document.getElementById('profileXP');
    
    if (nameEl) nameEl.textContent = profile.name;
    if (levelEl) levelEl.textContent = profile.level;
    if (xpEl) xpEl.textContent = profile.xp % 1000;
}

// 8. Classe "playing"
function updatePlayingClass() {
    const gameViews = [
        'asteroidsGameView', 'paddleGameView', 'tennisGameView',
        'invadersGameView', 'snakeGameView', 'tetrisGameView',
        'flappyGameView', 'pacmanGameView'
    ];
    const isPlaying = gameViews.some(id => 
        document.getElementById(id)?.classList.contains('active')
    );
    document.body.classList.toggle('playing', isPlaying);
}

document.addEventListener('DOMContentLoaded', () => {
    const gameViews = [
        'asteroidsGameView', 'paddleGameView', 'tennisGameView',
        'invadersGameView', 'snakeGameView', 'tetrisGameView',
        'flappyGameView', 'pacmanGameView'
    ];
    const observer = new MutationObserver(updatePlayingClass);
    gameViews.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
    
    updateProfileDisplay();
});

// 9. Message de démarrage
console.log('%c🎮 Arcade.io prêt !', 'color: #00ff88; font-family: monospace; font-size: 16px;');
console.log('💾 Sauvegarde de progression activée');
console.log('🏅 ' + Object.keys(ACHIEVEMENTS).length + ' succès à débloquer');
console.log('👤 Profil :', getProfile());