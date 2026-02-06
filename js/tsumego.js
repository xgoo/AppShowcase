/**
 * Tsumego Display Logic v13 - With i18n Support
 */

const TsumegoManager = (() => {
    let tsumegoData = [];
    let currentPlayer = null;

    // i18n mappings for tsumego title
    const levelMap = {
        'zh-CN': { '初级': '初级', '中级': '中级', '高级': '高级', 'prefix': '【每日一题】' },
        'zh-TW': { '初级': '初級', '中级': '中級', '高级': '高級', 'prefix': '【每日一題】' },
        'en':    { '初级': 'Beginner', '中级': 'Intermediate', '高级': 'Advanced', 'prefix': 'Daily Tsumego · ' },
        'ja':    { '初级': '初級', '中级': '中級', '高级': '上級', 'prefix': '【毎日の詰碁】' }
    };

    /**
     * Localize the tsumego title from API format
     * Input: 【每日一题】2026-02-04(初级)
     * Output: Daily Tsumego · 2026-02-04 (Beginner) [for English]
     */
    const localizeTsumegoTitle = (title) => {
        // Regex to parse: 【每日一题】YYYY-MM-DD(级别)
        const match = title.match(/【每日一题】(\d{4}-\d{2}-\d{2})\((.+?)\)/);
        if (!match) return title; // Return original if no match

        const date = match[1];
        const level = match[2]; // 初级, 中级, or 高级

        // Get current language from I18n or localStorage
        let lang = 'zh-CN';
        if (typeof I18n !== 'undefined' && I18n.currentLang) {
            lang = I18n.currentLang;
        } else {
            lang = localStorage.getItem('lang') || 'zh-CN';
        }

        const mapping = levelMap[lang] || levelMap['zh-CN'];
        const localizedLevel = mapping[level] || level;
        const prefix = mapping.prefix || '【每日一题】';

        // Format based on language
        if (lang === 'en') {
            return `${prefix}${date} (${localizedLevel})`;
        } else {
            return `${prefix}${date}(${localizedLevel})`;
        }
    };

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
        
        // Get container dimensions for proper sizing
        const containerWidth = container.offsetWidth || 500;

        console.log("TsumegoManager: Rendering " + levelName + " from " + sgfUrl + " (width: " + containerWidth + ")");

        try {
            // Use BasicPlayer with local SGF and explicit width
            currentPlayer = new WGo.BasicPlayer(container, {
                sgfFile: sgfUrl,
                move: 0,
                markLastMove: true,
                enableKeys: true,
                enableWheel: false,
                width: containerWidth,  // Force explicit width
                board: {
                    width: containerWidth,  // Also set board width
                    background: "lib/wood1.jpg",
                    stoneHandler: WGo.Board.drawHandlers.REALISTIC
                },
                layout: { top: [], right: [], left: [], bottom: [] }
            });
            
            // Apply localized title and store original
            if (nameLabel) {
                nameLabel.dataset.originalTitle = problem.name;
                nameLabel.textContent = localizeTsumegoTitle(problem.name);
            }
            console.log("TsumegoManager: Render successful");
        } catch (err) {
            console.error("TsumegoManager: Render error", err);
            container.innerHTML = '<div class="tsumego-placeholder">棋盘渲染失败</div>';
        }
    };

    // Re-localize when language changes
    const updateLabels = () => {
        const nameLabel = document.getElementById('tsumego-name');
        if (nameLabel && nameLabel.dataset.originalTitle) {
            nameLabel.textContent = localizeTsumegoTitle(nameLabel.dataset.originalTitle);
        }
    };

    return { init, updateLabels, localizeTsumegoTitle };
})();

document.addEventListener('DOMContentLoaded', TsumegoManager.init);
