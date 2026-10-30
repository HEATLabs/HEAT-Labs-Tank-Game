// World Rendering
Object.assign(TankGame.prototype, {
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;

        const gridSize = 50;

        // Calculate visible area for grid drawing
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endX = this.camera.x + this.canvas.width;
        const endY = this.camera.y + this.canvas.height;

        // Vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, Math.max(0, this.camera.y));
            this.ctx.lineTo(x, Math.min(this.world.height, endY));
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(Math.max(0, this.camera.x), y);
            this.ctx.lineTo(Math.min(this.world.width, endX), y);
            this.ctx.stroke();
        }
    },

    // Draw visible map borders
    drawMapBorders() {
        const border = this.borderSettings.thickness;
        const warningDistance = this.borderSettings.warningDistance;
        const worldWidth = this.world.width;
        const worldHeight = this.world.height;

        // Save context
        this.ctx.save();

        // Left border
        const leftGradient = this.ctx.createLinearGradient(0, border, border, border);
        leftGradient.addColorStop(0, this.borderSettings.edgeColor);
        leftGradient.addColorStop(1, this.borderSettings.mainColor);

        this.ctx.fillStyle = leftGradient;
        this.ctx.fillRect(0, border, border, worldHeight - border * 2);

        // Right border
        const rightGradient = this.ctx.createLinearGradient(worldWidth - border, border, worldWidth, border);
        rightGradient.addColorStop(0, this.borderSettings.mainColor);
        rightGradient.addColorStop(1, this.borderSettings.edgeColor);

        this.ctx.fillStyle = rightGradient;
        this.ctx.fillRect(worldWidth - border, border, border, worldHeight - border * 2);

        // Top border
        const topGradient = this.ctx.createLinearGradient(border, 0, border, border);
        topGradient.addColorStop(0, this.borderSettings.edgeColor);
        topGradient.addColorStop(1, this.borderSettings.mainColor);

        this.ctx.fillStyle = topGradient;
        this.ctx.fillRect(border, 0, worldWidth - border * 2, border);

        // Bottom border
        const bottomGradient = this.ctx.createLinearGradient(border, worldHeight - border, border, worldHeight);
        bottomGradient.addColorStop(0, this.borderSettings.mainColor);
        bottomGradient.addColorStop(1, this.borderSettings.edgeColor);

        this.ctx.fillStyle = bottomGradient;
        this.ctx.fillRect(border, worldHeight - border, worldWidth - border * 2, border);

        // Draw corners
        // Top-left corner
        const tlCorner = this.ctx.createLinearGradient(0, 0, border, border);
        tlCorner.addColorStop(0, this.borderSettings.edgeColor);
        tlCorner.addColorStop(0.5, this.borderSettings.mainColor);

        this.ctx.fillStyle = tlCorner;
        this.ctx.fillRect(0, 0, border, border);

        // Top-right corner
        const trCorner = this.ctx.createLinearGradient(worldWidth - border, 0, worldWidth, border);
        trCorner.addColorStop(0, this.borderSettings.mainColor);
        trCorner.addColorStop(0.5, this.borderSettings.edgeColor);

        this.ctx.fillStyle = trCorner;
        this.ctx.fillRect(worldWidth - border, 0, border, border);

        // Bottom-left corner
        const blCorner = this.ctx.createLinearGradient(0, worldHeight - border, border, worldHeight);
        blCorner.addColorStop(0, this.borderSettings.edgeColor);
        blCorner.addColorStop(0.5, this.borderSettings.mainColor);

        this.ctx.fillStyle = blCorner;
        this.ctx.fillRect(0, worldHeight - border, border, border);

        // Bottom-right corner
        const brCorner = this.ctx.createLinearGradient(worldWidth - border, worldHeight - border, worldWidth, worldHeight);
        brCorner.addColorStop(0, this.borderSettings.mainColor);
        brCorner.addColorStop(0.5, this.borderSettings.edgeColor);

        this.ctx.fillStyle = brCorner;
        this.ctx.fillRect(worldWidth - border, worldHeight - border, border, border);

        // Draw inner glow effect for better visibility
        this.ctx.strokeStyle = this.borderSettings.innerGlowColor;
        this.ctx.lineWidth = 3;

        // Inner rectangle showing playable area
        this.ctx.strokeRect(border, border, worldWidth - border * 2, worldHeight - border * 2);

        // Draw warning zone near edges
        // Left warning zone
        this.ctx.fillStyle = this.borderSettings.warningColor;
        this.ctx.fillRect(border, border, warningDistance, worldHeight - border * 2);

        // Right warning zone
        this.ctx.fillRect(worldWidth - border - warningDistance, border, warningDistance, worldHeight - border * 2);

        // Top warning zone
        this.ctx.fillRect(border, border, worldWidth - border * 2, warningDistance);

        // Bottom warning zone
        this.ctx.fillRect(border, worldHeight - border - warningDistance, worldWidth - border * 2, warningDistance);

        // Draw pattern on borders
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        const patternSize = 20;

        // Left border pattern
        for (let y = border; y < worldHeight - border; y += patternSize * 2) {
            for (let x = 0; x < border; x += patternSize) {
                if ((x + y) % (patternSize * 2) === 0) {
                    this.ctx.fillRect(x, y, patternSize, patternSize);
                }
            }
        }

        // Right border pattern
        for (let y = border; y < worldHeight - border; y += patternSize * 2) {
            for (let x = worldWidth - border; x < worldWidth; x += patternSize) {
                if ((x + y) % (patternSize * 2) === 0) {
                    this.ctx.fillRect(x, y, patternSize, patternSize);
                }
            }
        }

        // Top border pattern
        for (let x = border; x < worldWidth - border; x += patternSize * 2) {
            for (let y = 0; y < border; y += patternSize) {
                if ((x + y) % (patternSize * 2) === 0) {
                    this.ctx.fillRect(x, y, patternSize, patternSize);
                }
            }
        }

        // Bottom border pattern
        for (let x = border; x < worldWidth - border; x += patternSize * 2) {
            for (let y = worldHeight - border; y < worldHeight; y += patternSize) {
                if ((x + y) % (patternSize * 2) === 0) {
                    this.ctx.fillRect(x, y, patternSize, patternSize);
                }
            }
        }

        this.ctx.restore();
    },

    // Draw rocks/obstacles
    drawRocks() {
        this.rocks.forEach(rock => {
            this.ctx.save();
            this.ctx.translate(rock.x, rock.y);

            // Draw rock shape
            this.ctx.fillStyle = rock.color;
            this.ctx.beginPath();

            // Move to first point
            this.ctx.moveTo(rock.points[0].x, rock.points[0].y);

            // Draw lines to all other points
            for (let i = 1; i < rock.points.length; i++) {
                this.ctx.lineTo(rock.points[i].x, rock.points[i].y);
            }

            // Close the shape
            this.ctx.closePath();
            this.ctx.fill();

            // Add some shading for 3D effect
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.beginPath();

            // Draw a shadow on one side
            for (let i = 0; i < rock.points.length; i++) {
                const point = rock.points[i];
                const shadowX = point.x * 0.9;
                const shadowY = point.y * 0.9;

                if (i === 0) {
                    this.ctx.moveTo(shadowX, shadowY);
                } else {
                    this.ctx.lineTo(shadowX, shadowY);
                }
            }

            this.ctx.closePath();
            this.ctx.fill();

            // Add highlight for texture
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();

            // Draw a highlight on opposite side
            for (let i = 0; i < rock.points.length; i++) {
                const point = rock.points[i];
                const highlightX = point.x * 1.1;
                const highlightY = point.y * 1.1;

                if (i === 0) {
                    this.ctx.moveTo(highlightX, highlightY);
                } else {
                    this.ctx.lineTo(highlightX, highlightY);
                }
            }

            this.ctx.closePath();
            this.ctx.fill();

            // Draw debug bounding circle
            if (this.settings.debugMode) {
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, rock.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            this.ctx.restore();
        });
    },

    // Draw health packs
    drawHealthPacks() {
        this.healthPacks.forEach(pack => {
            if (!pack.collected) {
                this.ctx.save();
                this.ctx.translate(pack.x, pack.y);

                // Calculate pulsing effect
                const pulseScale = 0.8 + Math.sin(pack.pulsePhase) * 0.2;
                const currentSize = pack.size * pulseScale;

                // Draw outer glow
                this.ctx.fillStyle = this.healthPackSettings.glowColor;
                this.ctx.globalAlpha = 0.3 + Math.sin(pack.pulsePhase) * 0.2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, currentSize * 1.2, 0, Math.PI * 2);
                this.ctx.fill();

                // Reset alpha
                this.ctx.globalAlpha = 1;

                // Draw main health pack
                this.ctx.fillStyle = this.healthPackSettings.color;

                // Draw vertical part of cross
                this.ctx.fillRect(
                    -currentSize * 0.15,
                    -currentSize * 0.5,
                    currentSize * 0.3,
                    currentSize
                );

                // Draw horizontal part of cross
                this.ctx.fillRect(
                    -currentSize * 0.5,
                    -currentSize * 0.15,
                    currentSize,
                    currentSize * 0.3
                );

                // Draw inner highlight
                this.ctx.fillStyle = this.lightenColor(this.healthPackSettings.color, 30);

                // Vertical highlight
                this.ctx.fillRect(
                    -currentSize * 0.1,
                    -currentSize * 0.4,
                    currentSize * 0.2,
                    currentSize * 0.8
                );

                // Horizontal highlight
                this.ctx.fillRect(
                    -currentSize * 0.4,
                    -currentSize * 0.1,
                    currentSize * 0.8,
                    currentSize * 0.2
                );

                // Draw plus symbol in the center
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = `bold ${currentSize * 0.4}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('+', 0, 0);

                // Draw debug bounding circle
                if (this.settings.debugMode) {
                    this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, pack.size / 2, 0, Math.PI * 2);
                    this.ctx.stroke();
                }

                this.ctx.restore();
            }
        });
    }
});
