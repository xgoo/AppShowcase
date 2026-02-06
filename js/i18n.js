/**
 * i18n.js - 围棋工坊国际化模块
 * Supports: zh-CN (简体中文), en (English), zh-TW (繁體中文), ja (日本語)
 */

const I18n = {
    supportedLangs: ['zh-CN', 'en', 'zh-TW', 'ja'],
    currentLang: 'zh-CN',
    translations: {},
    
    /**
     * Initialize i18n - detect language and load translations
     */
    async init() {
        // Check URL param first, then localStorage, then browser language
        const urlLang = new URLSearchParams(window.location.search).get('lang');
        const storedLang = localStorage.getItem('lang');
        const browserLang = navigator.language || navigator.userLanguage;
        
        let lang = urlLang || storedLang || this.detectLang(browserLang);
        
        if (!this.supportedLangs.includes(lang)) {
            lang = 'zh-CN';
        }
        
        await this.setLang(lang, false);
        this.renderLangSwitcher();
    },
    
    /**
     * Detect closest supported language from browser preference
     */
    detectLang(browserLang) {
        if (!browserLang) return 'zh-CN';
        
        // Exact match
        if (this.supportedLangs.includes(browserLang)) {
            return browserLang;
        }
        
        // Prefix match (e.g., 'en-US' -> 'en', 'zh-TW' -> 'zh-TW')
        const prefix = browserLang.split('-')[0];
        
        if (prefix === 'zh') {
            // Check for Traditional Chinese regions
            if (['zh-TW', 'zh-HK', 'zh-MO'].includes(browserLang)) {
                return 'zh-TW';
            }
            return 'zh-CN';
        }
        
        if (prefix === 'ja') return 'ja';
        if (prefix === 'en') return 'en';
        
        return 'en'; // Default to English for unknown languages
    },
    
    /**
     * Load and apply a language
     */
    async setLang(lang, updateUrl = true) {
        if (!this.supportedLangs.includes(lang)) return;
        
        // Load translations if not cached
        if (!this.translations[lang]) {
            try {
                const response = await fetch(`locales/${lang}.json`);
                this.translations[lang] = await response.json();
            } catch (e) {
                console.error(`Failed to load ${lang} translations:`, e);
                return;
            }
        }
        
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Apply translations
        this.applyTranslations();
        
        // Notify TsumegoManager to update labels
        if (typeof TsumegoManager !== 'undefined' && TsumegoManager.updateLabels) {
            TsumegoManager.updateLabels();
        }
        
        // Update URL without reload (optional)
        if (updateUrl && window.history.replaceState) {
            const url = new URL(window.location);
            url.searchParams.set('lang', lang);
            window.history.replaceState({}, '', url);
        }
        
        // Update switcher active state
        document.querySelectorAll('.lang-option').forEach(el => {
            el.classList.toggle('active', el.dataset.lang === lang);
        });
    },
    
    /**
     * Get a translation by key path (e.g., 'nav.brand')
     */
    t(keyPath) {
        const keys = keyPath.split('.');
        let value = this.translations[this.currentLang];
        
        for (const key of keys) {
            if (value && typeof value === 'object') {
                value = value[key];
            } else {
                return keyPath; // Return key if not found
            }
        }
        
        return value || keyPath;
    },
    
    /**
     * Apply translations to all elements with data-i18n attribute
     */
    applyTranslations() {
        const t = this.translations[this.currentLang];
        if (!t) return;
        
        // Update document title
        document.title = t.meta?.title || document.title;
        
        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && t.meta?.description) {
            metaDesc.setAttribute('content', t.meta.description);
        }
        
        // Update all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = this.t(key);
            if (value && value !== key) {
                // Check if it contains HTML (like <strong>)
                if (value.includes('<')) {
                    el.innerHTML = value;
                } else {
                    el.textContent = value;
                }
            }
        });
        
        // Update placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const value = this.t(key);
            if (value && value !== key) {
                el.placeholder = value;
            }
        });
    },
    
    /**
     * Render language switcher in nav
     */
    renderLangSwitcher() {
        const nav = document.querySelector('.nav-links');
        if (!nav || document.querySelector('.lang-switcher')) return;
        
        const switcher = document.createElement('div');
        switcher.className = 'lang-switcher';
        
        const langNames = {
            'zh-CN': '简',
            'en': 'EN',
            'zh-TW': '繁',
            'ja': '日'
        };
        
        const fullNames = {
            'zh-CN': '简体中文',
            'en': 'English',
            'zh-TW': '繁體中文',
            'ja': '日本語'
        };
        
        // Create dropdown button
        const currentBtn = document.createElement('button');
        currentBtn.className = 'lang-current';
        currentBtn.textContent = langNames[this.currentLang];
        currentBtn.title = fullNames[this.currentLang];
        
        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'lang-dropdown';
        
        this.supportedLangs.forEach(lang => {
            const option = document.createElement('button');
            option.className = 'lang-option' + (lang === this.currentLang ? ' active' : '');
            option.dataset.lang = lang;
            option.textContent = fullNames[lang];
            option.addEventListener('click', () => {
                this.setLang(lang);
                currentBtn.textContent = langNames[lang];
                currentBtn.title = fullNames[lang];
                dropdown.classList.remove('show');
            });
            dropdown.appendChild(option);
        });
        
        currentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
        
        switcher.appendChild(currentBtn);
        switcher.appendChild(dropdown);
        nav.appendChild(switcher);
    }
};

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    I18n.init();
});
