// 围棋工坊 - Main JavaScript v3 (Bypass Cache)

document.addEventListener('DOMContentLoaded', () => {
    console.log("iProject Studio JS Loading...");
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Initialize components
    updateDanielStatus();
    fetchTsumego();
});

async function updateDanielStatus() {
    const statusText = document.querySelector('#daniel-status .status-text');
    try {
        const response = await fetch('data/status.json?v=' + Date.now());
        const data = await response.json();
        if (data && data.status) {
            statusText.textContent = "丹尼尔 (Daniel) 的日志: " + data.status;
        }
    } catch (e) {
        console.error("Status update error", e);
    }
}

let currentTsumegoData = [];

async function fetchTsumego() {
    console.log("Fetching tsumego data...");
    try {
        const response = await fetch('data/tsumego.json?v=' + Date.now());
        currentTsumegoData = await response.json();
        console.log("Data loaded:", currentTsumegoData.length, "items");
        renderTsumego('初级');
    } catch (e) {
        console.error("Tsumego fetch error", e);
    }
}

function renderTsumego(level) {
    console.log("Rendering level:", level);
    const nameLabel = document.getElementById('tsumego-name');
    const timeLabel = document.getElementById('tsumego-time');
    const container = document.getElementById('tsumego-display');
    
    if (!container) return;

    const problem = currentTsumegoData.find(p => p.name.includes(level));
    
    if (problem && window.WGo) {
        container.innerHTML = '';
        
        const fileName = problem.sgf_url.split('/').pop();
        const sgfUrl = "data/sgf/" + fileName + "?v=" + Date.now();
        
        console.log("Loading SGF with WGo:", sgfUrl);

        try {
            new WGo.BasicPlayer(container, {
                sgfFile: sgfUrl,
                move: 0,
                markLastMove: true,
                display: {
                    background: "#dcb35c"
                },
                layout: {
                    right: [],
                    left: [],
                    bottom: []
                }
            });
            console.log("WGo Player created successfully");
        } catch (err) {
            console.error("WGo Player creation failed:", err);
            container.innerHTML = '<p style="color:red">棋盘组件启动失败</p>';
        }
        
        nameLabel.textContent = problem.name;
        timeLabel.textContent = "更新时间: " + problem.input_time;
    } else {
        console.error("Problem not found or WGo missing", { problem: !!problem, WGo: !!window.WGo });
    }
}

// Tab Switching
document.querySelectorAll('.tsumego-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tsumego-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderTsumego(tab.dataset.level);
    });
});
