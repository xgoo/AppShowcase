/**
 * Tsumego Display Logic v25 - The Ultimate Combination
 * Combines v17 (Section Detection) + v18 (Explicit Sizing) + v21 (Zero-Point CSS)
 */

const TsumegoManager = (() => {
    let tsumegoData = [];
    let currentBoard = null;
    let currentKifu = null;

    // i18n mappings
    const levelMap = {
        'zh-CN': { '初级': '初级', '中级': '中级', '高级': '高级', 'prefix': '【每日一题】' },
        'zh-TW': { '初级': '初級', '中级': '中級', '高级': '高級', 'prefix': '【每日一題】' },
        'en':    { '初级': 'Beginner', '中级': 'Intermediate', '高级': 'Advanced', 'prefix': 'Daily Tsumego · ' },
        'ja':    { '初级': '初級', '中级': '中級', '高级': '上級', 'prefix': '【毎日の詰碁】' }
    };

    const localizeTsumegoTitle = (title) => {
        const match = title.match(/【每日一题】(\d{4}-\d{2}-\d{2})\((.+?)\)/);
        if (!match) return title;
        const date = match[1];
        const level = match[2];
        let lang = (typeof I18n !== 'undefined' && I18n.currentLang) ? I18n.currentLang : (localStorage.getItem('lang') || 'zh-CN');
        const mapping = levelMap[lang] || levelMap['zh-CN'];
        return lang === 'en' ? `${mapping.prefix}${date} (${mapping[level] || level})` : `${mapping.prefix}${date}(${mapping[level] || level})`;
    };

    const init = async () => {
        console.log("TsumegoManager v25: Initializing...");
        try {
            const response = await fetch('data/tsumego.json?t=' + Date.now());
            tsumegoData = await response.json();
            
            const checkWGo = () => {
                if (typeof WGo !== 'undefined') {
                    console.log("TsumegoManager: WGo v" + WGo.version + " ready");
                    loadLevel('初级');
                } else {
                    setTimeout(checkWGo, 200);
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

    /**
     * Calculate bounding box of stones to set board section
     */
    const calculateBounds = (position, boardSize) => {
        let minX = boardSize, maxX = 0, minY = boardSize, maxY = 0;
        let hasStones = false;
        
        for (let x = 0; x < boardSize; x++) {
            for (let y = 0; y < boardSize; y++) {
                if (position.get(x, y) !== 0) {
                    hasStones = true;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }
        
        if (!hasStones) return { top: 0, right: 0, bottom: 0, left: 0 };
        
        const padding = 2;
        return {
            top: Math.max(0, minY - padding),
            right: Math.max(0, boardSize - 1 - maxX - padding),
            bottom: Math.max(0, boardSize - 1 - maxY - padding),
            left: Math.max(0, minX - padding)
        };
    };

    const loadLevel = async (levelName) => {
        const container = document.getElementById('tsumego-display');
        const nameLabel = document.getElementById('tsumego-name');
        if (!container || tsumegoData.length === 0) return;

        const problem = tsumegoData.find(p => p.name.includes(levelName));
        if (!problem) return;

        container.innerHTML = '';
        const fileName = problem.sgf_url.split('/').pop();
        const sgfUrl = "data/sgf/" + fileName + "?t=" + Date.now();

        console.log("TsumegoManager: Loading " + sgfUrl);

        try {
            // Fetch and parse SGF
            const sgfResponse = await fetch(sgfUrl);
            const sgfContent = await sgfResponse.text();
            currentKifu = new WGo.Kifu.fromSgf(sgfContent);
            const boardSize = currentKifu.size || 19;
            
            // Calculate section
            const reader = new WGo.KifuReader(currentKifu);
            const section = calculateBounds(reader.game.position, boardSize);
            
            // Smart Responsive Sizing (v32)
            // Use screen width minus padding (32px) to prevent overflow
            const screenWidth = window.innerWidth;
            const maxAvailableWidth = Math.min(500, screenWidth - 32);
            // Use the smaller of current width or safe max width
            const currentWidth = container.offsetWidth || 500;
            const containerWidth = Math.min(currentWidth, maxAvailableWidth);

            // Use WGo.Board directly (Bypass BasicPlayer layout issues)
            currentBoard = new WGo.Board(container, {
                size: boardSize,
                width: containerWidth,
                section: section,
                background: "lib/wood1.jpg",
                stoneHandler: WGo.Board.drawHandlers.SHELL
            });

            // Post-render fix: Force sync dimensions
            setTimeout(() => {
                const boardEl = container.querySelector('.wgo-board');
                // Use the grid canvas as the source of truth for dimensions
                const gridCanvas = container.querySelector('canvas');
                
                if (boardEl && gridCanvas) {
                    const pixelRatio = window.devicePixelRatio || 1;
                    const actualWidth = gridCanvas.width / pixelRatio;
                    const actualHeight = gridCanvas.height / pixelRatio;
                    
                    // Force CSS to match calculated dimensions exactly
                    boardEl.style.width = actualWidth + 'px';
                    boardEl.style.height = actualHeight + 'px';
                    
                    // Sync container dimensions to match board (perfect fit)
                    container.style.width = actualWidth + 'px';
                    container.style.height = actualHeight + 'px';
                    
                    // Ensure background covers this exact area
                    boardEl.style.backgroundSize = '100% 100%';
                    console.log("TsumegoManager: Forced dimensions to " + actualWidth + "x" + actualHeight);
                }
            }, 50);

            // Draw stones
            const position = reader.game.position;
            for (let x = 0; x < boardSize; x++) {
                for (let y = 0; y < boardSize; y++) {
                    const stone = position.get(x, y);
                    if (stone !== 0) currentBoard.addObject({ x: x, y: y, c: stone });
                }
            }
            
            // Draw markup (LB, TR, etc.)
            const rootNode = currentKifu.root;
            if (rootNode) {
                if (rootNode.LB) rootNode.LB.forEach(l => {
                    const m = l.match(/([a-s])([a-s]):(.+)/i);
                    if(m) currentBoard.addObject({ x: m[1].charCodeAt(0)-97, y: m[2].charCodeAt(0)-97, type: 'LB', text: m[3] });
                });
                // Add other markups if needed...
            }

            if (nameLabel) {
                nameLabel.dataset.originalTitle = problem.name;
                nameLabel.textContent = localizeTsumegoTitle(problem.name);
            }
            
        } catch (err) {
            console.error("TsumegoManager: Error", err);
            container.innerHTML = '<div style="color:#fff;padding:20px;">加载失败: ' + err.message + '</div>';
        }
    };

    const updateLabels = () => {
        const nameLabel = document.getElementById('tsumego-name');
        if (nameLabel && nameLabel.dataset.originalTitle) {
            nameLabel.textContent = localizeTsumegoTitle(nameLabel.dataset.originalTitle);
        }
    };

    return { init, updateLabels, localizeTsumegoTitle };
})();

document.addEventListener('DOMContentLoaded', TsumegoManager.init);
