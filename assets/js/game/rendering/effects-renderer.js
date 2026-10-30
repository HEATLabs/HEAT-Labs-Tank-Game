// Bullet & Particle Rendering
Object.assign(TankGame.prototype, {
    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.save();
            this.ctx.translate(bullet.x, bullet.y);
            this.ctx.rotate(bullet.rotation);

            // Bullet glow
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.7, '#FFA500');
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
            this.ctx.fill();

            // Bullet core
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(-4, -2, 12, 4);

            // Bullet tip
            this.ctx.fillStyle = '#FF8C00';
            this.ctx.beginPath();
            this.ctx.moveTo(8, -3);
            this.ctx.lineTo(14, 0);
            this.ctx.lineTo(8, 3);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        });
    },

    drawEnemyBullets() {
        this.enemyBullets.forEach(bullet => {
            this.ctx.save();
            this.ctx.translate(bullet.x, bullet.y);
            this.ctx.rotate(bullet.rotation);

            // Bullet glow
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
            gradient.addColorStop(0, '#FF6B6B');
            gradient.addColorStop(0.7, '#FF4444');
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Bullet core
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillRect(-3, -2, 10, 4);

            // Bullet tip
            this.ctx.fillStyle = '#FF3333';
            this.ctx.beginPath();
            this.ctx.moveTo(7, -2.5);
            this.ctx.lineTo(12, 0);
            this.ctx.lineTo(7, 2.5);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        });
    },

    drawParticles() {
        this.particles.forEach(particle => {
            // Check if this is a floating text particle
            if (particle.text) {
                this.ctx.save();
                this.ctx.globalAlpha = particle.life / particle.maxLife;
                this.ctx.fillStyle = particle.color;
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(particle.text, particle.x, particle.y);
                this.ctx.restore();
            } else {
                // Regular particle
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha;

                if (particle.type === 'explosion' || particle.type === 'impact') {
                    // Draw explosion/impact particles with gradient
                    const gradient = this.ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, particle.size
                    );
                    gradient.addColorStop(0, particle.color);
                    gradient.addColorStop(0.5, particle.color);
                    gradient.addColorStop(1, 'transparent');

                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (particle.type === 'muzzleFlash') {
                    // Draw muzzle flash with star shape
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    for (let i = 0; i < 8; i++) {
                        const angle = (i * Math.PI) / 4;
                        const radius = i % 2 === 0 ? particle.size : particle.size * 0.5;
                        const x = particle.x + Math.cos(angle) * radius;
                        const y = particle.y + Math.sin(angle) * radius;

                        if (i === 0) this.ctx.moveTo(x, y);
                        else this.ctx.lineTo(x, y);
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                } else {
                    // Standard circular particle
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                this.ctx.restore();
            }
        });
    }
});
