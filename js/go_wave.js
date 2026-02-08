(function() {
    // 围棋气韵 - 动态粒子波浪效果 (v75 响应式偏移版)
    // 容器: #hero-canvas-container

    var container = document.getElementById('hero-canvas-container');
    if (!container) return;

    var camera, scene, renderer;
    var particles, particle;
    var count = 0;

    var SEPARATION = 80;
    var AMOUNTX = 60;
    var AMOUNTY = 40;

    var target = new THREE.Vector3(0, 100, 0); // 【v77】注视点回调到 100 (抬头)
    var waveOffset = -450; 

    init();
    animate();

    function init() {
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 10000);
        updateCameraConfig(); // 初始化时根据设备设置视角和偏移

        scene = new THREE.Scene();

        particles = new Array();

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
        for (var ix = 0; ix < AMOUNTX; ix++) {
            for (var iy = 0; iy < AMOUNTY; iy++) {
                var isWhite = (ix + iy) % 2 === 0;
                var material = isWhite ? materialWhite : materialBlack;

                particle = particles[i++] = new THREE.Particle(material);
                particle.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
                particle.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
                scene.add(particle);
            }
        }

        renderer = new THREE.CanvasRenderer({ alpha: true }); 
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x0a0a0a, 0); 
        
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
    }

    function updateCameraConfig() {
        if (!container) return;
        var isMobile = container.clientWidth < 768;
        if (isMobile) {
            // 移动端：拉远镜头，偏移量保持 -450
            camera.position.z = 1400; 
            camera.position.y = 700; 
            waveOffset = -450;
        } else {
            // 桌面端：【v77 反向调整】
            // Camera Y: 1000 -> 400 (降低机位，平视，压低地平线)
            // WaveOffset: -750 (保持深潜)
            camera.position.z = 1000; 
            camera.position.y = 400; 
            waveOffset = -750; 
        }
    }

    function onWindowResize() {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        updateCameraConfig();
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        camera.lookAt(target);

        var i = 0;
        for (var ix = 0; ix < AMOUNTX; ix++) {
            for (var iy = 0; iy < AMOUNTY; iy++) {
                particle = particles[i++];
                
                // 使用动态 waveOffset
                particle.position.y = (Math.sin((ix + count) * 0.3) * 25) + (Math.sin((iy + count) * 0.5) * 25) + waveOffset;
                
                particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2;
            }
        }

        renderer.clear();
        renderer.render(scene, camera);
        count += 0.1;
    }
})();
