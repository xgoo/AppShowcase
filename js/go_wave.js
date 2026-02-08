(function() {
    // 围棋气韵 - 动态粒子波浪效果 (v68 终极修复版)
    // 参数：移动端自适应，波浪偏移 -200
    
    var container = document.getElementById('hero-canvas-container');
    if (!container) return;

    var camera, scene, renderer;
    var particles, particle;
    var count = 0;

    var SEPARATION = 80;
    var AMOUNTX = 60;
    var AMOUNTY = 40;

    var target = new THREE.Vector3(0, 100, 0);

    init();
    animate();

    function init() {
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 10000);
        updateCameraConfig();

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
            // 移动端：拉远镜头
            camera.position.z = 1400; 
            camera.position.y = 700; 
        } else {
            // 桌面端
            camera.position.z = 1000; 
            camera.position.y = 600; 
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
                
                // 【v74 最佳位置】
                // 偏移量 -450：大幅下沉，确保波浪完全位于“探索应用”按钮下方
                particle.position.y = (Math.sin((ix + count) * 0.3) * 25) + (Math.sin((iy + count) * 0.5) * 25) - 450;
                
                particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2;
            }
        }

        renderer.clear();
        renderer.render(scene, camera);
        count += 0.1;
    }
})();
