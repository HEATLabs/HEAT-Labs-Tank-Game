// Menus, Overlays & Messages
Object.assign(TankGame.prototype, {
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
    },

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
    },

    showMessage(text) {
        this.notificationSystem.show(text);
    }
});
