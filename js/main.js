// ============================================
// 🚀 INITIALISATION PRINCIPALE
// ============================================

// 1. Créer toutes les vues de jeu dans le DOM
createAllGameViews();

// 2. Initialiser chaque jeu (récupère les canvas maintenant qu'ils existent)
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

// 4. Petit message de démarrage
console.log('🎮 Arcade.io prêt !');