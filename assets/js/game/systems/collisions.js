// Collisions
Object.assign(TankGame.prototype, {
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
});