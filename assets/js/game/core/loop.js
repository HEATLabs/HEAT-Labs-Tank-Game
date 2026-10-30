// Main Game Loop
Object.assign(TankGame.prototype, {
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
    },

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
    },

    // Update screen shake effect
    updateScreenShake(deltaTime) {
        if (this.screenShakeDuration > 0) {
            this.screenShakeDuration -= deltaTime;
            this.screenShakeAmount = this.screenShakeDuration / 1000 * 10;
        } else {
            this.screenShakeAmount = 0;
        }
    },

    // Update survival timer
    updateSurvivalTimer(deltaTime) {
        if (this.gameRunning && !this.gamePaused && !this.gameOver) {
            this.survivalTime += deltaTime;
        }
    },

    // Update indicator animation
    updateIndicatorAnimation(deltaTime) {
        this.indicatorPhase += this.enemyIndicators.pulseSpeed * (deltaTime / 16.67);
        if (this.indicatorPhase > Math.PI * 2) {
            this.indicatorPhase -= Math.PI * 2;
        }
    },

    // Format time in MM:SS format
    formatTime(timeInMilliseconds) {
        const totalSeconds = Math.floor(timeInMilliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
});