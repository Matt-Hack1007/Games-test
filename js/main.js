// ============================================
// 🚀 INITIALISATION PRINCIPALE
// ============================================

// 1. Créer toutes les vues de jeu dans le DOM
createAllGameViews();

// 2. Initialiser chaque jeu (le canvas existe maintenant !)
initAsteroids();
initPaddle();
initTennis();
initInvaders();
initSnake();
initTetris();
initFlappy();
initPacman();

// 3. Générer les étoiles de fond
generateStars();

// 4. Gérer la classe "playing" (bloque le scroll pendant le jeu)
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
        if (el) {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        }
    });
});

// 5. Message de démarrage
console.log('%c🎮 Arcade.io prêt !', 'color: #00ff88; font-family: monospace; font-size: 16px;');
console.log('📱 Mobile :', IS_MOBILE);
console.log('💻 Desktop :', IS_DESKTOP);
console.log('👆 Tactile :', IS_TOUCH);