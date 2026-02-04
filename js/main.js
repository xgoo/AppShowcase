// 围棋工坊 - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar background on scroll
    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(10, 10, 10, 0.95)';
        } else {
            nav.style.background = 'rgba(10, 10, 10, 0.8)';
        }
    });

    // Animate cards on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.app-card, .roadmap-item').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Stats counter animation
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const numericValue = parseInt(finalValue.replace(/\D/g, ''));
                const suffix = finalValue.replace(/[\d]/g, '');
                
                let current = 0;
                const increment = numericValue / 30;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= numericValue) {
                        target.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        target.textContent = Math.floor(current) + suffix;
                    }
                }, 50);
                
                statsObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => statsObserver.observe(stat));

    // Daniel Status Update
    updateDanielStatus();
    // Tsumego Logic
    fetchTsumego();
});

async function updateDanielStatus() {
    const statusContainer = document.querySelector('#daniel-status .status-text');
    try {
        const response = await fetch('data/status.json');
        const data = await response.json();
        if (data && data.status) {
            statusContainer.textContent = "丹尼尔 (Daniel) 的日志: " + data.status;
        }
    } catch (e) {
        statusContainer.textContent = "丹尼尔 (Daniel): 正在后台努力工作中... 🤖";
    }
}

// Tsumego Integration
let currentTsumegoData = [];

async function fetchTsumego() {
    try {
        // Load from local cache to avoid CORS
        const response = await fetch('data/tsumego.json');
        currentTsumegoData = await response.json();
        renderTsumego('初级');
    } catch (e) {
        console.error("Tsumego fetch error:", e);
        const display = document.getElementById('tsumego-display');
        display.innerHTML = '<div style="color: #D4A853">暂时无法获取棋谱数据，请检查网络。</div>';
    }
}

function renderTsumego(level) {
    const nameLabel = document.getElementById('tsumego-name');
    const timeLabel = document.getElementById('tsumego-time');
    const container = document.getElementById('tsumego-display');
    
    const problem = currentTsumegoData.find(p => p.name.includes(level));
    
    if (problem && window.besogo) {
        container.innerHTML = ''; // Clear container
        
        // Construct full SGF URL (Using the base URL provided by Steve)
        // We add a timestamp to bypass any caching during debugging
        const sgfUrl = "https://xsgf.verywill.com" + problem.sgf_url + "?t=" + new Date().getTime();
        
        console.log("Loading SGF from:", sgfUrl);

        // Initialize Besogo Board
        besogo.create(container, {
            path: sgfUrl,
            panel: 'none', 
            coord: 'western',
            tool: 'auto'
        });

        // Add an error listener or check if container is still empty after a delay
        setTimeout(() => {
            if (container.innerHTML.includes('Error') || container.innerText.trim() === '') {
                container.innerHTML = '<div style="padding: 20px; color: var(--color-accent);">' +
                                   '<div style="font-size: 3rem; margin-bottom: 10px;">🚧</div>' +
                                   '<p>棋谱服务器正在维护中 (502)</p>' +
                                   '<p style="font-size: 0.8rem; opacity: 0.7;">拍档丹尼尔与 Steve 正在全力抢修证书配置...</p>' +
                                   '</div>';
            }
        }, 2000);

        nameLabel.textContent = problem.name;
        timeLabel.textContent = "更新时间: " + problem.input_time;
    }
}

// Tab Switching Listener
document.querySelectorAll('.tsumego-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.tsumego-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderTsumego(tab.dataset.level);
    });
});
