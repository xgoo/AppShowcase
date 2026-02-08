(function() {
    // 围棋气韵 - 动态粒子波浪效果 (v80 双端精调版)
    // 容器: #hero-canvas-container

    var container = document.getElementById('hero-canvas-container');
    if (!container) return;

    var camera, scene, renderer;
    var particles = [], particle;
    var count = 0;

    // 参数配置 (默认值)
    var config = {
        sep: 80,
        amountX: 60,
        amountY: 40,
        camY: 500,
        camZ: 1000,
        targetY: 100,
        offset: -200,
        amp: 25
    };
    
    var targetVector = new THREE.Vector3(0, 0, 0);

    init();
    animate();

    function init() {
        // 1. 根据设备设定参数
        var isMobile = container.clientWidth < 768;
        if (isMobile) {
            // 移动端 (Steve 精调)
            config.sep = 72;
            config.camY = 290;
            config.camZ = 1418;
            config.targetY = 341;
            config.offset = -517;
            config.amp = 12;
        } else {
            // 桌面端 (Steve 精调)
            config.sep = 85;
            config.camY = 0;
            config.camZ = 1031;
            config.targetY = 129;
            config.offset = -541;
            config.amp = 25;
        }
        
        targetVector.y = config.targetY;

        // 2. 初始化场景
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 10000);
        camera.position.y = config.camY;
        camera.position.z = config.camZ;
        camera.lookAt(targetVector);

        scene = new THREE.Scene();

        // 3. 生成粒子 (使用 config.sep)
        var PI2 = Math.PI * 2;
        var materialWhite = new THREE.ParticleCanvasMaterial({
            color: 0xffffff,
            program: function (context) {
                context.beginPath();
                context.arc(0, 0, 1, 0, PI2, true);
                context.fill();
            }
        });
        var materialBlack = new THREE.ParticleCanvasMaterial({
            color: 0x222222, 
            program: function (context) {
                context.beginPath();
                context.arc(0, 0, 1, 0, PI2, true);
                context.fill();
            }
        });

        var i = 0;
        for (var ix = 0; ix < config.amountX; ix++) {
            for (var iy = 0; iy < config.amountY; iy++) {
                var isWhite = (ix + iy) % 2 === 0;
                var material = isWhite ? materialWhite : materialBlack;

                particle = new THREE.Particle(material);
                
                // 关键：位置计算使用 config.sep
                particle.position.x = ix * config.sep - ((config.amountX * config.sep) / 2);
                particle.position.z = iy * config.sep - ((config.amountY * config.sep) / 2);
                
                scene.add(particle);
                particles.push(particle);
            }
        }

        renderer = new THREE.CanvasRenderer({ alpha: true }); 
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x0a0a0a, 0); 
        
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        
        // Resize 时不重新生成粒子(耗性能)，只更新可能变化的相机参数? 
        // 但为了简单，这里假设用户不会在手机和桌面模式间频繁切换，所以只更新 aspect。
        // 如果真要完美响应 resize 导致的 isMobile 变化，需要 reload 页面。
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        // 始终锁定注视点
        camera.lookAt(targetVector);

        var i = 0;
        for (var ix = 0; ix < config.amountX; ix++) {
            for (var iy = 0; iy < config.amountY; iy++) {
                particle = particles[i++];
                
                // 核心算法：使用 config.amp 和 config.offset
                particle.position.y = (Math.sin((ix + count) * 0.3) * config.amp) + 
                                      (Math.sin((iy + count) * 0.5) * config.amp) + 
                                      config.offset;
                
                particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2;
            }
        }

        renderer.clear();
        renderer.render(scene, camera);
        count += 0.1;
    }
})();
