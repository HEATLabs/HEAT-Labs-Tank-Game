// Player Tank
Object.assign(TankGame.prototype, {
    // Handle auto-fire when mouse is held down
    handleAutoFire(deltaTime) {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;

        const currentTime = performance.now();

        // Check if mouse button is held down
        if (this.isMouseDown) {
            // Check if enough time has passed since the last shot
            const timeSinceLastShot = currentTime - this.lastFireTime;

            // Check if it's time to fire again
            if (timeSinceLastShot >= this.playerTank.shootCooldown) {
                this.shoot();
                this.lastFireTime = currentTime;
                this.autoFireTimer = 0; // Reset timer
            } else {
                // Accumulate time for the next check
                this.autoFireTimer += deltaTime;
            }
        }

        // Check if space key is held down
        if (this.keys[' ']) {
            // Check if enough time has passed since the last shot
            const timeSinceLastShot = currentTime - this.lastFireTime;

            // Check if it's time to fire again
            if (timeSinceLastShot >= this.playerTank.shootCooldown) {
                this.shoot();
                this.lastFireTime = currentTime;
                this.autoFireTimer = 0; // Reset timer
            } else {
                // Accumulate time for the next check
                this.autoFireTimer += deltaTime;
            }
        }
    },

    updatePlayer(deltaTime) {
        // Get input direction
        let inputX = 0;
        let inputY = 0;

        if (this.keys['w'] || this.keys['arrowup']) inputY -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) inputY += 1;
        if (this.keys['a'] || this.keys['arrowleft']) inputX -= 1;
        if (this.keys['d'] || this.keys['arrowright']) inputX += 1;

        // Calculate target rotation based on input
        if (inputX !== 0 || inputY !== 0) {
            this.playerTank.targetRotation = Math.atan2(inputY, inputX);
        }

        // Smoothly rotate towards target rotation
        const angleDiff = this.normalizeAngle(this.playerTank.targetRotation - this.playerTank.rotation);
        this.playerTank.rotation += angleDiff * this.playerTank.rotationSpeed;

        // Calculate movement direction based on current rotation
        const moveX = Math.cos(this.playerTank.rotation);
        const moveY = Math.sin(this.playerTank.rotation);

        // Calculate speed based on input magnitude
        const inputMagnitude = Math.sqrt(inputX * inputX + inputY * inputY);
        const targetSpeed = inputMagnitude > 0 ? this.playerTank.maxSpeed : 0;

        // Smoothly adjust current speed
        if (targetSpeed > this.playerTank.currentSpeed) {
            // Accelerate
            this.playerTank.currentSpeed = Math.min(
                targetSpeed,
                this.playerTank.currentSpeed + this.playerTank.acceleration * deltaTime
            );
        } else if (targetSpeed < this.playerTank.currentSpeed) {
            // Decelerate
            this.playerTank.currentSpeed = Math.max(
                targetSpeed,
                this.playerTank.currentSpeed - this.playerTank.deceleration * deltaTime
            );
        }

        // Calculate velocity based on current rotation and speed
        if (this.playerTank.currentSpeed > 0.1) {
            this.playerTank.velocityX = moveX * this.playerTank.currentSpeed;
            this.playerTank.velocityY = moveY * this.playerTank.currentSpeed;
        } else {
            // Apply friction when no input
            this.playerTank.velocityX *= 0.9;
            this.playerTank.velocityY *= 0.9;

            // Stop completely when velocity is very low
            if (Math.abs(this.playerTank.velocityX) < 0.1) this.playerTank.velocityX = 0;
            if (Math.abs(this.playerTank.velocityY) < 0.1) this.playerTank.velocityY = 0;
        }

        // Calculate new position
        let newX = this.playerTank.x + this.playerTank.velocityX * deltaTime * 60;
        let newY = this.playerTank.y + this.playerTank.velocityY * deltaTime * 60;

        // Check collision with rocks
        const playerRadius = this.playerTank.width / 2;
        for (const rock of this.rocks) {
            const dx = newX - rock.x;
            const dy = newY - rock.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = playerRadius + rock.radius;

            if (distance < minDistance) {
                // Collision detected - push player away
                const angle = Math.atan2(dy, dx);
                const overlap = minDistance - distance;

                newX += Math.cos(angle) * overlap;
                newY += Math.sin(angle) * overlap;

                // Reduce velocity when colliding with rock
                this.playerTank.velocityX *= 0.7;
                this.playerTank.velocityY *= 0.7;
            }
        }

        // Keep player in world bounds
        const margin = 50;
        if (newX > margin && newX < this.world.width - margin) {
            this.playerTank.x = newX;
        }
        if (newY > margin && newY < this.world.height - margin) {
            this.playerTank.y = newY;
        }
    },

    // Helper function to normalize angles
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    },

    shoot() {
        const currentTime = performance.now();
        if (currentTime - this.playerTank.lastShot < this.playerTank.shootCooldown) {
            return;
        }

        this.playerTank.lastShot = currentTime;

        // Calculate bullet spawn position at the end of the gun barrel
        const barrelEndX = Math.cos(this.playerTank.turretRotation) * this.playerTank.barrelLength;
        const barrelEndY = Math.sin(this.playerTank.turretRotation) * this.playerTank.barrelLength;

        const bullet = {
            x: this.playerTank.x + barrelEndX,
            y: this.playerTank.y + barrelEndY,
            rotation: this.playerTank.turretRotation,
            speed: this.settings.bulletSpeed,
            damage: 50
        };

        this.bullets.push(bullet);

        // Enhanced muzzle flash
        this.createMuzzleFlash(this.playerTank.x + barrelEndX, this.playerTank.y + barrelEndY, this.playerTank.turretRotation, '#4CAF50');
    }
});
