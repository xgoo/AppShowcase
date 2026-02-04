// 围棋工坊 - Main JavaScript v6 (Robust Rendering)

document.addEventListener('DOMContentLoaded', () => {
    console.log("iProject Studio JS v6 Loading...");
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
        if (container) container.innerHTML = '<p style="color:#D4A853; padding:20px;">正在加载棋盘引擎...</p>';
        setTimeout(checkWGo, 500);
    } else {
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
        console.error("Fetch error:", e);
    }
}

async function renderTsumego(level) {
    const container = document.getElementById('tsumego-display');
    const nameLabel = document.getElementById('tsumego-name');
    const timeLabel = document.getElementById('tsumego-time');
    
    if (!container) return;
    
    const problem = currentTsumegoData.find(p => p.name.includes(level));
    if (!problem) return;

    container.innerHTML = '';
    const fileName = problem.sgf_url.split('/').pop();
    const sgfUrl = "data/sgf/" + fileName + "?t=" + Date.now();
    
    console.log("Fetching SGF content:", sgfUrl);

    try {
        // Fetch SGF content first to ensure it's available
        const res = await fetch(sgfUrl);
        const sgfContent = await res.text();
        
        if (sgfContent.includes('(;')) {
            console.log("SGF content loaded, creating player...");
            new WGo.BasicPlayer(container, {
                sgf: sgfContent,
                move: 0,
                markLastMove: true,
                display: { background: "#dcb35c" },
                layout: { right: [], left: [], bottom: [] }
            });
        } else {
            throw new Error("Invalid SGF content");
        }
    } catch (err) {
        console.error("WGo error:", err);
        container.innerHTML = '<p style="color:#D4A853; padding:20px;">棋谱加载失败，请刷新重试</p>';
    }
    
    if (nameLabel) nameLabel.textContent = problem.name;
    if (timeLabel) timeLabel.textContent = "更新时间: " + problem.input_time;
}

// Tab Switching
document.querySelectorAll('.tsumego-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tsumego-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderTsumego(this.dataset.level);
    });
});
