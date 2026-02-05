// 围棋工坊 - JavaScript v10 (Clean Initialization)

document.addEventListener('DOMContentLoaded', () => {
    updateDanielStatus();
    initTsumego();
});

async function updateDanielStatus() {
    const el = document.querySelector('#daniel-status .status-text');
    try {
        const res = await fetch('data/status.json?t=' + Date.now());
        const data = await res.json();
        if (el && data.status) el.textContent = "丹尼尔 (Daniel): " + data.status;
    } catch (e) {}
}

let tsumegoData = [];
let player = null;

async function initTsumego() {
    try {
        const res = await fetch('data/tsumego.json?t=' + Date.now());
        tsumegoData = await res.json();
        loadLevel('初级');
    } catch (e) {
        console.error("Data load failed");
    }
}

function loadLevel(level) {
    const container = document.getElementById('tsumego-display');
    const nameLabel = document.getElementById('tsumego-name');
    
    if (!container || tsumegoData.length === 0) return;
    const item = tsumegoData.find(p => p.name.includes(level));
    if (!item) return;

    container.innerHTML = '';
    const sgfUrl = "data/sgf/" + item.sgf_url.split('/').pop() + "?t=" + Date.now();

    if (typeof WGo !== 'undefined') {
        player = new WGo.BasicPlayer(container, {
            sgfFile: sgfUrl,
            move: 0,
            display: { background: "#dcb35c" },
            layout: { top:[], right:[], left:[], bottom:[] }
        });
        if (nameLabel) nameLabel.textContent = item.name;
    } else {
        setTimeout(() => loadLevel(level), 1000);
    }
}

document.querySelectorAll('.tsumego-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tsumego-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        loadLevel(this.dataset.level);
    });
});
