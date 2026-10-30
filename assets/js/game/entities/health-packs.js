// Health Packs
Object.assign(TankGame.prototype, {
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
    },

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
    },

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
    },

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
});
