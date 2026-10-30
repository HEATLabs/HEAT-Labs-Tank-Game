// Game Flow
Object.assign(TankGame.prototype, {
    startGame() {
        // If game is paused, resume it
        if (this.gamePaused) {
            this.togglePause();
            return;
        }

        this.resetGame();
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;

        // Start survival timer
        this.startTime = performance.now();
        this.survivalTime = 0;

        // Position player in center of world
        this.playerTank.x = this.world.width / 2;
        this.playerTank.y = this.world.height / 2;

        // Initialize camera
        this.setupCamera();

        // Hide main menu and show game
        const mainMenuOverlay = document.getElementById('mainMenuOverlay');
        const startOverlay = document.getElementById('startOverlay');
        const gameOverOverlay = document.getElementById('gameOverOverlay');

        if (mainMenuOverlay) {
            mainMenuOverlay.style.display = 'none';
        }
        if (startOverlay) {
            startOverlay.style.display = 'none';
        }
        if (gameOverOverlay) {
            gameOverOverlay.style.display = 'none';
        }

        // Show fullscreen controls
        this.showFullscreenControls();

        // Start wave system
        this.startFirstWave();

        // Update button states
        this.updateButtonStates();

        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    togglePause() {
        if (!this.gameRunning || this.gameOver) return;

        this.gamePaused = !this.gamePaused;

        if (!this.gamePaused) {
            // Resume game
            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));
        }

        this.updateButtonStates();
    },

    resetGame() {
        this.enemies = [];
        this.particles = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.enemySpawnTimer = 0;
        this.wave = 1;
        this.score = 0;
        this.playerHealth = TankGameConfig.player.health;
        this.gameOver = false;
        this.gamePaused = false;
        this.keys = {};
        this.totalKills = 0;
        this.healthPacksCollected = 0;
        this.isMouseDown = false;
        this.autoFireTimer = 0;
        this.lastFireTime = 0;
        this.survivalTime = 0;
        this.startTime = 0;
        this.indicatorPhase = 0;
        this.screenShakeAmount = 0;
        this.screenShakeDuration = 0;

        // Reset wave system
        this.waveSystem.currentWave = 1;
        this.waveSystem.waveEnemiesTarget = 0;
        this.waveSystem.waveEnemiesSpawned = 0;
        this.waveSystem.waveTimer = 0;
        this.waveSystem.waveActive = false;
        this.waveSystem.waveStarting = false;
        this.waveSystem.waveStartTimer = 0;
        this.waveSystem.scalingFactor = 1;

        this.playerTank.x = this.world.width / 2;
        this.playerTank.y = this.world.height / 2;
        this.playerTank.rotation = 0;
        this.playerTank.turretRotation = 0;
        this.playerTank.velocityX = 0;
        this.playerTank.velocityY = 0;
        this.playerTank.targetRotation = 0;
        this.playerTank.currentSpeed = 0;

        // Regenerate rocks and health packs
        this.generateRocks();
        this.generateHealthPacks();

        // Clear respawn timers
        this.healthPackRespawnTimers = [];

        // Clear all notifications
        this.notificationSystem.clearAll();

        // Hide wave timer
        if (this.waveTimerElement) {
            this.waveTimerElement.style.display = 'none';
        }

        // Hide fullscreen controls when resetting game
        this.hideFullscreenControls();

        // Don't exit fullscreen
        this.applyFullscreenStyles();
        this.setupCamera();
        this.updateUI();
        this.updateButtonStates();
    }
});
