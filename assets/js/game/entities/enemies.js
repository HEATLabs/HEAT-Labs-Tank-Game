// Enemy Tanks & AI
Object.assign(TankGame.prototype, {
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
    },

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
    },

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
    },

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
});