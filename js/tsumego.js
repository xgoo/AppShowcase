/**
 * Tsumego Display Logic v12 - Local Asset Focus
 */

const TsumegoManager = (() => {
    let tsumegoData = [];
    let currentPlayer = null;

    const init = async () => {
        console.log("TsumegoManager: Initializing...");
        try {
            const response = await fetch('data/tsumego.json?t=' + Date.now());
            tsumegoData = await response.json();
            console.log("TsumegoManager: Data loaded (" + tsumegoData.length + " items)");
            
            // Wait for WGo to load from LOCAL lib/ folder
            const checkWGo = () => {
                if (typeof WGo !== 'undefined') {
                    console.log("TsumegoManager: WGo Engine Ready (v" + WGo.version + ")");
                    loadLevel('初级');
                } else {
                    console.log("TsumegoManager: Waiting for WGo library...");
                    setTimeout(checkWGo, 500);
                }
            };
            checkWGo();

            document.querySelectorAll('.tsumego-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('.tsumego-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    loadLevel(this.dataset.level);
                });
            });
        } catch (e) {
            console.error("TsumegoManager: Init failed", e);
        }
    };

    const loadLevel = (levelName) => {
        const container = document.getElementById('tsumego-display');
        const nameLabel = document.getElementById('tsumego-name');
        if (!container || tsumegoData.length === 0) return;

        const problem = tsumegoData.find(p => p.name.includes(levelName));
        if (!problem) return;

        container.innerHTML = '';
        const fileName = problem.sgf_url.split('/').pop();
        const sgfUrl = "data/sgf/" + fileName + "?t=" + Date.now();

        console.log("TsumegoManager: Rendering " + levelName + " from " + sgfUrl);

        try {
            // Use BasicPlayer with local SGF
            // Set background to wood texture now that assets are in lib/
            currentPlayer = new WGo.BasicPlayer(container, {
                sgfFile: sgfUrl,
                move: 0,
                markLastMove: true,
                enableKeys: true,
                enableWheel: false,
                board: {
                    background: "lib/wood1.jpg",
                    stoneHandler: WGo.Board.drawHandlers.REALISTIC
                },
                layout: { top: [], right: [], left: [], bottom: [] }
            });
            
            if (nameLabel) nameLabel.textContent = problem.name;
            console.log("TsumegoManager: Render successful");
        } catch (err) {
            console.error("TsumegoManager: Render error", err);
            container.innerHTML = '<div class="tsumego-placeholder">棋盘渲染失败</div>';
        }
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', TsumegoManager.init);
