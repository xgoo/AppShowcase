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

    document.querySelectorAll('.app-card').forEach(card => {
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
});

// Daniel Status Update Logic
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

document.addEventListener('DOMContentLoaded', updateDanielStatus);

// Tsumego Logic
let currentTsumegoData = [];

async function fetchTsumego() {
    const display = document.getElementById('tsumego-display');
    try {
        const response = await fetch('https://xapi.verywill.com/sgf_list_plus?cid=9&start=0&pageSize=10', {
            method: 'POST'
        });
        currentTsumegoData = await response.json();
        renderTsumego('初级');
    } catch (e) {
        display.innerHTML = '<div class="error">无法连接题库 API，请稍后再试。</div>';
    }
}

function renderTsumego(level) {
    const display = document.getElementById('tsumego-display');
    const nameLabel = document.getElementById('tsumego-name');
    const timeLabel = document.getElementById('tsumego-time');
    
    const problem = currentTsumegoData.find(p => p.name.includes(level));
    
    if (problem) {
        // Placeholder for the Go board - in real version, use WGo.js here
        display.innerHTML = '<div style="text-align:center; padding: 20px; color: #333;">' +
                           '<div style="font-size: 4rem; margin-bottom: 10px;">⚫⚪</div>' +
                           '<p>SGF 棋谱已就绪</p>' +
                           '<a href="https://www.verywill.com' + problem.sgf_url + '" target="_blank" style="color: #D4A853; text-decoration: underline;">下载 SGF 研究</a>' +
                           '</div>';
        nameLabel.textContent = problem.name;
        timeLabel.textContent = "更新时间: " + problem.input_time;
    }
}

// Tab Switching
document.querySelectorAll('.tsumego-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.tsumego-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderTsumego(tab.dataset.level);
    });
});

document.addEventListener('DOMContentLoaded', fetchTsumego);
