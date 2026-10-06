// ============================================
// 📱 DÉTECTION D'APPAREIL
// ============================================
const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const IS_MOBILE = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
const IS_TABLET = IS_TOUCH && window.innerWidth >= 768 && !/Mobi/i.test(navigator.userAgent);
const IS_DESKTOP = !IS_TOUCH || window.innerWidth > 1024;

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

// ============================================
// ⛶ PLEIN ÉCRAN
// ============================================
function toggleMobileFullscreen() {
    if (!document.fullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
}

// Afficher le bouton plein écran sur mobile
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('fullscreenBtn');
    if (btn && IS_MOBILE) {
        btn.style.display = 'inline-block';
    }
});

// ============================================
// 📳 VIBRATIONS (si supportées)
// ============================================
function vibrate(duration = 20) {
    if (navigator.vibrate && IS_TOUCH) {
        try { navigator.vibrate(duration); } catch (e) {}
    }
}