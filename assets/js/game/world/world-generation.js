// World Generation (rocks & health packs)
Object.assign(TankGame.prototype, {
    // Generate random rocks with irregular shapes
    generateRocks() {
        this.rocks = [];
        const maxAttempts = this.rockSettings.count * 10;
        let attempts = 0;
        let rocksGenerated = 0;

        // Calculate minimum safe distance from edges
        const edgeBuffer = this.rockSettings.edgeBuffer;
        const maxRockSize = this.rockSettings.maxSize;
        const minPassageWidth = this.rockSettings.minPassageWidth;

        // Calculate safe spawn boundaries
        const minX = edgeBuffer + maxRockSize / 2;
        const maxX = this.world.width - edgeBuffer - maxRockSize / 2;
        const minY = edgeBuffer + maxRockSize / 2;
        const maxY = this.world.height - edgeBuffer - maxRockSize / 2;

        while (rocksGenerated < this.rockSettings.count && attempts < maxAttempts) {
            attempts++;

            // Generate random position within safe boundaries
            const x = Math.random() * (maxX - minX) + minX;
            const y = Math.random() * (maxY - minY) + minY;

            // Avoid spawning rocks too close to player's starting position
            const dx = x - this.playerTank.x;
            const dy = y - this.playerTank.y;
            const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

            if (distanceToPlayer < this.rockSettings.playerBuffer) {
                continue; // Too close to player start
            }

            // Check minimum spacing from other rocks
            let tooClose = false;
            for (const rock of this.rocks) {
                const rockDx = x - rock.x;
                const rockDy = y - rock.y;
                const distance = Math.sqrt(rockDx * rockDx + rockDy * rockDy);

                if (distance < this.rockSettings.spacing) {
                    tooClose = true;
                    break;
                }
            }

            if (tooClose) {
                continue;
            }

            // Check if rock is too close to edges considering its size
            // Left edge
            if (x - maxRockSize / 2 < edgeBuffer) {
                continue;
            }
            // Right edge
            if (x + maxRockSize / 2 > this.world.width - edgeBuffer) {
                continue;
            }
            // Top edge
            if (y - maxRockSize / 2 < edgeBuffer) {
                continue;
            }
            // Bottom edge
            if (y + maxRockSize / 2 > this.world.height - edgeBuffer) {
                continue;
            }

            // Check if rock blocks passage between edges
            const leftDistance = x - maxRockSize / 2;
            const rightDistance = this.world.width - (x + maxRockSize / 2);
            const topDistance = y - maxRockSize / 2;
            const bottomDistance = this.world.height - (y + maxRockSize / 2);

            // Ensure at least one direction has enough clearance for 2 tanks
            const hasClearPath =
                leftDistance >= minPassageWidth ||
                rightDistance >= minPassageWidth ||
                topDistance >= minPassageWidth ||
                bottomDistance >= minPassageWidth;

            if (!hasClearPath) {
                continue; // Rock blocks all passages
            }

            // Generate rock size
            const size = this.rockSettings.minSize + Math.random() *
                (this.rockSettings.maxSize - this.rockSettings.minSize);

            // Generate rock shape
            const points = this.generateRockShape(size);

            // Generate rock color with variation
            const color = this.getRandomRockColor();

            // Create rock
            this.rocks.push({
                x,
                y,
                size,
                points,
                color,
                radius: size / 2 * 1.2
            });

            rocksGenerated++;
        }
    },

    // Generate random health packs around the map
    generateHealthPacks() {
        this.healthPacks = [];
        this.healthPackRespawnTimers = [];

        const maxAttempts = this.healthPackSettings.count * 10;
        let attempts = 0;
        let packsGenerated = 0;

        while (packsGenerated < this.healthPackSettings.count && attempts < maxAttempts) {
            attempts++;

            // Generate random position
            const x = Math.random() * (this.world.width - 100) + 50;
            const y = Math.random() * (this.world.height - 100) + 50;

            // Avoid spawning health packs too close to player's starting position
            const dx = x - this.playerTank.x;
            const dy = y - this.playerTank.y;
            const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

            if (distanceToPlayer < this.healthPackSettings.minDistanceFromPlayer) {
                continue; // Too close to player start
            }

            // Check minimum spacing from other health packs
            let tooClose = false;
            for (const pack of this.healthPacks) {
                const packDx = x - pack.x;
                const packDy = y - pack.y;
                const distance = Math.sqrt(packDx * packDx + packDy * packDy);

                if (distance < this.healthPackSettings.spacing) {
                    tooClose = true;
                    break;
                }
            }

            if (tooClose) {
                continue;
            }

            // Check minimum spacing from rocks
            for (const rock of this.rocks) {
                const rockDx = x - rock.x;
                const rockDy = y - rock.y;
                const distance = Math.sqrt(rockDx * rockDx + rockDy * rockDy);

                if (distance < rock.radius + 50) {
                    tooClose = true;
                    break;
                }
            }

            if (tooClose) {
                continue;
            }

            // Generate health pack size
            const size = this.healthPackSettings.minSize + Math.random() *
                (this.healthPackSettings.maxSize - this.healthPackSettings.minSize);

            // Create health pack
            this.healthPacks.push({
                x,
                y,
                size,
                collected: false,
                pulsePhase: Math.random() * Math.PI * 2
            });

            packsGenerated++;
        }
    },

    // Generate irregular rock shape
    generateRockShape(baseSize) {
        const points = [];
        const numPoints = Math.floor(
            this.rockSettings.minPoints +
            Math.random() * (this.rockSettings.maxPoints - this.rockSettings.minPoints)
        );

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;

            // Base radius with irregularity
            const irregularity = 1 + (Math.random() - 0.5) * 2 * this.rockSettings.irregularity;
            const radius = (baseSize / 2) * irregularity;

            // Add some randomness to angle
            const adjustedAngle = angle + (Math.random() - 0.5) * 0.5;

            points.push({
                x: Math.cos(adjustedAngle) * radius,
                y: Math.sin(adjustedAngle) * radius
            });
        }

        return points;
    },

    // Get random rock color with variation
    getRandomRockColor() {
        const baseColor = this.rockSettings.color;
        const variation = this.rockSettings.colorVariation;

        // Parse base color
        let r, g, b;
        if (baseColor.startsWith('#')) {
            const hex = baseColor.substring(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            // Default gray if parsing fails
            r = g = b = 107;
        }

        // Apply random variation
        const variationAmount = variation / 100;
        r = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * 255 * variationAmount));
        g = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * 255 * variationAmount));
        b = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * 255 * variationAmount));

        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
});