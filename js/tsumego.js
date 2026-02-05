/**
 * Tsumego Display Logic v10 - The "Isolation" Edition
 */

const TsumegoManager = (() => {
    let tsumegoData = [];
    let currentPlayer = null;

    const init = async () => {
        try {
            const response = await fetch('data/tsumego.json?t=' + Date.now());
            tsumegoData = await response.json();
            
            // Wait for WGo to load
            const checkWGo = () => {
                if (typeof WGo !== 'undefined' && WGo.BasicPlayer) {
                    loadLevel('初级');
                } else {
                    setTimeout(checkWGo, 300);
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
            console.error("Initialization failed", e);
        }
    };

    const loadLevel = (levelName) => {
        const container = document.getElementById('tsumego-display');
        const problem = tsumegoData.find(p => p.name.includes(levelName));
        if (!container || !problem) return;

        container.innerHTML = '';
        const fileName = problem.sgf_url.split('/').pop();
        const sgfUrl = "data/sgf/" + fileName + "?t=" + Date.now();

        console.log("Rendering SGF:", sgfUrl);

        try {
            currentPlayer = new WGo.BasicPlayer(container, {
                sgfFile: sgfUrl,
                move: 0,
                markLastMove: true,
                display: { background: "#dcb35c" },
                layout: { top: [], right: [], left: [], bottom: [] }
            });
            
            // Critical: Force refresh after render to catch potential container size shifts
            setTimeout(() => {
                if (currentPlayer && currentPlayer.update) currentPlayer.update();
            }, 200);

            document.getElementById('tsumego-name').textContent = problem.name;
        } catch (err) {
            console.error("Render failed", err);
        }
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', TsumegoManager.init);
