(function() {
    // 围棋气韵 - 动态粒子波浪效果 (固定视角版 v49)
    // 容器: #hero-canvas-container

    var container = document.getElementById('hero-canvas-container');
    if (!container) return;

    var camera, scene, renderer;
    var particles, particle;
    var count = 0;

    var windowHalfX = container.clientWidth / 2;
    var windowHalfY = container.clientHeight / 2;

    // 参数调整
    var SEPARATION = 80;
    var AMOUNTX = 60;
    var AMOUNTY = 40;

    init();
    animate();

    function init() {
        // 初始化相机
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 10000);
        
        // 【固定视角】高空俯瞰设定
        camera.position.z = 1000; 
        camera.position.y = 1000; // 高度锁定，上帝视角
        // camera.position.x 默认为 0，居中

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
            color: 0x222222, 
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
        renderer = new THREE.CanvasRenderer({ alpha: true }); 
        renderer.setSize(container.clientWidth, container.clientHeight);
        
        // 强制清除颜色，防残影
        renderer.setClearColor(0x0a0a0a, 0); 
        
        container.appendChild(renderer.domElement);

        // 【移除交互】不再监听鼠标/触摸事件，保持视角静止
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

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        // 【固定视角】不再随鼠标更新相机位置
        // 始终锁定看向场景中心
        camera.lookAt(scene.position);

        var i = 0;
        for (var ix = 0; ix < AMOUNTX; ix++) {
            for (var iy = 0; iy < AMOUNTY; iy++) {
                particle = particles[i++];
                
                // 核心算法：双重正弦波 (温柔版)
                particle.position.y = (Math.sin((ix + count) * 0.3) * 25) + (Math.sin((iy + count) * 0.5) * 25);
                particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2;
            }
        }

        // 强制清除画布
        renderer.clear();
        renderer.render(scene, camera);
        count += 0.1; // 动画速度
    }
})();
