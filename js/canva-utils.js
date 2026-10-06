// ============================================
// 📐 UTILITAIRES CANVAS (adaptation mobile/PC)
// ============================================

/**
 * Récupère la vraie taille du viewport (compatible mobile)
 * Utilise visualViewport si disponible pour éviter les problèmes de barre d'adresse
 */
function getViewportSize() {
    let w, h;
    
    if (window.visualViewport) {
        w = window.visualViewport.width;
        h = window.visualViewport.height;
    } else {
        w = window.innerWidth;
        h = window.innerHeight;
    }
    
    // Fallback si valeurs absurdes
    if (w < 100 || h < 100) {
        w = window.innerWidth;
        h = window.innerHeight;
    }
    
    return { width: w, height: h };
}

/**
 * Redimensionne un canvas avec gestion du DPI (retina)
 * et adaptation mobile/PC
 */
function resizeCanvas(canvas, ctx) {
    if (!canvas) return { width: 0, height: 0 };
    
    const { width, height } = getViewportSize();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Limite à 2 pour perf mobile
    
    // Taille CSS
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Taille de rendu interne
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    
    // Scale le contexte pour travailler en pixels CSS
    if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    
    return { width, height };
}

/**
 * Force la réorientation si possible (mobile en plein écran)
 */
function lockLandscape() {
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
    }
}

function unlockOrientation() {
    if (screen.orientation && screen.orientation.unlock) {
        try { screen.orientation.unlock(); } catch (e) {}
    }
}

/**
 * Détecte si on est en orientation paysage
 */
function isLandscape() {
    const { width, height } = getViewportSize();
    return width > height;
}

/**
 * Détecte si on est en orientation portrait
 */
function isPortrait() {
    return !isLandscape();
}

/**
 * Écoute les changements de taille ET d'orientation
 */
function onResize(callback) {
    let timeoutId = null;
    
    const handler = () => {
        // Debounce pour éviter les appels multiples
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback();
        }, 100);
    };
    
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', () => {
        // Attendre que le navigateur finisse la rotation
        setTimeout(handler, 300);
    });
    
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handler);
    }
}

console.log('📐 Canvas utils chargés');