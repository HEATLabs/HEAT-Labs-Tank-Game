// Tank Game JavaScript
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
        document.addEventListener('DOMContentLoaded', () => {
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
        });
    }

    applyFullscreenStyles() {
        // Always apply fullscreen styles
        const container = document.querySelector('.tank-game-section');
        const canvasContainer = document.querySelector('.tank-game-canvas-container');

        if (container && canvasContainer) {
            container.classList.add('tank-game-fullscreen');
        }
    }

    createFullscreenControls() {
        // Create fullscreen control bar
        const fullscreenBar = document.createElement('div');
        fullscreenBar.className = 'fullscreen-controls-bar';
        fullscreenBar.id = 'fullscreenControlsBar';

        // Create stats container
        const statsContainer = document.createElement('div');
        statsContainer.className = 'fullscreen-stats';

        // Create all stat items
        const statItems = [{
                id: 'fullscreenScore',
                label: 'Score',
                value: '0'
            },
            {
                id: 'fullscreenWave',
                label: 'Wave',
                value: '1'
            },
            {
                id: 'fullscreenHealth',
                label: 'Health',
                value: '100'
            },
            {
                id: 'fullscreenEnemies',
                label: 'Enemies',
                value: '0'
            },
            {
                id: 'fullscreenKills',
                label: 'Kills',
                value: '0'
            },
            {
                id: 'fullscreenHealthPacks',
                label: 'Health Packs',
                value: '0'
            },
            {
                id: 'fullscreenSurvivalTime',
                label: 'Survival Time',
                value: '00:00'
            }
        ];

        statItems.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'fullscreen-stat-item';

            const statValue = document.createElement('div');
            statValue.className = 'fullscreen-stat-value';
            statValue.id = stat.id;
            statValue.textContent = stat.value;

            const statLabel = document.createElement('div');
            statLabel.className = 'fullscreen-stat-label';
            statLabel.textContent = stat.label;

            statItem.appendChild(statValue);
            statItem.appendChild(statLabel);
            statsContainer.appendChild(statItem);
        });

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'fullscreen-buttons';

        // Pause button
        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'tank-game-btn secondary square';
        pauseBtn.id = 'fullscreenPause';
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';

        buttonsContainer.appendChild(pauseBtn);

        fullscreenBar.appendChild(statsContainer);
        fullscreenBar.appendChild(buttonsContainer);

        // Add to body
        document.body.appendChild(fullscreenBar);

        // Cache button elements
        this.buttonElements.fullscreenPause = pauseBtn;

        // Add event listeners
        pauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePause();
            this.removeButtonActiveState(pauseBtn);
        });
    }

    // Show fullscreen controls
    showFullscreenControls() {
        const controlsBar = document.getElementById('fullscreenControlsBar');
        if (!controlsBar) return;

        controlsBar.classList.add('visible');
        this.fullscreenControlsVisible = true;

        // Clear previous timeout
        if (this.fullscreenControlsTimeout) {
            clearTimeout(this.fullscreenControlsTimeout);
        }
    }

    // Hide fullscreen controls
    hideFullscreenControls() {
        const controlsBar = document.getElementById('fullscreenControlsBar');
        if (!controlsBar) return;

        controlsBar.classList.remove('visible');
        this.fullscreenControlsVisible = false;

        // Clear previous timeout
        if (this.fullscreenControlsTimeout) {
            clearTimeout(this.fullscreenControlsTimeout);
        }
    }

    createWaveTimerElement() {
        // Create wave timer element
        this.waveTimerElement = document.createElement('div');
        this.waveTimerElement.className = 'wave-timer';
        this.waveTimerElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            font-family: 'Arial', sans-serif;
            font-weight: bold;
            font-size: 16px;
            z-index: 100;
            pointer-events: none;
            border: 2px solid #4CAF50;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            display: none;
        `;
        this.canvas.parentElement.appendChild(this.waveTimerElement);
    }

    updateWaveTimerDisplay() {
        if (!this.waveTimerElement || !this.gameRunning) return;

        if (this.waveSystem.waveStarting) {
            const countdown = Math.ceil(this.waveSystem.waveStartCountdown - this.waveSystem.waveStartTimer / 1000);
            const formattedCountdown = countdown < 10 ? `0${countdown}` : countdown;
            this.waveTimerElement.textContent = `Wave ${this.waveSystem.currentWave} starts in ${formattedCountdown} seconds!`;
            this.waveTimerElement.style.display = 'block';
            this.waveTimerElement.style.borderColor = '#FF9800'; // Orange for countdown
        } else if (this.waveSystem.waveActive) {
            const timeLeft = Math.ceil(this.waveSystem.waveTimer / 1000);
            const formattedTimeLeft = timeLeft < 10 ? `0${timeLeft}` : timeLeft;
            this.waveTimerElement.textContent = `Wave ${this.waveSystem.currentWave} - ${formattedTimeLeft}s remaining`;
            this.waveTimerElement.style.display = 'block';
            this.waveTimerElement.style.borderColor = timeLeft < 10 ? '#F44336' : '#4CAF50'; // Red when under 10s
        } else {
            this.waveTimerElement.style.display = 'none';
        }
    }

    updateFullscreenStats() {
        if (!this.isFullscreen) return;

        const stats = {
            fullscreenScore: this.score,
            fullscreenWave: this.waveSystem.currentWave,
            fullscreenHealth: this.playerHealth,
            fullscreenEnemies: this.enemies.length,
            fullscreenKills: this.totalKills,
            fullscreenHealthPacks: this.healthPacksCollected,
            fullscreenSurvivalTime: this.formatTime(this.survivalTime)
        };

        for (const [id, value] of Object.entries(stats)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    }

    updateButtonStates() {
        // Cache button elements
        this.buttonElements.continueGameButton = document.getElementById('continueGameButton');
        this.buttonElements.newGameButton = document.getElementById('newGameButton');
        this.buttonElements.settingsButton = document.getElementById('settingsButton');
        this.buttonElements.exitButton = document.getElementById('exitButton');
        this.buttonElements.backToMainMenu = document.getElementById('backToMainMenu');
        this.buttonElements.startOverlay = document.getElementById('startGameFromOverlay');
        this.buttonElements.restartOverlay = document.getElementById('restartFromOverlay');

        // Update fullscreen controls
        this.updateFullscreenControls();
    }

    updateFullscreenControls() {
        if (!this.isFullscreen) return;

        const fullscreenPauseBtn = this.buttonElements.fullscreenPause;
        if (fullscreenPauseBtn) {
            if (this.gamePaused) {
                fullscreenPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                fullscreenPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        }
    }

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
    }

    resizeCanvas() {
        // Use full window dimensions
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Update camera when canvas resizes
        this.setupCamera();
    }

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
    }

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
    }

    clampCamera() {
        // Prevent camera from showing outside world bounds
        const maxX = this.world.width - this.camera.width;
        const maxY = this.world.height - this.camera.height;

        this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
    }

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

    setupEventListeners() {
        // Get button elements
        this.updateButtonStates();

        // Main menu buttons
        if (this.buttonElements.continueGameButton) {
            this.buttonElements.continueGameButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMessage("Feature Coming Soon");
                this.removeButtonActiveState(this.buttonElements.continueGameButton);
            });
        }

        if (this.buttonElements.newGameButton) {
            this.buttonElements.newGameButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.startGame();
                this.removeButtonActiveState(this.buttonElements.newGameButton);
            });
        }

        if (this.buttonElements.settingsButton) {
            this.buttonElements.settingsButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMessage("Feature Coming Soon");
                this.removeButtonActiveState(this.buttonElements.settingsButton);
            });
        }

        if (this.buttonElements.exitButton) {
            this.buttonElements.exitButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMessage("Feature Coming Soon");
                this.removeButtonActiveState(this.buttonElements.exitButton);
            });
        }

        if (this.buttonElements.backToMainMenu) {
            this.buttonElements.backToMainMenu.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMainMenu();
                this.removeButtonActiveState(this.buttonElements.backToMainMenu);
            });
        }

        // Overlay buttons
        if (this.buttonElements.startOverlay) {
            this.buttonElements.startOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.startGame();
                this.removeButtonActiveState(this.buttonElements.startOverlay);
            });
        }

        if (this.buttonElements.restartOverlay) {
            this.buttonElements.restartOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.startGame();
                this.removeButtonActiveState(this.buttonElements.restartOverlay);
            });
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameRunning || this.gameOver) {
                this.keys[e.key.toLowerCase()] = true;

                if (e.key === ' ') {
                    e.preventDefault();
                    if (!this.keys[' ']) {
                        this.shoot();
                    }
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse controls for turret
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameRunning && !this.gameOver) return;

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left + this.camera.x;
            const mouseY = e.clientY - rect.top + this.camera.y;

            // Calculate angle from tank to mouse
            const dx = mouseX - this.playerTank.x;
            const dy = mouseY - this.playerTank.y;
            this.playerTank.turretRotation = Math.atan2(dy, dx);
        });

        // Mouse click to shoot
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.gameRunning && !this.gameOver && !this.gamePaused) {
                e.preventDefault();
                this.isMouseDown = true;
                this.autoFireTimer = 0;
                this.lastFireTime = performance.now();
                // Fire immediately on click
                this.shoot();
            }
        });

        // Mouse up to stop auto-fire
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.gameRunning && !this.gameOver && !this.gamePaused) {
                e.preventDefault();
                this.isMouseDown = false;
            }
        });

        // Mouse leave canvas, stop auto-fire
        this.canvas.addEventListener('mouseleave', (e) => {
            this.isMouseDown = false;
        });

        // Mouse click to shoot
        this.canvas.addEventListener('click', (e) => {
            if (this.gameRunning && !this.gameOver && !this.gamePaused) {
                e.preventDefault();
            }
        });

        // Game control buttons
        if (this.buttonElements.pause) {
            this.buttonElements.pause.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePause();
                this.removeButtonActiveState(this.buttonElements.pause);
            });
        }

        // Pause with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.gameRunning && !this.gameOver) {
                e.preventDefault();
                this.togglePause();
            }
        });

        // Initial button state
        this.updateButtonStates();

        // Add global mouseup listener
        document.addEventListener('mouseup', (e) => {
            this.clearAllButtonActiveStates();
        });

        // Add touchend listener
        document.addEventListener('touchend', (e) => {
            this.clearAllButtonActiveStates();
        });
    }

    // Remove active state from a specific button
    removeButtonActiveState(button) {
        if (!button) return;

        // Blur the button to remove focus
        button.blur();

        // Remove any active styling classes
        button.classList.remove('active');
        button.classList.remove('pressed');

        // Force a reflow to ensure styles are updated
        void button.offsetWidth;
    }

    // Clear active states from all buttons
    clearAllButtonActiveStates() {
        // Get all tank game buttons
        const buttons = document.querySelectorAll('.tank-game-btn');
        buttons.forEach(button => {
            this.removeButtonActiveState(button);
        });

        // Also handle the fullscreen pause button
        if (this.buttonElements.fullscreenPause) {
            this.removeButtonActiveState(this.buttonElements.fullscreenPause);
        }
    }

    showMainMenu() {
        // Hide game overlays
        const gameOverOverlay = document.getElementById('gameOverOverlay');
        const startOverlay = document.getElementById('startOverlay');
        const mainMenuOverlay = document.getElementById('mainMenuOverlay');

        if (gameOverOverlay) gameOverOverlay.style.display = 'none';
        if (startOverlay) startOverlay.style.display = 'none';
        if (mainMenuOverlay) mainMenuOverlay.style.display = 'flex';

        // Stop game
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;

        // Hide fullscreen controls
        this.hideFullscreenControls();

        // Hide wave timer
        if (this.waveTimerElement) {
            this.waveTimerElement.style.display = 'none';
        }
        this.notificationSystem.clearAll();
    }

    // Generate random rocks with irregular shapes
    generateRocks() {
        this.rocks = [];
        const maxAttempts = this.rockSettings.count * 10;
        let attempts = 0;
        let rocksGenerated = 0;

        // Calculate minimum safe distance from edges
        const edgeBuffer = this.rockSettings.edgeBuffer;
        const maxRockSize = this.rockSettings.maxSize;
        const minPassageWidth = this.rockSettings.minPassageWidth;

        // Calculate safe spawn boundaries
        const minX = edgeBuffer + maxRockSize / 2;
        const maxX = this.world.width - edgeBuffer - maxRockSize / 2;
        const minY = edgeBuffer + maxRockSize / 2;
        const maxY = this.world.height - edgeBuffer - maxRockSize / 2;

        while (rocksGenerated < this.rockSettings.count && attempts < maxAttempts) {
            attempts++;

            // Generate random position within safe boundaries
            const x = Math.random() * (maxX - minX) + minX;
            const y = Math.random() * (maxY - minY) + minY;

            // Avoid spawning rocks too close to player's starting position
            const dx = x - this.playerTank.x;
            const dy = y - this.playerTank.y;
            const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

            if (distanceToPlayer < this.rockSettings.playerBuffer) {
                continue; // Too close to player start
            }

            // Check minimum spacing from other rocks
            let tooClose = false;
            for (const rock of this.rocks) {
                const rockDx = x - rock.x;
                const rockDy = y - rock.y;
                const distance = Math.sqrt(rockDx * rockDx + rockDy * rockDy);

                if (distance < this.rockSettings.spacing) {
                    tooClose = true;
                    break;
                }
            }

            if (tooClose) {
                continue;
            }

            // Check if rock is too close to edges considering its size
            // Left edge
            if (x - maxRockSize / 2 < edgeBuffer) {
                continue;
            }
            // Right edge
            if (x + maxRockSize / 2 > this.world.width - edgeBuffer) {
                continue;
            }
            // Top edge
            if (y - maxRockSize / 2 < edgeBuffer) {
                continue;
            }
            // Bottom edge
            if (y + maxRockSize / 2 > this.world.height - edgeBuffer) {
                continue;
            }

            // Check if rock blocks passage between edges
            const leftDistance = x - maxRockSize / 2;
            const rightDistance = this.world.width - (x + maxRockSize / 2);
            const topDistance = y - maxRockSize / 2;
            const bottomDistance = this.world.height - (y + maxRockSize / 2);

            // Ensure at least one direction has enough clearance for 2 tanks
            const hasClearPath =
                leftDistance >= minPassageWidth ||
                rightDistance >= minPassageWidth ||
                topDistance >= minPassageWidth ||
                bottomDistance >= minPassageWidth;

            if (!hasClearPath) {
                continue; // Rock blocks all passages
            }

            // Generate rock size
            const size = this.rockSettings.minSize + Math.random() *
                (this.rockSettings.maxSize - this.rockSettings.minSize);

            // Generate rock shape
            const points = this.generateRockShape(size);

            // Generate rock color with variation
            const color = this.getRandomRockColor();

            // Create rock
            this.rocks.push({
                x,
                y,
                size,
                points,
                color,
                radius: size / 2 * 1.2
            });

            rocksGenerated++;
        }
    }

    // Generate random health packs around the map
    generateHealthPacks() {
        this.healthPacks = [];
        this.healthPackRespawnTimers = [];

        const maxAttempts = this.healthPackSettings.count * 10;
        let attempts = 0;
        let packsGenerated = 0;

        while (packsGenerated < this.healthPackSettings.count && attempts < maxAttempts) {
            attempts++;

            // Generate random position
            const x = Math.random() * (this.world.width - 100) + 50;
            const y = Math.random() * (this.world.height - 100) + 50;

            // Avoid spawning health packs too close to player's starting position
            const dx = x - this.playerTank.x;
            const dy = y - this.playerTank.y;
            const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

            if (distanceToPlayer < this.healthPackSettings.minDistanceFromPlayer) {
                continue; // Too close to player start
            }

            // Check minimum spacing from other health packs
            let tooClose = false;
            for (const pack of this.healthPacks) {
                const packDx = x - pack.x;
                const packDy = y - pack.y;
                const distance = Math.sqrt(packDx * packDx + packDy * packDy);

                if (distance < this.healthPackSettings.spacing) {
                    tooClose = true;
                    break;
                }
            }

            if (tooClose) {
                continue;
            }

            // Check minimum spacing from rocks
            for (const rock of this.rocks) {
                const rockDx = x - rock.x;
                const rockDy = y - rock.y;
                const distance = Math.sqrt(rockDx * rockDx + rockDy * rockDy);

                if (distance < rock.radius + 50) {
                    tooClose = true;
                    break;
                }
            }

            if (tooClose) {
                continue;
            }

            // Generate health pack size
            const size = this.healthPackSettings.minSize + Math.random() *
                (this.healthPackSettings.maxSize - this.healthPackSettings.minSize);

            // Create health pack
            this.healthPacks.push({
                x,
                y,
                size,
                collected: false,
                pulsePhase: Math.random() * Math.PI * 2
            });

            packsGenerated++;
        }
    }

    // Generate irregular rock shape
    generateRockShape(baseSize) {
        const points = [];
        const numPoints = Math.floor(
            this.rockSettings.minPoints +
            Math.random() * (this.rockSettings.maxPoints - this.rockSettings.minPoints)
        );

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;

            // Base radius with irregularity
            const irregularity = 1 + (Math.random() - 0.5) * 2 * this.rockSettings.irregularity;
            const radius = (baseSize / 2) * irregularity;

            // Add some randomness to angle
            const adjustedAngle = angle + (Math.random() - 0.5) * 0.5;

            points.push({
                x: Math.cos(adjustedAngle) * radius,
                y: Math.sin(adjustedAngle) * radius
            });
        }

        return points;
    }

    // Get random rock color with variation
    getRandomRockColor() {
        const baseColor = this.rockSettings.color;
        const variation = this.rockSettings.colorVariation;

        // Parse base color
        let r, g, b;
        if (baseColor.startsWith('#')) {
            const hex = baseColor.substring(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            // Default gray if parsing fails
            r = g = b = 107;
        }

        // Apply random variation
        const variationAmount = variation / 100;
        r = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * 255 * variationAmount));
        g = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * 255 * variationAmount));
        b = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * 255 * variationAmount));

        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }

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
    }

    togglePause() {
        if (!this.gameRunning || this.gameOver) return;

        this.gamePaused = !this.gamePaused;

        if (!this.gamePaused) {
            // Resume game
            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));
        }

        this.updateButtonStates();
    }

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

    // Start first wave
    startFirstWave() {
        // Set wave 1 without incrementing
        this.waveSystem.currentWave = 1;
        this.waveSystem.scalingFactor = 1;
        this.waveSystem.waveEnemiesTarget = this.getEnemyCountForWave(this.waveSystem.currentWave);
        this.waveSystem.waveEnemiesSpawned = 0;
        this.waveSystem.waveTimer = this.waveSystem.waveTimeLimit;
        this.waveSystem.waveActive = false;
        this.waveSystem.waveStarting = true;
        this.waveSystem.waveStartTimer = 0;

        // Update UI
        this.wave = this.waveSystem.currentWave;
        this.updateUI();

        // Show wave start message
        const enemyCount = this.waveSystem.waveEnemiesTarget;
        const enemyText = enemyCount === 1 ? 'enemy' : 'enemies';
        this.showMessage(`Wave ${this.waveSystem.currentWave} - ${enemyCount} ${enemyText} incoming!`);
    }

    startNextWave() {
        this.waveSystem.currentWave++;
        const newScalingFactor = Math.pow(2, Math.floor((this.waveSystem.currentWave - 1) / 10));
        if (newScalingFactor !== this.waveSystem.scalingFactor) {
            this.waveSystem.scalingFactor = newScalingFactor;
            this.showMessage(`Wave ${this.waveSystem.currentWave}! Enemy count scaling doubled!`);
        }

        this.waveSystem.waveEnemiesTarget = this.getEnemyCountForWave(this.waveSystem.currentWave);
        this.waveSystem.waveEnemiesSpawned = 0;
        this.waveSystem.waveTimer = this.waveSystem.waveTimeLimit;
        this.waveSystem.waveActive = false;
        this.waveSystem.waveStarting = true;
        this.waveSystem.waveStartTimer = 0;

        // Update UI
        this.wave = this.waveSystem.currentWave;
        this.updateUI();

        // Show wave start message
        const enemyCount = this.waveSystem.waveEnemiesTarget;
        const enemyText = enemyCount === 1 ? 'enemy' : 'enemies';
        this.showMessage(`Wave ${this.waveSystem.currentWave} - ${enemyCount} ${enemyText} incoming!`);
    }

    // Wave scaling system
    getEnemyCountForWave(waveNumber) {
        // Handle early waves (1-6) using the predefined array
        if (waveNumber < this.waveSystem.waveEnemyCounts.length) {
            return this.waveSystem.waveEnemyCounts[waveNumber];
        }

        // For wave 7 and beyond, calculate using scaling system
        let baseWave = 7;
        let baseEnemies = 10;

        // Calculate which 10-wave block we're in
        const blockNumber = Math.floor((waveNumber - baseWave) / 10);

        // Calculate wave within current block (0-9)
        const waveInBlock = (waveNumber - baseWave) % 10;

        // Calculate scaling factor: doubles every 10 waves starting from wave 7
        const scalingFactor = Math.pow(2, blockNumber);

        // Calculate enemy count: base enemies + (2 * waveInBlock * scalingFactor)
        const additionalEnemies = this.waveSystem.baseEnemyIncrement * waveInBlock * scalingFactor;

        return baseEnemies * scalingFactor + additionalEnemies;
    }

    // Calculate wave completion reward
    getWaveReward(waveNumber) {
        // Calculate how many sets of 10 waves have been completed
        const waveSets = Math.floor((waveNumber - 1) / this.scoreSystem.waveBonusInterval);

        // Calculate reward: base + (bonus increment * waveSets)
        return this.scoreSystem.baseWaveComplete + (this.scoreSystem.waveBonusIncrement * waveSets);
    }

    startWave() {
        this.waveSystem.waveActive = true;
        this.waveSystem.waveStarting = false;

        // Get the number of enemies for this wave
        const enemiesThisWave = this.getEnemyCountForWave(this.waveSystem.currentWave);

        // Spawn ALL enemies for this wave
        for (let i = 0; i < enemiesThisWave; i++) {
            this.spawnEnemyRandomPosition();
        }

        // Update the spawned count
        this.waveSystem.waveEnemiesSpawned = enemiesThisWave;

        const enemyText = enemiesThisWave === 1 ? 'enemy' : 'enemies';
        this.showMessage(`Wave ${this.waveSystem.currentWave} has begun! ${enemiesThisWave} new ${enemyText} added!`);
    }

    // Spawn an enemy at a random position on the map
    spawnEnemyRandomPosition() {
        let attempts = 0;
        const maxAttempts = 50; // Limit attempts to prevent infinite loop

        while (attempts < maxAttempts) {
            attempts++;

            // Generate random position anywhere on the map
            const x = Math.random() * (this.world.width - 100) + 50;
            const y = Math.random() * (this.world.height - 100) + 50;

            // Don't spawn too close to player
            const dx = x - this.playerTank.x;
            const dy = y - this.playerTank.y;
            const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

            if (distanceToPlayer < 400) {
                continue; // Too close to player
            }

            // Don't spawn inside rocks
            let insideRock = false;
            for (const rock of this.rocks) {
                const rockDx = x - rock.x;
                const rockDy = y - rock.y;
                const distance = Math.sqrt(rockDx * rockDx + rockDy * rockDy);

                if (distance < rock.radius + this.enemyConfig.width / 2) {
                    insideRock = true;
                    break;
                }
            }

            if (insideRock) {
                continue; // Inside a rock
            }

            // Don't spawn too close to other enemies
            let tooCloseToEnemy = false;
            for (const enemy of this.enemies) {
                const enemyDx = x - enemy.x;
                const enemyDy = y - enemy.y;
                const distance = Math.sqrt(enemyDx * enemyDx + enemyDy * enemyDy);

                if (distance < 150) {
                    tooCloseToEnemy = true;
                    break;
                }
            }

            if (tooCloseToEnemy) {
                continue; // Too close to another enemy
            }

            // Don't spawn inside health packs
            let insideHealthPack = false;
            for (const pack of this.healthPacks) {
                if (!pack.collected) {
                    const packDx = x - pack.x;
                    const packDy = y - pack.y;
                    const distance = Math.sqrt(packDx * packDx + packDy * packDy);

                    if (distance < pack.size) {
                        insideHealthPack = true;
                        break;
                    }
                }
            }

            if (insideHealthPack) {
                continue; // Inside a health pack
            }

            // Found a good position, spawn enemy
            this.enemies.push({
                x: x,
                y: y,
                width: this.enemyConfig.width,
                height: this.enemyConfig.height,
                speed: this.enemyConfig.speed + Math.random() * 0.5,
                rotation: Math.random() * Math.PI * 2,
                turretRotation: Math.random() * Math.PI * 2,
                health: TankGameConfig.enemy.health,
                lastShot: 0,
                shootCooldown: this.enemyConfig.shootCooldown + Math.random() * 1000,
                color: this.enemyConfig.color,
                hullOffsetX: this.enemyConfig.hullOffsetX,
                hullOffsetY: this.enemyConfig.hullOffsetY,
                turretWidth: this.enemyConfig.turretWidth,
                turretHeight: this.enemyConfig.turretHeight,
                turretOffsetX: this.enemyConfig.turretOffsetX,
                turretOffsetY: this.enemyConfig.turretOffsetY,
                barrelLength: this.enemyConfig.barrelLength,
                barrelWidth: this.enemyConfig.barrelWidth,
                barrelOffsetX: this.enemyConfig.barrelOffsetX,
                barrelOffsetY: this.enemyConfig.barrelOffsetY,
                // For obstacle avoidance
                avoidanceForceX: 0,
                avoidanceForceY: 0,
                // For movement
                desiredX: x,
                desiredY: y,
                // For wave system
                wave: this.waveSystem.currentWave,
                stuckTimer: 0,
                lastPositions: [],
                wanderAngle: Math.random() * Math.PI * 2,
                targetRotation: Math.random() * Math.PI * 2,
                rotationSpeed: this.settings.enemyRotationSpeed + Math.random() * 0.02
            });

            return; // Successfully spawned
        }

        // If we couldn't find a good position after max attempts, spawn anyway
        const fallbackX = Math.random() * (this.world.width - 100) + 50;
        const fallbackY = Math.random() * (this.world.height - 100) + 50;

        this.enemies.push({
            x: fallbackX,
            y: fallbackY,
            width: this.enemyConfig.width,
            height: this.enemyConfig.height,
            speed: this.enemyConfig.speed + Math.random() * 0.5,
            rotation: Math.random() * Math.PI * 2,
            turretRotation: Math.random() * Math.PI * 2,
            health: TankGameConfig.enemy.health,
            lastShot: 0,
            shootCooldown: this.enemyConfig.shootCooldown + Math.random() * 1000,
            color: this.enemyConfig.color,
            hullOffsetX: this.enemyConfig.hullOffsetX,
            hullOffsetY: this.enemyConfig.hullOffsetY,
            turretWidth: this.enemyConfig.turretWidth,
            turretHeight: this.enemyConfig.turretHeight,
            turretOffsetX: this.enemyConfig.turretOffsetX,
            turretOffsetY: this.enemyConfig.turretOffsetY,
            barrelLength: this.enemyConfig.barrelLength,
            barrelWidth: this.enemyConfig.barrelWidth,
            barrelOffsetX: this.enemyConfig.barrelOffsetX,
            barrelOffsetY: this.enemyConfig.barrelOffsetY,
            avoidanceForceX: 0,
            avoidanceForceY: 0,
            desiredX: fallbackX,
            desiredY: fallbackY,
            wave: this.waveSystem.currentWave,
            stuckTimer: 0,
            lastPositions: [],
            wanderAngle: Math.random() * Math.PI * 2,
            targetRotation: Math.random() * Math.PI * 2,
            rotationSpeed: this.settings.enemyRotationSpeed + Math.random() * 0.02
        });
    }

    endWave() {
        this.waveSystem.waveActive = false;

        // Check if player completed the wave
        if (this.enemies.length === 0) {
            // Calculate wave reward based on the new system
            const waveReward = this.getWaveReward(this.waveSystem.currentWave);
            this.score += waveReward;

            // Show reward message with details
            this.showMessage(`Wave ${this.waveSystem.currentWave} completed! +${waveReward} points!`);

            // Show floating text for wave reward
            this.showFloatingText(`+${waveReward} Wave`,
                this.playerTank.x,
                this.playerTank.y - 50,
                '#FFD700');
        } else {
            // Keep current enemies for next wave
            const existingEnemies = this.enemies.length;
            const enemyText = existingEnemies === 1 ? 'enemy' : 'enemies';
            this.showMessage(`Wave ${this.waveSystem.currentWave} time's up! ${existingEnemies} ${enemyText} carry over to next wave.`);
        }

        // Start next wave after 3 seconds
        setTimeout(() => {
            if (this.gameRunning && !this.gameOver) {
                this.startNextWave();
            }
        }, 3000);
    }

    gameLoop(currentTime) {
        if (!this.gameRunning || this.gamePaused || this.gameOver) {
            return;
        }

        // Time is a flat circle
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Limit delta time to prevent large jumps when inactive
        const clampedDeltaTime = Math.min(deltaTime, 100);

        this.update(clampedDeltaTime);
        this.render();

        if (this.gameRunning && !this.gamePaused && !this.gameOver) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    update(deltaTime) {
        // Convert deltaTime to seconds
        const deltaTimeInSeconds = deltaTime / 1000;

        // Update screen shake
        this.updateScreenShake(deltaTime);

        // Update wave system
        this.updateWaveSystem(deltaTime);

        // Update survival timer
        this.updateSurvivalTimer(deltaTime);

        // Update indicator animation
        this.updateIndicatorAnimation(deltaTime);

        // Update player movement
        this.updatePlayer(deltaTimeInSeconds);

        // Update camera to follow player
        this.updateCamera();

        // Update enemies
        this.updateEnemies(deltaTimeInSeconds);

        // Update bullets
        this.updateBullets(deltaTimeInSeconds);

        // Update enemy bullets
        this.updateEnemyBullets(deltaTimeInSeconds);

        // Update particles
        this.updateParticles(deltaTime);

        // Update health packs
        this.updateHealthPacks(deltaTime);

        // Update health pack respawn timers
        this.updateHealthPackRespawnTimers(deltaTime);

        // Check collisions
        this.checkCollisions();

        // Check health pack collection
        this.checkHealthPackCollection();

        // Update UI
        this.updateUI();

        // Update fullscreen stats
        this.updateFullscreenStats();

        // Update wave timer display
        this.updateWaveTimerDisplay();

        // Update notifications
        this.notificationSystem.update(deltaTime);

        // Handle auto-fire
        this.handleAutoFire(deltaTime);
    }

    // Update screen shake effect
    updateScreenShake(deltaTime) {
        if (this.screenShakeDuration > 0) {
            this.screenShakeDuration -= deltaTime;
            this.screenShakeAmount = this.screenShakeDuration / 1000 * 10;
        } else {
            this.screenShakeAmount = 0;
        }
    }

    // Update survival timer
    updateSurvivalTimer(deltaTime) {
        if (this.gameRunning && !this.gamePaused && !this.gameOver) {
            this.survivalTime += deltaTime;
        }
    }

    // Update indicator animation
    updateIndicatorAnimation(deltaTime) {
        this.indicatorPhase += this.enemyIndicators.pulseSpeed * (deltaTime / 16.67);
        if (this.indicatorPhase > Math.PI * 2) {
            this.indicatorPhase -= Math.PI * 2;
        }
    }

    // Format time in MM:SS format
    formatTime(timeInMilliseconds) {
        const totalSeconds = Math.floor(timeInMilliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Handle auto-fire when mouse is held down
    handleAutoFire(deltaTime) {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;

        const currentTime = performance.now();

        // Check if mouse button is held down
        if (this.isMouseDown) {
            // Check if enough time has passed since the last shot
            const timeSinceLastShot = currentTime - this.lastFireTime;

            // Check if it's time to fire again
            if (timeSinceLastShot >= this.playerTank.shootCooldown) {
                this.shoot();
                this.lastFireTime = currentTime;
                this.autoFireTimer = 0; // Reset timer
            } else {
                // Accumulate time for the next check
                this.autoFireTimer += deltaTime;
            }
        }

        // Check if space key is held down
        if (this.keys[' ']) {
            // Check if enough time has passed since the last shot
            const timeSinceLastShot = currentTime - this.lastFireTime;

            // Check if it's time to fire again
            if (timeSinceLastShot >= this.playerTank.shootCooldown) {
                this.shoot();
                this.lastFireTime = currentTime;
                this.autoFireTimer = 0; // Reset timer
            } else {
                // Accumulate time for the next check
                this.autoFireTimer += deltaTime;
            }
        }
    }

    updateWaveSystem(deltaTime) {
        if (this.waveSystem.waveStarting) {
            // Update wave start countdown
            this.waveSystem.waveStartTimer += deltaTime;

            if (this.waveSystem.waveStartTimer >= this.waveSystem.waveStartCountdown * 1000) {
                this.startWave();
            }
        } else if (this.waveSystem.waveActive) {
            // Update wave timer
            this.waveSystem.waveTimer -= deltaTime;

            // Check if wave time is up
            if (this.waveSystem.waveTimer <= 0) {
                this.endWave();
            }

            // Check if all enemies are killed
            if (this.enemies.length === 0) {
                this.endWave();
            }
        }
    }

    updatePlayer(deltaTime) {
        // Get input direction
        let inputX = 0;
        let inputY = 0;

        if (this.keys['w'] || this.keys['arrowup']) inputY -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) inputY += 1;
        if (this.keys['a'] || this.keys['arrowleft']) inputX -= 1;
        if (this.keys['d'] || this.keys['arrowright']) inputX += 1;

        // Calculate target rotation based on input
        if (inputX !== 0 || inputY !== 0) {
            this.playerTank.targetRotation = Math.atan2(inputY, inputX);
        }

        // Smoothly rotate towards target rotation
        const angleDiff = this.normalizeAngle(this.playerTank.targetRotation - this.playerTank.rotation);
        this.playerTank.rotation += angleDiff * this.playerTank.rotationSpeed;

        // Calculate movement direction based on current rotation
        const moveX = Math.cos(this.playerTank.rotation);
        const moveY = Math.sin(this.playerTank.rotation);

        // Calculate speed based on input magnitude
        const inputMagnitude = Math.sqrt(inputX * inputX + inputY * inputY);
        const targetSpeed = inputMagnitude > 0 ? this.playerTank.maxSpeed : 0;

        // Smoothly adjust current speed
        if (targetSpeed > this.playerTank.currentSpeed) {
            // Accelerate
            this.playerTank.currentSpeed = Math.min(
                targetSpeed,
                this.playerTank.currentSpeed + this.playerTank.acceleration * deltaTime
            );
        } else if (targetSpeed < this.playerTank.currentSpeed) {
            // Decelerate
            this.playerTank.currentSpeed = Math.max(
                targetSpeed,
                this.playerTank.currentSpeed - this.playerTank.deceleration * deltaTime
            );
        }

        // Calculate velocity based on current rotation and speed
        if (this.playerTank.currentSpeed > 0.1) {
            this.playerTank.velocityX = moveX * this.playerTank.currentSpeed;
            this.playerTank.velocityY = moveY * this.playerTank.currentSpeed;
        } else {
            // Apply friction when no input
            this.playerTank.velocityX *= 0.9;
            this.playerTank.velocityY *= 0.9;

            // Stop completely when velocity is very low
            if (Math.abs(this.playerTank.velocityX) < 0.1) this.playerTank.velocityX = 0;
            if (Math.abs(this.playerTank.velocityY) < 0.1) this.playerTank.velocityY = 0;
        }

        // Calculate new position
        let newX = this.playerTank.x + this.playerTank.velocityX * deltaTime * 60;
        let newY = this.playerTank.y + this.playerTank.velocityY * deltaTime * 60;

        // Check collision with rocks
        const playerRadius = this.playerTank.width / 2;
        for (const rock of this.rocks) {
            const dx = newX - rock.x;
            const dy = newY - rock.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = playerRadius + rock.radius;

            if (distance < minDistance) {
                // Collision detected - push player away
                const angle = Math.atan2(dy, dx);
                const overlap = minDistance - distance;

                newX += Math.cos(angle) * overlap;
                newY += Math.sin(angle) * overlap;

                // Reduce velocity when colliding with rock
                this.playerTank.velocityX *= 0.7;
                this.playerTank.velocityY *= 0.7;
            }
        }

        // Keep player in world bounds
        const margin = 50;
        if (newX > margin && newX < this.world.width - margin) {
            this.playerTank.x = newX;
        }
        if (newY > margin && newY < this.world.height - margin) {
            this.playerTank.y = newY;
        }
    }

    // Helper function to normalize angles
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }

    updateHealthPacks(deltaTime) {
        // Update animation for visible health packs
        for (const pack of this.healthPacks) {
            if (!pack.collected) {
                // Update pulsing animation
                pack.pulsePhase += this.healthPackSettings.pulseSpeed * (deltaTime / 16.67);
                if (pack.pulsePhase > Math.PI * 2) {
                    pack.pulsePhase -= Math.PI * 2;
                }
            }
        }
    }

    updateHealthPackRespawnTimers(deltaTime) {
        // Update respawn timers for collected health packs
        for (let i = this.healthPackRespawnTimers.length - 1; i >= 0; i--) {
            const timer = this.healthPackRespawnTimers[i];
            timer.timeRemaining -= deltaTime;

            if (timer.timeRemaining <= 0) {
                // Respawn the health pack
                const packIndex = this.healthPacks.findIndex(p => p === timer.healthPack);
                if (packIndex !== -1) {
                    this.healthPacks[packIndex].collected = false;
                    this.healthPacks[packIndex].pulsePhase = Math.random() * Math.PI * 2;
                }

                // Remove the timer
                this.healthPackRespawnTimers.splice(i, 1);
            }
        }
    }

    updateEnemies(deltaTime) {
        // Calculate enemy movement toward player with obstacle avoidance
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];

            // Track position history for stuck detection
            enemy.lastPositions.push({
                x: enemy.x,
                y: enemy.y
            });
            if (enemy.lastPositions.length > this.settings.enemyMemorySize) {
                enemy.lastPositions.shift();
            }

            // Move toward player
            const dx = this.playerTank.x - enemy.x;
            const dy = this.playerTank.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Update turret rotation to track player
            if (distance > 0) {
                const targetTurretAngle = Math.atan2(dy, dx);
                const angleDiff = this.normalizeAngle(targetTurretAngle - enemy.turretRotation);
                enemy.turretRotation += angleDiff * this.settings.enemyTurretTrackingSpeed;
            }

            // Check if enemy can shoot at player
            this.updateEnemyShooting(enemy, deltaTime);

            // Calculate pursuit force
            let pursuitX = 0;
            let pursuitY = 0;
            if (distance > 0) {
                pursuitX = (dx / distance) * this.settings.enemyPursuitForce;
                pursuitY = (dy / distance) * this.settings.enemyPursuitForce;
            }

            // Calculate obstacle avoidance force
            let avoidanceX = 0;
            let avoidanceY = 0;

            // Avoid rocks
            for (const rock of this.rocks) {
                const rockDx = rock.x - enemy.x;
                const rockDy = rock.y - enemy.y;
                const rockDistance = Math.sqrt(rockDx * rockDx + rockDy * rockDy);
                const minDistance = enemy.width / 2 + rock.radius + 20;

                if (rockDistance < minDistance * 2) {
                    // Calculate repulsion force
                    const force = Math.max(0, 1 - (rockDistance / (minDistance * 2)));
                    avoidanceX -= (rockDx / rockDistance) * force * this.settings.enemyAvoidanceForce;
                    avoidanceY -= (rockDy / rockDistance) * force * this.settings.enemyAvoidanceForce;
                }
            }

            // Avoid other enemies
            for (let j = 0; j < this.enemies.length; j++) {
                if (i === j) continue;

                const otherEnemy = this.enemies[j];
                const enemyDx = otherEnemy.x - enemy.x;
                const enemyDy = otherEnemy.y - enemy.y;
                const enemyDistance = Math.sqrt(enemyDx * enemyDx + enemyDy * enemyDy);
                const minEnemyDistance = enemy.width + 30;

                if (enemyDistance < minEnemyDistance * 1.5) {
                    // Calculate repulsion force
                    const force = Math.max(0, 1 - (enemyDistance / (minEnemyDistance * 1.5)));
                    avoidanceX -= (enemyDx / enemyDistance) * force * this.settings.enemyAvoidanceForce * 0.7;
                    avoidanceY -= (enemyDy / enemyDistance) * force * this.settings.enemyAvoidanceForce * 0.7;
                }
            }

            // Add some wander behavior to prevent clustering
            enemy.wanderAngle += (Math.random() - 0.5) * 0.5;
            const wanderX = Math.cos(enemy.wanderAngle) * this.settings.enemyWanderForce;
            const wanderY = Math.sin(enemy.wanderAngle) * this.settings.enemyWanderForce;

            // Combine forces
            let desiredX = pursuitX + avoidanceX + wanderX;
            let desiredY = pursuitY + avoidanceY + wanderY;

            // Normalize desired direction
            const desiredLength = Math.sqrt(desiredX * desiredX + desiredY * desiredY);
            if (desiredLength > 0) {
                desiredX /= desiredLength;
                desiredY /= desiredLength;

                // Calculate target rotation
                enemy.targetRotation = Math.atan2(desiredY, desiredX);

                // Smoothly rotate toward target
                const angleDiff = this.normalizeAngle(enemy.targetRotation - enemy.rotation);
                enemy.rotation += angleDiff * enemy.rotationSpeed;

                // Move in the direction enemy is facing
                enemy.desiredX = enemy.x + Math.cos(enemy.rotation) * enemy.speed * deltaTime * 60;
                enemy.desiredY = enemy.y + Math.sin(enemy.rotation) * enemy.speed * deltaTime * 60;
            }
        }

        // Handle collisions with rocks after movement
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            // Check collision with rocks
            const enemyRadius = enemy.width / 2;
            let collisionDetected = false;

            for (const rock of this.rocks) {
                const dx = enemy.desiredX - rock.x;
                const dy = enemy.desiredY - rock.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = enemyRadius + rock.radius;

                if (distance < minDistance) {
                    // Push enemy away from rock
                    const angle = Math.atan2(dy, dx);
                    const overlap = minDistance - distance;

                    enemy.desiredX += Math.cos(angle) * overlap * 1.2;
                    enemy.desiredY += Math.sin(angle) * overlap * 1.2;
                    collisionDetected = true;
                }
            }

            // Apply movement if position changed
            const moveX = enemy.desiredX - enemy.x;
            const moveY = enemy.desiredY - enemy.y;
            const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);

            if (moveDistance > 0) {
                // Limit movement to avoid overshooting
                const maxMove = enemy.speed * 2 * deltaTime * 60;
                if (moveDistance > maxMove) {
                    enemy.desiredX = enemy.x + (moveX / moveDistance) * maxMove;
                    enemy.desiredY = enemy.y + (moveY / moveDistance) * maxMove;
                }

                enemy.x = enemy.desiredX;
                enemy.y = enemy.desiredY;
            }

            // Remove enemies that are out of world bounds
            const margin = 100;
            if (enemy.x < -margin || enemy.x > this.world.width + margin ||
                enemy.y < -margin || enemy.y > this.world.height + margin) {
                this.enemies.splice(i, 1);
            }
        }
    }

    // Update enemy shooting logic
    updateEnemyShooting(enemy, deltaTime) {
        // Check if enemy can shoot
        const currentTime = performance.now();

        // Check if enemy is ready to shoot
        if (currentTime - enemy.lastShot < enemy.shootCooldown) {
            return;
        }

        // Calculate distance to player
        const dx = this.playerTank.x - enemy.x;
        const dy = this.playerTank.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if player is within shooting range
        if (distance > this.settings.enemyShootingRange) {
            return;
        }

        // Check line of sight to player
        if (!this.hasLineOfSight(enemy.x, enemy.y, this.playerTank.x, this.playerTank.y)) {
            return;
        }

        // Calculate angle to player
        const angleToPlayer = Math.atan2(dy, dx);

        // Calculate angle difference between turret and player
        const angleDiff = Math.abs(this.normalizeAngle(angleToPlayer - enemy.turretRotation));

        // Only shoot if turret is pointing roughly at player
        if (angleDiff > 0.2) {
            return;
        }

        // Add some randomness to shooting timing
        if (Math.random() > this.settings.enemyShootingAccuracy) {
            return;
        }

        // Enemy can shoot!
        this.enemyShoot(enemy);
        enemy.lastShot = currentTime;

        // Add some randomness to next shot time
        enemy.shootCooldown = this.settings.enemyShootingCooldown + Math.random() * 500;
    }

    // Check if there's a clear line of sight between two points
    hasLineOfSight(x1, y1, x2, y2) {
        const segmentCount = 10;

        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            const checkX = x1 + (x2 - x1) * t;
            const checkY = y1 + (y2 - y1) * t;

            // Check if this point is inside any rock
            for (const rock of this.rocks) {
                const dx = checkX - rock.x;
                const dy = checkY - rock.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < rock.radius) {
                    return false; // Rock is in the way
                }
            }
        }

        return true; // Clear line of sight
    }

    enemyShoot(enemy) {
        // Calculate bullet spawn position at the end of the gun barrel
        const barrelEndX = Math.cos(enemy.turretRotation) * enemy.barrelLength;
        const barrelEndY = Math.sin(enemy.turretRotation) * enemy.barrelLength;

        // Randomness to bullet direction for more realistic shooting
        const randomAngle = (Math.random() - 0.5) * this.settings.enemyShootingRandomness;
        const finalRotation = enemy.turretRotation + randomAngle;

        const bullet = {
            x: enemy.x + barrelEndX,
            y: enemy.y + barrelEndY,
            rotation: finalRotation,
            speed: this.settings.enemyBulletSpeed,
            damage: 10
        };

        this.enemyBullets.push(bullet);

        // Enhanced muzzle flash
        this.createMuzzleFlash(enemy.x + barrelEndX, enemy.y + barrelEndY, finalRotation, '#ff6b6b');
    }

    shoot() {
        const currentTime = performance.now();
        if (currentTime - this.playerTank.lastShot < this.playerTank.shootCooldown) {
            return;
        }

        this.playerTank.lastShot = currentTime;

        // Calculate bullet spawn position at the end of the gun barrel
        const barrelEndX = Math.cos(this.playerTank.turretRotation) * this.playerTank.barrelLength;
        const barrelEndY = Math.sin(this.playerTank.turretRotation) * this.playerTank.barrelLength;

        const bullet = {
            x: this.playerTank.x + barrelEndX,
            y: this.playerTank.y + barrelEndY,
            rotation: this.playerTank.turretRotation,
            speed: this.settings.bulletSpeed,
            damage: 50
        };

        this.bullets.push(bullet);

        // Enhanced muzzle flash
        this.createMuzzleFlash(this.playerTank.x + barrelEndX, this.playerTank.y + barrelEndY, this.playerTank.turretRotation, '#4CAF50');
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            bullet.x += Math.cos(bullet.rotation) * bullet.speed * deltaTime * 60;
            bullet.y += Math.sin(bullet.rotation) * bullet.speed * deltaTime * 60;

            // Add bullet trail effect
            if (Math.random() < 0.3) {
                this.createBulletTrail(bullet.x, bullet.y, bullet.rotation, '#FFD700');
            }

            // Check collision with rocks
            let hitRock = false;
            for (const rock of this.rocks) {
                const dx = bullet.x - rock.x;
                const dy = bullet.y - rock.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < rock.radius) {
                    // Enhanced rock impact
                    this.createRockImpact(bullet.x, bullet.y, rock.color);
                    this.bullets.splice(i, 1);
                    hitRock = true;
                    break;
                }
            }

            if (hitRock) continue;

            // Remove bullets that are out of world bounds
            if (bullet.x < 0 || bullet.x > this.world.width ||
                bullet.y < 0 || bullet.y > this.world.height) {
                this.bullets.splice(i, 1);
            }
        }
    }

    updateEnemyBullets(deltaTime) {
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];

            bullet.x += Math.cos(bullet.rotation) * bullet.speed * deltaTime * 60;
            bullet.y += Math.sin(bullet.rotation) * bullet.speed * deltaTime * 60;

            // Add bullet trail effect
            if (Math.random() < 0.3) {
                this.createBulletTrail(bullet.x, bullet.y, bullet.rotation, '#FF6B6B');
            }

            // Check collision with rocks
            let hitRock = false;
            for (const rock of this.rocks) {
                const dx = bullet.x - rock.x;
                const dy = bullet.y - rock.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < rock.radius) {
                    // Enhanced rock impact
                    this.createRockImpact(bullet.x, bullet.y, rock.color);
                    this.enemyBullets.splice(i, 1);
                    hitRock = true;
                    break;
                }
            }

            if (hitRock) continue;

            // Remove bullets that are out of world bounds
            if (bullet.x < 0 || bullet.x > this.world.width ||
                bullet.y < 0 || bullet.y > this.world.height) {
                this.enemyBullets.splice(i, 1);
            }
        }
    }

    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // Update particle based on type
            if (particle.type === 'explosion') {
                particle.size += particle.growth * (deltaTime / 16.67);
                particle.alpha = particle.life / particle.maxLife;
                particle.x += particle.vx * (deltaTime / 16.67);
                particle.y += particle.vy * (deltaTime / 16.67);
                particle.vx *= 0.95;
                particle.vy *= 0.95;
            } else if (particle.type === 'muzzleFlash') {
                particle.size -= particle.growth * (deltaTime / 16.67);
                particle.alpha = particle.life / particle.maxLife;
            } else if (particle.type === 'trail') {
                particle.alpha = particle.life / particle.maxLife;
                particle.x += particle.vx * (deltaTime / 16.67);
                particle.y += particle.vy * (deltaTime / 16.67);
            } else if (particle.type === 'impact') {
                particle.alpha = particle.life / particle.maxLife;
                particle.size = particle.maxSize * (particle.life / particle.maxLife);
            } else {
                // Standard particle
                particle.x += particle.vx * (deltaTime / 16.67);
                particle.y += particle.vy * (deltaTime / 16.67);
                particle.alpha = particle.life / particle.maxLife;
            }
        }
    }

    checkCollisions() {
        // Player bullets vs enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];

                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < enemy.width / 2) {
                    // Hit!
                    enemy.health -= bullet.damage;

                    // Create hit particles
                    this.createEnemyImpact(enemy.x, enemy.y, enemy.color);

                    // Remove bullet
                    this.bullets.splice(i, 1);

                    // Check if enemy is dead
                    if (enemy.health <= 0) {
                        this.enemies.splice(j, 1);

                        // Add enemy kill points
                        this.score += this.scoreSystem.enemyKill;

                        // Increment total kills counter
                        this.totalKills++;

                        // Create particles and floating text for enemy kill
                        this.createExplosion(enemy.x, enemy.y, '#FFD700', 1.5);
                        this.showFloatingText(`+${this.scoreSystem.enemyKill} Kill`, enemy.x, enemy.y, '#FFD700');
                    } else {
                        // Just damage effect
                        this.createDamageEffect(enemy.x, enemy.y, '#FF6B6B');
                    }

                    break;
                }
            }
        }

        // Enemy bullets vs player
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];

            const dx = bullet.x - this.playerTank.x;
            const dy = bullet.y - this.playerTank.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.playerTank.width / 2) {
                // Hit player!
                this.playerHealth -= bullet.damage;

                // Create hit particles
                this.createPlayerImpact(this.playerTank.x, this.playerTank.y);

                // Remove bullet
                this.enemyBullets.splice(i, 1);

                // Screen shake effect
                this.screenShake(3);

                // Check game over
                if (this.playerHealth <= 0) {
                    this.playerHealth = 0;
                    this.gameOver = true;
                    this.gameRunning = false;

                    // Create death explosion
                    this.createExplosion(this.playerTank.x, this.playerTank.y, '#F44336', 2.0);

                    // Hide fullscreen controls when game over
                    this.hideFullscreenControls();

                    this.updateButtonStates();
                    this.showGameOver();
                }
            }
        }

        // Enemy vs player collision
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            const dx = enemy.x - this.playerTank.x;
            const dy = enemy.y - this.playerTank.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < (enemy.width / 2 + this.playerTank.width / 2)) {
                // RAM!
                this.playerHealth -= 5;

                // Create collision effect
                const collisionX = (enemy.x + this.playerTank.x) / 2;
                const collisionY = (enemy.y + this.playerTank.y) / 2;
                this.createCollisionEffect(collisionX, collisionY);

                // Push player away
                const angle = Math.atan2(dy, dx);
                this.playerTank.x -= Math.cos(angle) * 10;
                this.playerTank.y -= Math.sin(angle) * 10;

                // Reduce velocity when colliding
                this.playerTank.velocityX *= 0.5;
                this.playerTank.velocityY *= 0.5;

                // Push enemy away to prevent sticking
                enemy.x += Math.cos(angle) * 10;
                enemy.y += Math.sin(angle) * 10;

                // Screen shake
                this.screenShake(3);

                // Check game over
                if (this.playerHealth <= 0) {
                    this.playerHealth = 0;
                    this.gameOver = true;
                    this.gameRunning = false;

                    // Hide fullscreen controls when game over
                    this.hideFullscreenControls();

                    this.updateButtonStates();
                    this.showGameOver();
                }
            }
        }
    }

    // Create explosion effect
    createExplosion(x, y, color = '#FFD700', size = 1.0) {
        const particleCount = Math.floor(30 * size);
        const maxSpeed = 8 * size;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * maxSpeed + 2;
            const life = Math.random() * 800 + 400;

            // Create explosion particles with varying colors
            const colors = [
                color,
                '#FFA500',
                '#FF6B6B',
                '#FFFFFF'
            ];
            const particleColor = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: particleColor,
                alpha: 1,
                size: Math.random() * 4 * size + 2,
                type: 'explosion',
                growth: 0.2
            });
        }

        // Add shockwave effect
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 600,
                maxLife: 600,
                color: color,
                alpha: 0.7,
                size: 0,
                type: 'explosion',
                growth: 2.0
            });
        }

        // Add screen shake
        this.screenShake(5 * size);
    }

    // Create muzzle flash effect
    createMuzzleFlash(x, y, angle, color) {
        const flashCount = 8;
        const length = 20;

        for (let i = 0; i < flashCount; i++) {
            const flashAngle = angle + (Math.random() - 0.5) * 0.5;
            const flashLength = Math.random() * length + 10;
            const flashSpeed = Math.random() * 5 + 3;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(flashAngle) * flashSpeed,
                vy: Math.sin(flashAngle) * flashSpeed,
                life: 150,
                maxLife: 150,
                color: color,
                alpha: 1,
                size: Math.random() * 8 + 4,
                type: 'muzzleFlash',
                growth: -0.2
            });
        }

        // Add bright flash at barrel end
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 80,
            maxLife: 80,
            color: '#FFFFFF',
            alpha: 0.8,
            size: 15,
            type: 'muzzleFlash',
            growth: -0.3
        });
    }

    // Create bullet trail effect
    createBulletTrail(x, y, angle, color) {
        // Create trail particle behind bullet
        const trailX = x - Math.cos(angle) * 10;
        const trailY = y - Math.sin(angle) * 10;

        this.particles.push({
            x: trailX,
            y: trailY,
            vx: Math.cos(angle) * -2,
            vy: Math.sin(angle) * -2,
            life: 200,
            maxLife: 200,
            color: color,
            alpha: 0.6,
            size: Math.random() * 2 + 1,
            type: 'trail'
        });
    }

    // Create rock impact effect
    createRockImpact(x, y, rockColor) {
        const impactCount = 15;

        for (let i = 0; i < impactCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const life = Math.random() * 400 + 200;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: this.lightenColor(rockColor, 30),
                alpha: 1,
                size: Math.random() * 3 + 2,
                type: 'impact',
                maxSize: Math.random() * 4 + 3
            });
        }

        // Add impact flash
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 100,
            maxLife: 100,
            color: '#FFFFFF',
            alpha: 0.7,
            size: 12,
            type: 'impact',
            maxSize: 12
        });

        this.screenShake(3);
    }

    // Create enemy impact effect
    createEnemyImpact(x, y, enemyColor) {
        const impactCount = 12;

        for (let i = 0; i < impactCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            const life = Math.random() * 300 + 150;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: enemyColor,
                alpha: 1,
                size: Math.random() * 4 + 2
            });
        }

        // Add sparks
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            const life = Math.random() * 400 + 200;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: '#FFD700',
                alpha: 1,
                size: Math.random() * 2 + 1
            });
        }

        this.screenShake(3);
    }

    // Create player impact effect
    createPlayerImpact(x, y) {
        const impactCount = 15;

        for (let i = 0; i < impactCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const life = Math.random() * 350 + 150;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: '#FF6B6B',
                alpha: 1,
                size: Math.random() * 5 + 2
            });
        }

        // Add shield impact effect
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 300,
                maxLife: 300,
                color: '#4CAF50',
                alpha: 0.5,
                size: 0,
                type: 'explosion',
                growth: 1.0
            });
        }
    }

    // Create damage effect (for non-fatal hits)
    createDamageEffect(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const life = Math.random() * 200 + 100;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: color,
                alpha: 1,
                size: Math.random() * 3 + 2
            });
        }
    }

    // Create collision effect
    createCollisionEffect(x, y) {
        const sparkCount = 20;

        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4;
            const life = Math.random() * 500 + 300;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: '#FFFFFF',
                alpha: 1,
                size: Math.random() * 2 + 1
            });
        }

        // Add impact ring
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 400,
                maxLife: 400,
                color: '#FFA500',
                alpha: 0.6,
                size: 0,
                type: 'explosion',
                growth: 1.5
            });
        }
    }

    // Check if player collects health packs
    checkHealthPackCollection() {
        const playerRadius = this.playerTank.width / 2;

        for (const pack of this.healthPacks) {
            if (!pack.collected) {
                // Calculate distance from player to health pack
                const dx = this.playerTank.x - pack.x;
                const dy = this.playerTank.y - pack.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = playerRadius + pack.size / 1;

                if (distance < minDistance) {
                    // Player is touching the health pack
                    if (this.playerHealth < 100) {
                        // Player needs health, collect the pack
                        this.collectHealthPack(pack);
                    }
                    // If player is at full health, do nothing, pack remains on ground
                }
            }
        }
    }

    // Collect a health pack
    collectHealthPack(pack) {
        // Mark pack as collected
        pack.collected = true;

        // Heal the player
        const oldHealth = this.playerHealth;
        this.playerHealth = Math.min(100, this.playerHealth + this.healthPackSettings.healthAmount);
        const healthGained = this.playerHealth - oldHealth;

        // Add health pack points
        this.score += this.scoreSystem.healthPack;

        // Increment health packs collected counter
        this.healthPacksCollected++;

        // Create healing particles
        this.createHealingEffect(pack.x, pack.y);

        // Add floating text showing health gained AND points
        this.showFloatingText(`+${this.scoreSystem.healthPack} HP`, pack.x, pack.y, this.healthPackSettings.color);
        this.showFloatingText(`+${healthGained} HP`, pack.x, pack.y - 20, '#10B981');

        // Show message in UI
        this.showMessage(`Health restored: +${healthGained} HP (+${this.scoreSystem.healthPack} points)`);

        // Start respawn timer
        this.healthPackRespawnTimers.push({
            healthPack: pack,
            timeRemaining: this.healthPackSettings.respawnTime
        });
    }

    // Create healing effect
    createHealingEffect(x, y) {
        const healingCount = 25;

        for (let i = 0; i < healingCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const life = Math.random() * 600 + 400;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: this.healthPackSettings.color,
                alpha: 0.8,
                size: Math.random() * 4 + 2,
                type: 'explosion',
                growth: 0.1
            });
        }

        // Add glow effect
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 500,
                maxLife: 500,
                color: '#10B981',
                alpha: 0.6,
                size: 0,
                type: 'explosion',
                growth: 1.2
            });
        }
    }

    // Show floating text at a position
    showFloatingText(text, x, y, color) {
        this.notificationSystem.showFloatingText(text, x, y, color);
    }

    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: Math.random() * 500 + 500,
                maxLife: 1000,
                color: color,
                alpha: 1,
                size: Math.random() * 3 + 1
            });
        }
    }

    screenShake(intensity) {
        this.screenShakeDuration = intensity * 100;
        this.screenShakeAmount = intensity;
    }

    render() {
        // Apply screen shake
        const shakeX = this.screenShakeAmount > 0 ? (Math.random() - 0.5) * this.screenShakeAmount * 2 : 0;
        const shakeY = this.screenShakeAmount > 0 ? (Math.random() - 0.5) * this.screenShakeAmount * 2 : 0;

        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context for camera transformation
        this.ctx.save();

        // Apply screen shake
        this.ctx.translate(shakeX, shakeY);

        // Apply camera transformation
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw grid background
        this.drawGrid();

        // Draw map borders
        this.drawMapBorders();

        // Draw rocks
        this.drawRocks();

        // Draw health packs
        this.drawHealthPacks();

        // Draw all game objects
        this.drawParticles();
        this.drawEnemies();
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemyBullets();

        // Restore context
        this.ctx.restore();

        // Draw enemy indicators
        if (this.enemyIndicators.enabled && this.gameRunning && !this.gamePaused && !this.gameOver) {
            this.drawEnemyIndicators();
        }

        // Draw debug info
        if (this.settings.debugMode) {
            this.drawDebugInfo();
        }
    }

    // Draw visible map borders
    drawMapBorders() {
        const border = this.borderSettings.thickness;
        const warningDistance = this.borderSettings.warningDistance;
        const worldWidth = this.world.width;
        const worldHeight = this.world.height;

        // Save context
        this.ctx.save();

        // Left border
        const leftGradient = this.ctx.createLinearGradient(0, border, border, border);
        leftGradient.addColorStop(0, this.borderSettings.edgeColor);
        leftGradient.addColorStop(1, this.borderSettings.mainColor);

        this.ctx.fillStyle = leftGradient;
        this.ctx.fillRect(0, border, border, worldHeight - border * 2);

        // Right border
        const rightGradient = this.ctx.createLinearGradient(worldWidth - border, border, worldWidth, border);
        rightGradient.addColorStop(0, this.borderSettings.mainColor);
        rightGradient.addColorStop(1, this.borderSettings.edgeColor);

        this.ctx.fillStyle = rightGradient;
        this.ctx.fillRect(worldWidth - border, border, border, worldHeight - border * 2);

        // Top border
        const topGradient = this.ctx.createLinearGradient(border, 0, border, border);
        topGradient.addColorStop(0, this.borderSettings.edgeColor);
        topGradient.addColorStop(1, this.borderSettings.mainColor);

        this.ctx.fillStyle = topGradient;
        this.ctx.fillRect(border, 0, worldWidth - border * 2, border);

        // Bottom border
        const bottomGradient = this.ctx.createLinearGradient(border, worldHeight - border, border, worldHeight);
        bottomGradient.addColorStop(0, this.borderSettings.mainColor);
        bottomGradient.addColorStop(1, this.borderSettings.edgeColor);

        this.ctx.fillStyle = bottomGradient;
        this.ctx.fillRect(border, worldHeight - border, worldWidth - border * 2, border);

        // Draw corners
        // Top-left corner
        const tlCorner = this.ctx.createLinearGradient(0, 0, border, border);
        tlCorner.addColorStop(0, this.borderSettings.edgeColor);
        tlCorner.addColorStop(0.5, this.borderSettings.mainColor);

        this.ctx.fillStyle = tlCorner;
        this.ctx.fillRect(0, 0, border, border);

        // Top-right corner
        const trCorner = this.ctx.createLinearGradient(worldWidth - border, 0, worldWidth, border);
        trCorner.addColorStop(0, this.borderSettings.mainColor);
        trCorner.addColorStop(0.5, this.borderSettings.edgeColor);

        this.ctx.fillStyle = trCorner;
        this.ctx.fillRect(worldWidth - border, 0, border, border);

        // Bottom-left corner
        const blCorner = this.ctx.createLinearGradient(0, worldHeight - border, border, worldHeight);
        blCorner.addColorStop(0, this.borderSettings.edgeColor);
        blCorner.addColorStop(0.5, this.borderSettings.mainColor);

        this.ctx.fillStyle = blCorner;
        this.ctx.fillRect(0, worldHeight - border, border, border);

        // Bottom-right corner
        const brCorner = this.ctx.createLinearGradient(worldWidth - border, worldHeight - border, worldWidth, worldHeight);
        brCorner.addColorStop(0, this.borderSettings.mainColor);
        brCorner.addColorStop(0.5, this.borderSettings.edgeColor);

        this.ctx.fillStyle = brCorner;
        this.ctx.fillRect(worldWidth - border, worldHeight - border, border, border);

        // Draw inner glow effect for better visibility
        this.ctx.strokeStyle = this.borderSettings.innerGlowColor;
        this.ctx.lineWidth = 3;

        // Inner rectangle showing playable area
        this.ctx.strokeRect(border, border, worldWidth - border * 2, worldHeight - border * 2);

        // Draw warning zone near edges
        // Left warning zone
        this.ctx.fillStyle = this.borderSettings.warningColor;
        this.ctx.fillRect(border, border, warningDistance, worldHeight - border * 2);

        // Right warning zone
        this.ctx.fillRect(worldWidth - border - warningDistance, border, warningDistance, worldHeight - border * 2);

        // Top warning zone
        this.ctx.fillRect(border, border, worldWidth - border * 2, warningDistance);

        // Bottom warning zone
        this.ctx.fillRect(border, worldHeight - border - warningDistance, worldWidth - border * 2, warningDistance);

        // Draw pattern on borders
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        const patternSize = 20;

        // Left border pattern
        for (let y = border; y < worldHeight - border; y += patternSize * 2) {
            for (let x = 0; x < border; x += patternSize) {
                if ((x + y) % (patternSize * 2) === 0) {
                    this.ctx.fillRect(x, y, patternSize, patternSize);
                }
            }
        }

        // Right border pattern
        for (let y = border; y < worldHeight - border; y += patternSize * 2) {
            for (let x = worldWidth - border; x < worldWidth; x += patternSize) {
                if ((x + y) % (patternSize * 2) === 0) {
                    this.ctx.fillRect(x, y, patternSize, patternSize);
                }
            }
        }

        // Top border pattern
        for (let x = border; x < worldWidth - border; x += patternSize * 2) {
            for (let y = 0; y < border; y += patternSize) {
                if ((x + y) % (patternSize * 2) === 0) {
                    this.ctx.fillRect(x, y, patternSize, patternSize);
                }
            }
        }

        // Bottom border pattern
        for (let x = border; x < worldWidth - border; x += patternSize * 2) {
            for (let y = worldHeight - border; y < worldHeight; y += patternSize) {
                if ((x + y) % (patternSize * 2) === 0) {
                    this.ctx.fillRect(x, y, patternSize, patternSize);
                }
            }
        }

        this.ctx.restore();
    }

    // Draw enemy indicators on screen edges
    drawEnemyIndicators() {
        if (this.enemies.length === 0) return;

        // Calculate pulsing effect
        const pulseScale = 1 + Math.sin(this.indicatorPhase) * this.enemyIndicators.pulseScale;
        const indicatorSize = this.enemyIndicators.size * pulseScale;
        const margin = this.enemyIndicators.margin;

        // Screen bounds
        const screenLeft = 0;
        const screenRight = this.canvas.width;
        const screenTop = 0;
        const screenBottom = this.canvas.height;

        // Calculate camera bounds in world space
        const cameraLeft = this.camera.x;
        const cameraRight = this.camera.x + this.canvas.width;
        const cameraTop = this.camera.y;
        const cameraBottom = this.camera.y + this.canvas.height;

        // Draw indicators for each enemy that's outside the camera view
        for (const enemy of this.enemies) {
            // Skip enemies that are very far away
            const dx = enemy.x - this.playerTank.x;
            const dy = enemy.y - this.playerTank.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > this.enemyIndicators.maxDistanceForIndicator) {
                continue;
            }

            // Check if enemy is on screen
            const enemyScreenX = enemy.x - this.camera.x;
            const enemyScreenY = enemy.y - this.camera.y;

            if (enemyScreenX >= 0 && enemyScreenX <= this.canvas.width &&
                enemyScreenY >= 0 && enemyScreenY <= this.canvas.height) {
                continue; // Enemy is on screen, no indicator needed
            }

            // Calculate direction from center of screen to enemy
            const screenCenterX = this.canvas.width / 2;
            const screenCenterY = this.canvas.height / 2;

            // Calculate vector from screen center to enemy position
            const vecX = enemyScreenX - screenCenterX;
            const vecY = enemyScreenY - screenCenterY;

            // Calculate angle
            const angle = Math.atan2(vecY, vecX);

            // Find intersection point with screen edge
            let indicatorX, indicatorY;

            // Calculate intersection with screen edges
            const slope = vecY / vecX;

            if (Math.abs(vecX) > Math.abs(vecY)) {
                // Intersect with left or right edge
                if (vecX > 0) {
                    // Right edge
                    indicatorX = screenRight - margin;
                    indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);

                    // Clamp to top/bottom edges
                    if (indicatorY < screenTop + margin) {
                        indicatorY = screenTop + margin;
                        indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;
                    } else if (indicatorY > screenBottom - margin) {
                        indicatorY = screenBottom - margin;
                        indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;
                    }
                } else {
                    // Left edge
                    indicatorX = screenLeft + margin;
                    indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);

                    // Clamp to top/bottom edges
                    if (indicatorY < screenTop + margin) {
                        indicatorY = screenTop + margin;
                        indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;
                    } else if (indicatorY > screenBottom - margin) {
                        indicatorY = screenBottom - margin;
                        indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;
                    }
                }
            } else {
                // Intersect with top or bottom edge
                if (vecY > 0) {
                    // Bottom edge
                    indicatorY = screenBottom - margin;
                    indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;

                    // Clamp to left/right edges
                    if (indicatorX < screenLeft + margin) {
                        indicatorX = screenLeft + margin;
                        indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);
                    } else if (indicatorX > screenRight - margin) {
                        indicatorX = screenRight - margin;
                        indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);
                    }
                } else {
                    // Top edge
                    indicatorY = screenTop + margin;
                    indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;

                    // Clamp to left/right edges
                    if (indicatorX < screenLeft + margin) {
                        indicatorX = screenLeft + margin;
                        indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);
                    } else if (indicatorX > screenRight - margin) {
                        indicatorX = screenRight - margin;
                        indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);
                    }
                }
            }

            // Determine indicator color based on distance
            let indicatorColor;
            if (distance < this.enemyIndicators.dangerThreshold) {
                indicatorColor = this.enemyIndicators.dangerColor;
            } else if (distance < this.enemyIndicators.warningThreshold) {
                indicatorColor = this.enemyIndicators.warningColor;
            } else {
                indicatorColor = this.enemyIndicators.safeColor;
            }

            // Draw indicator
            this.ctx.save();
            this.ctx.translate(indicatorX, indicatorY);
            this.ctx.rotate(angle);

            // Draw outer glow
            this.ctx.fillStyle = indicatorColor;
            this.ctx.globalAlpha = this.enemyIndicators.glowIntensity * pulseScale;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, indicatorSize * 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw main indicator circle with gradient
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, indicatorSize / 2);
            gradient.addColorStop(0, this.enemyIndicators.innerGlowColor);
            gradient.addColorStop(1, indicatorColor);

            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, indicatorSize / 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw pulsating ring
            this.ctx.strokeStyle = indicatorColor;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.6 * pulseScale;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, indicatorSize * 0.6, 0, Math.PI * 2);
            this.ctx.stroke();

            // Draw tank icon
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();

            // Draw triangle pointing outward
            const tankIconSize = indicatorSize * 0.4;
            this.ctx.moveTo(indicatorSize / 2 + 2, 0);
            this.ctx.lineTo(indicatorSize / 2 - tankIconSize, -tankIconSize / 2);
            this.ctx.lineTo(indicatorSize / 2 - tankIconSize, tankIconSize / 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw arrow pointing towards enemy
            this.ctx.fillStyle = indicatorColor;
            this.ctx.beginPath();
            this.ctx.moveTo(indicatorSize / 2 + this.enemyIndicators.arrowLength, 0);
            this.ctx.lineTo(indicatorSize / 2, -this.enemyIndicators.arrowWidth / 2);
            this.ctx.lineTo(indicatorSize / 2, this.enemyIndicators.arrowWidth / 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw small danger symbol for close enemies
            if (distance < this.enemyIndicators.dangerThreshold) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = `bold ${indicatorSize * 0.3}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('!', 0, 0);
            }

            this.ctx.restore();
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;

        const gridSize = 50;

        // Calculate visible area for grid drawing
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endX = this.camera.x + this.canvas.width;
        const endY = this.camera.y + this.canvas.height;

        // Vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, Math.max(0, this.camera.y));
            this.ctx.lineTo(x, Math.min(this.world.height, endY));
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(Math.max(0, this.camera.x), y);
            this.ctx.lineTo(Math.min(this.world.width, endX), y);
            this.ctx.stroke();
        }
    }

    // Draw rocks/obstacles
    drawRocks() {
        this.rocks.forEach(rock => {
            this.ctx.save();
            this.ctx.translate(rock.x, rock.y);

            // Draw rock shape
            this.ctx.fillStyle = rock.color;
            this.ctx.beginPath();

            // Move to first point
            this.ctx.moveTo(rock.points[0].x, rock.points[0].y);

            // Draw lines to all other points
            for (let i = 1; i < rock.points.length; i++) {
                this.ctx.lineTo(rock.points[i].x, rock.points[i].y);
            }

            // Close the shape
            this.ctx.closePath();
            this.ctx.fill();

            // Add some shading for 3D effect
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.beginPath();

            // Draw a shadow on one side
            for (let i = 0; i < rock.points.length; i++) {
                const point = rock.points[i];
                const shadowX = point.x * 0.9;
                const shadowY = point.y * 0.9;

                if (i === 0) {
                    this.ctx.moveTo(shadowX, shadowY);
                } else {
                    this.ctx.lineTo(shadowX, shadowY);
                }
            }

            this.ctx.closePath();
            this.ctx.fill();

            // Add highlight for texture
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();

            // Draw a highlight on opposite side
            for (let i = 0; i < rock.points.length; i++) {
                const point = rock.points[i];
                const highlightX = point.x * 1.1;
                const highlightY = point.y * 1.1;

                if (i === 0) {
                    this.ctx.moveTo(highlightX, highlightY);
                } else {
                    this.ctx.lineTo(highlightX, highlightY);
                }
            }

            this.ctx.closePath();
            this.ctx.fill();

            // Draw debug bounding circle
            if (this.settings.debugMode) {
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, rock.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            this.ctx.restore();
        });
    }

    // Draw health packs
    drawHealthPacks() {
        this.healthPacks.forEach(pack => {
            if (!pack.collected) {
                this.ctx.save();
                this.ctx.translate(pack.x, pack.y);

                // Calculate pulsing effect
                const pulseScale = 0.8 + Math.sin(pack.pulsePhase) * 0.2;
                const currentSize = pack.size * pulseScale;

                // Draw outer glow
                this.ctx.fillStyle = this.healthPackSettings.glowColor;
                this.ctx.globalAlpha = 0.3 + Math.sin(pack.pulsePhase) * 0.2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, currentSize * 1.2, 0, Math.PI * 2);
                this.ctx.fill();

                // Reset alpha
                this.ctx.globalAlpha = 1;

                // Draw main health pack
                this.ctx.fillStyle = this.healthPackSettings.color;

                // Draw vertical part of cross
                this.ctx.fillRect(
                    -currentSize * 0.15,
                    -currentSize * 0.5,
                    currentSize * 0.3,
                    currentSize
                );

                // Draw horizontal part of cross
                this.ctx.fillRect(
                    -currentSize * 0.5,
                    -currentSize * 0.15,
                    currentSize,
                    currentSize * 0.3
                );

                // Draw inner highlight
                this.ctx.fillStyle = this.lightenColor(this.healthPackSettings.color, 30);

                // Vertical highlight
                this.ctx.fillRect(
                    -currentSize * 0.1,
                    -currentSize * 0.4,
                    currentSize * 0.2,
                    currentSize * 0.8
                );

                // Horizontal highlight
                this.ctx.fillRect(
                    -currentSize * 0.4,
                    -currentSize * 0.1,
                    currentSize * 0.8,
                    currentSize * 0.2
                );

                // Draw plus symbol in the center
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = `bold ${currentSize * 0.4}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('+', 0, 0);

                // Draw debug bounding circle
                if (this.settings.debugMode) {
                    this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, pack.size / 2, 0, Math.PI * 2);
                    this.ctx.stroke();
                }

                this.ctx.restore();
            }
        });
    }

    drawPlayer() {
        // Save context
        this.ctx.save();

        // Move to player position
        this.ctx.translate(this.playerTank.x, this.playerTank.y);

        // Draw player health bar
        this.drawPlayerHealthBar();

        // Draw hull
        this.ctx.save();
        this.ctx.rotate(this.playerTank.rotation);
        this.drawTankHull(
            this.playerTank.hullOffsetX,
            this.playerTank.hullOffsetY,
            this.playerTank.width,
            this.playerTank.height,
            this.playerTank.color
        );
        this.ctx.restore();

        // Draw turret
        this.ctx.save();
        this.ctx.rotate(this.playerTank.turretRotation);
        this.drawTankTurret(this.playerTank);
        this.ctx.restore();

        // Draw tank details
        this.drawTankDetails(this.playerTank);

        // Draw movement direction indicator
        if (this.settings.debugMode) {
            this.drawMovementIndicator();
        }

        // Restore context
        this.ctx.restore();
    }

    // Draw player health bar
    drawPlayerHealthBar() {
        const barWidth = this.playerTank.width;
        const barHeight = 6;
        const barX = -barWidth / 2;
        const barY = -this.playerTank.height / 2 - 25;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthWidth = (this.playerHealth / 100) * barWidth;
        this.ctx.fillStyle = this.playerHealth > 50 ? '#4CAF50' : this.playerHealth > 25 ? '#FF9800' : '#F44336';
        this.ctx.fillRect(barX, barY, healthWidth, barHeight);

        // Border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Health text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${this.playerHealth}%`, 0, barY + barHeight / 2);
    }

    drawMovementIndicator() {
        // Draw a line showing the movement direction
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(
            Math.cos(this.playerTank.rotation) * 50,
            Math.sin(this.playerTank.rotation) * 50
        );
        this.ctx.stroke();

        // Draw a circle showing the current speed
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.playerTank.currentSpeed * 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawEnemies() {
        this.enemies.forEach(enemy => {
            this.ctx.save();
            this.ctx.translate(enemy.x, enemy.y);

            // Draw hull
            this.ctx.save();
            this.ctx.rotate(enemy.rotation);
            this.drawTankHull(
                enemy.hullOffsetX,
                enemy.hullOffsetY,
                enemy.width,
                enemy.height,
                enemy.color
            );
            this.ctx.restore();

            // Draw turret
            this.ctx.save();
            this.ctx.rotate(enemy.turretRotation);
            this.drawTankTurret(enemy);
            this.ctx.restore();

            // Draw health bar
            this.drawHealthBar(enemy);

            // Draw debug info
            if (this.settings.debugMode) {
                // Draw avoidance force indicator
                if (enemy.avoidanceForceX !== 0 || enemy.avoidanceForceY !== 0) {
                    this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(enemy.avoidanceForceX * 10, enemy.avoidanceForceY * 10);
                    this.ctx.stroke();
                }

                // Draw target rotation indicator
                this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(
                    Math.cos(enemy.targetRotation) * 30,
                    Math.sin(enemy.targetRotation) * 30
                );
                this.ctx.stroke();

                // Draw stuck timer
                if (enemy.stuckTimer > 0) {
                    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                    this.ctx.font = 'bold 12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(`Stuck: ${enemy.stuckTimer}`, 0, -40);
                }
            }

            this.ctx.restore();
        });
    }

    drawTankHull(offsetX, offsetY, width, height, color) {
        // Main hull body
        this.ctx.fillStyle = color;
        this.ctx.fillRect(offsetX, offsetY, width, height);

        // Hull highlight
        this.ctx.fillStyle = this.lightenColor(color, 20);
        this.ctx.fillRect(offsetX + 5, offsetY + 5, width - 10, height / 3);

        // Hull details
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < 3; i++) {
            const y = offsetY + 10 + i * 15;
            this.ctx.fillRect(offsetX + width - 20, y, 10, 10);
        }

        // Tracks
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(offsetX, offsetY - 5, width, 8);
        this.ctx.fillRect(offsetX, offsetY + height - 3, width, 8);

        // Track details
        this.ctx.fillStyle = '#444';
        for (let i = 0; i < 8; i++) {
            const x = offsetX + 5 + i * (width / 7);
            this.ctx.fillRect(x, offsetY - 3, 4, 5);
            this.ctx.fillRect(x, offsetY + height - 1, 4, 5);
        }
    }

    drawTankTurret(tank) {
        // Draw turret body
        this.ctx.fillStyle = tank.color;
        this.ctx.fillRect(
            tank.turretOffsetX,
            tank.turretOffsetY,
            tank.turretWidth,
            tank.turretHeight
        );

        // Turret highlight
        this.ctx.fillStyle = this.lightenColor(tank.color, 15);
        this.ctx.beginPath();
        this.ctx.roundRect(
            tank.turretOffsetX + tank.turretWidth - 10,
            tank.turretOffsetY + 2,
            8,
            tank.turretHeight - 4,
            4
        );
        this.ctx.fill();

        // Draw gun barrel
        this.ctx.save();

        // Position at front center of turret
        this.ctx.translate(tank.turretWidth / 2 + tank.turretOffsetX, tank.turretOffsetY + tank.turretHeight / 2);

        // Draw barrel extending forward from the front
        this.ctx.fillStyle = '#333';

        // Barrel extends forward
        this.ctx.fillRect(
            0,
            -tank.barrelWidth / 2,
            tank.barrelLength,
            tank.barrelWidth
        );

        // Barrel tip
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(
            tank.barrelLength,
            -tank.barrelWidth / 2 - 1,
            5,
            tank.barrelWidth + 2
        );

        this.ctx.restore();
    }

    drawTankDetails(tank) {
        // Draw player name
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('', 0, -tank.height / 2 - 15);
    }

    drawHealthBar(enemy) {
        const barWidth = enemy.width;
        const barHeight = 5;
        const barX = -barWidth / 2;
        const barY = -enemy.height / 2 - 15;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthWidth = (enemy.health / 100) * barWidth;
        this.ctx.fillStyle = enemy.health > 50 ? '#4CAF50' : enemy.health > 25 ? '#FF9800' : '#F44336';
        this.ctx.fillRect(barX, barY, healthWidth, barHeight);

        // Border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.save();
            this.ctx.translate(bullet.x, bullet.y);
            this.ctx.rotate(bullet.rotation);

            // Bullet glow
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.7, '#FFA500');
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
            this.ctx.fill();

            // Bullet core
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(-4, -2, 12, 4);

            // Bullet tip
            this.ctx.fillStyle = '#FF8C00';
            this.ctx.beginPath();
            this.ctx.moveTo(8, -3);
            this.ctx.lineTo(14, 0);
            this.ctx.lineTo(8, 3);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    drawEnemyBullets() {
        this.enemyBullets.forEach(bullet => {
            this.ctx.save();
            this.ctx.translate(bullet.x, bullet.y);
            this.ctx.rotate(bullet.rotation);

            // Bullet glow
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
            gradient.addColorStop(0, '#FF6B6B');
            gradient.addColorStop(0.7, '#FF4444');
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Bullet core
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillRect(-3, -2, 10, 4);

            // Bullet tip
            this.ctx.fillStyle = '#FF3333';
            this.ctx.beginPath();
            this.ctx.moveTo(7, -2.5);
            this.ctx.lineTo(12, 0);
            this.ctx.lineTo(7, 2.5);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            // Check if this is a floating text particle
            if (particle.text) {
                this.ctx.save();
                this.ctx.globalAlpha = particle.life / particle.maxLife;
                this.ctx.fillStyle = particle.color;
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(particle.text, particle.x, particle.y);
                this.ctx.restore();
            } else {
                // Regular particle
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha;

                if (particle.type === 'explosion' || particle.type === 'impact') {
                    // Draw explosion/impact particles with gradient
                    const gradient = this.ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, particle.size
                    );
                    gradient.addColorStop(0, particle.color);
                    gradient.addColorStop(0.5, particle.color);
                    gradient.addColorStop(1, 'transparent');

                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (particle.type === 'muzzleFlash') {
                    // Draw muzzle flash with star shape
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    for (let i = 0; i < 8; i++) {
                        const angle = (i * Math.PI) / 4;
                        const radius = i % 2 === 0 ? particle.size : particle.size * 0.5;
                        const x = particle.x + Math.cos(angle) * radius;
                        const y = particle.y + Math.sin(angle) * radius;

                        if (i === 0) this.ctx.moveTo(x, y);
                        else this.ctx.lineTo(x, y);
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                } else {
                    // Standard circular particle
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                this.ctx.restore();
            }
        });
    }

    lightenColor(color, percent) {
        // Helper function to lighten colors for highlights
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    drawDebugInfo() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';

        // Draw in screen coordinates
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.ctx.fillText(`Player: ${this.playerTank.x.toFixed(1)}, ${this.playerTank.y.toFixed(1)}`, 10, 20);
        this.ctx.fillText(`Velocity: ${this.playerTank.velocityX.toFixed(2)}, ${this.playerTank.velocityY.toFixed(2)}`, 10, 40);
        this.ctx.fillText(`Speed: ${this.playerTank.currentSpeed.toFixed(2)}/${this.playerTank.maxSpeed}`, 10, 60);
        this.ctx.fillText(`Rotation: ${(this.playerTank.rotation * 180 / Math.PI).toFixed(1)}°`, 10, 80);
        this.ctx.fillText(`Target Rot: ${(this.playerTank.targetRotation * 180 / Math.PI).toFixed(1)}°`, 10, 100);
        this.ctx.fillText(`Camera: ${this.camera.x.toFixed(1)}, ${this.camera.y.toFixed(1)}`, 10, 120);
        this.ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 140);
        this.ctx.fillText(`Bullets: ${this.bullets.length}`, 10, 160);
        this.ctx.fillText(`Wave: ${this.waveSystem.currentWave}`, 10, 180);
        this.ctx.fillText(`Wave Enemies: ${this.waveSystem.waveEnemiesSpawned}/${this.waveSystem.waveEnemiesTarget}`, 10, 200);
        this.ctx.fillText(`Wave Time: ${Math.ceil(this.waveSystem.waveTimer / 1000)}s`, 10, 220);
        this.ctx.fillText(`Rocks: ${this.rocks.length}`, 10, 240);
        this.ctx.fillText(`Health Packs: ${this.healthPacks.filter(p => !p.collected).length}/${this.healthPacks.length}`, 10, 260);
        this.ctx.fillText(`Scaling Factor: ${this.waveSystem.scalingFactor}`, 10, 280);
        this.ctx.fillText(`Score: ${this.score}`, 10, 300);
        this.ctx.fillText(`Total Kills: ${this.totalKills}`, 10, 320);
        this.ctx.fillText(`Health Packs Collected: ${this.healthPacksCollected}`, 10, 340);
        this.ctx.fillText(`Auto-fire: ${this.isMouseDown ? 'ACTIVE' : 'INACTIVE'}`, 10, 360);
        this.ctx.fillText(`Auto-fire Timer: ${this.autoFireTimer.toFixed(0)}ms`, 10, 380);
        this.ctx.fillText(`Survival Time: ${this.formatTime(this.survivalTime)}`, 10, 400);
        this.ctx.fillText(`Enemy Indicators: ${this.enemyIndicators.enabled ? 'ON' : 'OFF'}`, 10, 420);
        this.ctx.fillText(`Indicator Phase: ${this.indicatorPhase.toFixed(2)}`, 10, 440);
        this.ctx.fillText(`Enemy AI: Turret Tracking ON`, 10, 460);
        this.ctx.fillText(`Obstacle Avoidance: ON`, 10, 480);
        this.ctx.fillText(`Enemy-Enemy Avoidance: ON`, 10, 500);
        this.ctx.fillText(`Notifications: ${this.notificationSystem.getNotificationCount()}`, 10, 520);
        this.ctx.fillText(`Edge Buffer: ${this.rockSettings.edgeBuffer}px`, 10, 540);
        this.ctx.fillText(`Min Passage Width: ${this.rockSettings.minPassageWidth}px`, 10, 560);
        this.ctx.fillText(`Border Thickness: ${this.borderSettings.thickness}px`, 10, 580);
        this.ctx.fillText(`Warning Distance: ${this.borderSettings.warningDistance}px`, 10, 600);
        this.ctx.fillText(`Enemy Shooting Range: ${this.settings.enemyShootingRange}px`, 10, 620);
        this.ctx.fillText(`Enemy Shooting Accuracy: ${this.settings.enemyShootingAccuracy}`, 10, 640);
        this.ctx.fillText(`Enemy Bullets: ${this.enemyBullets.length}`, 10, 660);
        this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 680);
        this.ctx.fillText(`Screen Shake: ${this.screenShakeAmount.toFixed(2)}`, 10, 700);

        this.ctx.restore();
    }

    updateUI() {
        // Update fullscreen stats
        this.updateFullscreenStats();
    }

    showGameOver() {
        const overlay = document.getElementById('gameOverOverlay');
        if (!overlay) return;

        overlay.style.display = 'flex';

        // Update final stats
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalWave').textContent = this.waveSystem.currentWave;
        document.getElementById('enemiesKilled').textContent = this.totalKills;

        // Update survival time
        const survivalTimeElement = document.getElementById('finalSurvivalTime');
        if (survivalTimeElement) {
            survivalTimeElement.textContent = this.formatTime(this.survivalTime);
        }

        // Hide wave timer
        if (this.waveTimerElement) {
            this.waveTimerElement.style.display = 'none';
        }

        // Show game over notification
        this.notificationSystem.showGameOverMessage(
            this.score,
            this.waveSystem.currentWave,
            this.totalKills,
            this.formatTime(this.survivalTime)
        );
    }

    showMessage(text) {
        this.notificationSystem.show(text);
    }
}

// Initialize the game
const tankGame = new TankGame();

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (typeof radius === 'number') {
            radius = {
                tl: radius,
                tr: radius,
                br: radius,
                bl: radius
            };
        } else {
            radius = {
                ...{
                    tl: 0,
                    tr: 0,
                    br: 0,
                    bl: 0
                },
                ...radius
            };
        }

        this.beginPath();
        this.moveTo(x + radius.tl, y);
        this.lineTo(x + width - radius.tr, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        this.lineTo(x + width, y + height - radius.br);
        this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        this.lineTo(x + radius.bl, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        this.lineTo(x, y + radius.tl);
        this.quadraticCurveTo(x, y, x + radius.tl, y);
        this.closePath();
        return this;
    };
}