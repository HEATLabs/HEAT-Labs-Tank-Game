// Off-screen Enemy Indicators
Object.assign(TankGame.prototype, {
    // Draw enemy indicators on screen edges
    drawEnemyIndicators() {
        if (this.enemies.length === 0) return;

        // Calculate pulsing effect
        const pulseScale = 1 + Math.sin(this.indicatorPhase) * this.enemyIndicators.pulseScale;
        const indicatorSize = this.enemyIndicators.size * pulseScale;
        const margin = this.enemyIndicators.margin;

        // Screen bounds
        const screenLeft = 0;
        const screenRight = this.canvas.width;
        const screenTop = 0;
        const screenBottom = this.canvas.height;

        // Calculate camera bounds in world space
        const cameraLeft = this.camera.x;
        const cameraRight = this.camera.x + this.canvas.width;
        const cameraTop = this.camera.y;
        const cameraBottom = this.camera.y + this.canvas.height;

        // Draw indicators for each enemy that's outside the camera view
        for (const enemy of this.enemies) {
            // Skip enemies that are very far away
            const dx = enemy.x - this.playerTank.x;
            const dy = enemy.y - this.playerTank.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > this.enemyIndicators.maxDistanceForIndicator) {
                continue;
            }

            // Check if enemy is on screen
            const enemyScreenX = enemy.x - this.camera.x;
            const enemyScreenY = enemy.y - this.camera.y;

            if (enemyScreenX >= 0 && enemyScreenX <= this.canvas.width &&
                enemyScreenY >= 0 && enemyScreenY <= this.canvas.height) {
                continue; // Enemy is on screen, no indicator needed
            }

            // Calculate direction from center of screen to enemy
            const screenCenterX = this.canvas.width / 2;
            const screenCenterY = this.canvas.height / 2;

            // Calculate vector from screen center to enemy position
            const vecX = enemyScreenX - screenCenterX;
            const vecY = enemyScreenY - screenCenterY;

            // Calculate angle
            const angle = Math.atan2(vecY, vecX);

            // Find intersection point with screen edge
            let indicatorX, indicatorY;

            // Calculate intersection with screen edges
            const slope = vecY / vecX;

            if (Math.abs(vecX) > Math.abs(vecY)) {
                // Intersect with left or right edge
                if (vecX > 0) {
                    // Right edge
                    indicatorX = screenRight - margin;
                    indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);

                    // Clamp to top/bottom edges
                    if (indicatorY < screenTop + margin) {
                        indicatorY = screenTop + margin;
                        indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;
                    } else if (indicatorY > screenBottom - margin) {
                        indicatorY = screenBottom - margin;
                        indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;
                    }
                } else {
                    // Left edge
                    indicatorX = screenLeft + margin;
                    indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);

                    // Clamp to top/bottom edges
                    if (indicatorY < screenTop + margin) {
                        indicatorY = screenTop + margin;
                        indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;
                    } else if (indicatorY > screenBottom - margin) {
                        indicatorY = screenBottom - margin;
                        indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;
                    }
                }
            } else {
                // Intersect with top or bottom edge
                if (vecY > 0) {
                    // Bottom edge
                    indicatorY = screenBottom - margin;
                    indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;

                    // Clamp to left/right edges
                    if (indicatorX < screenLeft + margin) {
                        indicatorX = screenLeft + margin;
                        indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);
                    } else if (indicatorX > screenRight - margin) {
                        indicatorX = screenRight - margin;
                        indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);
                    }
                } else {
                    // Top edge
                    indicatorY = screenTop + margin;
                    indicatorX = screenCenterX + (indicatorY - screenCenterY) / slope;

                    // Clamp to left/right edges
                    if (indicatorX < screenLeft + margin) {
                        indicatorX = screenLeft + margin;
                        indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);
                    } else if (indicatorX > screenRight - margin) {
                        indicatorX = screenRight - margin;
                        indicatorY = screenCenterY + slope * (indicatorX - screenCenterX);
                    }
                }
            }

            // Determine indicator color based on distance
            let indicatorColor;
            if (distance < this.enemyIndicators.dangerThreshold) {
                indicatorColor = this.enemyIndicators.dangerColor;
            } else if (distance < this.enemyIndicators.warningThreshold) {
                indicatorColor = this.enemyIndicators.warningColor;
            } else {
                indicatorColor = this.enemyIndicators.safeColor;
            }

            // Draw indicator
            this.ctx.save();
            this.ctx.translate(indicatorX, indicatorY);
            this.ctx.rotate(angle);

            // Draw outer glow
            this.ctx.fillStyle = indicatorColor;
            this.ctx.globalAlpha = this.enemyIndicators.glowIntensity * pulseScale;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, indicatorSize * 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw main indicator circle with gradient
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, indicatorSize / 2);
            gradient.addColorStop(0, this.enemyIndicators.innerGlowColor);
            gradient.addColorStop(1, indicatorColor);

            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, indicatorSize / 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw pulsating ring
            this.ctx.strokeStyle = indicatorColor;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.6 * pulseScale;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, indicatorSize * 0.6, 0, Math.PI * 2);
            this.ctx.stroke();

            // Draw tank icon
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();

            // Draw triangle pointing outward
            const tankIconSize = indicatorSize * 0.4;
            this.ctx.moveTo(indicatorSize / 2 + 2, 0);
            this.ctx.lineTo(indicatorSize / 2 - tankIconSize, -tankIconSize / 2);
            this.ctx.lineTo(indicatorSize / 2 - tankIconSize, tankIconSize / 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw arrow pointing towards enemy
            this.ctx.fillStyle = indicatorColor;
            this.ctx.beginPath();
            this.ctx.moveTo(indicatorSize / 2 + this.enemyIndicators.arrowLength, 0);
            this.ctx.lineTo(indicatorSize / 2, -this.enemyIndicators.arrowWidth / 2);
            this.ctx.lineTo(indicatorSize / 2, this.enemyIndicators.arrowWidth / 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw small danger symbol for close enemies
            if (distance < this.enemyIndicators.dangerThreshold) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = `bold ${indicatorSize * 0.3}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('!', 0, 0);
            }

            this.ctx.restore();
        }
    }
});
