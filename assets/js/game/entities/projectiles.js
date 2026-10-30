// Bullets
Object.assign(TankGame.prototype, {
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
    },

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
});
