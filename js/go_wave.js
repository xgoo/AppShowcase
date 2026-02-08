(function() {
    // 围棋气韵 - 动态粒子波浪效果
    // 移植自: go_wave_demo.html
    // 容器: #hero-canvas-container

    var container = document.getElementById('hero-canvas-container');
    if (!container) return;

    var camera, scene, renderer;
    var particles, particle;
    var count = 0;
    var mouseX = 0, mouseY = 0;

    var windowHalfX = container.clientWidth / 2;
    var windowHalfY = container.clientHeight / 2;

    // 参数调整：更密集的网格，更适合 Banner 区域
    var SEPARATION = 80;
    var AMOUNTX = 60; // 增加宽度覆盖
    var AMOUNTY = 40; // 深度适中

    init();
    animate();

    function init() {
        // 初始化相机
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 10000);
        camera.position.z = 1000; // 俯瞰视角

        scene = new THREE.Scene();

        particles = new Array();

        var PI2 = Math.PI * 2;

        // 【白子材质】纯净明亮
        var materialWhite = new THREE.ParticleCanvasMaterial({
            color: 0xffffff,
            program: function (context) {
                context.beginPath();
                context.arc(0, 0, 1, 0, PI2, true);
                context.fill();
            }
        });

        // 【黑子材质】哑光深灰，无描边，依靠与深黑背景的微妙色差
        var materialBlack = new THREE.ParticleCanvasMaterial({
            color: 0x222222, // 稍微提亮一点，确保在 #0a0a0a 背景上可见
            program: function (context) {
                context.beginPath();
                context.arc(0, 0, 1, 0, PI2, true);
                context.fill();
            }
        });

        // 生成粒子阵列 (棋盘网格)
        var i = 0;
        for (var ix = 0; ix < AMOUNTX; ix++) {
            for (var iy = 0; iy < AMOUNTY; iy++) {
                // 算法：交替生成黑白子
                var isWhite = (ix + iy) % 2 === 0;
                var material = isWhite ? materialWhite : materialBlack;

                particle = particles[i++] = new THREE.Particle(material);
                particle.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
                particle.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
                scene.add(particle);
            }
        }

        // 渲染器
        renderer = new THREE.CanvasRenderer({ alpha: true }); // 开启透明，以便融合背景渐变
        renderer.setSize(container.clientWidth, container.clientHeight);
        
        // 关键：虽然开启了 alpha，但为了防残影，我们手动管理清除
        // 这里尝试透明背景，让 CSS 的渐变透出来，看效果是否更好
        // 如果有残影，再切回 setClearColor 方案
        renderer.setClearColor(0x0a0a0a, 0); // 完全透明
        
        container.appendChild(renderer.domElement);

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);
        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        if (!container) return;
        windowHalfX = container.clientWidth / 2;
        windowHalfY = container.clientHeight / 2;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function onDocumentMouseMove(event) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    function onDocumentTouchStart(event) {
        if (event.touches.length > 1) {
            // event.preventDefault(); // 移除 preventDefault 以允许页面滚动
            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;
        }
    }

    function onDocumentTouchMove(event) {
        if (event.touches.length == 1) {
            // event.preventDefault();
            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        // 相机跟随鼠标轻微晃动
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        var i = 0;
        for (var ix = 0; ix < AMOUNTX; ix++) {
            for (var iy = 0; iy < AMOUNTY; iy++) {
                particle = particles[i++];
                
                // 核心算法：双重正弦波 (温柔版)
                // 振幅 25，呼吸感
                particle.position.y = (Math.sin((ix + count) * 0.3) * 25) + (Math.sin((iy + count) * 0.5) * 25);
                particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2;
            }
        }

        // 强制清除画布，防止透明背景下的残影
        renderer.clear();
        renderer.render(scene, camera);
        count += 0.1; // 动画速度
    }
})();
