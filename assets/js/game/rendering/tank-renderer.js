// Tank Rendering (player & enemies)
Object.assign(TankGame.prototype, {
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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

    drawTankDetails(tank) {
        // Draw player name
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('', 0, -tank.height / 2 - 15);
    },

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
});
