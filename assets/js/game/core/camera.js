// Camera & Canvas
Object.assign(TankGame.prototype, {
    setupCanvas() {
        this.canvas = document.getElementById('tankGameCanvas');
        if (!this.canvas) {
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.setupCamera();
        });
    },

    resizeCanvas() {
        // Use full window dimensions
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Update camera when canvas resizes
        this.setupCamera();
    },

    // Calculate proper offsets for player tank
    calculateOffsets() {
        // Hull centered on tank position
        this.playerTank.hullOffsetX = -this.playerTank.width / 2;
        this.playerTank.hullOffsetY = -this.playerTank.height / 2;

        // Turret centered on hull
        this.playerTank.turretOffsetX = -this.playerTank.turretWidth / 2;
        this.playerTank.turretOffsetY = -this.playerTank.turretHeight / 2;

        // Calculate enemy tank offsets
        this.enemyConfig = {
            width: TankGameConfig.enemy.width,
            height: TankGameConfig.enemy.height,
            speed: TankGameConfig.enemy.speed,
            shootCooldown: TankGameConfig.enemy.shootCooldown,
            color: TankGameConfig.enemy.color,
            hullOffsetX: -TankGameConfig.enemy.width / 2,
            hullOffsetY: -TankGameConfig.enemy.height / 2,
            turretWidth: TankGameConfig.enemy.turretWidth,
            turretHeight: TankGameConfig.enemy.turretHeight,
            turretOffsetX: -TankGameConfig.enemy.turretWidth / 2,
            turretOffsetY: -TankGameConfig.enemy.turretHeight / 2,
            barrelLength: TankGameConfig.enemy.barrelLength,
            barrelWidth: TankGameConfig.enemy.barrelWidth,
            barrelOffsetX: 0,
            barrelOffsetY: -12
        };
    },

    setupCamera() {
        // Camera is centered on player
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
        this.camera.offsetX = this.canvas.width / 2;
        this.camera.offsetY = this.canvas.height / 2;

        // Initialize camera position to player position
        this.camera.x = this.playerTank.x - this.camera.offsetX;
        this.camera.y = this.playerTank.y - this.camera.offsetY;

        // Clamp camera to world bounds
        this.clampCamera();
    },

    clampCamera() {
        // Prevent camera from showing outside world bounds
        const maxX = this.world.width - this.camera.width;
        const maxY = this.world.height - this.camera.height;

        this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
    },

    updateCamera() {
        // Calculate desired camera position
        const targetX = this.playerTank.x - this.camera.offsetX;
        const targetY = this.playerTank.y - this.camera.offsetY;

        // Smooth camera movement
        const lerpFactor = 0.1;
        this.camera.x += (targetX - this.camera.x) * lerpFactor;
        this.camera.y += (targetY - this.camera.y) * lerpFactor;

        // Clamp camera to world bounds
        this.clampCamera();
    }
});
