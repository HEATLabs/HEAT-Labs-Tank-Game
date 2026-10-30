// HUD, Fullscreen Controls & Wave Timer
Object.assign(TankGame.prototype, {
    applyFullscreenStyles() {
        // Always apply fullscreen styles
        const container = document.querySelector('.tank-game-section');
        const canvasContainer = document.querySelector('.tank-game-canvas-container');

        if (container && canvasContainer) {
            container.classList.add('tank-game-fullscreen');
        }
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

    updateUI() {
        // Update fullscreen stats
        this.updateFullscreenStats();
    }
});
