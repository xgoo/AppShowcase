// 围棋工坊 - Main JavaScript v7 (Local & Test Mode)

document.addEventListener('DOMContentLoaded', () => {
    console.log("iProject Studio JS v7 Loading (Local Assets)...");
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
    const container = document.getElementById('tsumego-display');
    if (typeof WGo === 'undefined') {
        if (container) container.innerHTML = '<p style="color:#D4A853; padding:20px;">正在加载本地棋盘引擎...</p>';
        setTimeout(checkWGo, 500);
    } else {
        console.log("WGo is ready!");
        fetchTsumego();
    }
}

let currentTsumegoData = [];

async function fetchTsumego() {
    try {
        const response = await fetch('data/tsumego.json?t=' + Date.now());
        currentTsumegoData = await response.json();
        renderTsumego('初级');
    } catch (e) {
        console.error("Fetch error, entering TEST MODE...");
        renderTsumego('TEST');
    }
}

async function renderTsumego(level) {
    const container = document.getElementById('tsumego-display');
    const nameLabel = document.getElementById('tsumego-name');
    const timeLabel = document.getElementById('tsumego-time');
    
    if (!container) return;
    
    let sgfUrl = "";
    let problemName = level;

    if (level === 'TEST') {
        sgfUrl = "data/sgf/test.sgf?t=" + Date.now();
        problemName = "测试模式：基础星位图";
    } else {
        const problem = currentTsumegoData.find(p => p.name.includes(level));
        if (!problem) {
            console.warn("Problem not found, fallback to TEST");
            renderTsumego('TEST');
            return;
        }
        const fileName = problem.sgf_url.split('/').pop();
        sgfUrl = "data/sgf/" + fileName + "?t=" + Date.now();
        problemName = problem.name;
    }

    container.innerHTML = '';
    console.log("Rendering SGF from:", sgfUrl);

    try {
        // Option 1: Try direct file load (more stable with WGo)
        new WGo.BasicPlayer(container, {
            sgfFile: sgfUrl,
            move: 0,
            markLastMove: true,
            display: { background: "#dcb35c" },
            layout: { right: [], left: [], bottom: [] }
        });
        console.log("WGo instance created.");
    } catch (err) {
        console.error("WGo Rendering failed:", err);
        container.innerHTML = '<p style="color:#D4A853; padding:20px;">本地渲染失败，尝试读取文本模式...</p>';
    }
    
    if (nameLabel) nameLabel.textContent = problemName;
}

// Tab Switching
document.querySelectorAll('.tsumego-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tsumego-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderTsumego(this.dataset.level);
    });
});
