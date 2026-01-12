// Game Configuration
const TankGameConfig = {
    // Game settings
    game: {
        world: {
            width: 5000,
            height: 5000
        },
        debugMode: true,
        rapidFire: false
    },

    // Player tank configuration
    player: {
        width: 80,
        height: 60,
        speed: 5,
        rotationSpeed: 0.05,
        acceleration: 5.0,
        deceleration: 3.0,
        maxSpeed: 5,
        shootCooldown: 500,
        color: '#4CAF50',
        turretWidth: 50,
        turretHeight: 40,
        barrelLength: 30,
        barrelWidth: 6,
        health: 100
    },

    // Enemy tank configuration
    enemy: {
        width: 70,
        height: 50,
        speed: 2,
        shootCooldown: 500,
        color: '#F44336',
        turretWidth: 45,
        turretHeight: 35,
        barrelLength: 25,
        barrelWidth: 5,
        health: 100,
        rotationSpeed: 0.05,
        turretTrackingSpeed: 0.1
    },

    // Physics settings
    physics: {
        bulletSpeed: 15,
        enemyBulletSpeed: 10,
        particleLifetime: 1000,
        enemyCollisionRepulsion: 0.5,
        enemySeparationDistance: 80,
        enemyAvoidanceForce: 1.5,
        enemyPursuitForce: 1.0,
        enemyWanderForce: 0.3,
        enemyStuckEscapeForce: 2.0
    },

    // AI settings
    ai: {
        enemySpawnDistance: 400,
        enemyDespawnDistance: 800,
        enemyObstacleDetectionRange: 200,
        enemyPathfindingAttempts: 5,
        enemySmoothMovement: true,
        enemyMemorySize: 10,
        enemyStuckThreshold: 60,
        enemyShootingRange: 600,
        enemyShootingCooldown: 1000,
        enemyShootingAccuracy: 0.95,
        enemyShootingRandomness: 0.1
    },

    // Wave system configuration
    wave: {
        timeLimit: 60000,
        startCountdown: 5,
        waveEnemyCounts: [0, 1, 2, 4, 6, 8, 10],
        baseEnemyIncrement: 2,
        scalingFactor: 1
    },

    // Score configuration
    score: {
        enemyKill: 25,
        healthPack: 10,
        baseWaveComplete: 100,
        waveBonusIncrement: 50,
        waveBonusInterval: 10
    },

    // Rocks/obstacles configuration
    rocks: {
        count: 60,
        minSize: 30,
        maxSize: 100,
        minPoints: 5,
        maxPoints: 12,
        irregularity: 0.3,
        spacing: 200,
        color: '#6B7280',
        colorVariation: 20,
        edgeBuffer: 200,
        playerBuffer: 300,
        minPassageWidth: 100
    },

    // Health packs configuration
    healthPacks: {
        count: 20,
        minSize: 50,
        maxSize: 55,
        healthAmount: 25,
        respawnTime: 30000,
        color: '#10B981',
        glowColor: '#34D399',
        spacing: 300,
        minDistanceFromPlayer: 400,
        pulseSpeed: 0.05,
        rotationSpeed: 0.02
    },

    // Enemy indicators configuration
    indicators: {
        enabled: true,
        size: 24,
        margin: 20,
        color: '#F44336',
        dangerColor: '#8B0000',
        warningColor: '#FF3D00',
        safeColor: '#FFC107',
        pulseSpeed: 0.005,
        arrowLength: 15,
        arrowWidth: 10,
        maxDistanceForIndicator: 5000,
        glowIntensity: 0.2,
        innerGlowColor: '#FFFFFF',
        pulseScale: 0.1,
        dangerThreshold: 1000,
        warningThreshold: 2500
    },

    // Map border configuration
    border: {
        thickness: 40,
        mainColor: '#2C3E50',
        edgeColor: '#34495E',
        innerGlowColor: 'rgba(52, 152, 219, 0.3)',
        warningThickness: 20,
        warningColor: 'rgba(231, 76, 60, 0.4)',
        warningDistance: 200,
        cornerSize: 100,
        cornerColor: '#2C3E50'
    },

    // Notification system configuration
    notifications: {
        maxNotifications: 5,
        notificationDuration: 2000,
        verticalSpacing: 60,
        minTopPosition: 50,
        maxTopPosition: 250,
        initialTopPosition: 80
    },

    // Auto-fire configuration
    autoFire: {
        interval: 500
    },

    // Enemy spawn settings
    spawning: {
        enemySpawnRate: 2000,
        maxEnemies: 1000
    }
};

// Export
if (typeof window !== 'undefined') {
    window.TankGameConfig = TankGameConfig;
}