/**
 * Tsumego Display Logic for Go Studio
 * Powered by WGo.js
 */

const TsumegoManager = (() => {
    let tsumegoData = [];
    let currentPlayer = null;

    const init = async () => {
        console.log("TsumegoManager: Initializing...");
        try {
            // Load cached data to bypass CORS
            const response = await fetch('data/tsumego.json?t=' + Date.now());
            tsumegoData = await response.json();
            console.log("TsumegoManager: Data loaded (" + tsumegoData.length + " items)");
            
            setupEventListeners();
            
            // Wait for WGo to be available if script is still loading
            waitForWGo(() => loadLevel('初级'));
        } catch (error) {
            console.error("TsumegoManager: Failed to load data", error);
            updateUIError("无法读取题库数据");
        }
    };

    const setupEventListeners = () => {
        document.querySelectorAll('.tsumego-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.tsumego-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                loadLevel(this.dataset.level);
            });
        });
    };

    const waitForWGo = (callback) => {
        if (typeof WGo !== 'undefined' && WGo.BasicPlayer) {
            callback();
        } else {
            console.log("TsumegoManager: Waiting for WGo...");
            setTimeout(() => waitForWGo(callback), 500);
        }
    };

    const loadLevel = (levelName) => {
        const container = document.getElementById('tsumego-display');
        const nameLabel = document.getElementById('tsumego-name');
        const timeLabel = document.getElementById('tsumego-time');
        
        if (!container) return;

        const problem = tsumegoData.find(p => p.name.includes(levelName));
        if (!problem) {
            console.warn("TsumegoManager: No problem found for level " + levelName);
            return;
        }

        container.innerHTML = '';
        
        // Extract filename and use local path
        const fileName = problem.sgf_url.split('/').pop();
        const localSgfUrl = "data/sgf/" + fileName + "?t=" + Date.now();

        console.log("TsumegoManager: Loading SGF from " + localSgfUrl);

        try {
            currentPlayer = new WGo.BasicPlayer(container, {
                sgfFile: localSgfUrl,
                move: 0,
                markLastMove: true,
                display: {
                    background: "#dcb35c"
                },
                layout: {
                    top: [],
                    right: [],
                    left: [],
                    bottom: []
                },
                autoPageSize: true
            });
            
            if (nameLabel) nameLabel.textContent = problem.name;
            if (timeLabel) timeLabel.textContent = "同步时间: " + problem.input_time;
        } catch (err) {
            console.error("TsumegoManager: WGo Player error", err);
            updateUIError("棋盘渲染失败");
        }
    };

    const updateUIError = (msg) => {
        const container = document.getElementById('tsumego-display');
        if (container) container.innerHTML = '<div class="tsumego-placeholder" style="color:#D4A853">' + msg + '</div>';
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', TsumegoManager.init);
