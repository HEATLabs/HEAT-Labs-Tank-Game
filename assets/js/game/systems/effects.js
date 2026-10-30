// Particles & Visual Effects
Object.assign(TankGame.prototype, {
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // Update particle based on type
            if (particle.type === 'explosion') {
                particle.size += particle.growth * (deltaTime / 16.67);
                particle.alpha = particle.life / particle.maxLife;
                particle.x += particle.vx * (deltaTime / 16.67);
                particle.y += particle.vy * (deltaTime / 16.67);
                particle.vx *= 0.95;
                particle.vy *= 0.95;
            } else if (particle.type === 'muzzleFlash') {
                particle.size -= particle.growth * (deltaTime / 16.67);
                particle.alpha = particle.life / particle.maxLife;
            } else if (particle.type === 'trail') {
                particle.alpha = particle.life / particle.maxLife;
                particle.x += particle.vx * (deltaTime / 16.67);
                particle.y += particle.vy * (deltaTime / 16.67);
            } else if (particle.type === 'impact') {
                particle.alpha = particle.life / particle.maxLife;
                particle.size = particle.maxSize * (particle.life / particle.maxLife);
            } else {
                // Standard particle
                particle.x += particle.vx * (deltaTime / 16.67);
                particle.y += particle.vy * (deltaTime / 16.67);
                particle.alpha = particle.life / particle.maxLife;
            }
        }
    },

    // Create explosion effect
    createExplosion(x, y, color = '#FFD700', size = 1.0) {
        const particleCount = Math.floor(30 * size);
        const maxSpeed = 8 * size;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * maxSpeed + 2;
            const life = Math.random() * 800 + 400;

            // Create explosion particles with varying colors
            const colors = [
                color,
                '#FFA500',
                '#FF6B6B',
                '#FFFFFF'
            ];
            const particleColor = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: particleColor,
                alpha: 1,
                size: Math.random() * 4 * size + 2,
                type: 'explosion',
                growth: 0.2
            });
        }

        // Add shockwave effect
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 600,
                maxLife: 600,
                color: color,
                alpha: 0.7,
                size: 0,
                type: 'explosion',
                growth: 2.0
            });
        }

        // Add screen shake
        this.screenShake(5 * size);
    },

    // Create muzzle flash effect
    createMuzzleFlash(x, y, angle, color) {
        const flashCount = 8;
        const length = 20;

        for (let i = 0; i < flashCount; i++) {
            const flashAngle = angle + (Math.random() - 0.5) * 0.5;
            const flashLength = Math.random() * length + 10;
            const flashSpeed = Math.random() * 5 + 3;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(flashAngle) * flashSpeed,
                vy: Math.sin(flashAngle) * flashSpeed,
                life: 150,
                maxLife: 150,
                color: color,
                alpha: 1,
                size: Math.random() * 8 + 4,
                type: 'muzzleFlash',
                growth: -0.2
            });
        }

        // Add bright flash at barrel end
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 80,
            maxLife: 80,
            color: '#FFFFFF',
            alpha: 0.8,
            size: 15,
            type: 'muzzleFlash',
            growth: -0.3
        });
    },

    // Create bullet trail effect
    createBulletTrail(x, y, angle, color) {
        // Create trail particle behind bullet
        const trailX = x - Math.cos(angle) * 10;
        const trailY = y - Math.sin(angle) * 10;

        this.particles.push({
            x: trailX,
            y: trailY,
            vx: Math.cos(angle) * -2,
            vy: Math.sin(angle) * -2,
            life: 200,
            maxLife: 200,
            color: color,
            alpha: 0.6,
            size: Math.random() * 2 + 1,
            type: 'trail'
        });
    },

    // Create rock impact effect
    createRockImpact(x, y, rockColor) {
        const impactCount = 15;

        for (let i = 0; i < impactCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const life = Math.random() * 400 + 200;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: this.lightenColor(rockColor, 30),
                alpha: 1,
                size: Math.random() * 3 + 2,
                type: 'impact',
                maxSize: Math.random() * 4 + 3
            });
        }

        // Add impact flash
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 100,
            maxLife: 100,
            color: '#FFFFFF',
            alpha: 0.7,
            size: 12,
            type: 'impact',
            maxSize: 12
        });

        this.screenShake(3);
    },

    // Create enemy impact effect
    createEnemyImpact(x, y, enemyColor) {
        const impactCount = 12;

        for (let i = 0; i < impactCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            const life = Math.random() * 300 + 150;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: enemyColor,
                alpha: 1,
                size: Math.random() * 4 + 2
            });
        }

        // Add sparks
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            const life = Math.random() * 400 + 200;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: '#FFD700',
                alpha: 1,
                size: Math.random() * 2 + 1
            });
        }

        this.screenShake(3);
    },

    // Create player impact effect
    createPlayerImpact(x, y) {
        const impactCount = 15;

        for (let i = 0; i < impactCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const life = Math.random() * 350 + 150;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: '#FF6B6B',
                alpha: 1,
                size: Math.random() * 5 + 2
            });
        }

        // Add shield impact effect
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 300,
                maxLife: 300,
                color: '#4CAF50',
                alpha: 0.5,
                size: 0,
                type: 'explosion',
                growth: 1.0
            });
        }
    },

    // Create damage effect (for non-fatal hits)
    createDamageEffect(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const life = Math.random() * 200 + 100;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: color,
                alpha: 1,
                size: Math.random() * 3 + 2
            });
        }
    },

    // Create collision effect
    createCollisionEffect(x, y) {
        const sparkCount = 20;

        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4;
            const life = Math.random() * 500 + 300;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: '#FFFFFF',
                alpha: 1,
                size: Math.random() * 2 + 1
            });
        }

        // Add impact ring
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 400,
                maxLife: 400,
                color: '#FFA500',
                alpha: 0.6,
                size: 0,
                type: 'explosion',
                growth: 1.5
            });
        }
    },

    // Create healing effect
    createHealingEffect(x, y) {
        const healingCount = 25;

        for (let i = 0; i < healingCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const life = Math.random() * 600 + 400;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: this.healthPackSettings.color,
                alpha: 0.8,
                size: Math.random() * 4 + 2,
                type: 'explosion',
                growth: 0.1
            });
        }

        // Add glow effect
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 500,
                maxLife: 500,
                color: '#10B981',
                alpha: 0.6,
                size: 0,
                type: 'explosion',
                growth: 1.2
            });
        }
    },

    // Show floating text at a position
    showFloatingText(text, x, y, color) {
        this.notificationSystem.showFloatingText(text, x, y, color);
    },

    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: Math.random() * 500 + 500,
                maxLife: 1000,
                color: color,
                alpha: 1,
                size: Math.random() * 3 + 1
            });
        }
    },

    screenShake(intensity) {
        this.screenShakeDuration = intensity * 100;
        this.screenShakeAmount = intensity;
    }
});