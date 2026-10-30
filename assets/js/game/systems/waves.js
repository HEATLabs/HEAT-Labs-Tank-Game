// Wave System
Object.assign(TankGame.prototype, {
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
    },

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
    },

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
    },

    // Calculate wave completion reward
    getWaveReward(waveNumber) {
        // Calculate how many sets of 10 waves have been completed
        const waveSets = Math.floor((waveNumber - 1) / this.scoreSystem.waveBonusInterval);

        // Calculate reward: base + (bonus increment * waveSets)
        return this.scoreSystem.baseWaveComplete + (this.scoreSystem.waveBonusIncrement * waveSets);
    },

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
    },

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
    },

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
    },

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
});
