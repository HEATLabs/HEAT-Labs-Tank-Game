// Render Pipeline
Object.assign(TankGame.prototype, {
    render() {
        // Apply screen shake
        const shakeX = this.screenShakeAmount > 0 ? (Math.random() - 0.5) * this.screenShakeAmount * 2 : 0;
        const shakeY = this.screenShakeAmount > 0 ? (Math.random() - 0.5) * this.screenShakeAmount * 2 : 0;

        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context for camera transformation
        this.ctx.save();

        // Apply screen shake
        this.ctx.translate(shakeX, shakeY);

        // Apply camera transformation
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw grid background
        this.drawGrid();

        // Draw map borders
        this.drawMapBorders();

        // Draw rocks
        this.drawRocks();

        // Draw health packs
        this.drawHealthPacks();

        // Draw all game objects
        this.drawParticles();
        this.drawEnemies();
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemyBullets();

        // Restore context
        this.ctx.restore();

        // Draw enemy indicators
        if (this.enemyIndicators.enabled && this.gameRunning && !this.gamePaused && !this.gameOver) {
            this.drawEnemyIndicators();
        }

        // Draw debug info
        if (this.settings.debugMode) {
            this.drawDebugInfo();
        }
    },

    lightenColor(color, percent) {
        // Helper function to lighten colors for highlights
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
});