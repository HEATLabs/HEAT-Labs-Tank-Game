// Debug Overlay
Object.assign(TankGame.prototype, {
    drawDebugInfo() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';

        // Draw in screen coordinates
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.ctx.fillText(`Player: ${this.playerTank.x.toFixed(1)}, ${this.playerTank.y.toFixed(1)}`, 10, 20);
        this.ctx.fillText(`Velocity: ${this.playerTank.velocityX.toFixed(2)}, ${this.playerTank.velocityY.toFixed(2)}`, 10, 40);
        this.ctx.fillText(`Speed: ${this.playerTank.currentSpeed.toFixed(2)}/${this.playerTank.maxSpeed}`, 10, 60);
        this.ctx.fillText(`Rotation: ${(this.playerTank.rotation * 180 / Math.PI).toFixed(1)}°`, 10, 80);
        this.ctx.fillText(`Target Rot: ${(this.playerTank.targetRotation * 180 / Math.PI).toFixed(1)}°`, 10, 100);
        this.ctx.fillText(`Camera: ${this.camera.x.toFixed(1)}, ${this.camera.y.toFixed(1)}`, 10, 120);
        this.ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 140);
        this.ctx.fillText(`Bullets: ${this.bullets.length}`, 10, 160);
        this.ctx.fillText(`Wave: ${this.waveSystem.currentWave}`, 10, 180);
        this.ctx.fillText(`Wave Enemies: ${this.waveSystem.waveEnemiesSpawned}/${this.waveSystem.waveEnemiesTarget}`, 10, 200);
        this.ctx.fillText(`Wave Time: ${Math.ceil(this.waveSystem.waveTimer / 1000)}s`, 10, 220);
        this.ctx.fillText(`Rocks: ${this.rocks.length}`, 10, 240);
        this.ctx.fillText(`Health Packs: ${this.healthPacks.filter(p => !p.collected).length}/${this.healthPacks.length}`, 10, 260);
        this.ctx.fillText(`Scaling Factor: ${this.waveSystem.scalingFactor}`, 10, 280);
        this.ctx.fillText(`Score: ${this.score}`, 10, 300);
        this.ctx.fillText(`Total Kills: ${this.totalKills}`, 10, 320);
        this.ctx.fillText(`Health Packs Collected: ${this.healthPacksCollected}`, 10, 340);
        this.ctx.fillText(`Auto-fire: ${this.isMouseDown ? 'ACTIVE' : 'INACTIVE'}`, 10, 360);
        this.ctx.fillText(`Auto-fire Timer: ${this.autoFireTimer.toFixed(0)}ms`, 10, 380);
        this.ctx.fillText(`Survival Time: ${this.formatTime(this.survivalTime)}`, 10, 400);
        this.ctx.fillText(`Enemy Indicators: ${this.enemyIndicators.enabled ? 'ON' : 'OFF'}`, 10, 420);
        this.ctx.fillText(`Indicator Phase: ${this.indicatorPhase.toFixed(2)}`, 10, 440);
        this.ctx.fillText(`Enemy AI: Turret Tracking ON`, 10, 460);
        this.ctx.fillText(`Obstacle Avoidance: ON`, 10, 480);
        this.ctx.fillText(`Enemy-Enemy Avoidance: ON`, 10, 500);
        this.ctx.fillText(`Notifications: ${this.notificationSystem.getNotificationCount()}`, 10, 520);
        this.ctx.fillText(`Edge Buffer: ${this.rockSettings.edgeBuffer}px`, 10, 540);
        this.ctx.fillText(`Min Passage Width: ${this.rockSettings.minPassageWidth}px`, 10, 560);
        this.ctx.fillText(`Border Thickness: ${this.borderSettings.thickness}px`, 10, 580);
        this.ctx.fillText(`Warning Distance: ${this.borderSettings.warningDistance}px`, 10, 600);
        this.ctx.fillText(`Enemy Shooting Range: ${this.settings.enemyShootingRange}px`, 10, 620);
        this.ctx.fillText(`Enemy Shooting Accuracy: ${this.settings.enemyShootingAccuracy}`, 10, 640);
        this.ctx.fillText(`Enemy Bullets: ${this.enemyBullets.length}`, 10, 660);
        this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 680);
        this.ctx.fillText(`Screen Shake: ${this.screenShakeAmount.toFixed(2)}`, 10, 700);

        this.ctx.restore();
    }
});