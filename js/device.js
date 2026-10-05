// ============================================
// 📱 DÉTECTION D'APPAREIL
// ============================================
const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const IS_MOBILE = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
const IS_TABLET = IS_TOUCH && window.innerWidth >= 768 && !/Mobi/i.test(navigator.userAgent);
const IS_DESKTOP = !IS_TOUCH || window.innerWidth > 1024;

// Classe CSS globale
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    if (IS_MOBILE) body.classList.add('is-mobile');
    if (IS_TABLET) body.classList.add('is-tablet');
    if (IS_DESKTOP) body.classList.add('is-desktop');
    if (IS_TOUCH) body.classList.add('is-touch');
    
    console.log('📱 Appareil détecté :', {
        mobile: IS_MOBILE,
        tablet: IS_TABLET,
        desktop: IS_DESKTOP,
        touch: IS_TOUCH
    });
});