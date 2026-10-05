// ============================================
// 🔊 AUDIO 8-BIT
// ============================================
let audioCtx = null;
let audioEnabled = true;
let musicEnabled = true;
let masterVolume = 0.3;
let thrustOsc = null;

function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { audioEnabled = false; }
}

function playBeep(freq = 440, duration = 0.08, type = 'square', vol = 0.15) {
    if (!audioEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol * masterVolume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playShoot() {
    if (!audioEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.12 * masterVolume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function playExplosion() {
    if (!audioEnabled || !audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.25 * masterVolume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
}

function playPickup() {
    if (!audioEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12 * masterVolume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

function playRecordFanfare() {
    if (!audioEnabled || !audioCtx) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
        setTimeout(() => playBeep(freq, 0.15, 'square', 0.2), i * 100);
    });
}

function playGameOver() {
    if (!audioEnabled || !audioCtx) return;
    const notes = [523, 440, 349, 262];
    notes.forEach((freq, i) => {
        setTimeout(() => playBeep(freq, 0.2, 'triangle', 0.15), i * 150);
    });
}

function startThrustSound() {
    if (!audioEnabled || !audioCtx || thrustOsc) return;
    thrustOsc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    thrustOsc.type = 'sawtooth';
    thrustOsc.frequency.setValueAtTime(80, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.04 * masterVolume, audioCtx.currentTime);
    thrustOsc.connect(gain); gain.connect(audioCtx.destination);
    thrustOsc.start();
}

function stopThrustSound() {
    if (thrustOsc) {
        try { thrustOsc.stop(); } catch(e) {}
        thrustOsc = null;
    }
}

function setVolume(val) { masterVolume = val / 100; }

// Activation audio au premier clic/touche
document.addEventListener('click', () => {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });

document.addEventListener('keydown', () => {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });