// Tank Game core class
class TankGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.gamePaused = false;
        this.lastTime = 0;
        this.enemies = [];
        this.particles = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.enemySpawnTimer = 0;
        this.wave = 1;
        this.score = 0;
        this.playerHealth = TankGameConfig.player.health;
        this.gameOver = false;
        this.keys = {};
        this.totalKills = 0;
        this.healthPacksCollected = 0;
        this.isFullscreen = true;
        this.fullscreenControlsVisible = false;
        this.fullscreenControlsTimeout = null;
        this.survivalTime = 0;
        this.startTime = 0;

        // Screen shake effect
        this.screenShakeAmount = 0;
        this.screenShakeDuration = 0;

        // Auto-fire properties
        this.isMouseDown = false;
        this.autoFireTimer = 0;
        this.autoFireInterval = TankGameConfig.autoFire.interval;
        this.lastFireTime = 0;

        // Wave system
        this.waveSystem = {
            currentWave: 1,
            waveEnemiesTarget: 0,
            waveEnemiesSpawned: 0,
            waveTimeLimit: TankGameConfig.wave.timeLimit,
            waveTimer: 0,
            waveActive: false,
            waveStarting: false,
            waveStartCountdown: TankGameConfig.wave.startCountdown,
            waveStartTimer: 0,
            waveEnemyCounts: TankGameConfig.wave.waveEnemyCounts,
            baseEnemyIncrement: TankGameConfig.wave.baseEnemyIncrement,
            scalingFactor: TankGameConfig.wave.scalingFactor
        };

        // Camera system for centering player
        this.camera = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            offsetX: 0,
            offsetY: 0
        };

        // Game world dimensions
        this.world = {
            width: TankGameConfig.game.world.width,
            height: TankGameConfig.game.world.height
        };

        // Map border configuration
        this.borderSettings = TankGameConfig.border;

        // Rocks/obstacles configuration
        this.rocks = [];
        this.rockSettings = TankGameConfig.rocks;

        // Health packs configuration
        this.healthPacks = [];
        this.healthPackSettings = TankGameConfig.healthPacks;

        // Track health pack respawn timers
        this.healthPackRespawnTimers = [];

        // Enemy indicators configuration
        this.enemyIndicators = TankGameConfig.indicators;

        // Player tank configuration
        this.playerTank = {
            x: this.world.width / 2,
            y: this.world.height / 2,
            width: TankGameConfig.player.width,
            height: TankGameConfig.player.height,
            speed: TankGameConfig.player.speed,
            rotation: 0,
            turretRotation: 0,
            lastShot: 0,
            shootCooldown: TankGameConfig.player.shootCooldown,
            color: TankGameConfig.player.color,
            hullOffsetX: 0,
            hullOffsetY: 0,
            // Turret configuration
            turretWidth: TankGameConfig.player.turretWidth,
            turretHeight: TankGameConfig.player.turretHeight,
            turretOffsetX: 0,
            turretOffsetY: 0,
            // Gun barrel configuration
            barrelLength: TankGameConfig.player.barrelLength,
            barrelWidth: TankGameConfig.player.barrelWidth,
            barrelOffsetX: 0,
            barrelOffsetY: -15,

            // Smooth movement properties
            velocityX: 0,
            velocityY: 0,
            targetRotation: 0,
            rotationSpeed: TankGameConfig.player.rotationSpeed,
            acceleration: TankGameConfig.player.acceleration,
            deceleration: TankGameConfig.player.deceleration,
            maxSpeed: TankGameConfig.player.maxSpeed,
            currentSpeed: 0
        };

        // Game settings
        this.settings = {
            enemySpawnRate: TankGameConfig.spawning.enemySpawnRate,
            maxEnemies: TankGameConfig.spawning.maxEnemies,
            bulletSpeed: TankGameConfig.physics.bulletSpeed,
            enemyBulletSpeed: TankGameConfig.physics.enemyBulletSpeed,
            particleLifetime: TankGameConfig.physics.particleLifetime,
            debugMode: TankGameConfig.game.debugMode,
            rapidFire: TankGameConfig.game.rapidFire,
            enemySpawnDistance: TankGameConfig.ai.enemySpawnDistance,
            enemyDespawnDistance: TankGameConfig.ai.enemyDespawnDistance,
            enemyCollisionRepulsion: TankGameConfig.physics.enemyCollisionRepulsion,
            enemySeparationDistance: TankGameConfig.physics.enemySeparationDistance,
            enemyObstacleDetectionRange: TankGameConfig.ai.enemyObstacleDetectionRange,
            enemyPathfindingAttempts: TankGameConfig.ai.enemyPathfindingAttempts,
            enemySmoothMovement: TankGameConfig.ai.enemySmoothMovement,
            enemyAvoidanceForce: TankGameConfig.physics.enemyAvoidanceForce,
            enemyPursuitForce: TankGameConfig.physics.enemyPursuitForce,
            enemyWanderForce: TankGameConfig.physics.enemyWanderForce,
            enemyRotationSpeed: TankGameConfig.enemy.rotationSpeed,
            enemyTurretTrackingSpeed: TankGameConfig.enemy.turretTrackingSpeed,
            enemyMemorySize: TankGameConfig.ai.enemyMemorySize,
            enemyStuckThreshold: TankGameConfig.ai.enemyStuckThreshold,
            enemyStuckEscapeForce: TankGameConfig.physics.enemyStuckEscapeForce,
            enemyShootingRange: TankGameConfig.ai.enemyShootingRange,
            enemyShootingCooldown: TankGameConfig.ai.enemyShootingCooldown,
            enemyShootingAccuracy: TankGameConfig.ai.enemyShootingAccuracy,
            enemyShootingRandomness: TankGameConfig.ai.enemyShootingRandomness
        };

        // Score configuration
        this.scoreSystem = TankGameConfig.score;

        // Button elements cache
        this.buttonElements = {
            pause: null,
            startOverlay: null,
            restartOverlay: null,
            fullscreen: null,
            exitFullscreen: null,
            fullscreenPause: null,
            continueGameButton: null,
            newGameButton: null,
            settingsButton: null,
            exitButton: null,
            backToMainMenu: null
        };

        // Wave timer element
        this.waveTimerElement = null;

        // Animation for indicators
        this.indicatorPhase = 0;

        // Notification system
        this.notificationSystem = new NotificationSystem(this);

        this.init();
    }

    init() {
        // main.js loads modules dynamically, so DOMContentLoaded may already have fired
        const onReady = () => {
            this.setupCanvas();
            this.setupEventListeners();
            this.calculateOffsets();
            this.setupCamera();
            this.generateRocks();
            this.generateHealthPacks();
            this.createWaveTimerElement();
            this.createFullscreenControls();
            this.updateButtonStates();

            // Show main menu by default
            const mainMenuOverlay = document.getElementById('mainMenuOverlay');
            if (mainMenuOverlay) {
                mainMenuOverlay.style.display = 'flex';
            }

            // Apply fullscreen styles immediately
            this.applyFullscreenStyles();

            // Hide fullscreen controls initially
            this.hideFullscreenControls();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }
}