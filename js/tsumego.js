/**
 * Tsumego Display Logic v19 - Simple & Clean
 * Just use WGo.BasicPlayer as intended, with proper CSS isolation
 */

const TsumegoManager = (() => {
    let tsumegoData = [];
    let currentPlayer = null;

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
        console.log("TsumegoManager v19: Initializing...");
        try {
            const response = await fetch('data/tsumego.json?t=' + Date.now());
            tsumegoData = await response.json();
            console.log("TsumegoManager: Loaded " + tsumegoData.length + " problems");
            
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

    const loadLevel = (levelName) => {
        const container = document.getElementById('tsumego-display');
        const nameLabel = document.getElementById('tsumego-name');
        if (!container || tsumegoData.length === 0) return;

        const problem = tsumegoData.find(p => p.name.includes(levelName));
        if (!problem) return;

        container.innerHTML = '';
        const fileName = problem.sgf_url.split('/').pop();
        const sgfUrl = "data/sgf/" + fileName;

        console.log("TsumegoManager: Loading " + sgfUrl);

        try {
            // Simple BasicPlayer usage - let WGo handle everything
            currentPlayer = new WGo.BasicPlayer(container, {
                sgfFile: sgfUrl,
                move: 0,
                markLastMove: true,
                layout: { top: [], right: [], left: [], bottom: [] }
            });
            
            if (nameLabel) {
                nameLabel.dataset.originalTitle = problem.name;
                nameLabel.textContent = localizeTsumegoTitle(problem.name);
            }
            
            console.log("TsumegoManager: Render complete");
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
