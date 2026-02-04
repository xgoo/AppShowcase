// 围棋工坊 - Main JavaScript v5 (Ultimate Stability)

document.addEventListener('DOMContentLoaded', () => {
    console.log("iProject Studio JS v5 Loading...");
    
    // Daniel Status
    updateDanielStatus();
    
    // Tsumego logic with a slight delay to ensure libraries are ready
    setTimeout(fetchTsumego, 500);
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

let currentTsumegoData = [];

async function fetchTsumego() {
    const display = document.getElementById('tsumego-display');
    try {
        console.log("Fetching tsumego.json...");
        const response = await fetch('data/tsumego.json?t=' + Date.now());
        currentTsumegoData = await response.json();
        console.log("Tsumego data loaded:", currentTsumegoData.length);
        renderTsumego('初级');
    } catch (e) {
        console.error("Fetch error:", e);
        if (display) display.innerHTML = '<p style="color:#D4A853; padding:20px;">数据加载失败</p>';
    }
}

function renderTsumego(level) {
    const container = document.getElementById('tsumego-display');
    const nameLabel = document.getElementById('tsumego-name');
    const timeLabel = document.getElementById('tsumego-time');
    
    if (!container) return;
    
    const problem = currentTsumegoData.find(p => p.name.includes(level));
    
    if (!problem) {
        container.innerHTML = '<p style="color:#D4A853; padding:20px;">未找到' + level + '题目</p>';
        return;
    }

    if (typeof WGo === 'undefined') {
        container.innerHTML = '<p style="color:#D4A853; padding:20px;">正在加载棋盘引擎...</p>';
        // Retry in 1s
        setTimeout(() => renderTsumego(level), 1000);
        return;
    }

    container.innerHTML = '';
    const fileName = problem.sgf_url.split('/').pop();
    const sgfUrl = "data/sgf/" + fileName + "?t=" + Date.now();
    
    console.log("Rendering SGF:", sgfUrl);

    try {
        const player = new WGo.BasicPlayer(container, {
            sgfFile: sgfUrl,
            move: 0,
            markLastMove: true,
            display: { background: "#dcb35c" },
            layout: { right: [], left: [], bottom: [] }
        });
        console.log("WGo Player initialized");
    } catch (err) {
        console.error("WGo error:", err);
        container.innerHTML = '<p style="color:red; padding:20px;">棋盘渲染出错</p>';
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
