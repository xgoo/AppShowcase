// 围棋工坊 - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
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

    // Daniel Status
    updateDanielStatus();
    // Tsumego
    fetchTsumego();
});

async function updateDanielStatus() {
    const statusText = document.querySelector('#daniel-status .status-text');
    try {
        const response = await fetch('data/status.json');
        const data = await response.json();
        if (data && data.status) {
            statusText.textContent = "丹尼尔 (Daniel) 的日志: " + data.status;
        }
    } catch (e) {
        console.error("Status update error");
    }
}

let currentTsumegoData = [];

async function fetchTsumego() {
    try {
        const response = await fetch('data/tsumego.json');
        currentTsumegoData = await response.json();
        renderTsumego('初级');
    } catch (e) {
        console.error("Tsumego fetch error");
    }
}

function renderTsumego(level) {
    const nameLabel = document.getElementById('tsumego-name');
    const timeLabel = document.getElementById('tsumego-time');
    const container = document.getElementById('tsumego-display');
    
    const problem = currentTsumegoData.find(p => p.name.includes(level));
    
    if (problem && window.besogo) {
        container.innerHTML = '';
        
        // Use relative path to local cached SGF
        const fileName = problem.sgf_url.split('/').pop();
        const sgfUrl = "data/sgf/" + fileName;
        
        console.log("Loading SGF:", sgfUrl);

        besogo.create(container, {
            path: sgfUrl,
            panel: 'none',
            coord: 'western',
            tool: 'auto',
            mobile: 'auto'
        });
        
        nameLabel.textContent = problem.name;
        timeLabel.textContent = "更新时间: " + problem.input_time;
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
