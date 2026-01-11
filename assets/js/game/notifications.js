// Game Notification System
class NotificationSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.notifications = [];
        this.settings = TankGameConfig.notifications;
        this.notificationElements = [];
    }

    // Show a notification message
    show(text) {
        // Remove old notifications if we have too many
        if (this.notifications.length >= this.settings.maxNotifications) {
            this.removeOldestNotification();
        }

        // Create notification element
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: ${this.settings.initialTopPosition}px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 600;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            pointer-events: none;
            animation: notificationPulse 2s ease-in-out infinite;
            border: 1px solid rgba(76, 175, 80, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                        0 0 0 1px rgba(255, 255, 255, 0.05),
                        0 0 20px rgba(76, 175, 80, 0.2);
            backdrop-filter: blur(10px);
            white-space: nowrap;
        `;

        document.body.appendChild(message);
        this.notificationElements.push(message);

        // Create notification object
        const notification = {
            element: message,
            life: this.settings.notificationDuration,
            maxLife: this.settings.notificationDuration,
            topPosition: this.settings.initialTopPosition,
            text: text
        };

        // Add to notifications array
        this.notifications.push(notification);

        // Calculate new position for this notification
        this.recalculatePositions();

        // Start fade out timer
        this.startFadeOutTimer(notification);

        return notification;
    }

    // Remove the oldest notification
    removeOldestNotification() {
        if (this.notifications.length > 0) {
            const oldestNotification = this.notifications[0];
            this.removeNotificationElement(oldestNotification.element);
            this.notifications.shift();
        }
    }

    // Start fade out timer for a notification
    startFadeOutTimer(notification) {
        setTimeout(() => {
            if (notification.element && notification.element.parentNode) {
                notification.element.style.opacity = '0';
                notification.element.style.transform = 'translateX(-50%) translateY(-10px)';
                notification.element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

                setTimeout(() => {
                    this.removeNotification(notification);
                }, 300);
            } else {
                this.removeNotification(notification);
            }
        }, this.settings.notificationDuration);
    }

    // Remove a specific notification
    removeNotification(notification) {
        // Remove element from DOM
        this.removeNotificationElement(notification.element);

        // Remove from array
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }

        // Recalculate positions for remaining notifications
        this.recalculatePositions();
    }

    // Remove notification element from DOM
    removeNotificationElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }

        // Remove from elements array
        const elementIndex = this.notificationElements.indexOf(element);
        if (elementIndex > -1) {
            this.notificationElements.splice(elementIndex, 1);
        }
    }

    // Recalculate positions for all notifications
    recalculatePositions() {
        let currentTop = this.settings.initialTopPosition;

        for (let i = 0; i < this.notifications.length; i++) {
            const notification = this.notifications[i];

            if (!notification.element || !notification.element.parentNode) {
                continue;
            }

            // Position the notification
            notification.element.style.top = `${currentTop}px`;
            notification.topPosition = currentTop;

            // Move to next position
            currentTop += this.settings.verticalSpacing;

            // Don't let notifications go too low
            if (currentTop > this.settings.maxTopPosition) {
                // If we run out of space, start removing oldest notifications
                for (let j = 0; j < i; j++) {
                    const oldNotification = this.notifications[j];
                    this.removeNotification(oldNotification);
                }
                break;
            }
        }
    }

    // Update all notifications
    update(deltaTime) {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            notification.life -= deltaTime;

            if (notification.life <= 0) {
                // Remove notification element
                this.removeNotificationElement(notification.element);
                // Remove from array
                this.notifications.splice(i, 1);
                // Recalculate positions for remaining notifications
                this.recalculatePositions();
                continue;
            }

            // Update opacity based on life if not in fade-out state
            if (notification.element) {
                const opacity = Math.min(notification.life / notification.maxLife, 1);
                if (opacity < 0.9 && !notification.element.style.transition.includes('opacity')) {
                    notification.element.style.opacity = opacity.toString();
                }
            }
        }
    }

    // Clear all notifications
    clearAll() {
        // Remove all notification elements
        this.notificationElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        this.notificationElements = [];
        this.notifications = [];
    }

    // Show floating text at a specific position
    showFloatingText(text, x, y, color) {
        // Create a floating text particle
        if (this.game && this.game.particles) {
            const floatingText = {
                text: text,
                x: x,
                y: y,
                color: color,
                life: 1000,
                maxLife: 1000,
                velocityY: -0.5
            };

            // Add to particles array for rendering
            this.game.particles.push(floatingText);
            return floatingText;
        }

        return null;
    }

    // Show message with wave information
    showWaveMessage(waveNumber, enemyCount) {
        const enemyText = enemyCount === 1 ? 'enemy' : 'enemies';
        return this.show(`Wave ${waveNumber} - ${enemyCount} ${enemyText} incoming!`);
    }

    // Show wave completion message
    showWaveCompleteMessage(waveNumber, reward) {
        return this.show(`Wave ${waveNumber} completed! +${reward} points!`);
    }

    // Show wave time up message
    showWaveTimeUpMessage(waveNumber, remainingEnemies) {
        const enemyText = remainingEnemies === 1 ? 'enemy' : 'enemies';
        return this.show(`Wave ${waveNumber} time's up! ${remainingEnemies} ${enemyText} carry over to next wave.`);
    }

    // Show health pack collected message
    showHealthPackMessage(healthGained, pointsGained) {
        return this.show(`Health restored: +${healthGained} HP (+${pointsGained} points)`);
    }

    // Show game over message
    showGameOverMessage(finalScore, waveReached, enemiesKilled, survivalTime) {
        return this.show(`Game Over! Final Score: ${finalScore}, Wave: ${waveReached}, Kills: ${enemiesKilled}, Time: ${survivalTime}`);
    }

    // Show enemy scaling message
    showEnemyScalingMessage(waveNumber) {
        return this.show(`Wave ${waveNumber}! Enemy count scaling doubled!`);
    }

    // Show error/feature message
    showFeatureMessage(text = "Feature Coming Soon") {
        return this.show(text);
    }

    // Show debug message
    showDebugMessage(text) {
        if (this.game && this.game.settings && this.game.settings.debugMode) {
            return this.show(`[DEBUG] ${text}`);
        }
        return null;
    }

    // Get current notification count
    getNotificationCount() {
        return this.notifications.length;
    }

    // Check if notifications are enabled
    isEnabled() {
        return this.settings !== null;
    }
}

// Add CSS animation if not already present
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes notificationPulse {
            0% {
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    0 0 20px rgba(76, 175, 80, 0.2);
            }
            50% {
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(255, 255, 255, 0.1),
                    0 0 30px rgba(76, 175, 80, 0.3);
            }
            100% {
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    0 0 20px rgba(76, 175, 80, 0.2);
            }
        }
    `;
    document.head.appendChild(style);
}

// Export
if (typeof window !== 'undefined') {
    window.NotificationSystem = NotificationSystem;
}