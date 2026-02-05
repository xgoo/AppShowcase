// 围棋工坊 - Main JavaScript v9 (Perfect Centering)

document.addEventListener('DOMContentLoaded', () => {
    updateDanielStatus();
    checkWGo();
});

async function updateDanielStatus() {
    const statusText = document.querySelector('#daniel-status .status-text');
    try {
        const response = await fetch('data/status.json?t=' + Date.now());
        const data = await response.json();
        if (data && data.status) {
            statusText.textContent = "丹尼尔 (Daniel) 的日志: " + data.status;
        }
    } catch (e) {}
}

function checkWGo() {
    if (typeof WGo === 'undefined') {
        setTimeout(checkWGo, 500);
    } else {
        fetchTsumego();
    }
}

let currentTsumegoData = [];
let currentPlayer = null;

async function fetchTsumego() {
    try {
        const response = await fetch('data/tsumego.json?t=' + Date.now());
        currentTsumegoData = await response.json();
        renderTsumego('初级');
    } catch (e) {
        console.error("Fetch error");
    }
}

function renderTsumego(level) {
    const container = document.getElementById('tsumego-display');
    const nameLabel = document.getElementById('tsumego-name');
    const timeLabel = document.getElementById('tsumego-time');
    
    if (!container) return;
    const problem = currentTsumegoData.find(p => p.name.includes(level));
    if (!problem) return;

    container.innerHTML = '';
    const fileName = problem.sgf_url.split('/').pop();
    const sgfUrl = "data/sgf/" + fileName + "?t=" + Date.now();

    try {
        // Use a slightly more robust initialization
        currentPlayer = new WGo.BasicPlayer(container, {
            sgfFile: sgfUrl,
            move: 0,
            markLastMove: true,
            display: { background: "#dcb35c" },
            layout: { 
                top: [],
                right: [], 
                left: [], 
                bottom: [] 
            },
            autoPageSize: true
        });
        
        // Force a resize calculation after a short delay
        setTimeout(() => {
            if (currentPlayer && currentPlayer.update) {
                currentPlayer.update();
            }
        }, 300);

    } catch (err) {
        console.error("WGo error:", err);
    }
    
    if (nameLabel) nameLabel.textContent = problem.name;
    if (timeLabel) timeLabel.textContent = "更新时间: " + problem.input_time;
}

// Window resize handler
window.addEventListener('resize', () => {
    if (currentPlayer && currentPlayer.update) {
        currentPlayer.update();
    }
});

// Tab Switching
document.querySelectorAll('.tsumego-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tsumego-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderTsumego(this.dataset.level);
    });
});
