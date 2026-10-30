// Input & Event Listeners
Object.assign(TankGame.prototype, {
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
});