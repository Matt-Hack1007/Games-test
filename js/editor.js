// ============================================
// ✏️ ÉDITEUR PADDLE
// ============================================
const EDITOR_COLS = 10;
const EDITOR_ROWS = 8;
const EDITOR_COLORS = ['#ff3366', '#ff00ff', '#00ffff', '#00ff88', '#ffdd00', '#ff8800', '#8800ff', '#ffffff'];
let editorGrid = [];
let editorCurrentColor = 0;

function openEditor() {
    showView('editorView');
    initEditor();
}

function initEditor() {
    let saved = null;
    try {
        const data = localStorage.getItem('arcade_io_custom_level');
        if (data) saved = JSON.parse(data);
    } catch(e) {}

    editorGrid = [];
    for (let r = 0; r < EDITOR_ROWS; r++) {
        editorGrid[r] = [];
        for (let c = 0; c < EDITOR_COLS; c++) {
            editorGrid[r][c] = (saved && saved[r] && saved[r][c]) ? saved[r][c] : -1;
        }
    }

    const colorPicker = document.getElementById('editorColorPicker');
    colorPicker.innerHTML = '';
    EDITOR_COLORS.forEach((color, i) => {
        const btn = document.createElement('button');
        btn.className = 'color-btn' + (i === editorCurrentColor ? ' selected' : '');
        btn.style.background = color;
        btn.onclick = () => {
            editorCurrentColor = i;
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            playBeep(700, 0.04);
        };
        colorPicker.appendChild(btn);
    });

    const grid = document.getElementById('editorGrid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${EDITOR_COLS}, 1fr)`;
    for (let r = 0; r < EDITOR_ROWS; r++) {
        for (let c = 0; c < EDITOR_COLS; c++) {
            const cell = document.createElement('button');
            cell.className = 'editor-cell' + (editorGrid[r][c] >= 0 ? ' filled' : '');
            if (editorGrid[r][c] >= 0) cell.style.background = EDITOR_COLORS[editorGrid[r][c]];
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.onclick = () => toggleEditorCell(r, c, cell);
            grid.appendChild(cell);
        }
    }
}

function toggleEditorCell(r, c, cell) {
    if (editorGrid[r][c] === editorCurrentColor) {
        editorGrid[r][c] = -1;
        cell.classList.remove('filled');
        cell.style.background = '';
    } else {
        editorGrid[r][c] = editorCurrentColor;
        cell.classList.add('filled');
        cell.style.background = EDITOR_COLORS[editorCurrentColor];
    }
    playBeep(500, 0.03, 'square', 0.06);
}

function clearEditor() {
    if (!confirm('🗑 Effacer la grille ?')) return;
    editorGrid = [];
    for (let r = 0; r < EDITOR_ROWS; r++) {
        editorGrid[r] = [];
        for (let c = 0; c < EDITOR_COLS; c++) editorGrid[r][c] = -1;
    }
    initEditor();
}

function saveCustomLevel() {
    try {
        localStorage.setItem('arcade_io_custom_level', JSON.stringify(editorGrid));
        playRecordFanfare();
        alert('✅ Niveau sauvegardé !\n\nSélectionne "PERSONNALISÉ" dans le menu Paddle pour le jouer.');
    } catch(e) {
        alert('❌ Erreur de sauvegarde');
    }
}

function loadCustomLevel() {
    try {
        const data = localStorage.getItem('arcade_io_custom_level');
        if (data) return JSON.parse(data);
    } catch(e) {}
    return null;
}