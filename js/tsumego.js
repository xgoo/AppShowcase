/**
 * Tsumego Display Logic v17 - Auto Section Detection
 * Automatically detect stone bounds and show only relevant board area
 */

const TsumegoManager = (() => {
    let tsumegoData = [];
    let currentBoard = null;
    let currentKifu = null;

    // i18n mappings for tsumego title
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

        let lang = 'zh-CN';
        if (typeof I18n !== 'undefined' && I18n.currentLang) {
            lang = I18n.currentLang;
        } else {
            lang = localStorage.getItem('lang') || 'zh-CN';
        }

        const mapping = levelMap[lang] || levelMap['zh-CN'];
        const localizedLevel = mapping[level] || level;
        const prefix = mapping.prefix || '【每日一题】';

        if (lang === 'en') {
            return `${prefix}${date} (${localizedLevel})`;
        } else {
            return `${prefix}${date}(${localizedLevel})`;
        }
    };

    const init = async () => {
        console.log("TsumegoManager v17: Initializing...");
        try {
            const response = await fetch('data/tsumego.json?t=' + Date.now());
            tsumegoData = await response.json();
            console.log("TsumegoManager: Data loaded (" + tsumegoData.length + " items)");
            
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

    /**
     * Calculate the bounding box of all stones
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
        
        if (!hasStones) {
            return { top: 0, right: 0, bottom: 0, left: 0 };
        }
        
        // Add margin around stones (2 lines padding, but clamp to board edges)
        const padding = 2;
        const top = Math.max(0, minY - padding);
        const left = Math.max(0, minX - padding);
        const bottom = Math.max(0, boardSize - 1 - maxY - padding);
        const right = Math.max(0, boardSize - 1 - maxX - padding);
        
        console.log(`TsumegoManager: Bounds calculated - stones at (${minX},${minY}) to (${maxX},${maxY}), section: top=${top}, right=${right}, bottom=${bottom}, left=${left}`);
        
        return { top, right, bottom, left };
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

        console.log("TsumegoManager: Loading " + levelName + " from " + sgfUrl);

        try {
            // Fetch SGF content
            const sgfResponse = await fetch(sgfUrl);
            const sgfContent = await sgfResponse.text();
            
            // Parse SGF to get board size and initial position
            currentKifu = new WGo.Kifu.fromSgf(sgfContent);
            const boardSize = currentKifu.size || 19;
            
            // Get initial position using KifuReader
            const reader = new WGo.KifuReader(currentKifu);
            const position = reader.game.position;
            
            // Calculate section based on stone positions
            const section = calculateBounds(position, boardSize);
            
            // Calculate container size
            const containerWidth = container.offsetWidth || 500;
            
            // Create board with section (only show relevant area)
            currentBoard = new WGo.Board(container, {
                size: boardSize,
                width: containerWidth,
                section: section,
                background: "lib/wood1.jpg",
                stoneHandler: WGo.Board.drawHandlers.SHELL
            });
            
            // Draw all stones from initial position
            for (let x = 0; x < boardSize; x++) {
                for (let y = 0; y < boardSize; y++) {
                    const stone = position.get(x, y);
                    if (stone !== 0) {
                        currentBoard.addObject({ x: x, y: y, c: stone });
                    }
                }
            }
            
            // Add any markup from the SGF root node
            const rootNode = currentKifu.root;
            if (rootNode) {
                // Labels (LB property)
                if (rootNode.LB) {
                    rootNode.LB.forEach(label => {
                        // Format: "ab:X" where ab is coordinates and X is the label
                        const match = label.match(/([a-s])([a-s]):(.+)/i);
                        if (match) {
                            const x = match[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                            const y = match[2].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                            currentBoard.addObject({ x: x, y: y, type: 'LB', text: match[3] });
                        }
                    });
                }
                
                // Triangles (TR property)
                if (rootNode.TR) {
                    rootNode.TR.forEach(coord => {
                        const x = coord[0].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                        const y = coord[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                        currentBoard.addObject({ x: x, y: y, type: 'TR' });
                    });
                }
                
                // Circles (CR property)
                if (rootNode.CR) {
                    rootNode.CR.forEach(coord => {
                        const x = coord[0].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                        const y = coord[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                        currentBoard.addObject({ x: x, y: y, type: 'CR' });
                    });
                }
                
                // Squares (SQ property)
                if (rootNode.SQ) {
                    rootNode.SQ.forEach(coord => {
                        const x = coord[0].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                        const y = coord[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                        currentBoard.addObject({ x: x, y: y, type: 'SQ' });
                    });
                }
                
                // Marks (MA property)
                if (rootNode.MA) {
                    rootNode.MA.forEach(coord => {
                        const x = coord[0].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                        const y = coord[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                        currentBoard.addObject({ x: x, y: y, type: 'MA' });
                    });
                }
            }

            // Apply localized title
            if (nameLabel) {
                nameLabel.dataset.originalTitle = problem.name;
                nameLabel.textContent = localizeTsumegoTitle(problem.name);
            }
            
            console.log("TsumegoManager: Render successful (size: " + boardSize + ", section applied)");
            
        } catch (err) {
            console.error("TsumegoManager: Render error", err);
            container.innerHTML = '<div class="tsumego-placeholder">棋盘渲染失败: ' + err.message + '</div>';
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
